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
              selected: isToday(day.date) || isSelected(day.date),
            }"
            @click="handleDayClick(day.date)">
            <view class="weekday">{{ getWeekday(day.date) }}</view>
            <view class="date">{{ day.date.getDate() }}</view>
            <view class="label">{{ getLabel(day.date) }}</view>
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
  console.log("week", week, startDate);
  return week;
};

// Get the start of the current week (Monday)
const current = new Date();
const startOfWeek = new Date(
  current.setDate(current.getDate() - ((current.getDay() + 6) % 7))
);

// State variables
const weeks = ref([
  getWeekDates(new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000)), // 上一周
  getWeekDates(startOfWeek), // 本周
  getWeekDates(new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)), // 下一周
]);

const selectedDay = ref(null);
let lastScrollLeft = 0; // Track last scroll position

// On mounted, set default selected day to today
onMounted(() => {
  selectedDay.value = new Date();
});

// Handle scroll to determine if user scrolled left or right
const onScroll = (event) => {
  // const scrollLeft = event.detail.scrollLeft;
  // if (scrollLeft > lastScrollLeft) {
  //   nextWeek(); // Scrolled right -> next week
  // } else if (scrollLeft < lastScrollLeft) {
  //   prevWeek(); // Scrolled left -> previous week
  // }
  // lastScrollLeft = scrollLeft;
};

// Go to the next week
const nextWeek = () => {
  const lastWeek = new Date(weeks.value[weeks.value.length - 1][6].date);
  const newWeek = getWeekDates(
    new Date(lastWeek.setDate(lastWeek.getDate() + 1))
  );
  weeks.value.push(newWeek);
  weeks.value.shift(); // Remove the oldest week to keep only three
};

// Go to the previous week
const prevWeek = () => {
  const firstWeek = new Date(weeks.value[0][0].date);
  const newWeek = getWeekDates(
    new Date(firstWeek.setDate(firstWeek.getDate() - 7))
  );
  weeks.value.unshift(newWeek);
  weeks.value.pop(); // Remove the oldest week to keep only three
};

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

// Get the weekday in Chinese
const getWeekday = (date) => {
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  return days[(date.getDay() + 6) % 7]; // Monday as the first day
};
</script>

<style lang="scss">
.calendar-container {
  width: 100%;
  overflow: hidden;
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

.label {
  font-size: 12px;
  color: #ff4d4f;
}

.selected {
  border: 2px solid #1890ff;
  border-radius: 5px;
  background-color: #ffe58f;
  border-radius: 5px;
}
</style>
