import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { normalizeRecipeResult, validateRecipeResult } from './recipe-result.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT) || 3000
const corsOrigin = process.env.CORS_ORIGIN || '*'
const difyBaseUrl = String(process.env.DIFY_BASE_URL || 'https://api.dify.ai/v1').replace(/\/+$/, '')
const difyApiKey = String(process.env.DIFY_API_KEY || '').trim()
const difyOutputKey = String(process.env.DIFY_OUTPUT_KEY || 'result').trim()
const difyUserPrefix = String(process.env.DIFY_USER_PREFIX || 'ai-cook').trim()
const debugDifyResponse = String(process.env.DEBUG_DIFY_RESPONSE || 'true').trim().toLowerCase() !== 'false'

app.use(cors({ origin: corsOrigin === '*' ? true : corsOrigin.split(',').map((item) => item.trim()) }))
app.use(express.json({ limit: '1mb' }))

function buildDifyUser(req) {
  const headerUser = req.headers['x-user-id']
  const bodyUser = req.body?.userId
  return String(bodyUser || headerUser || `${difyUserPrefix}-miniapp`).trim()
}

function tryParseJsonLikeString(value) {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return value
  }

  try {
    return JSON.parse(trimmed)
  } catch (error) {
    const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)

    if (!fencedMatch?.[1]) {
      return value
    }

    try {
      return JSON.parse(fencedMatch[1].trim())
    } catch (nestedError) {
      return value
    }
  }
}

function isRecipeLikeObject(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      (
        value.dishName !== undefined ||
        value.name !== undefined ||
        Array.isArray(value.ingredients) ||
        Array.isArray(value.timelineSteps) ||
        Array.isArray(value.steps) ||
        Array.isArray(value.prepTips) ||
        Array.isArray(value.prepSuggestions)
      )
  )
}

function unwrapRecipeEnvelope(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return value
  }

  if (isRecipeLikeObject(value)) {
    return value
  }

  const nestedCandidates = [value.result, value.output, value.recipe, value.data]

  for (const nested of nestedCandidates) {
    if (isRecipeLikeObject(nested)) {
      return nested
    }
  }

  return value
}

function collectRecipeCandidates(base) {
  const outputs = base?.outputs
  const values = [
    outputs?.[difyOutputKey],
    base?.result,
    base?.output,
    base?.recipe,
    outputs?.result,
    outputs?.output,
    outputs?.recipe,
    outputs?.data,
    outputs?.text,
    outputs?.json,
    outputs,
    base
  ]

  if (outputs && typeof outputs === 'object' && !Array.isArray(outputs)) {
    Object.keys(outputs).forEach((key) => {
      values.push(outputs[key])
    })
  }

  return values
}

function summarizeValue(value) {
  if (value === null || value === undefined) {
    return value
  }

  if (typeof value === 'string') {
    return value.slice(0, 240)
  }

  if (Array.isArray(value)) {
    return {
      type: 'array',
      length: value.length,
      first: value[0] ?? null
    }
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value)
    return {
      type: 'object',
      keys,
      preview: keys.slice(0, 8).reduce((acc, key) => {
        acc[key] = value[key]
        return acc
      }, {})
    }
  }

  return value
}

function logDifyDebug(label, payload) {
  if (!debugDifyResponse) {
    return
  }

  try {
    console.log(`[ai-cook-server] ${label}: ${JSON.stringify(payload, null, 2)}`)
  } catch (error) {
    console.log(`[ai-cook-server] ${label}:`, payload)
  }
}

function pickRecipeCandidate(responseData) {
  const base = responseData?.data ?? responseData
  const outputs = base?.outputs && typeof base.outputs === 'object' ? base.outputs : {}

  logDifyDebug('dify response summary', {
    workflowRunId: responseData?.workflow_run_id || responseData?.data?.id || '',
    status: responseData?.data?.status || responseData?.status || '',
    outputKeys: Object.keys(outputs),
    configuredOutputKey: difyOutputKey,
    configuredOutputPreview: summarizeValue(outputs?.[difyOutputKey]),
    outputsPreview: summarizeValue(outputs)
  })

  for (const item of collectRecipeCandidates(base)) {
    const parsed = unwrapRecipeEnvelope(tryParseJsonLikeString(item))

    if (isRecipeLikeObject(parsed)) {
      logDifyDebug('selected recipe candidate', summarizeValue(parsed))
      return parsed
    }
  }

  const outputKeys = base?.outputs && typeof base.outputs === 'object' ? Object.keys(base.outputs) : []
  const keysText = outputKeys.length ? `，outputs 可用字段：${outputKeys.join('、')}` : ''
  throw new Error(`Dify 返回里没有可识别的菜谱对象${keysText}`)
}

async function runDifyWorkflow(inputs, user) {
  if (!difyApiKey) {
    throw new Error('服务端缺少 DIFY_API_KEY 环境变量')
  }

  const response = await fetch(`${difyBaseUrl}/workflows/run`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${difyApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs,
      response_mode: 'blocking',
      user
    })
  })

  const responseText = await response.text()
  let responseJson = {}

  try {
    responseJson = responseText ? JSON.parse(responseText) : {}
  } catch (error) {
    throw new Error(`Dify 返回了非 JSON 内容：${responseText.slice(0, 120)}`)
  }

  if (!response.ok) {
    const message = responseJson?.message || responseJson?.error || `Dify 请求失败，状态码 ${response.status}`
    throw new Error(message)
  }

  return responseJson
}

function validateRequestBody(body) {
  if (!body || typeof body !== 'object') {
    return '请求体不能为空'
  }

  if (!String(body.dishName || '').trim()) {
    return 'dishName 不能为空'
  }

  return ''
}

app.get('/api/recipe/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI 做饭陪练后端服务正常',
    provider: 'dify',
    difyConfigured: Boolean(difyApiKey),
    difyOutputKey
  })
})

app.post('/api/recipe/generate', async (req, res) => {
  const validationMessage = validateRequestBody(req.body)
  if (validationMessage) {
    res.status(400).json({
      success: false,
      message: validationMessage
    })
    return
  }

  const inputs = {
    dishName: String(req.body.dishName || '').trim(),
    servings: Number(req.body.servings) || 2,
    taste: String(req.body.taste || '').trim(),
    availableIngredients: String(req.body.availableIngredients || '').trim()
  }

  try {
    const workflowResponse = await runDifyWorkflow(inputs, buildDifyUser(req))
    const candidate = pickRecipeCandidate(workflowResponse)
    const validation = validateRecipeResult(candidate)

    if (!validation.valid) {
      const outputKeys =
        workflowResponse?.data?.outputs && typeof workflowResponse.data.outputs === 'object'
          ? Object.keys(workflowResponse.data.outputs)
          : workflowResponse?.outputs && typeof workflowResponse.outputs === 'object'
            ? Object.keys(workflowResponse.outputs)
            : []

      res.status(502).json({
        success: false,
        message: `Dify 输出结构不符合预期：${validation.errors.join('；')}`,
        outputKeys,
        raw: workflowResponse
      })
      return
    }

    const result = normalizeRecipeResult(candidate)

    res.json({
      success: true,
      provider: 'dify',
      result,
      raw: {
        workflowRunId: workflowResponse?.workflow_run_id || workflowResponse?.data?.id || '',
        status: workflowResponse?.data?.status || workflowResponse?.status || 'succeeded'
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '调用 Dify workflow 失败'
    })
  }
})

app.listen(port, () => {
  console.log(`[ai-cook-server] listening on http://localhost:${port}`)
  console.log(`[ai-cook-server] health: http://localhost:${port}/api/recipe/health`)
})
