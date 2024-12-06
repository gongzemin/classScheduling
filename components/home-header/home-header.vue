<template>
  <view class="banner-container">
    <!--   interval="5000" -->
    <swiper
      class="banner-swiper"
      indicator-dots="true"
      :autoplay="false"
      duration="1000"
      circular="true">
      <swiper-item v-for="(item, index) in bannerList" :key="index">
        <image :src="item" mode="aspectFill" class="banner-image" />
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";

const props = defineProps({
  studioInfo: Object,
});

const bannerList = computed(() => {
  return props.studioInfo.banner;
});

// uniCloud
//   .database()
//   .collection("studio")
//   .add({
//     name: "Pick Star 舞蹈工作室",
//     slogan: "Just Enjoy",
//     descrption: "一个专业的舞蹈培训中心",
//     phone: "15112653200",
//     email: "example@email.com",
//     wechatId: "mingongze",
//     address: "广东省深圳市福田区大中华广场9楼",
//     banner: [
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/cloudstorage/ca31aed3-4f32-487e-a5cd-c4fff1bc7c35.jpg",
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/cloudstorage/c3804770-acdf-431e-96fe-ba0520bf5d87.png",
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/cloudstorage/c7e5c785-eb35-4a83-8d24-1eba4661b135.png",
//     ],
//     lngLat: {
//       longitude: 116.404, // 北京天安门广场经度
//       latitude: 39.915, // 北京天安门广场纬度
//     },
//   })
//   .then((res) => {
//     console.log("添加成功:", res);
//   })
//   .catch((err) => {
//     console.error("添加失败:", err);
//   });

// 模拟异步加载轮播图数据
const fetchBanners = async () => {
  // 模拟从云函数获取数据
  // const { result } = await uniCloud.callFunction({
  //   name: "getBanners", // 云函数名称
  // });
  // if (result.success) {
  //   banners.value = result.data; // 将数据赋值给 banners
  // } else {
  //   console.error("加载轮播图数据失败:", result.message);
  // }
};

// 在组件挂载时加载数据
onMounted(() => {
  fetchBanners();
});
</script>

<style>
.banner-container {
  width: 100%;
  height: 470rpx; /* 调整高度以适配需求 */
  overflow: hidden;
}

.banner-swiper {
  width: 100%;
  height: 100%;
}

.banner-image {
  width: 100%;
  height: 100%;
}
</style>
