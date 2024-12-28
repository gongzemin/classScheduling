<template>
  <view class="promotion">
    <!-- 活动头部 -->
    <view class="promo-header">
      <text class="promo-title">元旦节优惠活动</text>
    </view>

    <!-- 活动介绍 -->
    <view class="promo-introduction">
      <text class="description">
        参与我们的活动，使用手机号注册登录即可
        <text class="highlight">免费预约99节课</text>
        ！
        <text class="highlight">有效期3个月</text>
        。
      </text>
    </view>

    <!-- 显示优惠期或预约按钮 -->
    <view class="promo-action">
      <!--      <template v-if="isLoggedIn">
        <view class="success-container">
          <text class="success-text">您已登录，可直接预约</text>
          <text class="date-text">优惠期至：{{ offerEndDate }}</text>
        </view>
        <button class="reserve-button" @click="reserveCourse">立即预约</button>
      </template> -->
      <template v-if="!isLoggedIn">
        <text class="not-logged-in">现在就预约，畅享3个月99节免费课！</text>
        <button class="login-button" @click="toLoginPage">立即参与</button>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

// 用户登录信息
const storedUserInfo = ref(uni.getStorageSync("userInfo"));
const isLoggedIn = computed(() => !!storedUserInfo.value?.userId);

// 优惠结束日期计算
const offerEndDate = computed(() => {
  if (!isLoggedIn.value) return "";
  const date = new Date();
  date.setMonth(date.getMonth() + 3);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
});

// 跳转到登录页
const toLoginPage = () => {
  uni.navigateTo({
    url: "/pages/login/login",
  });
};

// 模拟预约成功
const reserveCourse = () => {
  uni.showToast({
    title: "预约成功",
    icon: "success",
  });
};
</script>

<style scoped lang="scss">
.promotion {
  background: linear-gradient(135deg, #fff6f0, #ffdfdf);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  // justify-content: center;
  text-align: center;
  padding: 180rpx 40rpx 40rpx; // 增加顶部 padding
  box-sizing: border-box;
}

.promo-header {
  margin-bottom: 50rpx;
}

.promo-title {
  font-size: 56rpx;
  font-weight: 600;
  color: #333;
  letter-spacing: 2rpx;
}

.promo-introduction {
  margin-bottom: 80rpx; // 增大介绍与操作区的间距
  max-width: 600rpx;
}

.description {
  font-size: 32rpx;
  line-height: 48rpx;
  color: #555;
}

.highlight {
  color: #f56c6c;
  font-weight: 500;
}

// 登录后的提示与按钮
.promo-action {
  margin-top: -40rpx; // 整体向上移动
}

.success-container {
  margin-bottom: 40rpx; // 登录提示和按钮之间的间距
}

.success-text {
  font-size: 30rpx;
  color: #666;
  margin-bottom: 10rpx; // 文本之间的间距
}

.date-text {
  font-size: 28rpx;
  color: #888;
}

.not-logged-in {
  font-size: 30rpx;
  margin-bottom: 40rpx; // 未登录时的提示间距
  color: #444;
}

.login-button,
.reserve-button {
  width: 80%;
  max-width: 400rpx;
  padding: 28rpx 0;
  background-color: #f56c6c;
  color: white;
  font-size: 34rpx;
  border-radius: 50rpx;
  border: none;
  margin-top: 30rpx; // 按钮与文本之间的间距
  transition: background-color 0.3s ease;
}

.login-button:hover,
.reserve-button:hover {
  background-color: #ff7875;
}
</style>
