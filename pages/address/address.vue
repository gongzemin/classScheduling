<template>
  <view>
    <view class="page-body">
      <view class="page-section page-section-gap">
        <map
          style="width: 100%; height: 100vh"
          :latitude="covers[0]?.latitude"
          :longitude="covers[0]?.longitude"
          :covers="covers"></map>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

// 覆盖物数组，初始为空
const covers = ref([
  {
    latitude: 0,
    longitude: 0,
    iconPath: "../../static/images/location.png",
  },
]);

// 页面加载时接收参数
onLoad((options) => {
  const { latitude, longitude } = options;
  if (latitude && longitude) {
    covers.value = [
      {
        latitude: Number(latitude),
        longitude: Number(longitude),
        iconPath: "../../static/images/location.png",
      },
    ];
  } else {
    uni.showToast({
      title: "未传递位置参数",
      icon: "none",
    });
  }
});
</script>

<style scoped>
.page-body {
  height: 100vh;
}
</style>
