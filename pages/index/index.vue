<template>
  <view class="home">
    <!-- 加载中状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">正在请求数据</text>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error" class="error-container">
      <text>加载失败，请下拉刷新重试</text>
    </view>

    <!-- 正常显示内容 -->
    <template v-else>
      <home-header :studioInfo="studioInfo"></home-header>
      <view class="main">
        <home-overview :modules="studioInfo.modules"></home-overview>
        <home-teachers></home-teachers>
        <home-contact :studioInfo="studioInfo"></home-contact>
      </view>
    </template>
  </view>
</template>

<script setup>
import { reactive, ref } from "vue";
import { onPullDownRefresh } from "@dcloudio/uni-app";

const db = uniCloud.database();
let studioInfo = reactive({});
let loading = ref(true); // 加载状态
let error = ref(false); // 错误状态

const getStudioInfo = () => {
  loading.value = true;
  error.value = false;
  db.collection("studio")
    .get({ getOne: true })
    .then((res) => {
      loading.value = false;
      if (res.result.errCode === 0) {
        Object.assign(studioInfo, res.result.data);
        // 使用异步的 uni.setStorage
        uni.setStorage({
          key: "studioInfo",
          data: {
            cancelDeadlineHours: res.result.data.cancelDeadlineHours,
            minParticipants: res.result.data.minParticipants,
            address: res.result.data.address,
          },
          success: () => {
            console.log("数据已成功存储");
          },
          fail: (error) => {
            console.error("存储失败", error);
          },
        });
      } else {
        error.value = true;
      }
    })
    .catch((err) => {
      loading.value = false;
      error.value = true;
    });
};

// 初始化加载
getStudioInfo();

// 下拉刷新 不然教师列表新增之后 不会刷新
onPullDownRefresh(() => {
  getStudioInfo();
  uni.stopPullDownRefresh(); // 停止下拉刷新动画
});
</script>

<style lang="scss">
.home {
  background-color: #f0f0f0;
  overflow: hidden;
  .main {
    padding: 20rpx;
  }

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 28rpx;
    color: #333;
  }

  .loading-text {
    font-size: 32rpx;
    color: #666;
    display: inline-block;
    position: relative;
    animation: text-slide 1.5s ease-in-out infinite,
      text-fade 1.5s ease-in-out infinite;
  }

  /* 文字的淡入淡出动画 */
  @keyframes text-fade {
    0%,
    100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }

  /* 文字左右滑动动画 */
  @keyframes text-slide {
    0% {
      transform: translateX(-10px);
    }
    50% {
      transform: translateX(10px);
    }
    100% {
      transform: translateX(-10px);
    }
  }

  .error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    color: #8f8f94;
  }
}
</style>
