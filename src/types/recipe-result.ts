export type TimelineStepType = 'auto' | 'wait' | 'confirm'

export type HeatLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'OFF'

export type RecipeDifficulty = 'EASY' | 'MEDIUM' | 'HARD'

export interface RecipeIngredient {
  name: string
  amount: string
}

export interface RecipeTimelineStep {
  stepNo: number
  type: TimelineStepType
  title: string
  instruction: string
  voiceText: string
  timeOffset: number
  duration: number
  heatLevel: HeatLevel
  needUserConfirm: boolean
}

export interface RecipeResult {
  dishName: string
  description: string
  servingSize: number
  difficulty: RecipeDifficulty
  totalDuration: number
  ingredients: RecipeIngredient[]
  prepTips: string[]
  timelineSteps: RecipeTimelineStep[]
}

export interface RecipeValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  normalized: RecipeResult
}
