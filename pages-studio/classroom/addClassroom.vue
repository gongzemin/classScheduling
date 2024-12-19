<template>
  <view class="p-20">
    <uni-forms
      ref="formRef"
      :model="formData"
      :rules="rules"
      @submit="handleSubmit">
      <!-- 教室名称 -->
      <uni-forms-item name="name" label="教室名称" required>
        <uni-easyinput
          v-model="formData.name"
          placeholder="请输入教室名称"></uni-easyinput>
      </uni-forms-item>

      <!-- 装修风格 -->
      <uni-forms-item name="style" label="装修风格" required>
        <picker
          mode="selector"
          :range="styleOptions"
          @change="handleStyleChange"
          :value="styleIndex">
          <uni-data-picker>
            {{ formData.style || "请选择装修风格" }}
          </uni-data-picker>
        </picker>
      </uni-forms-item>

      <!-- 面积 -->
      <uni-forms-item name="area" label="面积" required>
        <uni-easyinput
          v-model="formData.area"
          type="number"
          placeholder="请输入面积"></uni-easyinput>
      </uni-forms-item>

      <!-- 容纳人数 -->
      <uni-forms-item name="capacity" label="容纳人数" required>
        <uni-easyinput
          v-model="formData.capacity"
          type="number"
          placeholder="请输入容纳人数"></uni-easyinput>
      </uni-forms-item>

      <!-- 灯光类型 -->
      <uni-forms-item name="lighting" label="灯光类型">
        <uni-easyinput
          v-model="formData.lighting"
          placeholder="请输入灯光类型"></uni-easyinput>
      </uni-forms-item>

      <!-- 教室相册 -->
      <uni-forms-item name="album" label="教室相册">
        <view class="form-group">
          <text>教室相册 (最多上传 20 张)</text>
          <view class="upload-container">
            <button type="primary" @click="chooseImages">上传图片</button>
            <view
              class="image-preview"
              v-for="(image, index) in formData.album"
              :key="index">
              <image :src="image" class="preview-img" />
              <text @click="removeImage(index)" class="delete-btn">删除</text>
            </view>
          </view>
        </view>
      </uni-forms-item>

      <!-- 提交和重置按钮 -->
      <uni-button form-type="submit" type="primary">提交</uni-button>
      <uni-button form-type="reset" type="default" @click="handleReset">
        重置
      </uni-button>
    </uni-forms>
  </view>
</template>

<script setup>
import { ref } from "vue";

// 表单数据
const formData = ref({
  name: "",
  style: "",
  area: "",
  capacity: "",
  lighting: "",
  album: [],
});

// 校验规则
const rules = {
  name: {
    required: true,
    errorMessage: "教室名称不能为空",
  },
  style: {
    required: true,
    errorMessage: "请选择装修风格",
  },
  area: {
    required: true,
    errorMessage: "面积不能为空",
  },
  capacity: {
    required: true,
    errorMessage: "容纳人数不能为空",
  },
  album: {
    validator: (rule, value, callback) => {
      if (value.length > 20) {
        callback(new Error("最多上传 20 张图片"));
      } else {
        callback();
      }
    },
  },
};

// 装修风格选项
const styleOptions = [
  "现代简约",
  "复古风",
  "工业风",
  "日式风",
  "中式风",
  "混搭风",
  "其他",
];
const styleIndex = ref(0);

// 处理装修风格选择
const handleStyleChange = (e) => {
  styleIndex.value = e.detail.value;
  formData.value.style = styleOptions[e.detail.value];
};

// 上传图片
const chooseImages = () => {
  uni.chooseImage({
    count: 20 - formData.value.album.length,
    success: (res) => {
      formData.value.album.push(...res.tempFilePaths);
    },
  });
};

// 删除图片
const removeImage = (index) => {
  formData.value.album.splice(index, 1);
};

// 提交表单
const formRef = ref(null);
const handleSubmit = () => {
  formRef.value.validate((valid, errors) => {
    if (valid) {
      uni.showToast({ title: "表单提交成功", icon: "success" });
      console.log("提交数据：", formData.value);
    } else {
      uni.showToast({ title: "请检查表单内容", icon: "error" });
      console.error("表单校验失败：", errors);
    }
  });
};

// 重置表单
const handleReset = () => {
  formData.value = {
    name: "",
    style: "",
    area: "",
    capacity: "",
    lighting: "",
    album: [],
  };
  styleIndex.value = 0;
};
</script>
<style scoped>
.upload-container {
  margin-top: 10px;
}
.image-preview {
  display: flex;
  align-items: center;
  margin-top: 5px;
}
.preview-img {
  width: 80px;
  height: 80px;
  margin-right: 10px;
}
.delete-btn {
  color: red;
  cursor: pointer;
}
</style>
