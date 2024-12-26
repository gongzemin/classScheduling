<template>
  <view class="about-container">
    <view v-if="loading" class="loading">加载中...</view>
    <view v-else>
      <view class="title">{{ studioData.name }}</view>
      <view class="slogan">{{ studioData.slogan }}</view>

      <!-- 富文本内容展示 -->
      <view class="rich-text" v-html="formattedDescription"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { onPullDownRefresh } from "@dcloudio/uni-app";

const studioData = ref({
  name: "",
  slogan: "",
  description: "", // 富文本字段
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
});
</script>

<style scoped lang="scss">
.about-container {
  padding: 30rpx 30rpx 80rpx;
  background: #f9f9f9;

  .title {
    font-size: 52rpx;
    font-weight: bold;
    text-align: center;
    background: linear-gradient(90deg, #ff7e5f, #feb47b);
    -webkit-background-clip: text;
    color: transparent;
    margin-bottom: 10rpx;
  }

  .slogan {
    font-size: 26rpx;
    text-align: center;
    color: #666;
    margin-bottom: 50rpx;
    text-shadow: 2rpx 2rpx 6rpx rgba(0, 0, 0, 0.1);
  }

  .rich-text {
    font-size: 30rpx;
    line-height: 1.8;
    padding: 40rpx;
    background: #fff;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

    img {
      width: 100%;
      border-radius: 12rpx;
      margin: 20rpx 0;
    }
  }

  .loading {
    text-align: center;
    padding: 80rpx 0;
    font-size: 32rpx;
    color: #bbb;
  }
}
</style>
<style>
.rich-img {
  width: 100%;
  border-radius: 10rpx;
  margin: 20rpx 0;
}
</style>
