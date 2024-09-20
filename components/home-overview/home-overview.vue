<template>
  <view class="overview">
    <view class="card">
      <!-- <image class="logo" src="../../static/images/logo.png" mode="aspectFit"></image> -->
      <view class="content">
        <view class="title">KDS DANCE STUDIO</view>
        <view class="description">
          KDS舞蹈工作室（雅宝店）成立于2019年，以"让每一个普通人学会舞蹈"为愿景,目前开设有街舞、Kpop、Jazz、零基础入门、少儿爵士、少儿街舞等课程！
        </view>
      </view>
    </view>
  </view>
</template>
<script setup></script>

<style lang="scss" scoped>
.overview {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20rpx;
  .card {
    width: 100%; /* Adjust width as needed */
    border-radius: 16rpx;
    /*  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.2); */
    background-color: white;
    overflow: hidden;
    text-align: center;
    .logo {
      width: 100%;
      height: 200rpx; /* Adjust height as needed */
    }

    .content {
      padding: 20rpx;
      .title {
        font-size: 32rpx;
        font-weight: bold;
        margin-bottom: 16rpx;
      }

      .description {
        font-size: 28rpx;
        color: #666;
      }
    }
  }
}
</style>
