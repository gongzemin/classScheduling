<template>
  <view class="login-page">
    <!-- Logo -->
    <image class="logo" src="/static/logoCircle.png" />

    <!-- 公司名称 -->
    <view class="company-name">{{ studioData.name }}</view>

    <!-- 公司口号 -->
    <view class="slogan" v-if="studioData.slogan">
      {{ studioData.slogan }}
    </view>

    <!-- 按钮区域 -->
    <view class="button-group">
      <!-- 使用手机号授权登录按钮
	   open-type="getPhoneNumber"
	   @getphonenumber="getPhoneNumber"
	   open-type="getRealtimePhoneNumber"
		@getrealtimephonenumber="getrealtimephonenumber" -->
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
import { ref, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
const db = uniCloud.database();
const studioData = ref({});

// 显示加载框
const showLoading = (title = "加载中...") => {
  uni.showLoading({ title });
};

// 隐藏加载框
const hideLoading = () => {
  try {
    uni.hideLoading();
  } catch (error) {
    console.warn("加载框已关闭或不存在，无需再次关闭");
  }
};

// 获取手机号
const getPhoneNumber = async (val) => {
  try {
    showLoading();
    const { result } = await uniCloud.callFunction({
      name: "getPhoneNumber",
      data: { code: val.detail.code },
    });
    hideLoading();
    if (!result.success) {
      uni.showToast({ title: "获取手机号失败", icon: "none" });
      return;
    }

    const mobile = result.phoneNumber;
    showLoading();

    const queryResult = await queryUserByMobile(mobile);
    hideLoading();
    if (queryResult.length > 0) {
      await handleExistingUser(queryResult[0], mobile);
    } else {
      await createNewUserAndCard(mobile);
    }
  } catch (error) {
    console.error("手机号获取流程失败:", error);
    uni.showToast({ title: "操作失败，请稍后再试", icon: "none" });
  }
};

// 查询用户
const queryUserByMobile = async (mobile) => {
  const { result } = await db
    .collection("users")
    .where({ mobile })
    .field("mobile, avatar, nickname, role")
    .get();

  console.log("queryUserByMobile result:", result); // 修复误写
  return result.data || [];
};

// 处理已有用户的逻辑
const handleExistingUser = async ({ _id, avatar, nickname, role }, mobile) => {
  showLoading();
  const { result } = await db
    .collection("user-membership-card")
    .where({ user_id: _id })
    .get({ getOne: true });
  hideLoading();
  // 存储用户信息
  const cardInfo = result.data || {};
  console.log("handleExistingUser", cardInfo, result);
  uni.setStorageSync("userInfo", {
    mobile,
    avatar,
    role,
    nickname,
    userId: _id,
    ...cardInfo,
  });

  showSuccessAndNavigate("手机号已授权");
};

// 创建新用户及会员卡
const createNewUserAndCard = async (mobile) => {
  console.log("mobile", mobile);
  const currentDate = new Date();
  const expirationDate = new Date();
  expirationDate.setMonth(currentDate.getMonth() + 3);

  const newUser = { mobile };
  const cardInfo = {
    status: 1,
    cardType: "sessionCard",
    validityPeriod: "3个月",
    totalSessions: 99,
    remainingSessions: 99,
    startDate: currentDate,
    expirationDate,
  };
  // showLoading();
  const res = await db.collection("users").add(newUser);
  // hideLoading();
  if (res.result.errCode === 0) {
    cardInfo.user_id = res.result.id;
    await db.collection("user-membership-card").add(cardInfo);

    uni.setStorageSync("userInfo", {
      mobile,
      userId: res.result.id,
      ...cardInfo,
    });

    showSuccessAndNavigate("授权成功");
  } else {
    uni.showToast({ title: "注册失败，请重试", icon: "none" });
  }
};

// 显示成功提示并跳转
const showSuccessAndNavigate = (title) => {
  uni.showToast({
    title,
    icon: "success",
    duration: 1500,
  });
  uni.reLaunch({ url: "/pages/me/me" });
};

// 取消逻辑
const onCancel = () => {
  uni.switchTab({ url: "/pages/index/index" });
};

// 加载舞室信息
const fetchStudioData = async () => {
  try {
    uni.showLoading({ title: "" });
    const res = await db
      .collection("studio")
      .field("name, slogan")
      .limit(1)
      .get();

    if (res.result.data.length > 0) {
      studioData.value = res.result.data[0];
    } else {
      uni.showToast({ title: "未找到舞室信息", icon: "none" });
    }
  } catch (error) {
    uni.showToast({ title: "加载失败", icon: "none" });
    console.error("查询失败", error);
  } finally {
    uni.hideLoading();
  }
};

// 页面挂载时加载数据
onMounted(() => {
  fetchStudioData();
});

onLoad(() => {
  const userInfo = uni.getStorageSync("userInfo");
  if (userInfo && userInfo.mobile) {
    uni.showToast({
      title: "已登录",
      icon: "success",
      duration: 1500,
    });
    setTimeout(() => {
      uni.switchTab({
        url: "/pages/index/index", // 修复页面切换问题
      });
    }, 500);
  }
});
</script>

<style scoped lang="scss">
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
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
    font-size: 26px;
    font-weight: bold;
    color: #000;
    margin-bottom: 10px;
  }

  .slogan {
    font-size: 16px;
    color: #666;
    margin-bottom: 40px;
    text-align: center;
    max-width: 80%;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.2); // 添加阴影
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

  .login-btn {
    background-color: rgb(116, 219, 239);
    color: #fff;
  }
}
</style>
