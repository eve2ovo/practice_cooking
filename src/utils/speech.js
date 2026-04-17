export function speakText(text, enabled = true) {
  if (!enabled || !text) {
    return
  }

  try {
    if (typeof plus !== 'undefined' && plus.speech) {
      plus.speech.speak(text)
      return
    }

    if (typeof speechSynthesis !== 'undefined') {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      speechSynthesis.cancel()
      speechSynthesis.speak(utterance)
      return
    }

    uni.vibrateShort({
      type: 'light'
    })
  } catch (error) {
    console.warn('speakText failed:', error)
  }
}

export function stopSpeak() {
  try {
    if (typeof plus !== 'undefined' && plus.speech) {
      plus.speech.stop()
    }

    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel()
    }
  } catch (error) {
    console.warn('stopSpeak failed:', error)
  }
}
