<template>
  <view class="album">
    <!-- 加载中状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">正在加载...</text>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error" class="error-container">
      <text>加载失败，请下拉刷新重试</text>
    </view>

    <!-- 相册内容 -->
    <template v-else>
      <view class="gallery">
        <view
          class="image-item"
          v-for="(image, index) in images"
          :key="index"
          @click="openImage(image)">
          <image :src="image.url" class="image" mode="aspectFill" />
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { onPullDownRefresh } from "@dcloudio/uni-app";

// 响应式变量
const loading = ref(true);
const error = ref(false);
const images = ref<string[]>([]); // 保存从数据库获取的图片路径

// 获取相册图片数据 应该不需要自己请求数据的 如果用了pinia
const getStudioInfo = async () => {
  loading.value = true;
  error.value = false;
  try {
    const db = uniCloud.database();
    const res = await db.collection("studio").get({ getOne: true });
    loading.value = false;
    if (res.result.errCode === 0) {
      images.value = res.result.data.banner || []; // 获取横幅图片数据作为相册图片
    } else {
      error.value = true;
    }
  } catch (err) {
    loading.value = false;
    error.value = true;
  }
};

// 打开图片查看器
const openImage = (image: string) => {
  uni.previewImage({
    current: image.url, // 当前显示的图片，传入点击的图片
    urls: images.value.map((img) => img.url), // 需要展示的所有图片
  });
};

// 初始化加载
getStudioInfo();

// 下拉刷新
onPullDownRefresh(() => {
  getStudioInfo();
  uni.stopPullDownRefresh(); // 停止下拉刷新动画
});
</script>

<style lang="scss" scoped>
.album {
  background-color: #f0f0f0;
  padding: 20rpx;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.loading-text {
  font-size: 32rpx;
  color: #666;
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* 瀑布流布局 */
.gallery {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.image-item {
  width: 98%; /* 控制每列图片占比 */
  margin-bottom: 20rpx;
  background-color: #fff; /* 给图片项设置背景色，确保它们可见 */
  border-radius: 8rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

.image {
  width: 100%;
  height: 400rpx; /* 确保每个图片有固定的高度 */
  border-radius: 8rpx;
}
</style>
