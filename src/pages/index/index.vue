<template>
  <view class="page-shell home-page">
    <view class="hero-card hero">
      <view class="hero-top">
        <view>
          <text class="hero-title">AI做饭陪练</text>
          <text class="hero-subtitle">输入想做的菜，快速生成结构化菜谱与时间轴提醒。</text>
        </view>
      </view>
      <view class="hero-note">
        <text class="status-pill">当前已固定走后端 workflow 接口，生成失败时会直接提示错误，不再依赖设置页。</text>
      </view>
    </view>

    <SectionCard title="今天想做什么">
      <view class="field-block">
        <text class="label-text">菜名</text>
        <textarea
          v-model="dishName"
          class="field-textarea single-line-textarea"
          auto-height
          placeholder="例如：番茄炒蛋、青椒土豆丝"
          maxlength="30"
        />
      </view>

      <view class="field-block">
        <text class="label-text">人数</text>
        <view class="chip-row">
          <view
            v-for="count in servingsOptions"
            :key="count"
            class="chip-btn"
            :class="{ 'is-active': !isCustomServings && servings === count }"
            @click="selectServings(count)"
          >
            {{ count }}人
          </view>
          <view
            class="chip-btn"
            :class="{ 'is-active': isCustomServings }"
            @click="enableCustomServings"
          >
            自定义
          </view>
        </view>
        <view v-if="isCustomServings" class="custom-input-wrap">
          <textarea
            v-model="customServings"
            class="field-textarea single-line-textarea"
            auto-height
            maxlength="3"
            placeholder="请输入人数，例如 5"
            @input="normalizeCustomServings"
          />
          <text class="hint-text custom-hint">会按你输入的人数生成食材和步骤建议。</text>
        </view>
      </view>

      <view class="field-block">
        <text class="label-text">口味偏好</text>
        <view class="chip-row">
          <view
            v-for="item in tasteOptions"
            :key="item"
            class="chip-btn"
            :class="{ 'is-active': !isCustomTaste && taste === item }"
            @click="selectTaste(item)"
          >
            {{ item }}
          </view>
          <view
            class="chip-btn"
            :class="{ 'is-active': isCustomTaste }"
            @click="enableCustomTaste"
          >
            自定义
          </view>
        </view>
        <view v-if="isCustomTaste" class="custom-input-wrap">
          <textarea
            v-model="customTaste"
            class="field-textarea single-line-textarea"
            auto-height
            maxlength="20"
            placeholder="请输入口味，例如 偏甜、少油少盐"
          />
          <text class="hint-text custom-hint">支持更细的口味描述，生成结果会尽量贴合你的偏好。</text>
        </view>
      </view>

      <view class="field-block">
        <text class="label-text">现有食材</text>
        <textarea
          v-model="availableIngredients"
          class="field-textarea"
          placeholder="例如：鸡蛋、番茄、葱花、蒜末"
          maxlength="200"
        />
        <text class="hint-text">可输入冰箱现有食材，AI 会优先纳入建议。</text>
      </view>

      <button class="primary-btn submit-btn" :loading="recipeStore.loading" @click="handleGenerate">
        生成陪练菜谱
      </button>
    </SectionCard>

    <SectionCard title="使用说明">
      <view class="tips-list">
        <text class="tip-item">1. 首页负责采集菜名、人数、口味和现有食材。</text>
        <text class="tip-item">2. 结果页会展示结构化菜谱、预处理建议和步骤预览。</text>
        <text class="tip-item">3. 做菜模式会根据时间轴自动倒计时，并支持语音重播与步骤切换。</text>
      </view>
    </SectionCard>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import SectionCard from '@/components/SectionCard.vue'
import { useRecipeStore } from '@/stores/recipe'

const recipeStore = useRecipeStore()

const defaultServings = 2
const defaultTaste = '家常'
const servingsOptions = [1, 2, 3, 4, 6]
const tasteOptions = ['清淡', '家常', '微辣', '香辣', '下饭']

