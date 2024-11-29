<template>
  <view class="login-page">
    <!-- Logo -->
    <image class="logo" src="/static/logoCircle.png" />
    手机号{{ mobile }}
    <!-- 公司名称 -->
    <view class="company-name">摘星科技有限公司</view>

    <!-- 按钮区域 -->
    <view class="button-group">
      <!-- 使用手机号授权登录按钮 -->
      <button
        open-type="getPhoneNumber"
        @getphonenumber="getPhoneNumber"
        class="login-btn"
        type="primary">
        使用手机号授权登录
      </button>

      <!-- 取消按钮 -->
      <button class="cancel-btn" type="default" @click="onCancel">取消</button>
    </view>
  </view>
</template>

<script setup>
// import { useRouter } from "vue-router";
import { ref, reactive, onMounted } from "vue";
const db = uniCloud.database();
// const router = useRouter();
const mobile = ref(null);

const userInfo = uni.getStorageSync("userInfo");

if (userInfo && userInfo.mobile1) {
  // 如果本地缓存中有手机号，跳转到 "我的" 页面
  uni.switchTab({
    url: "/pages/me/me",
  });
} else {
  // getToken();
}

const getPhoneNumber = async (val) => {
  const { result } = await uniCloud.callFunction({
    name: "getPhoneNumber", // 云函数名称
    data: {
      code: val.detail.code, // 前端获取到的用户授权 code
    },
  });
  console.log("result---", result);

  if (result.success) {
    const mobile = result.phoneNumber;
    // 将手机号存储到数据库和本地缓存
    db.collection("users").add({ mobile });
    uni.setStorageSync("userInfo", { mobile });

    uni.showToast({ title: "授权成功", icon: "success" });
    uni.switchTab({ url: "/pages/me/me" });
  } else {
    uni.showToast({ title: "获取手机号失败", icon: "none" });
    console.error(result.msg);
  }
};

const getPhoneNumber1 = async (val) => {
  const appid = "wxdc6f7096d4b98844";
  const secret = "41ecdc5121b607b54ad31c1a5b3e7730";

  // 获取 access_token
  const { data: tokenData } = await uni.request({
    url: `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`,
    method: "GET",
  });

  const access_token = tokenData?.access_token;
  token.value = access_token;
  if (!access_token) {
    console.error("Failed to fetch access_token.");
    return;
  }
  uni.showToast({
    icon: "success",
    duration: 800,
    title: "授权成功",
  });

  uni.showLoading({
    title: "获取手机号码...",
    mask: true,
  });
  // 获取手机号
  const { data: phoneData } = await uni.request({
    url: `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${access_token}`,
    method: "POST",
    data: {
      code: val.detail.code,
    },
  });
  uni.hideLoading();
  code.value = phoneData;

  if (phoneData.errcode === 0 && phoneData.phone_info?.phoneNumber) {
    const mobile = phoneData.phone_info.phoneNumber;
    db.collection("users").add({
      mobile,
    });
    uni.setStorageSync("userInfo", {
      mobile,
    });
    console.log("User's phone number:", mobile);
    uni.switchTab({
      url: "/pages/me/me",
    });
  } else {
    console.error(
      "Failed to fetch phone number:",
      phoneData.errmsg || "Unknown error"
    );
  }
};

// 取消按钮逻辑
const onCancel = () => {
  console.log("取消登录");
  // 返回到首页或其他页面
  router.push({ path: "/" });
};
</script>

<style scoped lang="scss">
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  // justify-content: center;
  height: 100vh;
  background-color: #f7f8fa;
  padding: 20px;
  padding-top: 12vh;
  box-sizing: border-box;

  .logo {
    width: 110px;
    height: 110px;
    margin-bottom: 20px;
    border-radius: 50%;
  }

  .company-name {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin-bottom: 40px;
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 90%;
  }

  button {
    width: 100%;
  }

  // button {
  //   height: 45px;
  //   border-radius: 5px;
  //   font-size: 16px;
  // }

  .login-btn {
    background-color: rgb(116, 219, 239);
    color: #fff;
  }

  // .cancel-btn {
  //   background-color: #fff;
  //   color: #666;
  //   border: 1px solid #ccc;
  // }
}
</style>
