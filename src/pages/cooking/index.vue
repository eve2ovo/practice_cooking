<template>
  <view class="page-shell cooking-page">
    <template v-if="recipe && currentStep">
      <view class="hero-card cooking-hero">
        <view class="hero-row">
          <view>
            <text class="hero-title">{{ recipe.dishName }}</text>
            <text class="hero-subtitle">
              第 {{ cookingStore.session.stepIndex + 1 }} / {{ recipe.timelineSteps.length }} 步
            </text>
          </view>
          <view class="status-pill" @click="cookingStore.toggleSpeech()">
            {{ cookingStore.session.speechEnabled ? '语音开' : '语音关' }}
          </view>
        </view>

        <view class="timer-ring">
          <text class="timer-text">{{ formatSeconds(cookingStore.session.remainingSeconds) }}</text>
          <text class="timer-label">{{ heatLabel }}</text>
        </view>

        <view class="progress-track">
          <view class="progress-fill" :style="{ width: `${progressPercent}%` }" />
        </view>
      </view>

      <SectionCard title="当前步骤">
        <text class="step-title">{{ currentStep.title }}</text>
        <text class="step-desc">{{ currentStep.instruction }}</text>
        <text class="step-tip">提示：{{ stepTip }}</text>
      </SectionCard>

      <SectionCard title="操作面板">
        <view class="control-grid">
          <button class="secondary-btn" @click="handlePrev">上一步</button>
          <button class="secondary-btn" @click="handleReplay">重播提醒</button>
          <button class="primary-btn" @click="toggleRunning">
            {{ cookingStore.session.status === 'running' ? '暂停' : '继续' }}
          </button>
          <button class="ghost-btn" @click="handleNext">下一步</button>
        </view>
      </SectionCard>

      <SectionCard title="时间轴">
        <TimelinePreview :steps="recipe.timelineSteps" :current-index="cookingStore.session.stepIndex" />
      </SectionCard>
    </template>

    <SectionCard v-else title="做菜模式未启动">
      <text class="hint-text">请先从结果页进入做菜模式。</text>
      <button class="primary-btn back-btn" @click="goResult">返回结果页</button>
    </SectionCard>
  </view>
</template>

<script setup>
import { computed, watch } from 'vue'
import { onShow, onUnload } from '@dcloudio/uni-app'
import SectionCard from '@/components/SectionCard.vue'
import TimelinePreview from '@/components/TimelinePreview.vue'
import { useRecipeStore } from '@/stores/recipe'
import { useCookingStore } from '@/stores/cooking'
import { formatSeconds } from '@/utils/time'

const recipeStore = useRecipeStore()
const cookingStore = useCookingStore()

const recipe = computed(() => recipeStore.recipe)
const currentStep = computed(() => cookingStore.getCurrentStep(recipe.value))
const heatLabel = computed(() => {
  const map = {
    HIGH: '大火',
    MEDIUM: '中火',
    LOW: '小火',
    OFF: '关火'
  }
  return map[currentStep.value?.heatLevel] || '关火'
})
const stepTip = computed(() => {
  if (!currentStep.value) {
    return '按照步骤操作即可。'
  }

  if (currentStep.value.needUserConfirm) {
    return '这一步需要你确认状态后再进入下一步。'
  }

  if (currentStep.value.type === 'wait') {
    return '这一步更适合边观察边等待收汁或成熟度。'
  }

  return '按语音提醒和倒计时继续操作即可。'
})
const progressPercent = computed(() => {
  if (!recipe.value?.timelineSteps?.length) {
    return 0
  }

  const total = recipe.value.timelineSteps.length
  const current = currentStep.value
  const currentDuration = Number(current?.duration) || 0
  const currentProgress = currentDuration
    ? (currentDuration - cookingStore.session.remainingSeconds) / currentDuration
    : 0

  return Math.min(100, Math.max(0, ((cookingStore.session.stepIndex + currentProgress) / total) * 100))
})

function getRecipeSessionId(recipeValue) {
  return [recipeValue?.dishName || '', recipeValue?.servingSize || 0, recipeValue?.timelineSteps?.length || 0].join('|')
}

watch(
  () => cookingStore.session.status,
  (status) => {
    if (status === 'finished') {
      uni.redirectTo({
        url: '/pages/finish/index'
      })
    }
  }
)

onShow(() => {
  if (!recipe.value?.timelineSteps?.length) {
    return
  }

  if (cookingStore.session.recipeId !== getRecipeSessionId(recipe.value)) {
    cookingStore.init(recipe.value)
    cookingStore.start(recipe.value)
    return
  }

  if (cookingStore.session.status === 'idle') {
    cookingStore.start(recipe.value)
  }
})

onUnload(() => {
  cookingStore.stopTimer()
})

function toggleRunning() {
  if (!recipe.value) {
    return
  }

  if (cookingStore.session.status === 'running') {
    cookingStore.pause()
    return
  }

  cookingStore.resume(recipe.value)
}

function handleReplay() {
  if (!recipe.value) {
    return
  }
  cookingStore.replayCurrent(recipe.value)
}

function handlePrev() {
  if (!recipe.value) {
    return
  }
  cookingStore.prevStep(recipe.value)
}

function handleNext() {
  if (!recipe.value) {
    return
  }
  cookingStore.nextStep(recipe.value)
}

function goResult() {
  uni.navigateBack()
}
</script>

<style scoped lang="scss">
.cooking-page {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.cooking-hero {
  padding: 30rpx;
}

.hero-row {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.hero-title {
  display: block;
  font-size: 38rpx;
  font-weight: 800;
  color: #5b4424;
}

.hero-subtitle {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #b08b4a;
}

.timer-ring {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 260rpx;
  height: 260rpx;
  margin: 28rpx auto;
  border-radius: 999rpx;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.96), rgba(252, 231, 167, 0.55));
  box-shadow: inset 0 0 0 10rpx rgba(239, 185, 77, 0.12);
}

.timer-text {
  font-size: 58rpx;
  font-weight: 800;
  color: #da9d27;
}

.timer-label {
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #8d734b;
}

.progress-track {
  overflow: hidden;
  height: 16rpx;
  border-radius: 999rpx;
  background: rgba(239, 185, 77, 0.14);
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(135deg, #f7cf5b, #efb94d);
}

.step-title {
  display: block;
  font-size: 34rpx;
  font-weight: 800;
  color: #5b4424;
}

.step-desc {
  display: block;
  margin-top: 16rpx;
  font-size: 27rpx;
  line-height: 1.75;
  color: #8d734b;
}

.step-tip {
  display: block;
  margin-top: 18rpx;
  font-size: 25rpx;
  color: #b08b4a;
}

.control-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18rpx;
}

.back-btn {
  margin-top: 22rpx;
}
</style>
