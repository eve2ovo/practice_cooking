<template>
  <view class="page-shell settings-page">
    <SectionCard title="后端服务设置">
      <view class="field-block">
        <text class="label-text">serverBaseUrl</text>
        <input
          v-model.trim="form.serverBaseUrl"
          class="field-input"
          placeholder="请输入你的后端地址，例如 https://api.example.com"
        />
        <text class="field-hint">小程序只请求你的后端，由后端去调用你导入的 Dify workflow。真机预览和正式发布不能使用 localhost，必须换成公网 HTTPS 地址，并在微信后台配置 request 合法域名。</text>
      </view>

      <view class="field-block">
        <text class="label-text">generatePath</text>
        <input
          v-model.trim="form.generatePath"
          class="field-input"
          placeholder="默认 /api/recipe/generate"
        />
      </view>

      <view class="field-block">
        <text class="label-text">healthPath</text>
        <input
          v-model.trim="form.healthPath"
          class="field-input"
          placeholder="默认 /api/recipe/health"
        />
      </view>

      <view class="field-block">
        <text class="label-text">离线时使用 mock</text>
        <view class="chip-row">
          <view
            class="chip-btn"
            :class="{ 'is-active': form.useMockWhenOffline }"
            @click="form.useMockWhenOffline = true"
          >
            开启
          </view>
          <view
            class="chip-btn"
            :class="{ 'is-active': !form.useMockWhenOffline }"
            @click="form.useMockWhenOffline = false"
          >
            关闭
          </view>
        </view>
        <text class="field-hint">开发阶段没接后端时可继续使用本地 mock 菜谱。</text>
      </view>

      <view class="button-row">
        <button class="secondary-btn half-btn" :loading="testing" @click="handleTestConnection">
          测试后端
        </button>
        <button class="primary-btn half-btn" @click="handleSaveConfig">保存配置</button>
      </view>

      <view v-if="statusMessage" class="status-box" :class="statusSuccess ? 'is-success' : 'is-error'">
        <text class="status-text">{{ statusMessage }}</text>
      </view>
    </SectionCard>

    <SectionCard title="对接说明">
      <view class="tips-list">
        <text class="tip-item">1. 前端默认只请求你的后端接口，不再在小程序里保存 Dify 的 workflow token。</text>
        <text class="tip-item">2. 你的后端负责调用 Dify workflow，并返回标准 RecipeResult 数据。</text>
        <text class="tip-item">3. 推荐后端提供两个接口：POST {{ form.generatePath || '/api/recipe/generate' }} 和 GET {{ form.healthPath || '/api/recipe/health' }}。</text>
        <text class="tip-item">4. 如果你在微信开发者工具或真机里测试，请导入最新构建产物；真机和预览版还需要把后端域名配置到微信小程序 request 合法域名。</text>
      </view>
    </SectionCard>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import SectionCard from '@/components/SectionCard.vue'
import { useSettingsStore } from '@/stores/settings'
import { testWorkflowConnection } from '@/api/workflow'

const settingsStore = useSettingsStore()

const form = reactive({
  serverBaseUrl: '',
  generatePath: '/api/recipe/generate',
  healthPath: '/api/recipe/health',
  useMockWhenOffline: true
})

const testing = ref(false)
const statusMessage = computed(() => settingsStore.config.lastTestMessage)
const statusSuccess = computed(() => settingsStore.config.lastTestSuccess)

function syncForm() {
  Object.assign(form, {
    serverBaseUrl: settingsStore.config.serverBaseUrl || '',
    generatePath: settingsStore.config.generatePath || '/api/recipe/generate',
    healthPath: settingsStore.config.healthPath || '/api/recipe/health',
    useMockWhenOffline: settingsStore.config.useMockWhenOffline !== false
  })
}

onShow(() => {
  syncForm()
})

function isValidHttpUrl(value) {
  return /^https?:\/\//i.test(value)
}

function isValidPath(value) {
  return /^\//.test(String(value || '').trim())
}

function validateForm() {
  if (!form.serverBaseUrl) {
    return '请填写 serverBaseUrl'
  }

  if (!isValidHttpUrl(form.serverBaseUrl)) {
    return 'serverBaseUrl 需以 http:// 或 https:// 开头'
  }

  if (!form.generatePath || !isValidPath(form.generatePath)) {
    return 'generatePath 需以 / 开头'
  }

  if (!form.healthPath || !isValidPath(form.healthPath)) {
    return 'healthPath 需以 / 开头'
  }

  return ''
}

function normalizePayload() {
  return {
    serverBaseUrl: form.serverBaseUrl.trim(),
    generatePath: form.generatePath.trim() || '/api/recipe/generate',
    healthPath: form.healthPath.trim() || '/api/recipe/health',
    useMockWhenOffline: Boolean(form.useMockWhenOffline)
  }
}

function showValidationError(message) {
  settingsStore.setTestResult({
    success: false,
    message
  })

  uni.showToast({
    title: message,
    icon: 'none'
  })
}

function handleSaveConfig() {
  const message = validateForm()
  if (message) {
    showValidationError(message)
    return
  }

  settingsStore.updateConfig(normalizePayload())
  uni.showToast({
    title: '配置已保存',
    icon: 'success'
  })
}

async function handleTestConnection() {
  const message = validateForm()
  if (message) {
    showValidationError(message)
    return
  }

  const payload = normalizePayload()
  settingsStore.updateConfig(payload)
  testing.value = true

  try {
    const result = await testWorkflowConnection(payload)
    settingsStore.setTestResult(result)

    uni.showToast({
      title: result.success ? '测试成功' : '测试失败',
      icon: result.success ? 'success' : 'none'
    })
  } catch (error) {
    showValidationError(error.message || '测试后端失败')
  } finally {
    testing.value = false
  }
}
</script>

<style scoped lang="scss">
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.field-block {
  margin-bottom: 28rpx;
}

.field-hint {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: #9a8259;
}

.button-row {
  display: flex;
  gap: 20rpx;
  margin-top: 10rpx;
}

.half-btn {
  flex: 1;
}

.status-box {
  margin-top: 24rpx;
  padding: 20rpx 22rpx;
  border-radius: 20rpx;
  border: 2rpx solid transparent;
}

.status-box.is-success {
  background: rgba(117, 168, 67, 0.12);
  border-color: rgba(117, 168, 67, 0.18);
}

.status-box.is-error {
  background: rgba(217, 102, 67, 0.1);
  border-color: rgba(217, 102, 67, 0.16);
}

.status-text {
  font-size: 25rpx;
  line-height: 1.6;
  color: #5b4424;
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
