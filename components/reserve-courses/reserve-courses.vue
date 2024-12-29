<template>
  <view class="p-20 course-wrapper">
    <view v-for="(course, index) in dayCourses" :key="index" class="mb-20">
      <course-card
        :courseInfo="course"
        @refreshList="refresh"
        :clickDate="clickDate" />
    </view>
    <view class="add" v-if="isAdmin" @click="goNewCourse">
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
  clickDate: Date, // 点击的日期对象 当天展示的星期-日期表现形式
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
let loading = false;
const fetchCourses = async () => {
  try {
    if (!loading) {
      loading = true;
      // uni.showLoading({ title: "加载中...", mask: true });
    }
    const res = await db.collection("class-schedule").get();
    if (res.result?.errCode === 0) {
      courseList.value = res.result.data || [];
    } else {
      uni.showToast({ title: "课程加载失败", icon: "none" });
    }
  } catch (error) {
    uni.showToast({ title: "网络异常", icon: "none" });
  } finally {
    if (loading) {
      loading = false;
      // uni.hideLoading();
    }
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
  // dayCourses.value.forEach((item) => {
  //   item.reservedUsers && item.reservedUsers.reverse();
  // });
};

// const test = async () => {
// 	const existingReservation = await db
// 	    .collection("user-reserve")
// 	    .where({
// 	      user_id: userId,
// 	      class_id: queryClassId,
// 	    })
// 	    .get();
// 		console.log('ssss', existingReservation)
// }
// console.log('xxx', test())

const getReserveUser = (course, targetDate) => {
  // 获取当天的起始时间
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0); // 设置为当天 00:00:00.000

  // 获取当天的结束时间
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999); // 设置为当天 23:59:59.999

  let reserveTemp = db
    .collection("user-reserve")
    .where({
      class_id: course._id,
      canceled: false, // 增加canceled为false的条件
      reserve_class_date: db.command
        .gte(startOfDay)
        .and(db.command.lte(endOfDay)), // 日期范围查询})
    })
    .getTemp();
  let userTemp = db.collection("users").field("_id, avatar").getTemp();

  return db
    .collection(reserveTemp, userTemp)
    .orderBy("reserve_time desc")
    .limit(course.capacity)
    .get();
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
    isReserved: false,
    reservedUsers: [],
  }));
  sortedTimes();

  // 设置用户头像
  for (let course of dayCourses.value) {
    const res = await getReserveUser(course, props.clickDate); // 获取预约用户信息
    if (res.result.errCode === 0) {
      // console.log(
      //   "9999",
      //   res.result.data,
      //   props.clickDate,
      //   typeof props.clickDate
      // );
      if (res.result.data.length) {
        let users = res.result.data
          .map((item) => item.user_id.length && item.user_id)
          .flat();
        // console.log("999999991", users);
        course.reservedUsers = users.map((item) => item.avatar);
        course.isReserved = users
          .map((item) => item._id)
          .includes(storedUserInfo.value.userId);
      } else {
        course.isReserved = false;
        course.reservedUsers = [];
      }
    }
  }

  console.log("Updated day courses:", dayCourses.value);
  // dayCourses.value.forEach((item) => {
  //   item.isReserved =
  //     item.reservedUsers &&
  //     item.reservedUsers.some(
  //       (user) => user.user_id === storedUserInfo.value.userId
  //     );
  // });

  console.log("Updated day courses:", dayCourses.value);
};

// 页面跳转：前往新增课程页面
const goNewCourse = () => {
  uni.navigateTo({ url: "/pages-courses/newCourse/newCourse" });
};

// 刷新课程列表
const refresh = () => {
  console.log("Refresh triggered for:", props.dayOfTheWeek);
  updateDayCourses(props.dayOfTheWeek, true); // 强制刷新课程数据
};

uni.$on("refreshList", () => {
  console.log("这个uni.on起作用吗");
  updateDayCourses(props.dayOfTheWeek, true); // 强制刷新
});

// 挂载时初始化
onMounted(() => {
  updateDayCourses(props.dayOfTheWeek, true); // 强制刷新
});

// 这里应该监听日期 而不是周几 不然后面的周几和现在的周几用户数据一样
watch(
  () => props.clickDate,
  () => {
    updateDayCourses(props.dayOfTheWeek, false);
  }
);
// console.log("clickDate000000000", props.clickDate, typeof props.clickDate);
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
