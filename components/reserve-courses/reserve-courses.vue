<template>
  <view class="p-20">
    <view
      v-for="(course, index) in dayCourses"
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
import { onMounted, ref, watch } from "vue";
import courseCard from "./course-card.vue";
const props = defineProps({
  dayOfTheWeek: String,
});

// 用于保存当前需要展示的课程
const dayCourses = ref([]);
const courses = [
  {
    name: "音乐创作",
    teacher: "霉霉(Taylor Swift)",
    time: "19:00-20:30",
    difficulty: 4,
    dayOfTheWeek: "周三",
    teacherImage:
      "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/课程预约卡片/taylorSwift.jpg",
    students: [
      {
        avatar:
          "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/课程预约卡片/steve-jobs-visionary-or-perfectionist.jpeg",
      },
      {
        avatar:
          "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/课程预约卡片/matthew-mcconaughey-portrait.jpg",
      },
      {
        avatar:
          "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/课程预约卡片/lana del rey.png",
      },
      {
        avatar:
          "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/课程预约卡片/kingOfPop.jpg",
      },
      {
        avatar:
          "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/课程预约卡片/gongQiJun.jpg",
      },
      {
        avatar:
          "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/课程预约卡片/fayeWong.jpg",
      },
      {
        avatar:
          "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/课程预约卡片/aBing.jpg",
      },
      {
        avatar:
          "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/课程预约卡片/IngridBergman.jpg",
      },
    ],
  },
  {
    name: "电影表演",
    teacher: "英格丽·褒曼(Ingrid Bergman)",
    time: "20:30-22:00",
    difficulty: 3,
    dayOfTheWeek: "周三",
    teacherImage:
      "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/课程预约卡片/IngridBergman.jpg",
    students: [],
  },
  {
    name: "声乐",
    teacher: "王菲",
    time: "19:30-21:00",
    difficulty: 5,
    dayOfTheWeek: "周三",
    teacherImage:
      "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/课程预约卡片/fayeWong.jpg",
    students: [],
  },
  {
    name: "如何做出一个好产品",
    teacher: "乔布斯(Steve Jobs)",
    time: "19:00-20:30",
    difficulty: 4,
    dayOfTheWeek: "周二",
    teacherImage:
      "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/课程预约卡片/young-steve-jobs-1_0.jpg",
    students: [
      {
        avatar:
          "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/课程预约卡片/kingOfPop.jpg",
      },
      {
        avatar:
          "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/课程预约卡片/gongQiJun.jpg",
      },
      {
        avatar:
          "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/课程预约卡片/fayeWong.jpg",
      },
      {
        avatar:
          "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/课程预约卡片/aBing.jpg",
      },
      {
        avatar:
          "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/课程预约卡片/IngridBergman.jpg",
      },
    ],
  },
  {
    name: "二胡演奏",
    teacher: "阿炳",
    time: "20:30-22:00",
    difficulty: 3,
    dayOfTheWeek: "周二",
    teacherImage:
      "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/课程预约卡片/aBing.jpg",
    students: [],
  },
  {
    name: "动画电影制作",
    teacher: "宫崎骏",
    time: "19:30-21:00",
    difficulty: 5,
    dayOfTheWeek: "周二",
    teacherImage:
      "https://mp-0f5589ad-8ec0-443d-bfcc-a8f38857fc78.cdn.bspapp.com/teachers/课程预约卡片/gongQiJun.jpg",
    students: [],
  },
];

// 将数字星期几转换为中文格式的"周几"
const getWeekdayInChinese = (dayIndex) => {
  const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return days[dayIndex];
};

// 计算今天的课程并进行过滤
const updateDayCourses = (dayOfWeek) => {
  const targetDay = dayOfWeek || getWeekdayInChinese(new Date().getDay());
  console.log("targetDay", targetDay);
  dayCourses.value = courses.filter(
    (course) => course.dayOfTheWeek === targetDay
  );
};

// 监听 props 的 dayOfTheWeek 变化
watch(
  () => props.dayOfTheWeek,
  (newDayOfTheWeek) => {
    updateDayCourses(newDayOfTheWeek);
  }
);

// 在组件挂载时，计算今天的课程
onMounted(() => {
  updateDayCourses(props.dayOfTheWeek);
});
</script>

<style scoped>
.course-wrapper {
  margin-bottom: 20px;
}
</style>
