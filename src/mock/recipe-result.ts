import type { RecipeResult } from '@/types/recipe-result'

export const mockRecipeResultExample: RecipeResult = {
  dishName: '番茄炒蛋',
  description: '一道适合新手的家常菜，酸甜开胃，流程清晰，适合做时间轴提醒演示。',
  servingSize: 2,
  difficulty: 'EASY',
  totalDuration: 540,
  ingredients: [
    { name: '番茄', amount: '2个' },
    { name: '鸡蛋', amount: '3个' },
    { name: '小葱', amount: '1根' },
    { name: '食用油', amount: '1勺' },
    { name: '盐', amount: '3克' },
    { name: '糖', amount: '2克' }
  ],
  prepTips: [
    '番茄切块，鸡蛋提前打散并加少许盐。',
    '调料先放手边，开火后不容易手忙脚乱。',
    '如果喜欢汤汁多一点，可以预留 2 勺清水。'
  ],
  timelineSteps: [
    {
      stepNo: 1,
      type: 'confirm',
      title: '准备食材',
      instruction: '切好番茄和葱花，鸡蛋打散备用。',
      voiceText: '第一步，请先切好番茄和葱花，把鸡蛋打散备用。',
      timeOffset: 0,
      duration: 180,
      heatLevel: 'OFF',
      needUserConfirm: true
    },
    {
      stepNo: 2,
      type: 'auto',
      title: '炒鸡蛋',
      instruction: '中火热锅下油，倒入蛋液，快速划散后盛出。',
      voiceText: '第二步，中火热锅下油，倒入蛋液，快速划散后盛出。',
      timeOffset: 180,
      duration: 90,
      heatLevel: 'MEDIUM',
      needUserConfirm: false
    },
    {
      stepNo: 3,
      type: 'auto',
      title: '炒番茄',
      instruction: '锅中补少量油，下番茄翻炒至出汁。',
      voiceText: '第三步，下番茄翻炒到变软出汁。',
      timeOffset: 270,
      duration: 120,
      heatLevel: 'MEDIUM',
      needUserConfirm: false
    },
    {
      stepNo: 4,
      type: 'wait',
      title: '调味收汁',
      instruction: '加入盐和糖，和鸡蛋一起翻匀，略收汁。',
      voiceText: '第四步，加入盐和糖，再把鸡蛋回锅翻匀。',
      timeOffset: 390,
      duration: 90,
      heatLevel: 'LOW',
      needUserConfirm: false
    },
    {
      stepNo: 5,
      type: 'confirm',
      title: '出锅装盘',
      instruction: '观察汤汁状态，确认味道合适后关火装盘。',
      voiceText: '最后一步，确认味道和状态后关火装盘。',
      timeOffset: 480,
      duration: 60,
      heatLevel: 'OFF',
      needUserConfirm: true
    }
  ]
}

export const mockRecipeResultRawExample = {
  name: '番茄炒蛋',
  summary: '经典家常菜，适合下饭。',
  servings: '2',
  difficulty: '简单',
  estimatedTotalMinutes: '9',
  ingredients: ['番茄', { name: '鸡蛋', amount: 3 }, { ingredient: '盐', quantity: '3克' }],
  prepSuggestions: ['番茄切块', '鸡蛋提前打散'],
  timelineSteps: [
    {
      step: '1',
      type: 'manual',
      title: '准备食材',
      instruction: '切番茄、打蛋液',
      durationSeconds: '180',
      heat: 'off',
      needUserConfirm: 'true'
    },
    {
      order: 2,
      title: '炒鸡蛋',
      description: '中火热锅下油后炒蛋',
      voiceText: '',
      timeOffset: '180',
      duration: '90',
      heatLevel: 'medium'
    }
  ]
}
