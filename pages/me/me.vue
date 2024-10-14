<template>
  <view class="container">
    <!-- 用户信息部分 -->
    <view class="user-info">
      <view class="left-section">
        <button
          class="avatar-wrapper"
          open-type="chooseAvatar"
          @chooseavatar="onChooseAvatar">
          <image class="avatar" :src="avatarUrl" mode="aspectFill" />
        </button>
        <input
          v-model="nickname"
          class="weui-input"
          type="nickname"
          placeholder="请输入昵称" />
      </view>
      <button v-if="!isLoggedIn" class="login-btn" @click="handleLogin">
        登录/注册
      </button>
    </view>

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

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

// 用户信息
const avatarUrl = ref("/static/images/defaultAvatar.jpeg"); // 默认头像
const nickname = ref("未登录"); // 用户昵称

// 获取微信头像
const onChooseAvatar = (e: any) => {
  // 获取选中的头像
  avatarUrl.value = e.detail.avatarUrl;
  console.log("选择的头像:", avatarUrl.value, e);
};

const menuItems = ref([
  { label: "已约", path: "my-reservations", icon: "calendar" },
  { label: "上课记录", path: "course-records", icon: "info" },
  { label: "会员卡", path: "membership-cards", icon: "wallet" },
  {
    label: "联系客服",
    path: "",
    icon: "chat",
    action: "contactCustomerService",
  },
  { label: "设置", path: "settings", icon: "gear" },
  { label: "意见反馈", path: "feedback", icon: "mail-open" },
]);

// 登录状态
const isLoggedIn = ref(false);

// 路由跳转
const router = useRouter();

const navigateTo = (path: string) => {
  router.push({ path });
};

// 模拟登录
const handleLogin = () => {
  uni.navigateTo({
    url: `../login/login`,
  });
  console.log("用户昵称:", nickname.value);
};
</script>

<style>
button::after {
  border: none !important;
  box-shadow: none !important;
}
</style>
<style scoped lang="scss">
.container {
  padding: 20rpx;
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Left section (avatar, nickname) on the left and login button on the right */
  margin-bottom: 40rpx;
}

.left-section {
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20rpx;
  padding-left: 0rpx;
  padding-right: 0rpx;
}

.avatar {
  width: 100%;
  height: 100%;
}
.avatar::after {
  border: 1px solid transparent !important;
}
uni-button:after {
  border: 1px solid transparent !important;
}

.weui-input {
  width: 180rpx;
  padding: 10rpx;
  font-size: 32rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
}

.login-btn {
  background-color: rgb(116, 219, 239);
  color: #fff;
  border-radius: 8rpx;
  margin-right: 5rpx;
}

.card {
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 80rpx;
}

.card-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20rpx 0;
  width: 30%;
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
</style>
