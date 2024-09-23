<template>
  <view>
    <view class="page-body">
      <view class="page-section page-section-gap">
        <map
          style="width: 100%; height: 100vh"
          :latitude="latitude"
          :longitude="longitude"
          :covers="covers"></map>
      </view>
    </view>
  </view>
</template>

<script setup>
const latitude = 22.601266;
const longitude = 114.059307;

const covers = [
  {
    latitude: 22.601266,
    longitude: 114.059307,
    iconPath: "../../static/images/location.png",
  },
];
</script>

<style></style>
