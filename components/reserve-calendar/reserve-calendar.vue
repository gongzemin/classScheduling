<template>
  <view class="calendar-container">
    <scroll-view
      scroll-x="true"
      show-scrollbar="false"
      scroll-with-animation
      class="week-scroll"
      @scroll="onScroll">
      <view v-for="(week, index) in weeks" :key="index" class="week">
        <view class="week-wrapper">
          <view
            v-for="(day, i) in week"
            :key="i"
            class="day"
            :class="{
              selected: isSelected(day.date),
            }"
            @click="handleDayClick(day.date)">
            <view class="weekday">{{ getWeekday(day.date) }}</view>
            <view class="date">{{ day.date.getDate() }}</view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";

// Helper to get week dates starting from Monday
const getWeekDates = (startDate) => {
  const week = [];
  const date = new Date(startDate);
  for (let i = 0; i < 7; i++) {
    week.push({ date: new Date(date) });
    date.setDate(date.getDate() + 1);
  }
  return week;
};

// Get the start of the current week (Monday)
const current = new Date();
const startOfWeek = new Date(
  current.setDate(current.getDate() - ((current.getDay() + 6) % 7))
);

// State variables
const weeks = ref([
  // getWeekDates(new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000)), // 上一周
  getWeekDates(startOfWeek), // 本周
  getWeekDates(new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)), // 下一周
]);

const selectedDay = ref(null);

// On mounted, set default selected day to today
onMounted(() => {
  selectedDay.value = new Date();
});

// Mark the clicked day
const handleDayClick = (date) => {
  selectedDay.value = date;
};

// Helper to check if a date is today
const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

// Helper to check if a date is the selected day
const isSelected = (date) => {
  return (
    selectedDay.value &&
    date.toDateString() === selectedDay.value.toDateString()
  );
};

// Get label for today, tomorrow, or the day after tomorrow
const getLabel = (date) => {
  const today = new Date();
  const diff = (date - today) / (1000 * 60 * 60 * 24);

  if (diff === 0) return "今天";
  if (diff === 1) return "明天";
  if (diff === 2) return "后天";
  return "";
};

const getWeekday = (date) => {
  const today = new Date();

  // clearTime 函数用于将日期的时分秒重置为 00:00:00，从而保证比较时只考虑日期而不是时间
  const clearTime = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const dateWithoutTime = clearTime(date);
  const todayWithoutTime = clearTime(today);

  // 在 JavaScript 中，Date 对象实际上是一个包含了时间戳（自 1970 年 1 月 1 日以来的毫秒数）的对象。
  // 当你从一个 Date 对象中减去另一个 Date 对象时，JavaScript 会隐式地将它们转换为数值类型，即它们各自的时间戳，然后相减得到毫秒差值。

  // 比如 dateWithoutTime.getTime() 返回的是一个整数，表示 dateWithoutTime 所代表的时刻离 1970 年 1 月 1 日 0 时 0 分 0 秒有多少毫秒。
  // 当你执行 dateWithoutTime - todayWithoutTime 时，JavaScript 会调用 .getTime() 方法隐式地将两个日期对象转换为它们的时间戳，然后相减，得到它们之间的毫秒差。

  // 从毫秒转换为天数：
  //•	一天有 24 小时，一小时有 60 分钟，一分钟有 60 秒，一秒有 1000 毫秒，所以一天有 1000 * 60 * 60 * 24 = 86400000 毫秒。
  //•	因此，通过 (dateWithoutTime - todayWithoutTime) / (1000 * 60 * 60 * 24)，可以将毫秒差转换为天数差。
  const diffInMs = (dateWithoutTime - todayWithoutTime) / (1000 * 60 * 60 * 24);

  if (diffInMs === 0) return "今天";
  if (diffInMs === 1) return "明天";
  if (diffInMs === 2) return "后天";

  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  return days[(dateWithoutTime.getDay() + 6) % 7]; // Monday as the first day
};
</script>

<style lang="scss">
.calendar-container {
  width: 100%;
  overflow: hidden;
  background-color: #f0f0f0;
}

.week-scroll {
  white-space: nowrap;
  width: 100%;
  height: 127rpx;
  display: flex;
}

.week {
  display: inline-block;
  width: 100%; /* Ensure that only one week is visible at a time */
  height: 100%;
  .week-wrapper {
    display: flex;
  }
}

.day {
  width: calc(100% / 7); /* Each day takes up 1/7th of the width */
  text-align: center;
  position: relative;
  padding: 8px;
}

.weekday {
  font-size: 12px;
  color: #999;
}

.date {
  font-size: 20px;
  font-weight: bold;
}

.selected {
  border-radius: 5px;
  background-color: #ffe58f;
  border-radius: 5px;
}
</style>
