export function padZero(value) {
  return String(value).padStart(2, '0')
}

export function formatSeconds(totalSeconds = 0) {
  const seconds = Math.max(0, Number(totalSeconds) || 0)
  const minutesPart = Math.floor(seconds / 60)
  const secondsPart = seconds % 60
  return `${padZero(minutesPart)}:${padZero(secondsPart)}`
}

export function formatDurationText(totalSeconds = 0) {
  const seconds = Math.max(0, Number(totalSeconds) || 0)
  if (seconds < 60) {
    return `${seconds}秒`
  }

  const minutes = Math.floor(seconds / 60)
  const remainSeconds = seconds % 60

  if (!remainSeconds) {
    return `${minutes}分钟`
  }

  return `${minutes}分${remainSeconds}秒`
}

export function formatDateTime(dateString) {
  if (!dateString) {
    return '--'
  }

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return '--'
  }

  const month = padZero(date.getMonth() + 1)
  const day = padZero(date.getDate())
  const hours = padZero(date.getHours())
  const minutes = padZero(date.getMinutes())
  return `${month}-${day} ${hours}:${minutes}`
}
