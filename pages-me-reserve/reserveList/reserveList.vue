<template>
  <view class="p-20 course-wrapper">
    <button open-type="share"></button>
    <view v-for="(course, index) in dayCourses" :key="index" class="mb-20">
      <course-card
        :courseName="course.courseType"
        :teacherName="course.courseTeacherName"
        :courseTime="course.time"
        :difficulty="course.difficulty"
        :teacherImage="course.courseTeacherPic"
        :students="course.students" />
    </view>
    <view class="add">新增课程</view>
  </view>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import courseCard from "../../components/reserve-courses/course-card.vue";
import { formatTimestampToHHMM } from "../../common/util";
import { onLoad } from "@dcloudio/uni-app";
const props = defineProps({
  dayOfTheWeek: String,
});

const db = uniCloud.database();
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
];

const courseList = ref([]);

// 将数字星期几转换为中文格式的"周几"
const getWeekdayInChinese = (dayIndex) => {
  const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return days[dayIndex];
};

const fetchCourses = async () => {
  try {
    const res = await db.collection("class-schedule").get();
    uni.hideLoading();
    if (res.result?.errCode === 0) {
      courseList.value = res.result.data;
      console.log("Fetched courses:", courseList.value);
    } else {
      console.error("Failed to fetch courses:", res.result?.errMsg);
    }
  } catch (error) {
    uni.hideLoading();
    console.error("Error fetching courses:", error);
  }
};

const filterCoursesByDay = (day) => {
  return courseList.value.filter((course) => course.day === day);
};

onLoad(() => {
  uni.showShareMenu({
    withShareTicket: true,
    menus: ["shareAppMessage", "shareTimeline"],
    success() {
      console.log("分享菜单显示成功");
    },
    fail(err) {
      console.error("分享菜单显示失败", err);
    },
  });
});
const updateDayCourses = async (dayOfWeek) => {
  const targetDay = dayOfWeek || getWeekdayInChinese(new Date().getDay());
  console.log("Target day:", targetDay);

  if (!courseList.value.length) {
    console.log("Course list is empty, fetching data...");
    await fetchCourses();
  }
  console.log("courses.value", courseList.value);

  let courseList = filterCoursesByDay(targetDay);
  courseList.forEach((item) => {
    const formattedStartTime = formatTimestampToHHMM(item.startTime);
    const formattedEndTime = formatTimestampToHHMM(item.endTime);
    item.time = `${formattedStartTime}-${formattedEndTime}`;
  });
  console.log("courseList1", courseList);
  dayCourses.value = courseList;

  console.log("Filtered day courses:", dayCourses.value);
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
  uni.showLoading({
    title: "正在加载数据...",
    mask: true,
  });
  updateDayCourses(props.dayOfTheWeek);
  console.log("onAddToFavorites(3333)000", typeof getCurrentPages);

  if (typeof getCurrentPages === "function" && getCurrentPages().length) {
    console.log("onAddToFavorites(3333)");
    wx.showShareMenu();
    const currentPage = getCurrentPages().slice(-1)[0];
    currentPage.onShareAppMessage = () => {
      return {
        title: "Pick Dance Studio",
        path: "/pages/reserve/reserve",
        // imageUrl: "../../static/images/share.jpg",
      };
    };
    currentPage.onShareTimeline = () => {
      return {
        title: "Pick Dance Studio",
        // imageUrl: "../../static/images/moment.jpg",
      };
    };
  }
});
</script>

<style scoped lang="scss">
.course-wrapper {
  .add {
    width: 140rpx;
    height: 140rpx;
    background-color: #0199fe;
    border-radius: 50%;
    position: absolute;
    bottom: 3%;
    right: 3%;
  }
}
</style>
