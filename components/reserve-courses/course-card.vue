<template>
  <view class="course-card">
    <!-- 背景展示老师图片 -->
    <view
      class="course-background"
      :style="{ backgroundImage: `url(${teacherImage})` }">
      <!-- 透明蒙版 -->
      <view class="overlay"></view>
      <!-- 课程内容 -->
      <view class="course-info">
        <text class="course-name">{{ courseName }}</text>
        <view class="teacher-name mt-10">{{ teacherName }}</view>
        <view class="course-time mt-40">时间: {{ courseTime }}</view>
        <view class="course-difficulty">
          <text>难度:</text>
          <view class="stars">
            <view v-for="n in 5" :key="n" class="star">
              <text v-if="n <= difficulty" class="filled">★</text>
              <text v-else>☆</text>
            </view>
          </view>
        </view>
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

    /* 透明蒙版 */
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.4); /* 黑色背景，透明度为 0.4 */
      z-index: 1;
    }

    .course-info,
    .student-avatar-list,
    .reserve-btn {
      position: relative;
      z-index: 2; /* 确保内容在蒙版上方 */
    }

    .course-info {
      // background: rgba(0, 0, 0, 0.5);
      padding: 10px;
      border-radius: 5px;

      .teacher-name {
        font-size: 16px;
      }
      .course-name {
        font-size: 18px;
        font-weight: bold;
      }

      .course-difficulty {
        margin-top: 2rpx;
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
        font-size: 16px;
      }
    }

    .student-avatar-list {
      display: flex;
      margin-top: 10px;
      padding: 0 10px;
      .avatar-wrapper {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 5px;
        border: 0.5px solid rgba(255, 255, 255, 0.3);

        .avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }

    .reserve-btn {
      position: absolute;
      right: 25rpx;
      top: 50%;
      transform: translateY(-50%);
      background-color: #ff6600;
      border: none;
      color: #fff;
      font-size: 16px;
      text-align: center;
      border-radius: 5px;
      z-index: 2; /* 确保按钮在蒙版上方 */
    }
  }
}
</style>
