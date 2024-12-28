<template>
  <view class="login-page">
    <!-- Logo -->
    <image class="logo" src="/static/logoCircle.png" />
    <!-- 公司名称 -->
    <view class="company-name">Pick Star 娱乐有限公司</view>

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

const getPhoneNumber = async (val) => {
  const { result } = await uniCloud.callFunction({
    name: "getPhoneNumber", // 云函数名称
    data: {
      code: val.detail.code, // 前端获取到的用户授权 code
    },
  });
  console.log("result---", result);

  // 获取当前日期和3个月后的日期
  const currentDate = new Date();
  const expirationDate = new Date();
  expirationDate.setMonth(currentDate.getMonth() + 3);

  if (result.success) {
    const mobile = result.phoneNumber;

    // 查询 users 数据表中是否已存在该手机号
    const { result: queryResult } = await db
      .collection("users")
      .where({ mobile })
      .field("mobile")
      .get();
    console.log("queryResult", queryResult);
    if (queryResult.data.length > 0) {
      // 手机号已存在，直接提示用户
      uni.setStorageSync("userInfo", { mobile });
      uni.showToast({ title: "手机号已授权", icon: "success" });
    } else {
      // 新用户数据
      const newUser = {
        mobile,
        status: 1, // 已激活
        cardType: "sessionCard", // 次卡
        validityPeriod: "3个月",
        expirationDate: expirationDate,
        createdAt: currentDate,
      };
      // 手机号不存在，添加到数据库并存储到本地缓存
      await db.collection("users").add(newUser);
      uni.setStorageSync("userInfo", { mobile });
      uni.showToast({ title: "授权成功", icon: "success" });
    }

    // 跳转到用户中心页面
    uni.switchTab({ url: "/pages/me/me" });
  } else {
    uni.showToast({ title: "获取手机号失败", icon: "none" });
    console.error(result.msg);
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
