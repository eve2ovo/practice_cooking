let currentText = ''

function hasPlusSpeech() {
  return typeof plus !== 'undefined' && plus.speech
}

function hasWebSpeech() {
  return typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined'
}

export function speakText(text, enabled = true) {
  currentText = text || ''

  if (!currentText) {
    stopSpeak()
    return false
  }

  if (!enabled) {
    stopSpeak({ resetText: false })
    return false
  }

  try {
    if (hasPlusSpeech()) {
      plus.speech.stop?.()
      plus.speech.speak?.(currentText)
      return true
    }

    if (hasWebSpeech()) {
      speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(currentText)
      utterance.lang = 'zh-CN'

      speechSynthesis.speak(utterance)
      return true
    }

    uni.vibrateShort({
      type: 'light'
    })
    return false
  } catch (error) {
    console.warn('speakText failed:', error)
    return false
  }
}

export function pauseSpeak() {
  try {
    if (hasPlusSpeech() && typeof plus.speech.pause === 'function') {
      plus.speech.pause()
      return true
    }

    if (hasWebSpeech() && speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause()
      return true
    }
  } catch (error) {
    console.warn('pauseSpeak failed:', error)
  }

  return false
}

export function resumeSpeak(enabled = true) {
  if (!enabled) {
    return false
  }

  try {
    if (hasPlusSpeech() && typeof plus.speech.resume === 'function') {
      plus.speech.resume()
      return true
    }

    if (hasWebSpeech() && speechSynthesis.paused) {
      speechSynthesis.resume()
      return true
    }
  } catch (error) {
    console.warn('resumeSpeak failed:', error)
  }

  return false
}

export function replaySpeak(enabled = true) {
  if (!currentText) {
    return false
  }

  return speakText(currentText, enabled)
}

export function stopSpeak(options = {}) {
  const { resetText = true } = options

  try {
    if (hasPlusSpeech()) {
      plus.speech.stop?.()
    }

    if (hasWebSpeech()) {
      speechSynthesis.cancel()
    }
  } catch (error) {
    console.warn('stopSpeak failed:', error)
  } finally {
    if (resetText) {
      currentText = ''
    }
  }
}
