<template>
  <view class="overview">
    <!-- 功能卡片 -->
    <view class="card" v-if="menuItems.length">
      <view
        v-for="(item, index) in menuItems"
        :key="index"
        class="card-item"
        @click="navigateTo(item.path)">
        <uni-icons :type="item.icon" size="30"></uni-icons>
        <text>{{ item.label }}</text>
      </view>
    </view>

    <!-- 空状态提示 -->
    <view class="empty-state" v-else>
      <uni-icons type="info" size="60" color="#ccc"></uni-icons>
      <text class="empty-text">暂无功能模块</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  modules: Array,
});

// 功能列表
const menuList = [
  { label: "品牌介绍", path: "/pages-studio/studio/about", icon: "info" },
  { label: "舞室相册", path: "/pages-studio/album/album", icon: "image" },
  { label: "租教室", path: "membership-cards", icon: "calendar" },
  { label: "演出合作", path: "membership-cards", icon: "flag" },
  {
    label: "优惠活动",
    path: "/pages-studio/promotion/promotion",
    icon: "gift",
  },
];

// 计算显示的菜单项
const menuItems = computed(() => {
  if (Array.isArray(props.modules)) {
    return menuList.filter((item) => props.modules.includes(item.label));
  }
  return [];
});

// 页面跳转
const navigateTo = (path) => {
  uni.navigateTo({
    url: path,
  });
};
</script>

<style lang="scss" scoped>
.overview {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20rpx;
  padding: 20rpx; // 卡片样式
  width: 100%;
  background-color: #fff;
  border-radius: 16rpx;
  // box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  .card {
    width: 100%;
    display: flex;
    flex-wrap: wrap;

    .card-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 20rpx 0;
      width: 24%;
    }
  }
  // 空状态样式
  .empty-state {
    margin-top: 100rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .empty-text {
      margin-top: 20rpx;
      font-size: 28rpx;
      color: #888;
    }
  }
}
</style>
