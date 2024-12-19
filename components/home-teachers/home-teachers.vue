<template>
  <view class="scroll-container">
    <Title :content="`教师团队(${count})`"></Title>
    <scroll-view
      scroll-x="true"
      show-scrollbar="false"
      class="scroll-view"
      @scroll="onScroll">
      <view
        v-for="(teacher, index) in visibleTeachers"
        :key="index"
        class="card">
        <image
          class="avatar"
          :src="teacher.courseTeacherPic"
          mode="aspectFill"
          @click="viewDetails(teacher)"></image>
        <view class="info">
          <view class="name">{{ teacher.name }}</view>
          <view class="description">{{ teacher.description }}</view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import Title from "../Title.vue";

const db = uniCloud.database();
const visibleTeachers = ref([]); // 当前显示的教师数据
const count = ref(0); // 总教师人数

// 获取教师总数
const getCount = () => {
  db.collection("teachers")
    .count()
    .then((res) => {
      if (res.result.errCode === 0) {
        count.value = res.result.total;
        // 初始化加载
        getTeachers();
      }
    });
};

// 获取教师数据（分页）
const getTeachers = async (offset = 0, pageSize = 5) => {
  uni.showLoading();
  try {
    const res = await db
      .collection("teachers")
      .skip(offset) // 跳过已加载的数据
      .limit(pageSize) // 限制每次获取的数量
      .get();

    uni.hideLoading();
    if (res.result.errCode === 0) {
      // 确保只更新未加载的数据
      if (res.result.data.length > 0) {
        visibleTeachers.value = res.result.data;
      }
    }
  } catch (error) {
    uni.hideLoading();
    console.error("加载教师数据失败", error);
  }
};

getCount();

// 懒加载教师数据
const loadMoreTeachers = () => {
  if (visibleTeachers.value.length < count.value) {
    getTeachers(0, count.value);
  }
};

// 滚动事件监听
const onScroll = (e) => {
  const scrollLeft = e.detail.scrollLeft; // 当前滚动位置
  const scrollWidth = e.detail.scrollWidth; // 滚动内容总宽度
  const windowWidth = uni.getSystemInfoSync().windowWidth; // 可见区域宽度

  // 判断是否接近右侧（滚动到底部）
  if (scrollLeft + windowWidth >= scrollWidth - 50) {
    loadMoreTeachers();
  }
};

const viewDetails = (teacher) => {
  // 跳转到教师详情页面
  uni.navigateTo({
    url: `/pages/teacherDetail/teacherDetail?id=${teacher.name}`,
  });
};
</script>

<style lang="scss" scoped>
.scroll-container {
  .scroll-view {
    white-space: nowrap;
    width: 100%;

    .card {
      width: calc(100vw / 4); /* 每屏显示 4 个卡片 */
      display: inline-block;
      background-color: white;
      border-radius: 8rpx;
      box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
      margin-right: 16rpx; /* 卡片间距 */
      .avatar {
        width: 100%;
        height: 210rpx;
      }

      .info {
        text-align: center;

        .name {
          font-size: 28rpx;
          font-weight: bold;
          margin-bottom: 8rpx;
        }

        .description {
          font-size: 24rpx;
          color: #666;
          margin-bottom: 12rpx;
        }
      }
    }
  }
}
</style>
