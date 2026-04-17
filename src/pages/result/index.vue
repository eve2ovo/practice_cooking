<template>
  <view class="page-shell result-page">
    <template v-if="recipe">
      <view class="hero-card summary-card">
        <text class="dish-name">{{ recipe.dishName }}</text>
        <text class="dish-meta">
          {{ recipe.servingSize }}人份 · {{ difficultyLabel }} · {{ formatDurationText(recipe.totalDuration) }}
        </text>
        <text class="dish-desc">{{ recipe.description }}</text>
        <view class="meta-row">
          <view class="status-pill">{{ recipe.timelineSteps.length }} 个步骤</view>
          <view class="status-pill">结果已标准化</view>
        </view>
      </view>

      <SectionCard title="食材清单">
        <view class="tag-grid">
          <InfoTag
            v-for="item in recipe.ingredients"
            :key="`${item.name}-${item.amount}`"
            :label="item.name"
            :value="item.amount"
          />
        </view>
      </SectionCard>

      <SectionCard title="预处理建议">
        <view class="tips-list">
          <text v-for="item in recipe.prepTips" :key="item" class="tip-item">{{ item }}</text>
        </view>
      </SectionCard>

      <SectionCard title="步骤预览">
        <TimelinePreview :steps="recipe.timelineSteps" />
      </SectionCard>

      <view class="action-bar">
        <button class="secondary-btn" @click="handleRegenerate">重新生成</button>
        <button class="primary-btn" @click="goCooking">进入做菜模式</button>
      </view>
    </template>

    <SectionCard v-else title="还没有菜谱结果">
      <text class="hint-text">先回首页生成一份结构化菜谱，再进入做菜模式。</text>
      <button class="primary-btn empty-btn" @click="goHome">返回首页</button>
    </SectionCard>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import SectionCard from '@/components/SectionCard.vue'
import InfoTag from '@/components/InfoTag.vue'
import TimelinePreview from '@/components/TimelinePreview.vue'
import { useRecipeStore } from '@/stores/recipe'
import { useCookingStore } from '@/stores/cooking'
import { formatDurationText } from '@/utils/time'

const recipeStore = useRecipeStore()
const cookingStore = useCookingStore()

const recipe = computed(() => recipeStore.recipe)
const difficultyLabel = computed(() => {
  const map = {
    EASY: '简单',
    MEDIUM: '中等',
    HARD: '进阶'
  }
  return map[recipe.value?.difficulty] || '中等'
})

function goHome() {
  uni.reLaunch({
    url: '/pages/index/index'
  })
}

async function handleRegenerate() {
  const result = await recipeStore.generateRecipe()
  if (result) {
    uni.showToast({
      title: '已重新生成',
      icon: 'success'
    })
  }
}

function goCooking() {
  if (!recipe.value?.timelineSteps?.length) {
    uni.showToast({
      title: '菜谱步骤为空',
      icon: 'none'
    })
    return
  }

  cookingStore.init(recipe.value)
  cookingStore.start(recipe.value)
  uni.navigateTo({
    url: '/pages/cooking/index'
  })
}
</script>

<style scoped lang="scss">
.result-page {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.summary-card {
  padding: 30rpx;
}

.dish-name {
  display: block;
  font-size: 42rpx;
  font-weight: 800;
  color: #5b4424;
}

.dish-meta {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #b08b4a;
}

.dish-desc {
  display: block;
  margin-top: 16rpx;
  font-size: 27rpx;
  line-height: 1.7;
  color: #8d734b;
}

.meta-row {
  display: flex;
  gap: 16rpx;
  margin-top: 20rpx;
}

.tag-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
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

.empty-btn {
  margin-top: 22rpx;
}
</style>
