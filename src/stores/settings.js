import { defineStore } from 'pinia'
import {
  createDefaultWorkflowSettings,
  loadWorkflowSettings,
  saveWorkflowSettings
} from '@/utils/workflowSettingsStorage'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    config: createDefaultWorkflowSettings()
  }),
  actions: {
    hydrate() {
      this.config = loadWorkflowSettings()
    },
    save() {
      saveWorkflowSettings(this.config)
    },
    updateConfig(partialConfig = {}) {
      this.config = {
        ...this.config,
        ...partialConfig
      }
      this.save()
    },
    resetConfig() {
      this.config = createDefaultWorkflowSettings()
      this.save()
    },
    setTestResult(result = {}) {
      this.config.lastTestMessage = result.message || ''
      this.config.lastTestSuccess = Boolean(result.success)
      this.save()
    }
  }
})
