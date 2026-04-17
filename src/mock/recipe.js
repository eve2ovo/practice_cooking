import { normalizeRecipeResult } from '@/utils/recipe-result'

function sleep(duration = 600) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration)
  })
}

function splitIngredients(text = '') {
  return String(text || '')
    .split(/[\n,，、;；]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function buildIngredients(payload) {
  const userIngredients = splitIngredients(payload.availableIngredients)
  const fallbackIngredients = payload.dishName.includes('鸡蛋')
    ? ['鸡蛋', '番茄', '小葱']
    : payload.dishName.includes('土豆')
      ? ['土豆', '青椒', '蒜末']
      : ['主食材', '蒜末', '葱花']

  return [...new Set([...userIngredients, ...fallbackIngredients])].slice(0, 6)
}

function buildTimelineSteps(payload) {
  const dishName = payload.dishName || '家常快手菜'
  const taste = payload.taste || '家常'

  return [
    {
      stepNo: 1,
      type: 'confirm',
      title: '准备食材',
      instruction: `把 ${dishName} 需要的食材洗净切配，常用调料提前摆到手边。`,
      voiceText: `第一步，准备食材。请先把${dishName}要用到的食材切好摆好。`,
      duration: 150,
      heatLevel: 'OFF',
      needUserConfirm: true
    },
    {
      stepNo: 2,
      type: 'auto',
      title: '热锅下油',
      instruction: '中火热锅后下油，轻轻转锅让油铺匀。',
      voiceText: '第二步，开中火热锅，下油并转动锅身，让油均匀铺开。',
      duration: 45,
      heatLevel: 'MEDIUM',
      needUserConfirm: false
    },
    {
      stepNo: 3,
      type: 'auto',
      title: '主料翻炒',
      instruction: '依次下主料和辅料快速翻炒，保持节奏避免糊锅。',
      voiceText: '第三步，下主料快速翻炒，保持节奏，不要糊锅。',
      duration: 150,
      heatLevel: 'HIGH',
      needUserConfirm: false
    },
    {
      stepNo: 4,
      type: 'wait',
      title: '调味收汁',
      instruction: `按 ${taste} 口味加入盐、生抽等调味，必要时补少量清水收汁。`,
      voiceText: '第四步，开始调味收汁，注意边尝边调，口味更稳。',
      duration: 120,
      heatLevel: 'LOW',
      needUserConfirm: false
    },
    {
      stepNo: 5,
      type: 'confirm',
      title: '出锅装盘',
      instruction: '确认成熟度与香味都到位后关火装盘。',
      voiceText: '最后一步，确认成熟度后关火装盘，这道菜就完成了。',
      duration: 60,
      heatLevel: 'OFF',
      needUserConfirm: true
    }
  ]
}

export async function mockGenerateRecipe(payload) {
  await sleep()

  const ingredients = buildIngredients(payload)
  const timelineSteps = buildTimelineSteps(payload)

  return normalizeRecipeResult({
    dishName: payload.dishName || '家常快手菜',
    description: `这是一份适合 ${Number(payload.servings) || 2} 人的 ${payload.taste || '家常'} 风味陪练菜谱，流程清晰，适合边做边跟。`,
    servingSize: Number(payload.servings) || 2,
    difficulty: 'EASY',
    ingredients: ingredients.map((name, index) => ({
      name,
      amount: index === 0 ? `${Math.max(1, Number(payload.servings) || 2)}人份主量` : '适量'
    })),
    prepTips: [
      `现有食材优先使用：${payload.availableIngredients || '按常见家用食材准备即可'}`,
      '建议先完成切配再开火，做菜节奏会更稳。',
      `如果偏好 ${payload.taste || '家常'} 风味，建议最后 1 分钟微调咸淡。`
    ],
    timelineSteps
  })
}
