<template>
  <view class="page-container">
    <view v-if="studio" class="studio-card">
      <swiper
        class="banner-swiper"
        :indicator-dots="true"
        :autoplay="true"
        :interval="3000"
        :duration="800">
        <swiper-item v-for="(img, index) in studio.banner" :key="index">
          <image :src="img.url" mode="aspectFill" class="banner-img"></image>
        </swiper-item>
      </swiper>

      <view class="studio-info">
        <text class="studio-name">{{ studio.name }}</text>
        <text class="studio-slogan">{{ studio.slogan }}</text>

        <!-- 富文本内容展示 -->
        <view class="studio-desc" v-html="formattedDescription"></view>

        <view class="info-item">
          <uni-icons type="phone" size="20"></uni-icons>
          <text>{{ studio.phone }}</text>
        </view>

        <view class="info-item">
          <uni-icons type="location" size="20"></uni-icons>
          <text>{{ studio.address }}</text>
        </view>

        <!-- 微信 ID 显示 -->
        <view class="info-item">
          <uni-icons type="weixin" size="20"></uni-icons>
          <text>{{ studio.wechatId }}</text>
        </view>

        <map
          v-if="studio.lngLat.longitude"
          class="map"
          :longitude="studio.lngLat.longitude"
          :latitude="studio.lngLat.latitude"
          :markers="markers"
          scale="16"></map>
      </view>
    </view>

    <view v-else class="loading-container">
      <uni-load-more status="loading" />
    </view>

    <!-- 固定位置的编辑按钮 -->
    <view class="fixed-edit-btn" @click="editDescription">
      <uni-icons type="compose" size="30" color="#fff"></uni-icons>
      <!-- <text class="edit-text">编辑</text> -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";

const studio = ref<any>(null);
const markers = ref([]);

const formattedDescription = computed(() => {
  if (!studio.value.description) return "";
  return studio.value.description.replace(/<img /g, `<img class='rich-img' `);
});

const fetchStudioData = async () => {
  try {
    const db = uniCloud.database();
    const res = await db.collection("studio").limit(1).get();

    if (res.result.data.length > 0) {
      studio.value = res.result.data[0];
      markers.value = [
        {
          id: 1,
          latitude: studio.value.lngLat.latitude,
          longitude: studio.value.lngLat.longitude,
          title: studio.value.name,
        },
      ];
    } else {
      uni.showToast({
        title: "未找到舞室信息",
        icon: "none",
      });
    }
  } catch (err) {
    console.error("数据加载失败", err);
    uni.showToast({
      title: "加载失败，请重试",
      icon: "none",
    });
  }
};

const editDescription = () => {
  if (studio.value) {
    uni.navigateTo({
      url: `/pages-studio/studio/addStudio?id=${studio.value._id}`,
    });
  }
};

onMounted(() => {
  fetchStudioData();
});
</script>

<style scoped lang="scss">
.page-container {
  padding: 20rpx;
}

.studio-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.banner-swiper {
  width: 100%;
  height: 400rpx;
}

.banner-img {
  width: 100%;
  height: 100%;
  border-bottom: 1px solid #f0f0f0;
}

.studio-info {
  padding: 30rpx;
}

.studio-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block; /* Ensure name is on a new line */
}

.studio-slogan {
  font-size: 28rpx;
  color: #666;
  margin: 10rpx 0 20rpx 0;
  display: block; /* Ensure slogan is on a new line */
}

.studio-desc {
  font-size: 26rpx;
  color: #888;
  line-height: 1.5;
  margin-bottom: 30rpx;
}

.info-item {
  display: flex;
  align-items: center;
  margin: 20rpx 0;
}

.info-item uni-icons {
  margin-right: 10rpx;
  color: #007aff;
}

.map {
  width: 100%;
  height: 300rpx;
  margin-top: 40rpx;
  border-radius: 10rpx;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* 固定位置编辑按钮 */
.fixed-edit-btn {
  position: fixed;
  bottom: 130rpx;
  right: 30rpx;
  background-color: #007aff;
  // padding: 54rpx 15rpx;
  border-radius: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  width: 120rpx;
  height: 120rpx;
}

.edit-text {
  font-size: 24rpx;
  color: #fff;
}

.rich-img {
  width: 100%;
  border-radius: 10rpx;
  margin: 20rpx 0;
}
</style>

<style lang="scss">
.rich-img {
  width: 100%;
  border-radius: 10rpx;
  margin: 20rpx 0;
}
/* WeChat ID */
.info-item {
  .uni-icons {
    color: #1aad19; /* Green for WeChat */
  }

  text {
    color: #333;
    font-size: 26rpx;
  }
}
</style>
