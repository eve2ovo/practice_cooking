import { STORAGE_KEYS } from '@/constants/storageKeys'
import { getStorage, setStorage, removeStorage } from '@/utils/storage'

export function createDefaultWorkflowSettings() {
  return {
    serverBaseUrl: '',
    generatePath: '/api/recipe/generate',
    healthPath: '/api/recipe/health',
    useMockWhenOffline: true,
    lastTestMessage: '',
    lastTestSuccess: false
  }
}

export function loadWorkflowSettings() {
  const saved = getStorage(STORAGE_KEYS.settings, null)
  return {
    ...createDefaultWorkflowSettings(),
    ...(saved || {})
  }
}

export function saveWorkflowSettings(config) {
  return setStorage(STORAGE_KEYS.settings, config)
}

export function clearWorkflowSettings() {
  return removeStorage(STORAGE_KEYS.settings)
}
