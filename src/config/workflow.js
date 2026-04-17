function resolveServerBaseUrl() {
  if (typeof window === 'undefined') {
    return 'http://localhost:3000'
  }

  const { protocol, hostname, origin } = window.location
  const isLocalHost = ['localhost', '127.0.0.1'].includes(hostname)

  if (isLocalHost) {
    return 'http://localhost:3000'
  }

  // 非本地环境优先走同源后端，方便用反向代理一起部署。
  if (protocol === 'http:' || protocol === 'https:') {
    return origin
  }

  return 'http://localhost:3000'
}

export const WORKFLOW_CONFIG = {
  // 如果你的后端是单独域名，把这里改成真实后端地址即可。
  serverBaseUrl: resolveServerBaseUrl(),
  generatePath: '/api/recipe/generate',
  healthPath: '/api/recipe/health',
  // 接入真实后端后，默认不要静默回退到 mock，方便直接暴露问题。
  useMockWhenOffline: false
}
