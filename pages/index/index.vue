<template>
  <view class="home">
    <home-header :studioInfo="studioInfo" v-if="studioInfo"></home-header>
    <view class="main">
      <home-overview></home-overview>
      <home-teachers></home-teachers>
      <home-contact :studioInfo="studioInfo"></home-contact>
    </view>
  </view>
</template>

<script setup>
const db = uniCloud.database();
import { reactive, ref } from "vue";
let studioInfo = reactive({});
db.collection("studio")
  .get()
  .then((res) => {
    if (res.result.errCode === 0) {
      Object.assign(studioInfo, res.result.data[0]);
    }
    console.log("res--studio-", studioInfo);
  });
</script>

<style lang="scss">
.home {
  background-color: #f0f0f0; //#e7f1fc;
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
