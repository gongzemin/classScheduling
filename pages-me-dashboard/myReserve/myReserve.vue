<template>
  <view class="container">
    <!-- Tab切换按钮 -->
    <view class="tabs">
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        @click="activeTab = tab.key"
        :class="{ active: activeTab === tab.key }">
        {{ tab.label }}
      </view>
    </view>

    <!-- 我的预约 Tab -->
    <view v-if="activeTab === 'myReservations'">
      <view
        v-for="reservation in myReservations"
        :key="reservation._id"
        class="card">
        <image
          :src="reservation?.class_id[0]?.courseTeacherPic"
          class="teacher-pic" />
        <view class="info">
          <text class="title">
            {{ reservation?.class_id[0]?.courseTeacherName }}
          </text>
          <text class="details">
            {{ reservation.courseType }} | {{ reservation.reserve_class_date }}
          </text>
          <text class="time">{{ reservation.reserve_time }}</text>
        </view>
      </view>
    </view>

    <!-- 取消预约 Tab -->
    <view v-if="activeTab === 'cancelReservations'">
      <view
        v-for="reservation in cancelReservations"
        :key="reservation._id"
        class="card">
        <image :src="reservation.courseTeacherPic" class="teacher-pic" />
        <view class="info">
          <text class="title">{{ reservation.courseTeacherName }}</text>
          <text class="details">
            {{ reservation.courseType }} | {{ reservation.reserve_class_date }}
          </text>
          <text class="time">{{ reservation.reserve_time }}</text>
        </view>
        <text class="badge" v-if="reservation.canceled">已取消</text>
      </view>
    </view>

    <!-- 历史预约 Tab -->
    <view v-if="activeTab === 'historyReservations'">
      <view
        v-for="reservation in historyReservations"
        :key="reservation._id"
        class="card">
        <image :src="reservation.courseTeacherPic" class="teacher-pic" />
        <view class="info">
          <text class="title">{{ reservation.courseTeacherName }}</text>
          <text class="details">
            {{ reservation.courseType }} | {{ reservation.reserve_class_date }}
          </text>
          <text class="time">{{ reservation.reserve_time }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { formatTimestampToHHMM, getCurrentTimeInHHMM } from "../../common/util";

const userInfo = uni.getStorageSync("userInfo");
// Tab选项
const tabs = [
  { key: "myReservations", label: "已预约" },
  { key: "cancelReservations", label: "已取消" },
  { key: "historyReservations", label: "历史预约" },
];

// 当前激活的Tab
const activeTab = ref("myReservations");

// 模拟数据

// 1.	已预约：上课日期是今天或未来，且预约记录未取消（canceled: false）。
// 2.	已取消：记录中 canceled: true。
// 3.	历史预约：上课日期是过去的，或今天的预约但课程开始时间已过。

// const fetchReservations = async () => {
//   myReservations.value = await getMyReservations();
//   cancelReservations.value = await getCanceledReservations();
//   historyReservations.value = await getHistoryReservations();
// };

// 根据课程结束时间分配预约
const myReservations = ref([]);
const cancelReservations = ref([]);
const historyReservationList = ref([]);

function compareTimeStrings(time1, time2) {
  const [hours1, minutes1] = time1.split(":").map(Number);
  const [hours2, minutes2] = time2.split(":").map(Number);

  // Convert both times to total minutes from midnight
  const time1InMinutes = hours1 * 60 + minutes1;
  const time2InMinutes = hours2 * 60 + minutes2;

  if (time1InMinutes < time2InMinutes) {
    return -1; // time1 is earlier than time2
  } else if (time1InMinutes > time2InMinutes) {
    return 1; // time1 is later than time2
  } else {
    return 0; // both times are equal
  }
}

console.log(compareTimeStrings("18:10", "20:20")); // Output: -1 (18:10 is earlier than 20:20)

const fetchReservations = async () => {
  const db = uniCloud.database();
  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));

  // 预约记录筛选（今天及未来的预约）
  const reserveTemp = db
    .collection("user-reserve")
    .where({
      user_id: userInfo.userId,
      reserve_class_date: db.command.gte(startOfDay), // 筛选今天及未来的预约
    })
    .getTemp();

  // 课程表集合临时查询
  const classTemp = db
    .collection("class-schedule")
    .field("_id, endTime, courseTeacherName, courseTeacherPic") // 只查询课程结束时间，减少冗余字段
    .getTemp();

  // 联表查询
  const { result } = await db
    .collection(reserveTemp, classTemp) // 合并临时集合
    .orderBy("reserve_time", "desc")
    .get();

  const reservations = result.data;
  console.log("result---", result.data);

  // 分类预约记录
  const currentReservations = [];
  const historyReservations = [];

  reservations.forEach((reservation) => {
    const endTime = reservation["class_id"][0]?.endTime;
    let endTimeHHMM = formatTimestampToHHMM(endTime);
    const currentHHMM = getCurrentTimeInHHMM();
    console.log("wwwwwi", "type", typeof endTime);
    if (compareTimeStrings(currentHHMM, endTimeHHMM) !== -1) {
      // 大于等于结束时间
      historyReservations.push(reservation); // 课程已结束归为历史预约
    } else {
      currentReservations.push(reservation); // 课程未结束归为已预约
    }
  });

  // 更新前端列表
  myReservations.value = currentReservations.filter((res) => !res.canceled);
  console.log(
    "myReservations",
    reservations,
    currentReservations,
    historyReservations,
    myReservations.value
  );
  cancelReservations.value = currentReservations.filter((res) => res.canceled);
  historyReservationList.value = historyReservations;
};

