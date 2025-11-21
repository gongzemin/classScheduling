<template>
  <view class="reserve-btn" :class="buttonClass">
    {{ buttonText }}
  </view>
</template>

<script setup>
import { computed } from "vue";
import { parseTimeToMinutes } from "../../common/util.js";

const userInfo = uni.getStorageSync("userInfo");
// Props 接收
const props = defineProps({
  clickDate: {
    type: Date, // 按钮对应的约课上课日期
    required: true,
  },
  courseInfo: {
    type: Object,
    required: true,
  },
  confirmedCount: {
    type: Number,
    required: true,
  },
  isCourseCancelled: {
    type: Boolean,
    default: false,
  },
});

// 动态获取当前时间
const now = computed(() => new Date());
const today = computed(() => {
  const date = new Date();
  date.setHours(0, 0, 0, 0); // 清除时间
  return date;
});
const today12PM = computed(() => {
  const date = new Date();
  date.setHours(12, 0, 0, 0); // 今天中午 12 点
  return date;
});

// 拆分开始时间和结束时间
const [startTime, endTime] = props.courseInfo.time
  .split("-")
  .map(parseTimeToMinutes);

// 课程是否已满
const isFull = computed(() => {
  return props.confirmedCount >= (props.courseInfo?.capacity || 20);
});

// 当前用户的预约状态 confirmed waitlist
const userReservationStatus = computed(() => {
  const currentUserReserve = props.courseInfo.reserveRecords?.find(
    (record) => record.user_id?.[0]?._id === userInfo.userId
  );
  return currentUserReserve?.status || null;
});

// 当前用户的预约状态
const buttonStatus = computed(() => {
  // 1. 优先判断是否已取消
  if (props.isCourseCancelled) {
    return "courseCancelled";
  }

  // 2. 判断用户预约状态
  if (userReservationStatus.value === "confirmed") {
    return "userConfirmed";
  }
  if (userReservationStatus.value === "waitlist") {
    return "userWaitlist";
  }

  // 3. 判断时间状态
  const currentMinutes = now.value.getHours() * 60 + now.value.getMinutes();
  const diffDays = Math.floor(
    (props.clickDate.getTime() - today.value.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) {
    return "ended";
  }

  if (diffDays === 0) {
    if (currentMinutes > endTime) {
      return "ended";
    }
    if (currentMinutes >= startTime && currentMinutes <= endTime) {
      return "ongoing";
    }
    return isFull.value ? "waitlistAvailable" : "reserveAvailable";
  }

  if (diffDays > 0 && diffDays <= 2) {
    if (diffDays === 2) {
      if (now.value >= today12PM.value) {
        return isFull.value ? "waitlistAvailable" : "reserveAvailable";
      } else {
        return "notOpenYet";
      }
    }
    return isFull.value ? "waitlistAvailable" : "reserveAvailable";
  }

  return "notOpenYet";
});

// 按钮文本
const buttonText = computed(() => {
  const textMap = {
    courseCancelled: "已取消", // 课程取消
    userConfirmed: "已预约",
    userWaitlist: "候补中",
    ended: "已结束",
    ongoing: "进行中",
    waitlistAvailable: "候补",
    reserveAvailable: "预约",
    notOpenYet: "暂未开放预约",
  };
  return textMap[buttonStatus.value] || "预约";
});

// 按钮样式类
const buttonClass = computed(() => {
  const classMap = {
    courseCancelled: "cancelled",
    userConfirmed: "confirmed",
    userWaitlist: "waitlist",
    ended: "ended",
    ongoing: "ongoing",
    waitlistAvailable: "waitlist-available",
    reserveAvailable: "active",
    notOpenYet: "not-open",
  };
  return classMap[buttonStatus.value] || "";
});
</script>

<style scoped lang="scss">
.reserve-btn {
  font-size: 28rpx;
  padding: 12rpx 30rpx;
  text-align: center;
  border-radius: 50rpx;
  border: none;
  transition: all 0.3s ease;
}

/* 已取消 */
.reserve-btn.cancelled {
  background: linear-gradient(135deg, #ff416c, #ff4b2b);
  color: #fff;
  font-weight: bold;
  box-shadow: 0 8rpx 16rpx rgba(255, 75, 43, 0.5);
  cursor: not-allowed;
}

/* 已预约 */
.reserve-btn.confirmed {
  background-color: #4caf50;
  color: #fff;
  cursor: pointer;
}

/* 候补中 */
.reserve-btn.waitlist {
  background-color: #ffa726;
  color: #fff;
  cursor: pointer;
}

/* 已结束 */
.reserve-btn.ended {
  background-color: #9e9e9e;
  color: #fff;
  cursor: not-allowed;
}

/* 进行中 */
.reserve-btn.ongoing {
  background-color: #74dbef;
  color: #333;
  cursor: not-allowed;
}

/* 可候补 */
.reserve-btn.waitlist-available {
  background-color: #0b6309;
  color: #fff;
  cursor: pointer;
}

/* 可预约 */
.reserve-btn.active {
  background-color: #ff6600;
  color: #fff;
  cursor: pointer;
}

/* 暂未开放 */
.reserve-btn.not-open {
  background-color: #ddd;
  color: #999;
  cursor: not-allowed;
}
</style>
