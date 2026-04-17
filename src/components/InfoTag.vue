<template>
  <view class="info-tag" :class="{ owned }">
    <text class="name">{{ label }}</text>
    <text v-if="value" class="value">{{ value }}</text>
  </view>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: ''
  },
  value: {
    type: String,
    default: ''
  },
  owned: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped lang="scss">
.info-tag {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  padding: 14rpx 18rpx;
  border-radius: 20rpx;
  background: rgba(252, 231, 167, 0.42);
  color: #8d734b;
  font-size: 24rpx;
}

.info-tag.owned {
  background: rgba(117, 168, 67, 0.16);
  color: #5f8336;
}

.name {
  font-weight: 600;
}

.value {
  opacity: 0.85;
}
</style>
