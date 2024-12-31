<template>
  <view class="form-container">
    <uni-forms
      ref="formRef"
      :modelValue="formData"
      :rules="rules"
      label-position="top"
      label-width="100">
      <uni-forms-item label="舞室名称" name="name" required>
        <uni-easyinput v-model="formData.name" placeholder="请输入舞室名称" />
      </uni-forms-item>
      <uni-forms-item label="口号" name="slogan">
        <uni-easyinput v-model="formData.slogan" placeholder="请输入口号" />
      </uni-forms-item>
      <uni-forms-item label="客服电话" name="phone" required>
        <uni-easyinput
          v-model="formData.phone"
          placeholder="请输入客服电话"
          type="number" />
      </uni-forms-item>
      <uni-forms-item label="客服微信ID" name="wechatId" required>
        <uni-easyinput
          v-model="formData.wechatId"
          placeholder="请输入客服微信ID" />
      </uni-forms-item>
      <uni-forms-item label="舞室地址" name="address" required>
        <uni-easyinput
          v-model="formData.address"
          placeholder="请输入舞室地址" />
      </uni-forms-item>
      <!-- 功能模块选择 -->
      <uni-forms-item label="请选择首页需要的功能模块" name="modules" required>
        <uni-data-checkbox
          v-model="formData.modules"
          :localdata="moduleOptions"
          multiple />
      </uni-forms-item>
      <uni-forms-item label="最低开课人数" required name="minParticipants">
        <uni-easyinput
          v-model="formData.minParticipants"
          type="number"
          placeholder="请输入最低开课人数" />
      </uni-forms-item>

      <uni-forms-item
        label="取消截止时间 (小时)"
        required
        name="cancelDeadlineHours">
        <uni-easyinput
          v-model="formData.cancelDeadlineHours"
          type="number"
          placeholder="请输入取消截止时间" />
      </uni-forms-item>

      <uni-forms-item
        label="请上传舞室相册 前3张为首页轮播图"
        name="banner"
        required>
        <uni-file-picker
          v-model="formData.banner"
          fileMediatype="image"
          :limit="14" />
      </uni-forms-item>

      <uni-forms-item label="请输入舞室介绍" name="descrption">
        <view class="content">
          <view class="tools" v-if="toolShow">
            <view
              class="item"
              v-for="(item, idx) in toolList"
              :key="idx"
              @click="setActiveIcon(idx)">
              <uni-icons
                :class="[activeIndex === idx ? 'active-icon' : 'default-icon']"
                size="18"
                fontFamily="iconfont">
                {{ item.icon }}
              </uni-icons>
            </view>
          </view>
          <editor
            placeholder="舞室介绍"
            class="myEdit"
            id="editor"
            show-img-size
            show-img-toolbar
            show-img-resize
            @ready="onEditReady"
            @focus="onFocus"
            @statuschange="onStatuschange"></editor>
        </view>
      </uni-forms-item>

      <!--      <uni-forms-item label="经度" name="lngLat.longitude">
        <uni-easyinput
          v-model.number="formData.lngLat.longitude"
          placeholder="请输入经度" />
      </uni-forms-item>

      <uni-forms-item label="纬度" name="lngLat.latitude">
        <uni-easyinput
          v-model.number="formData.lngLat.latitude"
          placeholder="请输入纬度" />
      </uni-forms-item> -->

      <button type="primary" :disabled="submitting" @click="submitForm">
        提交
      </button>
    </uni-forms>
  </view>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from "vue";
