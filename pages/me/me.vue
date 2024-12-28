<template>
  <view class="me-container">
    <!-- 用户信息部分 -->
    <view class="user-info">
      <view class="left-section">
        <button
          class="avatar-wrapper"
          open-type="chooseAvatar"
          v-if="isLoggedIn"
          @chooseavatar="onChooseAvatar">
          <image class="avatar" :src="userInfo.avatar" mode="aspectFill" />
        </button>
        <view class="flex flex-col">
          <button v-if="!isLoggedIn" class="login-btn" @click="handleLogin">
            登录/注册
          </button>
          <input
            v-model="userInfo.nickname"
            class="weui-input mb-5"
            v-else
            @blur="onNameChange"
            type="nickname"
            placeholder="请输入昵称" />
          <view v-if="isLoggedIn">{{ userInfo.mobile }}</view>
        </view>
      </view>
    </view>

    <!-- 功能卡片 -->
    <view class="card">
      <view
        v-for="(item, index) in menuItems"
        :key="index"
        class="card-item"
        @click="navigatePath(item)">
        <uni-icons size="24" v-if="item.type" fontFamily="iconfont">
          {{ item.icon }}
        </uni-icons>
        <uni-icons :type="item.icon" size="30" v-else></uni-icons>
        <text>{{ item.label }}</text>
      </view>
    </view>
    <!-- v-if="userInfo.role && userInfo.role == 'superAdmin'" -->
    <view class="card">
      <view
        v-for="(item, index) in adminItems"
        :key="index"
        class="card-item"
        @click="navigatePath(item)">
        <uni-icons size="24" v-if="item.type" fontFamily="iconfont">
          {{ item.icon }}
        </uni-icons>
        <uni-icons :type="item.icon" size="30" v-else></uni-icons>
        <text>{{ item.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";

const db = uniCloud.database();
const collection = db.collection("users");

// 登录状态
const isLoggedIn = ref(false);
const userInfo = reactive({
  // mobile: "15270228821",
  // avatar: "/static/images/defaultAvatar.jpeg", // 默认头像
  // userId: "67526d0789bd27450be85c4e",
  // nickname: "未登录",
  // role: "Admin",
  // expirationDate: "2025-02-11T18:00:30Z",
  // cardType: "timeCard",
});

// uni.setStorageSync("userInfo", {
//   mobile: "15270228821",
//   avatar: "/static/images/defaultAvatar.jpeg", // 默认头像
//   userId: "675abd1bce5ec9aad5641046",
//   nickname: "未登录",
//   role: "Admin",
//   expirationDate: "2025-02-11T18:00:30Z",
//   cardType: "timeCard",
// });

// uni.setStorageSync("userInfo", {
//   mobile: "15270223103",
//   userId: "6763d1654b9247079917bee5",
//   cardType: "sessionCard",
//   nickname: "录",
//   role: "Admin",
//   expirationDate: "2025-02-11T18:00:30Z",
// });

// db.collection("users")
//   .add({
//     gender: 0,
//     cardType: "sessionCard",
//     mobile: "15270223103",
//     avatar:
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/avatar/7J0bHgHKxZLQd6e32c82d19bbf5917bb784504b8b994.jpg",
//   })
//   .then((res) => {
//     console.log("hha");
//   });

// uni.setStorageSync("userInfo", {
//   mobile: "15112653200",
//   avatar: "/static/images/defaultAvatar.jpeg", // 默认头像
//   userId: "67526d0789bd27450be85c4e",
//   nickname: "未登录",
//   role: "superAdmin",
//   expirationDate: "2025-02-11T18:00:30Z",
//   cardType: "timeCard",
// });

// 获取用户电话获取用户id
// 获取用户信息的方法
const getUser = async () => {
  try {
    console.log("userinfo.mobile", userInfo.mobile);
    const queryRes = await collection
      .where({ mobile: userInfo.mobile })
      .field("mobile,role")
      .get();

    console.log("queryRes----", queryRes, userInfo.mobile);
    if (queryRes.result.errCode === 0 && queryRes.result.data?.length) {
      const { role } = queryRes.result.data[0];

      userInfo.role = role;
      const existingUserInfo = uni.getStorageSync("userInfo") || {};
      uni.setStorageSync("userInfo", {
        ...existingUserInfo,
        role,
      });
      console.log("获取到的 userId:", userInfo.userId);
      return true;
    } else {
      console.warn("未查询到用户信息");
      return false;
    }
  } catch (error) {
    console.error("查询用户信息失败:", error);
    return false;
  }
};

const onChooseAvatar = async (e) => {
  const tempFilePath = e.detail.avatarUrl; // 获取临时路径
  userInfo.avatar = e.detail.avatarUrl;
  console.log("临时路径:", tempFilePath);

  // 提取文件名（包含扩展名）
  const fileName = tempFilePath.substring(tempFilePath.lastIndexOf("/") + 1);

  // 判断 userId 是否存在
  if (!userInfo.userId) {
    console.error("无法获取用户信息，无法上传头像");
    return;
  }

  // 上传头像到服务器
  uniCloud.uploadFile({
    filePath: tempFilePath, // 本地临时文件路径
    cloudPath: `avatar/${fileName}`, // 文件存储路径
    cloudPathAsRealPath: true, // 使用 cloudPath 作为绝对路径
    success: (uploadRes) => {
      console.log("uploadRes.data", uploadRes);
      // 确保上传成功后处理
      if (uploadRes.success) {
        const avatar = uploadRes.fileID; // 服务器返回的文件路径
        const existingUserInfo = uni.getStorageSync("userInfo") || {};
        uni.setStorageSync("userInfo", { ...existingUserInfo, avatar });

        // 查询是否已经有该用户的 avatar 数据
        collection
          .doc(userInfo.userId)
          .update({ avatar })
          .then((updateRes) => {
            uni.showToast({
              title: "头像设置成功",
              icon: "none",
            });
            console.log("头像更新成功:", updateRes);
          })
          .catch((err) => {
            console.error("头像更新失败:", err);
          });
      }
    },
    fail: (err) => {
      console.error("上传失败:", err);
    },
  });
};

const menuItems = ref([
  {
    label: "已约",
    path: "/pages-me-dashboard/myReserve/myReserve",
    icon: "calendar",
  },
  {
    label: "上课记录",
    path: "/pages-me-dashboard/classAttendanceRecord/classAttendanceRecord",
    icon: "info",
  },
  {
    label: "会员卡",
    path: "/pages-membership-card/my-membership-card/my-membership-card",
    icon: "\ue693",
    type: "iconfont",
  },
  // {
  //   label: "联系客服",
  //   path: "",
  //   icon: "chat",
  //   action: "contactCustomerService",
  // },
  // { label: "设置", path: "settings", icon: "gear" },
  // { label: "意见反馈", path: "feedback", icon: "mail-open" },
  { label: "退出登录", path: null, icon: "\ue61d", type: "iconfont" },
]);

const adminItems = ref([
  {
    label: "课表管理",
    path: "/pages-courses/courseList/courseList",
    icon: "\ue600",
    type: "iconfont",
  },
  {
    label: "学员管理",
    path: "/pages-courses/courseList/courseList",
    icon: "staff",
  },
  {
    label: "教师管理",
    path: "/pages-courses/courseList/courseList",
    icon: "\ue7d0",
    type: "iconfont",
  },
  {
    label: "舞室信息管理",
    path: "/pages-studio/studio/studio",
    icon: "shop",
    action: "contactCustomerService",
  },
]);

const encryptMobile = computed(() => {
  return userInfo.mobile.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
});

const navigatePath = (item) => {
  if (!item.path) {
    logout();
  } else {
    if (item.label.includes("管理") && userInfo.role !== "superAdmin") {
      uni.showToast({
        title: "抱歉，暂无权限",
        icon: "none",
      });
    } else {
      uni.navigateTo({
        url: item.path,
      });
    }
  }
  // if (path && userInfo.role === "superAdmin") {
  //   uni.navigateTo({
  //     url: path,
  //   });
  // } else {
  //   uni.showToast({
  //     title: "抱歉，暂无权限",
  //     icon: "none",
  //   });
  // }
};

// 跳转到登录页
const handleLogin = () => {
  uni.navigateTo({
    url: `../login/login`,
  });
  console.log("用户昵称:", userInfo.nickname);
};

const goLoginPage = () => {
  if (!isLoggedIn.value) {
    uni.showToast({
      title: "未登录",
      icon: "none",
    });
    return true;
  }
  return false;
};

const logout = () => {
  console.log("logout");
  if (goLoginPage()) return;
  uni.showModal({
    title: "是否确认退出",
    success: (res) => {
      console.log(res);
      if (res.confirm) {
        uni.clearStorageSync();
        isLoggedIn.value = false;
      }
    },
  });
};

const onNameChange = async (e) => {
  userInfo.nickname = e.detail.value;
  console.log("微信返回的用户名:", e, userInfo.userId);

  // 判断 userId 是否存在
  if (!userInfo.userId) {
    console.error("无法获取用户信息，无法更新昵称");
    return;
  }

  const existingUserInfo = uni.getStorageSync("userInfo") || {};
  uni.setStorageSync("userInfo", {
    ...existingUserInfo,
    nickname: e.detail.value,
  });

  // 更新用户昵称
  collection
    .doc(userInfo.userId)
    .update({ nickname: e.detail.value })
    .then((updateRes) => {
      uni.showToast({
        title: "名称设置成功",
        icon: "none",
      });
      console.log("名称更新成功:", updateRes);
    })
    .catch((err) => {
      console.error("名称更新失败:", err);
    });
};

onMounted(async () => {
  const storedUserInfo = uni.getStorageSync("userInfo");
  // 回显用户电话 头像 昵称
  console.log("storedUserInfo", storedUserInfo);
  if (storedUserInfo && storedUserInfo.avatar) {
    userInfo.avatar = storedUserInfo.avatar;
  }
  if (storedUserInfo && storedUserInfo.nickname) {
    userInfo.nickname = storedUserInfo.nickname;
  } else {
    userInfo.nickname = "请输入昵称";
  }
  if (storedUserInfo && storedUserInfo.mobile) {
    userInfo.mobile = storedUserInfo.mobile; // 直接更新 mobile 字段
    isLoggedIn.value = true;
    const userFetched = await getUser();
    if (!userFetched) {
      console.error("用户信息获取失败");
    }
  }
});
</script>

<style>
button::after {
  border: none !important;
  box-shadow: none !important;
}
</style>
<style scoped lang="scss">
.me-container {
  padding: 70rpx 20rpx 30rpx;

  .user-info {
    display: flex;
    align-items: center;
    justify-content: space-between; /* Left section (avatar, nickname) on the left and login button on the right */
    margin-bottom: 40rpx;
    padding-left: 20rpx;
  }

  .left-section {
    display: flex;
    align-items: center;
  }

  .avatar-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 20rpx;
    padding-left: 0rpx;
    padding-right: 0rpx;
  }

  .avatar {
    width: 100%;
    height: 100%;
  }
  .avatar::after {
    border: 1px solid transparent !important;
  }
  uni-button:after {
    border: 1px solid transparent !important;
  }

  .weui-input {
    width: 280rpx;
    padding: 10rpx 0rpx;
    font-size: 32rpx;
    border-radius: 8rpx;
  }

  .login-btn {
    background-color: rgb(116, 219, 239);
    color: #fff;
    border-radius: 8rpx;
    margin-right: 5rpx;
  }

  .card {
    background-color: #fff;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
    padding: 20rpx;
    display: flex;
    // justify-content: space-between;
    flex-wrap: wrap;
    margin-top: 60rpx;

    .card-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 20rpx 0;
      width: 32%;
    }

    .card-item:last-child {
      border-bottom: none;
    }

    .arrow-icon {
      width: 20rpx;
      height: 20rpx;
    }

    /* CSS Arrow Right */
    .arrow-right {
      width: 0;
      height: 0;
      border-top: 10rpx solid transparent;
      border-bottom: 10rpx solid transparent;
      border-left: 10rpx solid #ccc;
    }
  }
}
</style>
