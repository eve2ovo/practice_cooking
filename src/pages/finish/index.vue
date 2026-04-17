<template>
  <view class="page-shell finish-page">
    <view class="hero-card finish-card">
      <text class="finish-title">本次做菜已完成</text>
      <text class="finish-status">{{ summary.statusText }}</text>
      <view class="summary-grid">
        <view class="summary-item">
          <text class="summary-label">菜品</text>
          <text class="summary-value">{{ summary.dishName || recipe?.dishName || '本次菜谱' }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">完成时间</text>
          <text class="summary-value">{{ formatDateTime(summary.finishedAt) }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">完成步骤</text>
          <text class="summary-value">{{ summary.completedSteps }}/{{ summary.totalSteps }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">总耗时</text>
          <text class="summary-value">{{ formatDurationText(summary.elapsedSeconds) }}</text>
        </view>
      </view>
    </view>

    <SectionCard title="完成情况">
      <view class="tips-list">
        <text class="tip-item">1. 时间轴流程已走完，适合复盘本次火候和调味节奏。</text>
        <text class="tip-item">2. 下次可在首页更换菜名或人数，继续生成新的陪练菜谱。</text>
        <text class="tip-item">3. 若已部署后端 Dify 服务，关闭 mock 后即可直接通过后端生成标准菜谱 JSON。</text>
      </view>
    </SectionCard>

    <view class="action-bar">
      <button class="secondary-btn" @click="viewRecipe">查看结果页</button>
      <button class="primary-btn" @click="restartFlow">再做一道</button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import SectionCard from '@/components/SectionCard.vue'
import { useCookingStore } from '@/stores/cooking'
import { useRecipeStore } from '@/stores/recipe'
import { formatDateTime, formatDurationText } from '@/utils/time'

const cookingStore = useCookingStore()
const recipeStore = useRecipeStore()

const summary = computed(() => cookingStore.lastCompletion)
const recipe = computed(() => recipeStore.recipe)

function restartFlow() {
  cookingStore.resetSession()
  uni.reLaunch({
    url: '/pages/index/index'
  })
}

function viewRecipe() {
  uni.redirectTo({
    url: '/pages/result/index'
  })
}
</script>

<style scoped lang="scss">
.finish-page {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.finish-card {
  padding: 30rpx;
}

.finish-title {
  display: block;
  font-size: 40rpx;
  font-weight: 800;
  color: #5b4424;
}

.finish-status {
  display: block;
  margin-top: 12rpx;
  font-size: 28rpx;
  color: #75a843;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18rpx;
  margin-top: 24rpx;
}

.summary-item {
  padding: 22rpx;
  border-radius: 22rpx;
  background: rgba(255, 250, 240, 0.9);
}

.summary-label {
  display: block;
  font-size: 22rpx;
  color: #b08b4a;
}

.summary-value {
  display: block;
  margin-top: 10rpx;
  font-size: 27rpx;
  line-height: 1.5;
  color: #5b4424;
  font-weight: 700;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.tip-item {
  font-size: 26rpx;
  line-height: 1.7;
  color: #8d734b;
}

.action-bar {
  display: flex;
  gap: 20rpx;
}

.action-bar button {
  flex: 1;
}
</style>

