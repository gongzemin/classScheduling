<template>
  <view class="card">
    <image
      :src="reservation.class_id[0]?.courseTeacherPic"
      class="teacher-pic"
      mode="aspectFill" />
    <view class="info">
      <view class="title flex">
        {{ reservation.class_id[0]?.courseType }}
        <view class="details ml-10 flex items-center">
          {{ reservation.class_id[0]?.courseLevel }}
        </view>
      </view>
      <view class="details">
        {{ reservation.class_id[0]?.courseTeacherName }}
      </view>
      <view class="time">
        {{ reservation.time }}
      </view>
      <view v-if="reservation.canceled" class="badge canceled">已取消</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { Reservation } from "@/types";

defineProps<{ reservation: Reservation }>();
</script>

<style scoped lang="scss">
.card {
  display: flex;
  padding: 30rpx;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
  background-color: #fff;
  margin-bottom: 20rpx;
  position: relative;

  .teacher-pic {
    width: 150rpx;
    height: 150rpx;
    border-radius: 12rpx;
    margin-right: 20rpx;
  }

  .info {
    display: flex;
    flex-direction: column;
    justify-content: space-around;

    .title {
      font-size: 34rpx;
      font-weight: bold;
    }

    .details {
      font-size: 28rpx;
      color: #666;
    }

    .time {
      font-size: 26rpx;
      color: #999;
    }

    .badge.canceled {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      right: 30rpx;
      background-color: #ff4d4f;
      color: #fff;
      padding: 8rpx 20rpx;
      border-radius: 30rpx;
      font-size: 24rpx;
    }
  }
}
</style>