const dishName = ref('')
const servings = ref(defaultServings)
const taste = ref(defaultTaste)
const availableIngredients = ref('')
const isCustomServings = ref(false)
const isCustomTaste = ref(false)
const customServings = ref('')
const customTaste = ref('')

function syncForm() {
  dishName.value = recipeStore.form.dishName || ''
  availableIngredients.value = recipeStore.form.availableIngredients || ''

  const savedServings = Number(recipeStore.form.servings)
  if (Number.isInteger(savedServings) && savedServings > 0 && servingsOptions.includes(savedServings)) {
    servings.value = savedServings
    isCustomServings.value = false
    customServings.value = ''
  } else if (Number.isInteger(savedServings) && savedServings > 0) {
    servings.value = defaultServings
    isCustomServings.value = true
    customServings.value = String(savedServings)
  } else {
    servings.value = defaultServings
    isCustomServings.value = false
    customServings.value = ''
  }

  const savedTaste = String(recipeStore.form.taste || '').trim()
  if (tasteOptions.includes(savedTaste)) {
    taste.value = savedTaste
    isCustomTaste.value = false
    customTaste.value = ''
  } else if (savedTaste) {
    taste.value = defaultTaste
    isCustomTaste.value = true
    customTaste.value = savedTaste
  } else {
    taste.value = defaultTaste
    isCustomTaste.value = false
    customTaste.value = ''
  }
}

onLoad(() => {
  syncForm()
})

function normalizeCustomServings(event) {
  customServings.value = String(event?.detail?.value || customServings.value || '')
    .replace(/[^\d]/g, '')
    .slice(0, 3)
}

function selectServings(count) {
  isCustomServings.value = false
  servings.value = count
}

function enableCustomServings() {
  isCustomServings.value = true
}

function selectTaste(value) {
  isCustomTaste.value = false
  taste.value = value
}

function enableCustomTaste() {
  isCustomTaste.value = true
}

function resolveServings() {
  if (!isCustomServings.value) {
    return servings.value
  }

  const normalized = String(customServings.value || '').trim()
  const parsed = Number(normalized)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    uni.showToast({
      title: '请输入正确的人数',
      icon: 'none'
    })
    return null
  }

  return parsed
}

function resolveTaste() {
  const finalTaste = String(isCustomTaste.value ? customTaste.value : taste.value || '').trim()

  if (!finalTaste) {
    uni.showToast({
      title: '请输入口味偏好',
      icon: 'none'
    })
    return null
  }

  return finalTaste
}

async function handleGenerate() {
  if (!dishName.value.trim()) {
    uni.showToast({
      title: '请先输入菜名',
      icon: 'none'
    })
    return
  }

  const finalServings = resolveServings()
  if (!finalServings) {
    return
  }

  const finalTaste = resolveTaste()
  if (!finalTaste) {
    return
  }

  recipeStore.setForm({
    dishName: dishName.value.trim(),
    servings: finalServings,
    taste: finalTaste,
    availableIngredients: availableIngredients.value.trim()
  })

  const result = await recipeStore.generateRecipe()

  if (result) {
    uni.navigateTo({
      url: '/pages/result/index'
    })
  }
}
</script>

<style scoped lang="scss">
.home-page {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.hero {
  padding: 30rpx;
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.hero-title {
  display: block;
  font-size: 42rpx;
  font-weight: 800;
  color: #5b4424;
}

.hero-subtitle {
  display: block;
  margin-top: 12rpx;
  font-size: 27rpx;
  line-height: 1.6;
  color: #8d734b;
}

.hero-note {
  margin-top: 22rpx;
}

.field-block {
  margin-bottom: 28rpx;
}

.custom-input-wrap {
  margin-top: 18rpx;
}

.single-line-textarea {
  min-height: 88rpx;
  max-height: 88rpx;
  overflow: hidden;
}

.custom-hint {
  display: block;
  margin-top: 12rpx;
}

.submit-btn {
  margin-top: 18rpx;
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
</style>
