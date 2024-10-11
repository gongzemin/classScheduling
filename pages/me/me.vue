<template>
  <view class="container">
    <!-- 用户信息部分 -->
    <view class="user-info">
      <view class="user-details">
        <image
          class="avatar"
          :src="user.avatarUrl"
          mode="aspectFill"
          @click="getWeChatAvatar" />
        <text class="user-name">{{ user.nickname || "未登录" }}</text>
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

const menuItems = ref([
  { label: "我的已约", path: "my-reservations", icon: "calendar" },
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

// 用户信息
const user = ref({
  nickname: "用户名",
  avatarUrl: "/static/images/defaultAvatar.jpeg",
});

// 登录状态
const isLoggedIn = ref(false);

// 路由跳转
const router = useRouter();

const navigateTo = (path: string) => {
  router.push({ path });
};

// 模拟登录
const handleLogin = () => {
  // 这里可以调用登录逻辑
  console.log("登录/注册");
};

// 获取微信头像
const getWeChatAvatar = () => {
  uni.getUserProfile({
    desc: "用于完善会员资料", // 用户点击头像时的弹窗描述
    success: (res) => {
      console.log("res", res);
      user.value.avatarUrl = res.userInfo.avatarUrl;
      user.value.nickname = res.userInfo.nickName;
      isLoggedIn.value = true;
    },
    fail: (err) => {
      console.error("获取用户信息失败", err);
    },
  });
};

// 联系客服
const contactCustomerService = () => {
  // 模拟联系客服
  console.log("联系客服");
};
</script>

<style scoped lang="scss">
.container {
  padding: 20rpx;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
  justify-content: space-between;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
}

.user-details {
  margin-left: 20rpx;
  flex: 1;
  display: flex;
  align-items: center;
}

.user-name {
  font-size: 36rpx;
  color: #333;
}

.login-btn {
  margin-top: 10rpx;
  background-color: #682aae;
  color: #fff;
  border-radius: 8rpx;
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
