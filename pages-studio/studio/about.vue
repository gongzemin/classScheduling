<template>
  <view class="about-container">
    <view v-if="loading" class="loading">加载中...</view>
    <view v-else>
      <view class="studio-card">
        <view class="title-container">
          <view class="title">{{ studioData.name }}</view>
          <!--     <view class="title-border"></view> -->
        </view>
        <view class="slogan">{{ studioData.slogan }}</view>
      </view>
      <!-- 富文本内容展示 -->
      <view class="rich-text-card">
        <view class="rich-text" v-html="formattedDescription"></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { onPullDownRefresh } from "@dcloudio/uni-app";

const studioData = ref({
  name: "",
  slogan: "",
  description: "",
});

const loading = ref(true);

// 获取舞室详情
const fetchStudioData = async () => {
  loading.value = true;
  try {
    const res = await uniCloud
      .database()
      .collection("studio")
      .field("name, slogan, description")
      .limit(1)
      .get();

    if (res.result.data.length > 0) {
      studioData.value = res.result.data[0];
    } else {
      uni.showToast({
        title: "未找到舞室信息",
        icon: "none",
      });
    }
  } catch (error) {
    uni.showToast({
      title: "加载失败",
      icon: "none",
    });
    console.error("查询失败", error);
  } finally {
    loading.value = false;
    uni.stopPullDownRefresh();
  }
};

// 格式化富文本
const formattedDescription = computed(() => {
  if (!studioData.value.description) return "";
  return studioData.value.description.replace(
    /<img /g,
    `<img class='rich-img' `
  );
});

// 页面初始化加载
onMounted(() => {
  fetchStudioData();
});

// 下拉刷新
onPullDownRefresh(() => {
  fetchStudioData();
  uni.stopPullDownRefresh(); // 停止下拉刷新动画
});
</script>

<style scoped lang="scss">
.about-container {
  padding: 40rpx 30rpx 80rpx;
  background: linear-gradient(180deg, #fdfbfb, #ebedee);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;

  .studio-card {
    width: 100%;
    max-width: 700rpx;
    background: #ffffff;
    border-radius: 20rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
    padding: 20rpx 20rpx;
    text-align: center;
    margin-bottom: 20rpx;
  }

  // .title-container {
  //   margin-bottom: 24rpx;
  // }

  .title {
    font-size: 60rpx;
    font-weight: bold;
    background: linear-gradient(90deg, #ff7e5f, #feb47b);
    -webkit-background-clip: text;
    color: transparent;
    display: inline-block;
  }

  .title-border {
    width: 80rpx;
    height: 8rpx;
    margin: 12rpx auto 0;
    background: linear-gradient(90deg, #ff7e5f, #feb47b);
    border-radius: 4rpx;
  }

  .slogan {
    font-size: 28rpx;
    color: #777;
    // font-style: italic;
    // margin-top: 10rpx;
    letter-spacing: 1rpx;
  }

  .rich-text-card {
    width: 100%;
    max-width: 700rpx;
    background: #ffffff;
    border-radius: 20rpx;
    box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.06);
    padding: 50rpx 40rpx;
  }

  .rich-text {
    font-size: 32rpx;
    line-height: 1.8;
    color: #444;

    img {
      width: 100%;
      border-radius: 16rpx;
      margin: 30rpx 0;
    }
  }

  .loading {
    text-align: center;
    padding: 100rpx 0;
    font-size: 34rpx;
    color: #aaa;
  }
}
</style>

<style>
.rich-img {
  width: 100%;
  border-radius: 16rpx;
  margin: 20rpx 0;
}
</style>
