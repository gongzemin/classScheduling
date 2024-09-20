<template>
  <view>
    <Title content="联系我们"></Title>
    <view class="contact-card">
      <view class="flex justify-between">
        <view class="info">
          <view class="label">电话:</view>
          <text class="content phone" @click="makePhoneCall">{{ phone }}</text>
        </view>

        <view class="info">
          <view class="label">微信:</view>
          <text class="content wechat" @click="copyWechatId">
            {{ wechatId }}
          </text>
        </view>
      </view>
      <view class="info">
        <view class="label">地址:</view>
        <!-- <uni-icons type="location" size="20"></uni-icons> -->
        <text class="content address" @click="openMap">{{ address }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import Title from "../Title.vue";
import { ref } from "vue";
// import { showToast } from "@dcloudio/uni-app";

// Sample data
const address = ref("广东省深圳市龙华区梅坂大道民乐科技园E栋创客工坊410室");
const phone = ref("166-7673-6546");
const wechatId = ref("166-7673-6546");

// Navigate to the built-in map with the address
const openMap = () => {
  uni.navigateTo({
    url: "/pages/address/address", //?address=" + address.value, // Assuming you have a map page
  });
};

// Make a phone call
const makePhoneCall = () => {
  uni.makePhoneCall({
    phoneNumber: phone.value,
    success() {
      console.log("Calling " + phone.value);
    },
    fail(err) {
      console.error("Failed to make a call", err);
    },
  });
};

// Copy WeChat ID to clipboard
const copyWechatId = () => {
  uni.setClipboardData({
    data: wechatId.value,
    success() {
      // uni.showToast({
      //   title: "复制成功",
      //   icon: "success",
      //   duration: 2000,
      // });
    },
  });
};
</script>

<style scoped lang="scss">
.contact-card {
  padding: 40rpx 20rpx;
  border-radius: 10rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
}

.info {
  display: flex;
  margin-bottom: 20rpx;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-right: 8rpx;
  width: 100rpx;
}

.content {
  font-size: 26rpx;
  color: #007aff;
}

.address {
  cursor: pointer;
}

.phone {
  cursor: pointer;
}

.wechat {
  cursor: pointer;
}
</style>
