import type {
  HeatLevel,
  RecipeDifficulty,
  RecipeIngredient,
  RecipeResult,
  RecipeTimelineStep,
  RecipeValidationResult,
  TimelineStepType
} from '@/types/recipe-result'

const DEFAULT_RECIPE_RESULT: RecipeResult = {
  dishName: '未命名菜谱',
  description: '暂无描述',
  servingSize: 1,
  difficulty: 'MEDIUM',
  totalDuration: 0,
  ingredients: [],
  prepTips: [],
  timelineSteps: []
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function asRecord(value: unknown): Record<string, unknown> {
  return isPlainObject(value) ? value : {}
}

function toNonEmptyString(value: unknown, fallback = '') {
  if (typeof value === 'string') {
    return value.trim() || fallback
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return fallback
}

function toPositiveInteger(value: unknown, fallback = 0) {
  const numberValue =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value.trim())
        : Number.NaN

  if (!Number.isFinite(numberValue)) {
    return fallback
  }

  return Math.max(0, Math.round(numberValue))
}

function toBoolean(value: unknown, fallback = false) {
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

function normalizeDifficulty(value: unknown): RecipeDifficulty {
  const normalized = toNonEmptyString(value, 'MEDIUM').toUpperCase()

  if (['EASY', '简单', '新手', 'LOW'].includes(normalized)) {
    return 'EASY'
  }

  if (['HARD', '困难', '进阶', 'HIGH'].includes(normalized)) {
    return 'HARD'
  }

  return 'MEDIUM'
}

function normalizeStepType(value: unknown, needUserConfirm = false): TimelineStepType {
  const normalized = toNonEmptyString(value).toLowerCase()

  if (['auto', 'timer'].includes(normalized)) {
    return 'auto'
  }

  if (['wait', 'pause'].includes(normalized)) {
    return 'wait'
  }

  if (['confirm', 'manual', 'user'].includes(normalized)) {
    return 'confirm'
  }

  return needUserConfirm ? 'confirm' : 'auto'
}

function normalizeHeatLevel(value: unknown): HeatLevel {
  const normalized = toNonEmptyString(value, 'OFF').toUpperCase()

  if (['HIGH', '大火', '猛火'].includes(normalized)) {
    return 'HIGH'
  }

  if (['MEDIUM', '中火'].includes(normalized)) {
    return 'MEDIUM'
  }

  if (['LOW', '小火'].includes(normalized)) {
    return 'LOW'
  }

  return 'OFF'
}

function normalizeIngredients(rawIngredients: unknown, warnings: string[]): RecipeIngredient[] {
  if (!Array.isArray(rawIngredients)) {
    if (rawIngredients !== undefined) {
      warnings.push('ingredients 不是数组，已自动降级为空数组')
    }
    return []
  }

  return rawIngredients
    .map((item, index) => {
      if (typeof item === 'string') {
        return {
          name: item.trim() || `食材${index + 1}`,
          amount: '适量'
        }
      }

      const record = asRecord(item)
      const name = toNonEmptyString(record.name ?? record.ingredient ?? record.title, `食材${index + 1}`)
      const amount = toNonEmptyString(record.amount ?? record.quantity ?? record.value, '适量')

      return {
        name,
        amount
      }
    })
    .filter((item) => Boolean(item.name))
}

function normalizePrepTips(rawPrepTips: unknown, warnings: string[]): string[] {
  if (!Array.isArray(rawPrepTips)) {
    if (rawPrepTips !== undefined) {
      warnings.push('prepTips 不是数组，已自动降级为空数组')
    }
    return []
  }

  return rawPrepTips
    .map((item) => toNonEmptyString(item))
    .filter(Boolean)
}

function normalizeTimelineSteps(rawSteps: unknown, warnings: string[]): RecipeTimelineStep[] {
  if (!Array.isArray(rawSteps)) {
    if (rawSteps !== undefined) {
      warnings.push('timelineSteps 不是数组，已自动降级为空数组')
    }
    return []
  }

  let currentOffset = 0

  return rawSteps.map((item, index) => {
    const record = asRecord(item)
    const needUserConfirm = toBoolean(record.needUserConfirm, false)
    const duration = toPositiveInteger(record.duration ?? record.durationSeconds, 0)
    const hasExplicitOffset = record.timeOffset !== undefined
    const timeOffset = hasExplicitOffset
      ? toPositiveInteger(record.timeOffset, currentOffset)
      : currentOffset

    const normalizedStep: RecipeTimelineStep = {
      stepNo: toPositiveInteger(record.stepNo ?? record.step ?? record.order, index + 1) || index + 1,
      type: normalizeStepType(record.type, needUserConfirm),
      title: toNonEmptyString(record.title, `步骤 ${index + 1}`),
      instruction: toNonEmptyString(record.instruction ?? record.description, `请执行步骤 ${index + 1}`),
      voiceText: toNonEmptyString(
        record.voiceText ?? record.instruction ?? record.description,
        `请执行步骤 ${index + 1}`
      ),
      timeOffset,
      duration,
      heatLevel: normalizeHeatLevel(record.heatLevel ?? record.heat ?? record.fire),
      needUserConfirm
    }

    currentOffset = Math.max(currentOffset, timeOffset) + duration
    return normalizedStep
  })
}

function normalizeFromUnknown(input: unknown, warnings: string[]): RecipeResult {
  const record = asRecord(input)

  const dishName = toNonEmptyString(record.dishName ?? record.name, DEFAULT_RECIPE_RESULT.dishName)
  const description = toNonEmptyString(
    record.description ?? record.summary ?? record.sceneTips,
    DEFAULT_RECIPE_RESULT.description
  )
  const servingSize = toPositiveInteger(record.servingSize ?? record.servings ?? record.people, 1) || 1
  const difficulty = normalizeDifficulty(record.difficulty)
  const ingredients = normalizeIngredients(record.ingredients, warnings)
  const prepTips = normalizePrepTips(record.prepTips ?? record.prepSuggestions, warnings)
  const timelineSteps = normalizeTimelineSteps(record.timelineSteps ?? record.steps, warnings)

  const totalDurationFromField = toPositiveInteger(
    record.totalDuration ??
      (record.estimatedTotalMinutes !== undefined
        ? toPositiveInteger(record.estimatedTotalMinutes, 0) * 60
        : undefined),
    0
  )

  const totalDuration =
    totalDurationFromField || timelineSteps.reduce((sum, step) => sum + step.duration, 0)

  return {
    dishName,
    description,
    servingSize,
    difficulty,
    totalDuration,
    ingredients,
    prepTips,
    timelineSteps
  }
}

export function normalizeRecipeResult(input: unknown): RecipeResult {
  const warnings: string[] = []
  return normalizeFromUnknown(input, warnings)
}

export function validateRecipeResult(input: unknown): RecipeValidationResult {
  const warnings: string[] = []
  const normalized = normalizeFromUnknown(input, warnings)
  const errors: string[] = []

  if (!normalized.dishName) {
    errors.push('dishName 缺失')
  }

  if (!normalized.description) {
    warnings.push('description 缺失，已使用默认描述')
  }

  if (!normalized.ingredients.length) {
    errors.push('ingredients 不能为空')
  }

  if (!normalized.prepTips.length) {
    warnings.push('prepTips 为空，页面可按空态显示')
  }

  if (!normalized.timelineSteps.length) {
    errors.push('timelineSteps 不能为空')
  }

  normalized.timelineSteps.forEach((step, index) => {
    if (!step.title) {
      errors.push(`timelineSteps[${index}].title 缺失`)
    }

    if (!step.instruction) {
      errors.push(`timelineSteps[${index}].instruction 缺失`)
    }

    if (step.duration < 0) {
      errors.push(`timelineSteps[${index}].duration 不能小于 0`)
    }
  })

  if (normalized.totalDuration <= 0 && normalized.timelineSteps.length) {
    warnings.push('totalDuration 缺失，已根据 timelineSteps.duration 自动汇总')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalized
  }
}
