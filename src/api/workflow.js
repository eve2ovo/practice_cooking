import { mockGenerateRecipe } from '@/mock/recipe'
import { request } from '@/utils/request'
import { normalizeRecipeResult, validateRecipeResult } from '@/utils/recipe-result'
import { WORKFLOW_CONFIG } from '@/config/workflow'

function joinUrl(baseUrl, path) {
  const base = String(baseUrl || '').trim().replace(/\/+$/, '')
  const suffix = String(path || '').trim().replace(/^\/+/, '')
  return base && suffix ? `${base}/${suffix}` : base || ''
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

function getRecipeCandidates(base) {
  const outputs = base?.outputs
  const values = [
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

function extractRecipeCandidate(rawData) {
  const base = rawData?.data ?? rawData

  for (const item of getRecipeCandidates(base)) {
    const parsed = tryParseJsonLikeString(item)

    if (isRecipeLikeObject(parsed)) {
      return parsed
    }
  }

  const outputKeys = base?.outputs && typeof base.outputs === 'object' ? Object.keys(base.outputs) : []
  const keysText = outputKeys.length ? `，outputs 可用字段：${outputKeys.join('、')}` : ''
  throw new Error(`后端返回里没有可识别的菜谱对象${keysText}`)
}

function normalizeRecipeResponse(rawData) {
  if (!rawData) {
    throw new Error('后端没有返回数据')
  }

  const candidate = extractRecipeCandidate(rawData)
  const normalized = normalizeRecipeResult(candidate)
  const validation = validateRecipeResult(candidate)

  if (!validation.valid) {
    throw new Error(`后端返回格式不符合预期：${validation.errors.join('；')}`)
  }

  return normalized
}

export function buildWorkflowPayload(formData) {
  return {
    dishName: String(formData.dishName || '').trim(),
    servings: Number(formData.servings) || 2,
    taste: String(formData.taste || '').trim(),
    availableIngredients: String(formData.availableIngredients || '').trim(),
    clientMeta: {
      source: 'uni-app',
      platform: uni.getSystemInfoSync?.().platform || 'unknown'
    }
  }
}

function normalizeSettings(settings = {}) {
  return {
    serverBaseUrl: String(settings.serverBaseUrl || WORKFLOW_CONFIG.serverBaseUrl || '').trim(),
    generatePath: settings.generatePath || WORKFLOW_CONFIG.generatePath || '/api/recipe/generate',
    healthPath: settings.healthPath || WORKFLOW_CONFIG.healthPath || '/api/recipe/health',
    useMockWhenOffline:
      settings.useMockWhenOffline !== undefined
        ? settings.useMockWhenOffline !== false
        : WORKFLOW_CONFIG.useMockWhenOffline !== false
  }
}

export async function generateRecipeByWorkflow(formData, settings = WORKFLOW_CONFIG) {
  const payload = buildWorkflowPayload(formData)
  const normalized = normalizeSettings(settings)
  const endpoint = joinUrl(normalized.serverBaseUrl, normalized.generatePath)

  if (!endpoint) {
    if (normalized.useMockWhenOffline) {
      return mockGenerateRecipe(payload)
    }
    throw new Error('请先配置可用的后端服务地址')
  }

  const response = await request({
    url: endpoint,
    method: 'POST',
    data: payload,
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 300000
  })

  return normalizeRecipeResponse(response.data)
}

export async function testWorkflowConnection(settings = WORKFLOW_CONFIG) {
  const normalized = normalizeSettings(settings)
  const endpoint = joinUrl(normalized.serverBaseUrl, normalized.healthPath)

  if (!endpoint) {
    return {
      success: false,
      message: '请先配置可用的后端服务地址'
    }
  }

  try {
    const response = await request({
      url: endpoint,
      method: 'GET',
      timeout: 8000
    })

    return {
      success: true,
      message: response?.data?.message || `后端连接成功：${endpoint}`
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || '后端连接失败'
    }
  }
}
