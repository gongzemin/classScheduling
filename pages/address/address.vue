<template>
  <view>
    <view class="page-body">
      <view class="page-section page-section-gap">
        <map
          style="width: 100%; height: 100vh"
          :latitude="markers[0]?.latitude"
          :longitude="markers[0]?.longitude"
          :markers="markers"></map>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

// 覆盖物数组，初始为空
const markers = ref([]);

// 页面加载时接收参数
onLoad((options) => {
  const { latitude, longitude } = options;
  if (latitude && longitude) {
    markers.value = [
      {
        id: 1,
        latitude,
        longitude,
        width: 40, // 必填宽度
        height: 60, // 必填高度
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
