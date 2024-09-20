<template>
  <view class="home">
    <home-header></home-header>
    <view class="main">
      <home-overview></home-overview>
      <home-teachers></home-teachers>
      <home-contact></home-contact>
    </view>
  </view>
</template>

<script setup></script>

<style lang="scss">
.home {
  background-color: #e7f1fc;
  overflow: hidden;
  .main {
    padding: 20rpx;
  }
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-top: 200rpx;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}
</style>
