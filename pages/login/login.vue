<template>
  <view class="login-container">
    <!-- Background image -->
    <image class="background-image" src="/static/images/dance1.png" />

    <!-- Form with phone input, verification code, and agreement -->
    <view class="form-group">
      <input
        v-model="phoneNumber"
        type="number"
        maxlength="11"
        placeholder="请输入手机号码"
        class="input" />
    </view>

    <view class="form-group">
      <input
        v-model="verificationCode"
        type="text"
        maxlength="6"
        placeholder="请输入验证码"
        class="input" />
      <button
        class="send-code-btn"
        :disabled="isSending || !isPhoneValid"
        @click="sendVerificationCode">
        {{ sendButtonText }}
      </button>
    </view>

    <view class="agreement">
      <!-- Bind change event manually -->
      <checkbox
        :checked="isAgreementChecked"
        @change="toggleAgreement"
        class="checkbox" />
      <text>我已阅读并同意</text>
      <navigator url="/pages/agreement/agreement">用户协议</navigator>
    </view>

    <button class="login-btn" :disabled="!canLogin" @click="handleLogin">
      登录
    </button>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

// Data for phone number, verification code, and agreement
const phoneNumber = ref("");
const verificationCode = ref("");
const isSending = ref(false);
const sendButtonText = ref("发送验证码");
const isAgreementChecked = ref(false);

// Check if the phone number is valid
const isPhoneValid = computed(() => {
  return phoneNumber.value.length === 11;
});

// Check if the user can log in (phone, code, and agreement)
const canLogin = computed(() => {
  return (
    phoneNumber.value.length === 11 &&
    verificationCode.value.length === 6 &&
    isAgreementChecked.value
  );
});

const router = useRouter();

// Toggle the checkbox state
const toggleAgreement = (event: any) => {
  isAgreementChecked.value = event.detail.value;
};

// Function to send the verification code using a third-party service
const sendVerificationCode = async () => {
  if (!isPhoneValid.value) return;

  isSending.value = true;
  sendButtonText.value = "发送中...";

  try {
    // Mock sending request (replace with third-party service)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    sendButtonText.value = "重新发送";
    isSending.value = false;
  } catch (error) {
    console.error("发送验证码失败", error);
    sendButtonText.value = "发送验证码";
    isSending.value = false;
  }
};

// Handle the login process
const handleLogin = () => {
  if (!canLogin.value) return;

  // Mock login action
  console.log("登录中...");

  // On success, navigate to the next page or home
  router.push({ path: "/home" });
};
</script>

<style scoped lang="scss">
.login-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 20rpx;
}

.background-image {
  position: absolute;
  top: 0;
  // left: 0;
  width: 40%;
  // height: 100%;
  z-index: -1;
  opacity: 0.8;
}

.form-group {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  position: relative;
}

.input {
  width: 400rpx;
  height: 80rpx;
  font-size: 32rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 20rpx;
}

.send-code-btn {
  position: absolute;
  right: 0;
  padding: 8rpx 16rpx;
  background-color: #682aae;
  color: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.agreement {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;

  .checkbox {
    margin-right: 10rpx;
  }

  navigator {
    color: #682aae;
    text-decoration: underline;
  }
}

.login-btn {
  width: 400rpx;
  height: 80rpx;
  background-color: #682aae;
  color: #fff;
  border: none;
  border-radius: 10rpx;
  font-size: 32rpx;
}
</style>