import { onLoad } from "@dcloudio/uni-app";
const formRef = ref();
const db = uniCloud.database();
const formData = ref({
  name: "",
  slogan: "",
  description: "",
  phone: "",
  modules: [],
  wechatId: "",
  address: "",
  banner: [],
  lngLat: {
    longitude: null,
    latitude: null,
  },
  minParticipants: 3,
  cancelDeadlineHours: 1,
});
const queryId = ref();
const submitting = ref(false);
// 表单校验规则
const rules = {
  name: {
    rules: [
      { required: true, errorMessage: "用户名不能为空" },
      { minLength: 2, maxLength: 20, errorMessage: "用户名长度为3-20个字符" },
    ],
  },
  slogan: {
    rules: [{ required: true, errorMessage: "口号不能为空" }],
  },
  // descrption: {
  //   rules: [{ required: true, errorMessage: "简介不能为空" }],
  // },
  phone: {
    rules: [
      { required: true, errorMessage: "客服电话不能为空" },
      {
        pattern: /^1[3-9]\d{9}$/,
        errorMessage: "请输入有效的11位手机号",
      },
    ],
  },
  email: {
    rules: [
      { required: true, errorMessage: "邮件地址不能为空" },
      {
        format: "email",
        errorMessage: "请输入有效的邮件地址",
      },
    ],
  },

  wechatId: {
    rules: [{ required: true, errorMessage: "微信ID不能为空" }],
  },
  address: {
    rules: [{ required: true, errorMessage: "舞室地址不能为空" }],
  },
  modules: {
    rules: [{ required: true, errorMessage: "请选择至少一个功能模块" }],
  },
  minParticipants: {
    rules: [
      { required: true, errorMessage: "最低开课人数不能为空" },
      { pattern: /^[1-9]\d*$/, errorMessage: "请输入有效的正整数" },
    ],
  },
  cancelDeadlineHours: {
    rules: [
      { required: true, errorMessage: "取消截止时间不能为空" },
      { pattern: /^\d+(\.\d+)?$/, errorMessage: "请输入有效的数字 (允许小数)" },
    ],
  },
  banner: {
    rules: [{ required: true, errorMessage: "请至少上传一张图片" }],
  },
  // banner: {
  //   rules: [
  //     {
  //       validator: (rule: any, value: any) => {
  //         return value && value.length > 0; // 确保至少上传一张图片
  //       },
  //       errorMessage: "请至少上传一张图片",
  //     },
  //   ],
  // },
  // "lngLat.longitude": {
  //   rules: [
  //     { required: true, errorMessage: "经度不能为空" },
  //     {
  //       pattern: /^-?(180(\.0{1,6})?|((1[0-7]\d)|([1-9]?\d))(\.\d{1,6})?)$/,
  //       errorMessage: "请输入有效的经度（-180 至 180）",
  //     },
  //   ],
  // },
  // "lngLat.latitude": {
  //   rules: [
  //     { required: true, errorMessage: "纬度不能为空" },
  //     {
  //       pattern: /^-?(90(\.0{1,6})?|([1-8]?\d(\.\d{1,6})?))$/,
  //       errorMessage: "请输入有效的纬度（-90 至 90）",
  //     },
  //   ],
  // },
};

const moduleOptions = [
  { text: "舞室相册", value: "舞室相册" },
  { text: "租教室", value: "租教室" },
  { text: "演出合作", value: "演出合作" },
  { text: "优惠活动", value: "优惠活动" },
  { text: "品牌介绍", value: "品牌介绍" },
];

const instance = getCurrentInstance();
// 当前激活的图标索引
const activeIndex = ref(null);

const toolShow = ref(false);
// 工具列表
const toolList = [
  { icon: "\ue675" },
  { icon: "\ue829" },
  { icon: "\ue82b" },
  { icon: "\ue7c1" },
  { icon: "\ue622" },
  { icon: "\ue645" },
];

// 设置激活图标的索引
function setActiveIcon(idx) {
  if (activeIndex.value === idx) {
    // 如果当前索引已经是激活状态，再次点击时取消高亮
    activeIndex.value = null;
  } else {
    activeIndex.value = idx;
  }
  // 插一条横线
  if (idx === 3) {
    editorCtx.value.insertDivider();
  } else if (idx === 0) {
    editorCtx.value.format("header", "h1");
  } else if (idx === 1) {
    editorCtx.value.format("bold");
  } else if (idx === 2) {
    editorCtx.value.format("italic");
  } else if (idx === 4) {
    // 添加头像
    uni.chooseImage({
      success: async (res) => {
        console.log(res, "0");

        // 显示 loading
        uni.showLoading({
          title: "上传中请稍后",
        });

        // 创建一个 Promise 数组，每个图片上传操作都是一个 Promise
        const uploadTasks = res.tempFiles.map((item) => {
          return new Promise((resolve, reject) => {
            uniCloud.uploadFile({
              filePath: item.path,
              cloudPath: `banner/${item.path.split("/").pop()}`, // 获取路径中图片文件名部分
              cloudPathAsRealPath: true,
              success: (uploadFileRes) => {
                // 插入图片到编辑器
                editorCtx.value.insertImage({
                  src: uploadFileRes.fileID,
                });
                console.log(uploadFileRes, "2");
                resolve(); // 上传成功
              },
              fail: (err) => {
                console.error("Upload failed:", err);
                reject(err); // 上传失败
              },
            });
          });
        });

        // 等待所有上传任务完成后隐藏 loading
        try {
          await Promise.all(uploadTasks);
        } catch (err) {
          console.error("One or more uploads failed:", err);
        } finally {
          uni.hideLoading();
        }
      },
    });
  }
}
const onFocus = () => {
  toolShow.value = true;
};

