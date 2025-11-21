<template>
  <view class="avatars" v-if="reservedUsers && reservedUsers.length">
    <template v-for="(item, idx) in reservedUsers" :key="idx">
      <image
        :src="getAvatar(item.user_id)"
        mode="aspectFill"
        class="avatar"></image>
    </template>
  </view>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

interface User {
  avatar?: string;
  userId: string;
}

// 定义 props
defineProps({
  reservedUsers: {
    type: Array as () => User[], // 用户列表类型
    required: true,
  },
});
function getAvatar(user) {
  // 检查 user.avatar 是否为有效字符串
  return (
    (Array.isArray(user) && user[0].avatar) ||
    "../../static/images/defAvatar.png"
  );
}
</script>

<style scoped lang="scss">
.avatars {
  display: flex;
  flex-wrap: wrap;
  // justify-content: center;
  // padding-top: 25rpx;
  image {
    width: 55rpx;
    height: 55rpx;
    border-radius: 50%;
    margin-right: 10rpx;
    margin-bottom: 10rpx;
    // border: 1px solid #fff;
    // margin-left: -20rpx;
  }
}
</style>
