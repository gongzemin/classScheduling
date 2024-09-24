<template>
  <view class="course-card">
    <!-- 背景展示老师图片 -->
    <view
      class="course-background"
      :style="{ backgroundImage: `url(${teacherImage})` }">
      <!-- 课程内容 -->
      <view class="course-info">
        <text class="course-name">{{ courseName }}</text>
        <view class="course-difficulty">
          <text>难度:</text>
          <view class="stars">
            <view v-for="n in 5" :key="n" class="star">
              <text v-if="n <= difficulty" class="filled">★</text>
              <text v-else>☆</text>
            </view>
          </view>
        </view>
        <text class="course-time">时间: {{ courseTime }}</text>
      </view>
      <!-- 学生头像列表 -->
      <view class="student-avatar-list">
        <view
          v-for="(student, index) in students"
          :key="index"
          class="avatar-wrapper">
          <image :src="student.avatar" class="avatar" />
        </view>
      </view>
      <!-- 预约按钮 -->
      <button class="reserve-btn" @click="reserveCourse">预约课程</button>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  courseName: String,
  teacherName: String,
  courseTime: String,
  difficulty: Number, // 课程难度：1-5
  teacherImage: String,
  students: Array, // 学生 avatar 列表
});

const reserveCourse = () => {
  uni.showToast({
    title: "已预约",
    icon: "success",
  });
};
</script>

<style scoped lang="scss">
.course-card {
  width: 100%;
  // height: 330rpx;
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  .course-background {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    display: flex;
    flex-direction: column;
    // justify-content: space-between;
    padding: 10px;
    color: #fff;

    .course-info {
      // background: rgba(0, 0, 0, 0.5);
      padding: 10px;
      border-radius: 5px;

      .course-name {
        font-size: 18px;
        font-weight: bold;
      }

      .course-difficulty {
        margin-top: 6px;
        display: flex;
        align-items: center;

        text {
          font-size: 14px;
        }

        .stars {
          display: flex;
          margin-left: 5px;
          .star {
            font-size: 18px;
            margin-right: 2px;
          }
          .filled {
            color: gold;
          }
        }
      }

      .course-time {
        margin-top: 4px;
        font-size: 14px;
      }
    }

    .student-avatar-list {
      display: flex;
      margin-top: 10px;
      .avatar-wrapper {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 5px;
        border: 2px solid #fff;

        .avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }

    .reserve-btn {
      background-color: #ff6600;
      border: none;
      color: #fff;
      font-size: 16px;
      text-align: center;
      border-radius: 5px;
      margin-top: 10px;
      position: absolute;
      right: 20rpx;
      bottom: 30%;
    }
  }
}
</style>
