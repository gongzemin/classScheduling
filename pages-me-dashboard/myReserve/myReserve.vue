<template>
  <view class="container">
    <!-- 顶部 Tabs -->
    <view class="tabs">
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        @click="handleTabChange(tab.key)"
        :class="{ active: activeTab === tab.key }">
        {{ tab.label }}
      </view>
    </view>

    <!-- 预约卡片列表 -->
    <template
      v-for="reservation in filteredReservations"
      :key="reservation._id">
      <ReservationCard :reservation="reservation" />
    </template>

    <!-- 无预约提示 -->
    <view v-if="filteredReservations.length === 0" class="empty">
      {{ activeTab !== "cancelReservations" ? "暂无预约记录" : "暂无取消记录" }}
    </view>
  </view>
</template>

<script setup lang="ts">
// 1.	已预约：上课日期是今天或未来，且预约记录未取消（canceled: false）。
// 2.	已取消：canceled: true。
// 3.	历史预约：上课日期是过去的，或今天的预约但课程开始时间已过。
import { ref, computed, onMounted } from "vue";

import ReservationCard from "../../components/my-reserve/reserve-card.vue";
import { Reservation } from "../../types";
import {
  formatCourseTime,
  formatDateToYYYYMMDD,
  formatTimestampToHHMM,
  getCurrentTimeInHHMM,
  compareTimeStrings,
} from "../../common/util";

const db = uniCloud.database();
const userInfo = uni.getStorageSync("userInfo");
const myReservations = ref<Reservation[]>([]);
const cancelReservations = ref<Reservation[]>([]);
const historyReservations = ref<Reservation[]>([]);
const todayPastReservations = ref<Reservation[]>([]); // 今天上课时间已经过的预约
const activeTab = ref<string>("myReservations");

const tabs = [
  { key: "myReservations", label: "我的预约" },
  { key: "cancelReservations", label: "取消预约" },
  { key: "historyReservations", label: "历史预约" },
];

// 统一查询预约记录
const fetchReservations = async (type: "future" | "past") => {
  uni.showLoading({});

  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));

  const condition =
    type === "future"
      ? db.command.gte(startOfDay) // 筛选今天及未来预约
      : db.command.lte(startOfDay); // 筛选历史预约

  const reserveTemp = db
    .collection("user-reserve")
    .where({
      user_id: userInfo.userId, // 替换为实际用户 ID
      reserve_class_date: condition,
    })
    .getTemp();

  const classTemp = db
    .collection("class-schedule")
    .field(
      "_id, startTime, endTime, courseTeacherName, courseTeacherPic, courseType, courseLevel"
    )
    .getTemp();

  const { result } = await db.collection(reserveTemp, classTemp).get();
  uni.hideLoading();

  const formattedReservations = result.data.map((item: Reservation) => {
    const startTime = item.class_id[0].startTime;
    const endTime = item.class_id[0].endTime;
    item.time = `${formatDateToYYYYMMDD(
      new Date(item.reserve_class_date)
    )} ${formatCourseTime(startTime, endTime)}`;
    return item;
  });

  return formattedReservations;
};

// 切换标签页逻辑
const handleTabChange = async (tab: string) => {
  activeTab.value = tab;

  todayPastReservations.value = [];
  myReservations.value = [];
  cancelReservations.value = [];
  historyReservations.value = [];
  if (tab === "historyReservations") {
    historyReservations.value = await fetchReservations("past");
    if (todayPastReservations.value.length) {
      todayPastReservations.value.forEach((item) => {
        historyReservations.value.shift(item);
      });
    }
  } else {
    const futureData = await fetchReservations("future");
    console.log("futureDate", futureData);
    const currentReservations = [];
    futureData.forEach((reservation) => {
      const endTime = reservation["class_id"][0]?.endTime;
      let endTimeHHMM = formatTimestampToHHMM(endTime);
      const currentHHMM = getCurrentTimeInHHMM();
      if (compareTimeStrings(currentHHMM, endTimeHHMM) !== -1) {
        // 现在时间大于等于结束时间
        todayPastReservations.value.push(reservation); // 课程已结束归为历史预约
      } else {
        currentReservations.push(reservation); // 课程未结束归为已预约
      }
    });
    myReservations.value = currentReservations.filter((res) => !res.canceled);
    cancelReservations.value = currentReservations.filter(
      (res) => res.canceled
    );
  }
};

// 计算属性返回当前标签的预约记录
const filteredReservations = computed(() => {
  if (activeTab.value === "myReservations") return myReservations.value;
  if (activeTab.value === "cancelReservations") return cancelReservations.value;
  if (activeTab.value === "historyReservations")
    return historyReservations.value;
  return [];
});

// 页面加载时拉取数据
onMounted(() => {
  handleTabChange("myReservations");
});
</script>

<style scoped lang="scss">
.container {
  padding: 20rpx;
}

.tabs {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20rpx;

  view {
    padding: 20rpx;
    font-size: 30rpx;
  }

  .active {
    font-weight: bold;
    border-bottom: 4rpx solid #007aff;
  }
}

.empty {
  text-align: center;
  padding: 50rpx;
  color: #666;
}
</style>
