<template>
  <view class="overview">
    <!-- 功能卡片 -->
    <view class="card">
      <view
        v-for="(item, index) in menuItems"
        :key="index"
        class="card-item"
        @click="navigateTo(item.path)">
        <uni-icons :type="item.icon" size="30"></uni-icons>
        <text>{{ item.label }}</text>
      </view>
    </view>
  </view>
</template>
<script setup>
import { ref } from "vue";
const menuItems = ref([
  { label: "课表", path: "my-reservations", icon: "calendar" },
  { label: "作品集", path: "course-records", icon: "videocam" },
  { label: "舞室相册", path: "course-records", icon: "image" },
  { label: "租教室", path: "membership-cards", icon: "info" },
  { label: "演出合作", path: "membership-cards", icon: "info" },
  { label: "优惠", path: "course-records", icon: "gift" },
  { label: "品牌介绍", path: "membership-cards", icon: "info" },
]);

const navigateTo = (path) => {
  uni.navigateTo({
    url: path,
  });
};
</script>

<style lang="scss" scoped>
.overview {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20rpx;
  .card {
    width: 100vw;
    background-color: #fff;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
    padding: 20rpx;
    display: flex;
    // justify-content: space-between;
    flex-wrap: wrap;
    margin-top: 10rpx;

    .card-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 20rpx 0;
      width: 24%;
    }

    .card-item:last-child {
      border-bottom: none;
    }

    .arrow-icon {
      width: 20rpx;
      height: 20rpx;
    }

    /* CSS Arrow Right */
    .arrow-right {
      width: 0;
      height: 0;
      border-top: 10rpx solid transparent;
      border-bottom: 10rpx solid transparent;
      border-left: 10rpx solid #ccc;
    }
  }
}
</style>