// 获取数据
onMounted(() => {
  fetchReservations();
});

const getMyReservations = async () => {
  return [
    {
      _id: "1",
      courseTeacherPic: "../../static/images/moment.jpg",
      courseTeacherName: "老师A",
      reserve_class_date: "2024-12-25",
      courseType: "数学",
      reserve_time: "2024-12-20 10:00",
    },
  ];
};

const getCanceledReservations = async () => {
  return [
    {
      _id: "2",
      courseTeacherPic: "../../static/images/moment.jpg",
      courseTeacherName: "老师B",
      reserve_class_date: "2024-12-28",
      courseType: "英语",
      reserve_time: "2024-12-20 11:00",
      canceled: true,
    },
  ];
};

const getHistoryReservations = async () => {
  return [
    {
      _id: "3",
      courseTeacherPic: "../../static/images/moment.jpg",
      courseTeacherName: "老师C",
      reserve_class_date: "2024-12-30",
      courseType: "物理",
      reserve_time: "2024-12-20 12:00",
    },
  ];
};
</script>

<style scoped lang="scss">
.container {
  padding: 40rpx;
  .tabs {
    display: flex;
    justify-content: space-around;
    margin-bottom: 30rpx;
    border-bottom: 2rpx solid #ddd;
  }
  .tabs view {
    padding: 20rpx 0;
    font-size: 32rpx;
    color: #666;
    cursor: pointer;
    position: relative;
  }

  .tabs view.active {
    color: #007aff;
    font-weight: bold;
  }

  .tabs view.active::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 6rpx;
    background-color: #007aff;
  }
  .card {
    display: flex;
    align-items: center;
    padding: 30rpx;
    border: 2rpx solid #e0e0e0;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    background-color: #fff;
    box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.05);
    position: relative;

    .teacher-pic {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      margin-right: 30rpx;
    }
    .info {
      display: flex;
      flex-direction: column;
    }
    .title {
      font-size: 36rpx;
      font-weight: bold;
      margin-bottom: 10rpx;
    }
    .details {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 10rpx;
    }
    .time {
      font-size: 28rpx;
      color: #999;
    }

    // 已取消徽章样式
    .badge {
      position: absolute;
      top: 20rpx;
      right: 30rpx;
      background-color: #ff4d4f;
      color: #fff;
      padding: 8rpx 20rpx;
      border-radius: 30rpx;
      font-size: 24rpx;
    }
  }
}
</style>
