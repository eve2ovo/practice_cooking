<template>
  <view class="panel-card section-card">
    <view class="section-head">
      <text class="section-name">{{ title }}</text>
      <slot name="extra" />
    </view>
    <slot />
  </view>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>

<style scoped lang="scss">
.section-card {
  padding: 28rpx;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22rpx;
}

.section-name {
  font-size: 30rpx;
  font-weight: 700;
  color: #5b4424;
}
</style>
