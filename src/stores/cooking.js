import { defineStore } from 'pinia'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { getStorage, setStorage } from '@/utils/storage'
import { speakText, stopSpeak } from '@/utils/speech'

let timer = null

const sessionFactory = () => ({
  recipeId: '',
  stepIndex: 0,
  remainingSeconds: 0,
  elapsedSeconds: 0,
  status: 'idle',
  startedAt: '',
  speechEnabled: true
})

const summaryFactory = () => ({
  dishName: '',
  finishedAt: '',
  completedSteps: 0,
  totalSteps: 0,
  elapsedSeconds: 0,
  statusText: '未开始'
})

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function getRecipeSessionId(recipe) {
  return [recipe?.dishName || '', recipe?.servingSize || 0, recipe?.timelineSteps?.length || 0].join('|')
}

function getStepDuration(step) {
  return Number(step?.duration) || 0
}

export const useCookingStore = defineStore('cooking', {
  state: () => ({
    session: sessionFactory(),
    lastCompletion: summaryFactory()
  }),
  actions: {
    hydrate() {
      const session = getStorage(STORAGE_KEYS.cookingSession, null)
      const summary = getStorage(STORAGE_KEYS.cookingSummary, null)
      if (session) {
        this.session = {
          ...sessionFactory(),
          ...session,
          status: session.status === 'running' ? 'paused' : session.status
        }
      }
      if (summary) {
        this.lastCompletion = { ...summaryFactory(), ...summary }
      }
    },
    persistSession() {
      setStorage(STORAGE_KEYS.cookingSession, this.session)
    },
    persistSummary() {
      setStorage(STORAGE_KEYS.cookingSummary, this.lastCompletion)
    },
    getCurrentStep(recipe) {
      return recipe?.timelineSteps?.[this.session.stepIndex] || null
    },
    init(recipe) {
      stopTimer()
      const firstStep = recipe?.timelineSteps?.[0]
      this.session = {
        recipeId: getRecipeSessionId(recipe),
        stepIndex: 0,
        remainingSeconds: getStepDuration(firstStep),
        elapsedSeconds: 0,
        status: 'idle',
        startedAt: '',
        speechEnabled: this.session.speechEnabled
      }
      this.persistSession()
    },
    start(recipe) {
      const current = this.getCurrentStep(recipe)
      if (!current) return
      if (this.session.recipeId !== getRecipeSessionId(recipe)) this.init(recipe)
      stopTimer()
      this.session.status = 'running'
      this.session.startedAt = this.session.startedAt || new Date().toISOString()
      this.persistSession()
      speakText(current.voiceText || current.instruction, this.session.speechEnabled)
      timer = setInterval(() => this.tick(recipe), 1000)
    },
    tick(recipe) {
      if (this.session.status !== 'running') return
      if (this.session.remainingSeconds > 0) {
        this.session.remainingSeconds -= 1
        this.session.elapsedSeconds += 1
        this.persistSession()
      }
      if (this.session.remainingSeconds === 0) this.nextStep(recipe, true)
    },
    pause() {
      this.session.status = 'paused'
      stopTimer()
      this.persistSession()
      stopSpeak()
    },
    resume(recipe) {
      if (recipe?.timelineSteps?.length) this.start(recipe)
    },
    replayCurrent(recipe) {
      const current = this.getCurrentStep(recipe)
      if (current) speakText(current.voiceText || current.instruction, this.session.speechEnabled)
    },
    prevStep(recipe) {
      if (!recipe?.timelineSteps?.length) return
      stopTimer()
      this.session.stepIndex = Math.max(0, this.session.stepIndex - 1)
      this.session.remainingSeconds = getStepDuration(recipe.timelineSteps[this.session.stepIndex])
      this.session.status = 'paused'
      this.persistSession()
      this.replayCurrent(recipe)
    },
    nextStep(recipe, auto = false) {
      if (!recipe?.timelineSteps?.length) return
      if (this.session.stepIndex >= recipe.timelineSteps.length - 1) {
        this.complete(recipe)
        return
      }
      stopTimer()
      this.session.stepIndex += 1
      this.session.remainingSeconds = getStepDuration(recipe.timelineSteps[this.session.stepIndex])
      this.session.status = auto ? 'running' : 'paused'
      this.persistSession()
      if (auto) {
        this.resume(recipe)
        return
      }
      this.replayCurrent(recipe)
    },
    toggleSpeech() {
      this.session.speechEnabled = !this.session.speechEnabled
      this.persistSession()
    },
    complete(recipe) {
      stopTimer()
      stopSpeak()
      this.session.status = 'finished'
      this.persistSession()
      this.lastCompletion = {
        dishName: recipe?.dishName || '本次菜谱',
        finishedAt: new Date().toISOString(),
        completedSteps: recipe?.timelineSteps?.length || 0,
        totalSteps: recipe?.timelineSteps?.length || 0,
        elapsedSeconds: this.session.elapsedSeconds,
        statusText: '顺利完成'
      }
      this.persistSummary()
    },
    stopTimer,
    resetSession() {
      stopTimer()
      stopSpeak()
      this.session = sessionFactory()
      this.persistSession()
    }
  }
})
