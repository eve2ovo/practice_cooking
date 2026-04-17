<template>
  <view class="timeline-list">
    <view
      v-for="(item, index) in steps"
      :key="item.stepNo || index"
      class="timeline-item"
      :class="{
        current: index === currentIndex,
        done: index < currentIndex
      }"
    >
      <view class="dot-line">
        <view class="dot">{{ item.stepNo || index + 1 }}</view>
        <view v-if="index !== steps.length - 1" class="line" />
      </view>
      <view class="content">
        <view class="row">
          <text class="title">{{ item.title }}</text>
          <text class="heat">{{ formatHeatLevel(item.heatLevel) }}</text>
        </view>
        <text class="desc">{{ item.instruction }}</text>
        <text v-if="item.duration" class="time">
          预计 {{ Math.ceil(item.duration / 60) }} 分钟 · {{ formatStepType(item.type) }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  steps: {
    type: Array,
    default: () => []
  },
  currentIndex: {
    type: Number,
    default: -1
  }
})

function formatHeatLevel(level) {
  const map = {
    HIGH: '大火',
    MEDIUM: '中火',
    LOW: '小火',
    OFF: '关火'
  }
  return map[level] || '关火'
}

function formatStepType(type) {
  const map = {
    auto: '自动提醒',
    wait: '等待观察',
    confirm: '确认操作'
  }
  return map[type] || '自动提醒'
}
</script>

<style scoped lang="scss">
.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.timeline-item {
  display: flex;
  gap: 18rpx;
}

.dot-line {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40rpx;
}

.dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  border-radius: 999rpx;
  background: rgba(239, 185, 77, 0.24);
  color: #8d734b;
  font-size: 22rpx;
  font-weight: 700;
}

.line {
  flex: 1;
  width: 4rpx;
  margin-top: 8rpx;
  background: rgba(239, 185, 77, 0.18);
}

.content {
  flex: 1;
  padding-bottom: 24rpx;
}

.row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.title {
  font-size: 28rpx;
  font-weight: 700;
  color: #5b4424;
}

.heat {
  flex-shrink: 0;
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(252, 231, 167, 0.5);
  color: #da9d27;
  font-size: 22rpx;
}

.desc {
  display: block;
  margin-top: 10rpx;
  font-size: 25rpx;
  line-height: 1.65;
  color: #8d734b;
}

.time {
  display: inline-block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #b08b4a;
}

.timeline-item.current .dot {
  background: linear-gradient(135deg, #f7cf5b, #efb94d);
  color: #ffffff;
}

.timeline-item.done .dot {
  background: rgba(117, 168, 67, 0.22);
  color: #5f8336;
}
</style>
