<template>
  <view class="p-20">
    <view
      v-for="(course, index) in courses"
      :key="index"
      class="course-wrapper">
      <course-card
        :courseName="course.name"
        :teacherName="course.teacher"
        :courseTime="course.time"
        :difficulty="course.difficulty"
        :teacherImage="course.teacherImage"
        :students="course.students" />
    </view>
  </view>
</template>

<script setup>
import courseCard from "./course-card.vue";
const courses = [
  {
    name: "Vue.js 实战课程",
    teacher: "张老师",
    time: "19:00-20:30",
    difficulty: 4,
    teacherImage:
      "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/课程预约卡片/IMG_0962.jpg",
    students: [
      {
        avatar:
          "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/IMG_0941.jpg",
      },
      {
        avatar:
          "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/IMG_0942.jpg",
      },
    ],
  },
  {
    name: "React.js 初级课程",
    teacher: "李老师",
    time: "15:00-16:30",
    difficulty: 3,
    teacherImage: "https://example.com/teacher2.jpg",
    students: [
      { avatar: "https://example.com/student3.jpg" },
      { avatar: "https://example.com/student4.jpg" },
    ],
  },
  {
    name: "Node.js 进阶课程",
    teacher: "王老师",
    time: "18:00-19:30",
    difficulty: 5,
    teacherImage: "https://example.com/teacher3.jpg",
    students: [
      { avatar: "https://example.com/student5.jpg" },
      { avatar: "https://example.com/student6.jpg" },
    ],
  },
];
</script>

<style scoped>
.course-wrapper {
  margin-bottom: 20px;
}
</style>
