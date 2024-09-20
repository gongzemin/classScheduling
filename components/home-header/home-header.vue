<template>
  <view class="banner">
    <view class="tagline">让每一个普通人学会舞蹈</view>
  </view>
</template>

<script setup></script>

<style>
.banner {
  width: 100vw; /* Full width of the viewport */
  height: 31vh; /* 31% of the viewport height */
  background: url("../../static/images/kds-banner.jpg") no-repeat center center;
  background-size: cover; /* Ensure the image covers the entire banner */
  display: flex; /* Use flexbox for layout */
  justify-content: flex-end; /* Align children horizontally to the end (right) */
  align-items: flex-end; /* Align children vertically to the end (bottom) */
  padding: 14rpx; /* Optional padding to avoid text sticking to edges */
  color: white; /* Text color for contrast */
}

.tagline {
  margin: 20rpx; /* Optional margin to add space around the tagline */
  font-size: 26rpx; /* Adjust font size as needed */
  color: #f1f1f1;
  padding-right: 15rpx;
}
</style>
