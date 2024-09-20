<template>
  <view class="scroll-container">
    <Title content="教师团队 (10)"></Title>
    <scroll-view class="scroll-view" scroll-x="true" show-scrollbar="false">
      <view v-for="(teacher, index) in teachers" :key="index" class="card">
        <image
          class="avatar"
          :src="teacher.avatar"
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

const teachers = ref([
  {
    name: "魅力",
    description: "kPop",
    avatar:
      "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/IMG_0941.jpg",
  },
  {
    name: "欧欧",
    description: "jazz",
    avatar:
      "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/IMG_0942.jpg",
  },
  {
    name: "王老师",
    description: "舞蹈专家",
    avatar:
      "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/IMG_0943.jpg",
  },
  {
    name: "赵老师",
    description: "高级舞蹈教练",
    avatar: "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/IMG_0941.jpg",
  },
  // Add more teachers here
]);

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
  display: flex;
  flex-direction: row;
  overflow-x: scroll;
  white-space: nowrap;
}

.card {
  width: calc(100vw / 4); /* Shows 3.2 cards per screen */
  display: inline-block;
  // display: flex;
  // flex-direction: column;
  // justify-content: center;
  // align-items: center;
  background-color: white;
  border-radius: 8rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
  // padding-bottom: 20rpx;
  margin-right: 16rpx; /* Space between cards */
}

.avatar {
  width: 100%;
  height: 170rpx;
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
