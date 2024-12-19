<template>
  <view class="p-20 course-wrapper">
    <view v-for="(course, index) in dayCourses" :key="index" class="mb-20">
      <course-card
        :courseInfo="course"
        @refreshList="refresh"
        :clickDate="clickDate" />
    </view>
    <view class="add" v-if="isAdmin" @click="goNew">
      <uni-icons type="plusempty" size="40" color="#fff"></uni-icons>
    </view>
  </view>
</template>

<script setup>
import { onMounted, ref, watch, computed } from "vue";

import courseCard from "./course-card.vue";
import { formatCourseTime } from "../../common/util";

const props = defineProps({
  dayOfTheWeek: String, // 当前展示的星期
  clickDate: Date, // 点击的日期对象
});

// 数据库引用
const db = uniCloud.database();

// 状态管理
const courseList = ref([]); // 所有课程数据
const dayCourses = ref([]); // 当前需要展示的课程
const storedUserInfo = ref(uni.getStorageSync("userInfo")); // 用户信息

// 计算属性：判断是否为管理员
const isAdmin = computed(() => storedUserInfo.value?.role === "superAdmin");

// 工具函数：将数字星期几转换为中文格式的"周几"
const getWeekdayInChinese = (dayIndex) => {
  const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return days[dayIndex];
};

// 数据获取：从云数据库获取课程列表
const fetchCourses = async () => {
  //     .orderBy("startTime", "asc")
  try {
    const res = await db.collection("class-schedule").get();
    if (res.result?.errCode === 0) {
      courseList.value = res.result.data || [];
      console.log("Fetched courses:", courseList.value);
    } else {
      console.error("Failed to fetch courses:", res.result?.errMsg);
    }
  } catch (error) {
    console.error("Error fetching courses:", error);
  } finally {
    uni.hideLoading();
  }
};

// 数据过滤：根据指定的星期过滤课程
const filterCoursesByDay = (day) =>
  courseList.value.filter((course) => course.day === day);

const sortedTimes = () => {
  dayCourses.value.sort((a, b) => {
    // 提取起始时间（"HH:mm"格式），并转为分钟数（从00:00开始的分钟数）
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    // 提取并比较起始时间
    const startA = timeToMinutes(a.time.split("-")[0]);
    const startB = timeToMinutes(b.time.split("-")[0]);

    return startA - startB; // 升序排序
  });
  // 预约用户倒序排列
  dayCourses.value.forEach((item) => {
    item.reservedUsers && item.reservedUsers.reverse();
  });
};

// 数据更新：更新需要展示的课程
const updateDayCourses = async (dayOfWeek, forceUpdate = false) => {
  const targetDay = dayOfWeek || getWeekdayInChinese(new Date().getDay());
  console.log("Target day:", targetDay);

  // 如果没有课程数据或者需要强制刷新，则重新获取数据
  if (!courseList.value.length || forceUpdate) {
    console.log("Fetching courses data...");
    await fetchCourses();
  }

  if (!courseList.value.length) {
    console.warn("No course data available.");
    dayCourses.value = []; // 清空展示课程
    return;
  }

  // 筛选并格式化课程数据
  dayCourses.value = filterCoursesByDay(targetDay).map((item) => ({
    ...item,
    time: formatCourseTime(item.startTime, item.endTime),
  }));
  sortedTimes();
  dayCourses.value.forEach((item) => {
    item.isReserved =
      item.reservedUsers &&
      item.reservedUsers.some(
        (user) => user.user_id === storedUserInfo.value.userId
      );
  });

  console.log("Updated day courses:", dayCourses.value);
};

// 页面跳转：前往新增课程页面
const goNew = () => {
  uni.navigateTo({ url: "/pages-courses/newCourse/newCourse" });
};

// 刷新课程列表
const refresh = () => {
  console.log("Refresh triggered for:", props.dayOfTheWeek);
  uni.showLoading({ mask: true });
  updateDayCourses(props.dayOfTheWeek, true); // 强制刷新课程数据
};

uni.$on("refreshList", () => {
  console.log("这个uni.on起作用吗");
  uni.showLoading({ mask: false });
  updateDayCourses(props.dayOfTheWeek, true); // 强制刷新
});

// 挂载时初始化
onMounted(() => {
  uni.showLoading({ mask: false });
  updateDayCourses(props.dayOfTheWeek, true); // 强制刷新
});

// 监听：props.dayOfTheWeek 变化时更新课程
watch(
  () => props.dayOfTheWeek,
  (newDayOfTheWeek) => updateDayCourses(newDayOfTheWeek)
);
</script>

<style scoped lang="scss">
.course-wrapper {
  .add {
    width: 140rpx;
    height: 140rpx;
    background-color: #74dbef;
    border-radius: 50%;
    position: fixed;
    bottom: 1%;
    right: 3%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
  }
}
</style>