const addData = async () => {
  // const { banner, ...formDataWithoutBanner } = formData.value;
  //const formattedBanner = banner.map((item) => item.url);

  uni.showLoading({
    title: "处理中...",
  });

  try {
    console.log("formData-----", formData.value);
    const res = await db.collection("studio").limit(1).get();
    const studioExists = res.result.data.length > 0;

    if (studioExists) {
      // 更新已有数据
      const studioId = res.result.data[0]._id;
      await db
        .collection("studio")
        .doc(studioId)
        .update({
          ...formData.value,
          minParticipants: Number(formData.value.minParticipants),
          cancelDeadlineHours: Number(formData.value.cancelDeadlineHours),
          // ...formDataWithoutBanner,
          // banner: formattedBanner,
        });

      uni.showToast({
        title: "更新成功",
      });
    } else {
      // 新增数据
      await db.collection("studio").add({
        ...formData.value,
        minParticipants: Number(formData.value.minParticipants),
        cancelDeadlineHours: Number(formData.value.cancelDeadlineHours),
        // ...formDataWithoutBanner,
        // banner: formattedBanner,
      });

      uni.showToast({
        title: "发布成功",
      });
    }
    submitting.value = false;

    // 显示成功后 为了发布成功可以 显示完 跳转
    setTimeout(() => {
      uni.reLaunch({
        url: "/pages/index/index",
      });
    }, 800);
  } catch (err) {
    console.error("操作失败", err);
    submitting.value = false;
    uni.showToast({
      title: "操作失败",
      icon: "none",
    });
  } finally {
    submitting.value = false;
    uni.hideLoading();
  }
};
const editorCtx = ref(null);

const onEditReady = () => {
  uni
    .createSelectorQuery()
    .in(instance.proxy)
    .select("#editor")
    .fields(
      {
        size: true,
        context: true,
      },
      (res) => {
        editorCtx.value = res.context; // || formData.value.description;
        console.log(res, editorCtx.value, "size-context");
      }
    )
    .exec();
};

const onStatuschange = (e) => {
  let detail = e.detail;
  // 敲完回车后 就不要高亮显示
  if (Object.keys(detail).length === 0) {
    activeIndex.value = null;
  }
};

// 提交表单
const submitForm = () => {
  formRef.value
    ?.validate()
    .then(() => {
      editorCtx.value.getContents({
        success: (res) => {
          if (!res.html) {
            uni.showToast({
              title: "请填写舞室介绍",
            });
            return;
          }
          formData.value.description = res.html;
          uni.showLoading({
            title: "发布中...",
          });
          console.log("formData", formData);
          // 表单验证成功才禁用提交 不然点击校验没通过  修改了这时候就不可以提交了
          submitting.value = true;
          addData();
        },
      });
      console.log("表单验证通过", formData.value);
      uni.showToast({
        title: "提交成功",
        icon: "success",
      });
    })
    .catch((err: any) => {
      console.log("表单验证失败", err);
    });
};

const getDetail = async () => {
  try {
    // Assuming 'queryId' holds the ID to fetch the studio details
    const res = await db.collection("studio").doc(queryId.value).get();

    if (res.result.data.length > 0) {
      formData.value = res.result.data[0];

      editorCtx.value.setContents({
        html: res.result.data[0].description,
        success: () => {
          console.log("内容设置成功");
        },
        fail: (err) => {
          console.error("设置失败", err);
        },
      });

      // editorCtx.value = formData.value.description;

      // If you have any special logic to handle or populate specific fields, do that here
      // For example, you could set a default for some fields or process data before assigning to formData

      uni.showToast({
        title: "信息加载成功",
        icon: "success",
      });
    } else {
      uni.showToast({
        title: "未找到相关数据",
        icon: "none",
      });
    }
  } catch (err) {
    console.error("获取详情失败", err);
    uni.showToast({
      title: "获取详情失败",
      icon: "none",
    });
  } finally {
    uni.hideLoading();
  }
};

onLoad((e) => {
  queryId.value = e.id;
  if (e.id) {
    uni.showLoading({
      // title: "...",
    });
    getDetail();
    uni.setNavigationBarTitle({
      title: "编辑信息",
    });
  }
});
</script>

<style scoped lang="scss">
.form-container {
  padding: 20rpx;
}

button {
  margin-top: 40rpx;
  width: 100%;
}
</style>
<style lang="scss">
.ql-blank::before {
  font-style: normal;
  color: #e0e0e0;
}

.content {
  margin-bottom: 20rpx;
  border: 1px solid #ddd;
  border-radius: 8rpx;
  overflow: hidden;

  .myEdit {
    height: calc(100vh - 500rpx);
  }

  // editor {
  //   width: 100%;
  //   min-height: 300rpx;
  //   padding: 10rpx;
  //   font-size: 26rpx;
  // }
}

.btnGroup {
  margin: 20rpx 0;

  wd-button {
    width: 100%;
    font-size: 26rpx;
    color: #fff;
    background-color: #409eff;
    border-radius: 8rpx;
  }

  wd-button[disabled] {
    background-color: #ccc;
    color: #999;
  }
}

.tools {
  display: flex;
  justify-content: space-around;
  margin-top: 20rpx;

  .item {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50rpx;
    height: 50rpx;
    font-size: 26rpx;
    color: #11f011;
    uni-icons {
      transition: color 0.3s;
      font-size: 36rpx;
    }

    .default-icon {
      color: #333;
    }

    .active-icon {
      // color: #409eff !important;
      text {
        color: #409eff !important;
      }
    }
  }
}
.rich-img {
  width: 100%;
  border-radius: 10rpx;
  margin: 20rpx 0;
}
</style>
