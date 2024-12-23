<template>
  <view class="member-card" :class="cardType">
    <!-- 会员卡信息区域 -->
    <view class="card-info">
      <view class="info-item">
        <!--       <text class="label">类型:</text> -->
        <text class="value">
          {{ cardType === "timeCard" ? "时间卡" : "次卡" }}
        </text>
      </view>
      <view class="info-item">
        <text class="label">有效期:</text>
        <text class="value">{{ validityPeriod }}</text>
      </view>

      <!-- 次卡显示次数信息 -->
      <view v-if="cardType === 'sessionCard'" class="info-item">
        <text class="label">剩余次数:</text>
        <text class="value">
          {{ remainingSessions }}/{{ totalSessions }} 次
        </text>
      </view>
    </view>

    <!-- 日期信息 -->
    <view class="date-info">
      <view class="date-item">
        <text>开卡日期: {{ startDate }}</text>
      </view>
      <view class="date-item">
        <text>有效期至: {{ expirationDate }}</text>
      </view>
    </view>

    <!-- 装饰图案 -->
    <view class="decoration">
      <view class="circle"></view>
      <view class="triangle"></view>
      <view class="line"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps({
  cardType: {
    type: String,
    required: true,
    default: "timeCard",
  },
  validityPeriod: {
    type: String,
    required: true,
  },
  totalSessions: {
    type: Number,
    default: 0,
  },
  remainingSessions: {
    type: Number,
    default: 0,
  },
  expirationDate: {
    type: String,
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
});
</script>

<style scoped lang="scss">
.member-card {
  width: 96%;
  height: 320rpx;
  margin: 50rpx auto;
  border-radius: 32rpx;
  padding: 40rpx;
  position: relative;
  box-shadow: 0 14rpx 28rpx rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &.timeCard {
    background: linear-gradient(135deg, #ff7f50, #ff1493);
  }

  &.sessionCard {
    height: 390rpx;
    background: linear-gradient(135deg, #8ec5fc, #40a1f7, #3d8bff);
  }

  .card-info {
    margin-top: 10rpx;

    .info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8rpx;
      align-items: center;

      .label {
        font-size: 28rpx;
        color: #fff;
      }

      .value {
        font-size: 34rpx;
        font-weight: 600;
        color: #fff;
      }
    }
    // .info-item:nth-child(2) {
    //   margin-bottom: 20rpx;
    // }
  }

  .date-info {
    margin-top: 30rpx;

    .date-item {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.85);
      margin-top: 10rpx;
    }
  }

  .decoration {
    .circle {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      position: absolute;
      top: 20rpx;
      left: -30rpx;
    }

    .triangle {
      width: 0;
      height: 0;
      border-left: 60rpx solid transparent;
      border-right: 60rpx solid transparent;
      border-bottom: 100rpx solid rgba(255, 255, 255, 0.1);
      position: absolute;
      bottom: -20rpx;
      right: 40rpx;
    }

    .line {
      width: 100rpx;
      height: 4rpx;
      background: rgba(255, 255, 255, 0.3);
      position: absolute;
      bottom: 70rpx;
      left: 30rpx;
      transform: rotate(-25deg);
    }
  }
}
</style>
