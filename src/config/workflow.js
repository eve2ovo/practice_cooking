const configuredServerBaseUrl =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_SERVER_BASE_URL
    ? String(import.meta.env.VITE_SERVER_BASE_URL).trim()
    : ''

function resolveServerBaseUrl() {
  if (configuredServerBaseUrl) {
    return configuredServerBaseUrl.replace(/\/+$/, '')
  }

  if (typeof window === 'undefined') {
    return 'http://localhost:3000'
  }

  const { protocol, hostname, origin } = window.location
  const isLocalHost = ['localhost', '127.0.0.1'].includes(hostname)

  if (isLocalHost) {
    return 'http://localhost:3000'
  }

  // Non-local deployments can point to the same origin backend by default.
  if (protocol === 'http:' || protocol === 'https:') {
    return origin
  }

  return 'http://localhost:3000'
}

export const WORKFLOW_CONFIG = {
  serverBaseUrl: resolveServerBaseUrl(),
  generatePath: '/api/recipe/generate',
  healthPath: '/api/recipe/health',
  useMockWhenOffline: false
}
