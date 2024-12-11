<template>
  <view>
    <uni-forms
      ref="formRef"
      :model-value="formData"
      :rules="rules"
      label-position="top"
      :validate-trigger="['submit']">
      <!-- 手机号 -->
      <uni-easyinput
        v-model="formData.phone"
        label="手机号"
        placeholder="请输入手机号"
        type="number"
        :maxlength="11"
        clearable />

      <!-- 会员卡类型 -->
      <uni-radio-group v-model="formData.cardType" label="会员卡类型">
        <uni-radio name="timeCard">时间卡</uni-radio>
        <uni-radio name="sessionCard">次卡</uni-radio>
      </uni-radio-group>

      <!-- 有效期 -->
      <view>
        <picker mode="selector" :range="timeOptions" @change="setTimeValidity">
          <view class="picker">
            {{ formData.validity || "请选择有效期" }}
          </view>
        </picker>
      </view>

      <!-- 次卡次数设置（仅次卡显示） -->
      <view v-if="formData.cardType === 'sessionCard'">
        <uni-easyinput
          v-model="formData.sessionCount"
          label="次卡次数"
          placeholder="请输入次数"
          type="number"
          clearable />
      </view>

      <!-- 提交按钮 -->
      <uni-section>
        <uni-button type="primary" @click="submitForm">提交</uni-button>
      </uni-section>
    </uni-forms>
  </view>
</template>

<script setup>
import { ref } from "vue";

const formData = ref({
  phone: "",
  cardType: "",
  validity: "",
  sessionCount: "",
});

const rules = {
  phone: {
    rules: [
      { required: true, errorMessage: "手机号不能为空" },
      { pattern: /^1[3-9]\d{9}$/, errorMessage: "手机号格式不正确" },
    ],
  },
  cardType: {
    rules: [{ required: true, errorMessage: "请选择会员卡类型" }],
  },
  validity: {
    rules: [{ required: true, errorMessage: "请选择有效期" }],
  },
  sessionCount: {
    rules: [
      { required: true, errorMessage: "请设置次数" },
      { pattern: /^\d+$/, errorMessage: "次数只能为数字" },
    ],
  },
};

const timeOptions = [
  "7天",
  "1个月",
  "2个月",
  "3个月",
  "4个月",
  "5个月",
  "6个月",
  "7个月",
  "8个月",
  "9个月",
  "10个月",
  "11个月",
  "1年",
  "永久有效",
];

const setTimeValidity = (event) => {
  formData.value.validity = timeOptions[event.detail.value];
};

const formRef = ref(null);

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      uni.showToast({
        title: "提交成功",
        icon: "success",
      });
      console.log("提交的数据:", formData.value);
    } else {
      uni.showToast({
        title: "表单验证失败",
        icon: "error",
      });
    }
  });
};
</script>

<style scoped>
.picker {
  padding: 10px;
  border: 1px solid #ddd;
  margin-top: 10px;
  border-radius: 5px;
}
</style>
