function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function asRecord(value) {
  return isPlainObject(value) ? value : {}
}

function toStringValue(value, fallback = '') {
  if (typeof value === 'string') {
    return value.trim() || fallback
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return fallback
}

function toPositiveInteger(value, fallback = 0) {
  const numeric = typeof value === 'number' ? value : typeof value === 'string' ? Number(value.trim()) : Number.NaN
  if (!Number.isFinite(numeric)) {
    return fallback
  }
  return Math.max(0, Math.round(numeric))
}

function toBoolean(value, fallback = false) {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['true', '1', 'yes', 'y'].includes(normalized)) {
      return true
    }
    if (['false', '0', 'no', 'n'].includes(normalized)) {
      return false
    }
  }
  if (typeof value === 'number') {
    return value !== 0
  }
  return fallback
}

function normalizeDifficulty(value) {
  const normalized = toStringValue(value, 'MEDIUM').toUpperCase()
  if (['EASY', '简单', '新手'].includes(normalized)) return 'EASY'
  if (['HARD', '困难', '进阶'].includes(normalized)) return 'HARD'
  return 'MEDIUM'
}

function normalizeHeatLevel(value) {
  const normalized = toStringValue(value, 'OFF').toUpperCase()
  if (['HIGH', '大火', '猛火'].includes(normalized)) return 'HIGH'
  if (['MEDIUM', '中火'].includes(normalized)) return 'MEDIUM'
  if (['LOW', '小火'].includes(normalized)) return 'LOW'
  return 'OFF'
}

function normalizeStepType(value, needUserConfirm = false) {
  const normalized = toStringValue(value, '').toLowerCase()
  if (['auto', 'timer'].includes(normalized)) return 'auto'
  if (['wait', 'pause'].includes(normalized)) return 'wait'
  if (['confirm', 'manual', 'user'].includes(normalized)) return 'confirm'
  return needUserConfirm ? 'confirm' : 'auto'
}

function normalizeIngredients(rawIngredients) {
  if (!Array.isArray(rawIngredients)) return []
  return rawIngredients
    .map((item, index) => {
      if (typeof item === 'string') {
        return { name: item.trim() || `食材${index + 1}`, amount: '适量' }
      }
      const record = asRecord(item)
      return {
        name: toStringValue(record.name ?? record.ingredient ?? record.title, `食材${index + 1}`),
        amount: toStringValue(record.amount ?? record.quantity ?? record.value, '适量')
      }
    })
    .filter((item) => item.name)
}

function normalizePrepTips(rawPrepTips) {
  if (!Array.isArray(rawPrepTips)) return []
  return rawPrepTips.map((item) => toStringValue(item)).filter(Boolean)
}

function normalizeTimelineSteps(rawSteps) {
  if (!Array.isArray(rawSteps)) return []
  let currentOffset = 0

  return rawSteps.map((item, index) => {
    const record = asRecord(item)
    const needUserConfirm = toBoolean(record.needUserConfirm, false)
    const duration = toPositiveInteger(record.duration ?? record.durationSeconds, 0)
    const hasExplicitOffset = record.timeOffset !== undefined
    const timeOffset = hasExplicitOffset ? toPositiveInteger(record.timeOffset, currentOffset) : currentOffset
    const normalized = {
      stepNo: toPositiveInteger(record.stepNo ?? record.step ?? record.order, index + 1) || index + 1,
      type: normalizeStepType(record.type, needUserConfirm),
      title: toStringValue(record.title, `步骤 ${index + 1}`),
      instruction: toStringValue(record.instruction ?? record.description, `请执行步骤 ${index + 1}`),
      voiceText: toStringValue(record.voiceText ?? record.instruction ?? record.description, `请执行步骤 ${index + 1}`),
      timeOffset,
      duration,
      heatLevel: normalizeHeatLevel(record.heatLevel ?? record.heat ?? record.fire),
      needUserConfirm
    }

    currentOffset = Math.max(currentOffset, timeOffset) + duration
    return normalized
  })
}

export function normalizeRecipeResult(input) {
  const record = asRecord(input)
  const timelineSteps = normalizeTimelineSteps(record.timelineSteps ?? record.steps)
  const totalDurationFromField = toPositiveInteger(
    record.totalDuration ??
      (record.estimatedTotalMinutes !== undefined ? toPositiveInteger(record.estimatedTotalMinutes, 0) * 60 : undefined),
    0
  )

  return {
    dishName: toStringValue(record.dishName ?? record.name, '未命名菜谱'),
    description: toStringValue(record.description ?? record.summary ?? record.sceneTips, '暂无描述'),
    servingSize: toPositiveInteger(record.servingSize ?? record.servings ?? record.people, 1) || 1,
    difficulty: normalizeDifficulty(record.difficulty),
    totalDuration: totalDurationFromField || timelineSteps.reduce((sum, item) => sum + item.duration, 0),
    ingredients: normalizeIngredients(record.ingredients),
    prepTips: normalizePrepTips(record.prepTips ?? record.prepSuggestions),
    timelineSteps
  }
}

export function validateRecipeResult(input) {
  const normalized = normalizeRecipeResult(input)
  const errors = []

  if (!normalized.dishName) errors.push('dishName 缺失')
  if (!normalized.ingredients.length) errors.push('ingredients 不能为空')
  if (!normalized.timelineSteps.length) errors.push('timelineSteps 不能为空')

  normalized.timelineSteps.forEach((step, index) => {
    if (!step.title) errors.push(`timelineSteps[${index}].title 缺失`)
    if (!step.instruction) errors.push(`timelineSteps[${index}].instruction 缺失`)
  })

  return {
    valid: errors.length === 0,
    errors,
    normalized
  }
}
