<template>
  <view class="scroll-container">
    <Title :content="`教师团队(${count})`"></Title>
    <scroll-view scroll-x="true" show-scrollbar="false" class="scroll-view">
      <view v-for="(teacher, index) in teachers" :key="index" class="card">
        <image
          class="avatar"
          :src="teacher.courseTeacherPic"
          mode="aspectFill"
          @click="viewDetails(teacher)"></image>
        <view class="info">
          <view class="name">{{ teacher.name }}</view>
          <view class="description">{{ teacher.description }}</view>
          <!--   <button class="book-button" @click.stop="bookCourse(teacher)">
            预约课程
          </button> -->
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import Title from "../Title.vue";

const db = uniCloud.database();
const teachers = ref([]);
const count = ref("");

const getTeachers = () => {
  uni.showLoading({
    title: "正在加载数据",
  });
  db.collection("teachers")
    .get()
    .then((res) => {
      console.log("res---", res);
      uni.hideLoading();
      if (res.result.errCode === 0) {
        teachers.value = res.result.data;
        count.value = res.result.data.length;
      }
    });
};
getTeachers();
const viewDetails = (teacher) => {
  // Navigate to teacher detail page
  uni.navigateTo({
    url: `/pages/teacherDetail/teacherDetail?id=${teacher.name}`,
  });
};

const bookCourse = (teacher) => {
  // Handle booking functionality
  uni.showToast({
    title: `预约 ${teacher.name} 的课程`,
    icon: "none",
  });
};
</script>

<style lang="scss" scoped>
.scroll-container {
  // width: 100vw;
  // height: 100vh;
}

.scroll-view {
  white-space: nowrap;
  width: 100%;
}

.card {
  width: calc(100vw / 4); /* Shows 3.2 cards per screen */
  display: inline-block;
  background-color: white;
  border-radius: 8rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
  // padding-bottom: 20rpx;
  margin-right: 16rpx; /* Space between cards */
  margin-bottom: 6rpx; /* Space between cards */
}

.avatar {
  width: 100%;
  height: 210rpx;
  // border-radius: 50%; /* Circle shape */
  // margin-bottom: 10rpx;
  position: relative;
  left: 50%; /* Move the element 50% from the left of the container */
  transform: translateX(-50%); /* Shift it back by 50% of its own width */
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

.book-button {
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 6rpx;
  padding: 10rpx 20rpx;
  font-size: 26rpx;
}
</style>
