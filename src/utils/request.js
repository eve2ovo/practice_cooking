export function parseHeadersJson(headersJson = '') {
  const rawText = String(headersJson || '').trim()

  if (!rawText) {
    return {}
  }

  const parsed = JSON.parse(rawText)

  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error('headersJson 必须是 JSON 对象')
  }

  return parsed
}

export function buildHeaders({ token = '', headersJson = '', extraHeaders = {} } = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...parseHeadersJson(headersJson),
    ...extraHeaders
  }

  if (token) {
    headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`
  }

  return headers
}

export function request({ url, method = 'GET', data = {}, headers = {}, timeout = 15000 }) {
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method,
      data,
      timeout,
      header: headers,
      success: (response) => {
        const { statusCode, data: responseData } = response

        if (statusCode >= 200 && statusCode < 300) {
          resolve({
            statusCode,
            data: responseData,
            raw: response
          })
          return
        }

        reject(
          new Error(
            typeof responseData?.message === 'string'
              ? responseData.message
              : `请求失败，状态码 ${statusCode}`
          )
        )
      },
      fail: (error) => {
        reject(new Error(error?.errMsg || '网络请求失败'))
      }
    })
  })
}
