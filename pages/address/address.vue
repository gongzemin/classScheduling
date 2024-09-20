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
const latitude = 22.599907;
const longitude = 114.060665;

const covers = [
  {
    latitude: 22.599907,
    longitude: 114.060665,
    iconPath: "../../static/images/location.png",
  },
];
</script>

<style></style>
