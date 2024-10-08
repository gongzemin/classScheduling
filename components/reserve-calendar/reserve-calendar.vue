<template>
  <view class="calendar-container">
    <scroll-view
      scroll-x="true"
      show-scrollbar="false"
      :scroll-into-view="todayId"
      class="calendar-scroll"
      @scroll="onScroll">
      <view v-for="(week, index) in weeks" :key="index" class="calendar-week">
        <view class="calendar-week-days">
          <view
            v-for="(day, i) in week"
            :key="i"
            class="calendar-day"
            :class="{
              selected: isSelected(day.date),
              past: isPast(day.date),
            }"
            :id="isToday(day.date) ? 'today' : ''"
            @click="handleDayClick(day.date)">
            <view class="calendar-day-weekday">
              {{ getWeekdayLabel(day.date) }}
            </view>
            <view class="calendar-day-date">{{ day.date.getDate() }}</view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const emits = defineEmits(["dayClick"]);

// 定义日期对象类型，包含 Date 实例
interface Day {
  date: Date;
}

// 定义滚动事件的处理函数类型
const onScroll = (event: Event): void => {
  console.log("Scrolling...", event);
};
/**
 * 获取从周一开始的一周日期的辅助函数
 * @param {Date} startDate - 一周的起始日期（通常是某个周一）
 * @returns {Day[]} - 返回包含 7 天的数组，每个元素是 Day 类型对象，表示该周内每一天的日期
 */
const getWeekDates = (startDate: Date): Day[] => {
  const week: Day[] = [];
  const date = new Date(startDate);
  for (let i = 0; i < 7; i++) {
    week.push({ date: new Date(date) });
    date.setDate(date.getDate() + 1);
  }
  return week; // 返回一周内的所有日期
};

/**
 * 获取当前周的起始日期（周一）
 * 1. 获取当前日期对象（current）
 * 2. 通过 `current.getDay()` 获取当前日期是星期几（0 表示周日，1 表示周一，...，6 表示周六）
 * 3. 计算当前日期到周一的天数偏移量 `((current.getDay() + 6) % 7)`
 *    - `current.getDay() + 6` 是为了将周日（0）转为 6，将周一（1）转为 0...，将周六（6）转为 5
 *    - `(current.getDay() + 6) % 7` 将上述值控制在 [0, 6] 范围内，得到当前日期与周一的天数差
 * 4. 使用 `current.setDate(current.getDate() - ((current.getDay() + 6) % 7))` 计算出当前周一的日期
 */
const current = new Date();
const startOfWeek: Date = new Date(
  current.setDate(current.getDate() - ((current.getDay() + 6) % 7))
);

// 定义 `weeks` 状态变量，其中包含上周、本周和下周的日期列表
const weeks = ref<Day[][]>([
  // getWeekDates(new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000)), // 上一周的日期列表
  getWeekDates(startOfWeek), // 本周的日期列表，从当前周一开始
  getWeekDates(new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)), // 下一周的日期列表，从下个周一开始
]);

const selectedDay = ref<Date | null>(null); // 存储选中的日期
const todayId = ref(""); // 存储今天的 ID

/**
 * 获取用于显示的标签（今天、明天、后天或周几）
 * @param {Date} date - 目标日期
 * @returns {string} - 显示的标签内容
 */
const getWeekdayLabel = (date: Date): string => {
  const today = new Date();

  // 将日期的时分秒重置为 00:00:00，从而保证比较时只考虑日期而不是时间
  const clearTime = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const dateWithoutTime = clearTime(date);
  const todayWithoutTime = clearTime(today);

  // 获取天数差值，并根据差值判断显示的标签内容
  const diffInMs =
    (dateWithoutTime.getTime() - todayWithoutTime.getTime()) /
    (1000 * 60 * 60 * 24);

  if (diffInMs === 0) return "今天";
  if (diffInMs === 1) return "明天";
  if (diffInMs === 2) return "后天";

  return getWeekday(date); // 如果不是今天、明天或后天，则返回周几
};

/**
 * 获取周几（周一至周日）
 * @param {Date} date - 目标日期
 * @returns {string} - 周几的字符串表示
 */
const getWeekday = (date: Date): string => {
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  return days[(date.getDay() + 6) % 7]; // 将周一作为第一天
};

/**
 * 处理日期点击事件
 * @param {Date} date - 被点击的日期
 */
const handleDayClick = (date: Date) => {
  const weekday = getWeekday(date); // 获取点击的日期对应的周几
  selectedDay.value = date; // 更新选中的日期
  emits("dayClick", weekday); // 仅传递周几作为事件参数
};

/**
 * 判断是否为今天
 * @param {Date} date - 目标日期
 * @returns {boolean} - 返回是否为今天
 */
const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * 判断日期是否在今天之前（过去的日期）
 * @param {Date} date - 目标日期
 * @returns {boolean} - 返回是否为过去的日期
 */
const isPast = (date: Date): boolean => {
  const today = new Date();
  return date < new Date(today.setHours(0, 0, 0, 0)); // 去除时间部分，仅比较日期
};

/**
 * 判断是否为选中的日期
 * @param {Date} date - 目标日期
 * @returns {boolean} - 返回是否为选中的日期
 */
const isSelected = (date: Date): boolean => {
  return (
    selectedDay.value !== null &&
    date.toDateString() === selectedDay.value.toDateString()
  );
};

// 在组件挂载时，默认选中今天，并设置滚动目标为今天
onMounted(() => {
  selectedDay.value = new Date(); // 默认选中今天
  todayId.value = "today"; // 设置滚动 ID 为今天
});
</script>

<style lang="scss">
.calendar-container {
  width: 100%;
  overflow: hidden;
  background-color: #f0f0f0;
}

.calendar-scroll {
  white-space: nowrap;
  width: 100%;
  height: 127rpx;
  display: flex;
  .calendar-week {
    display: inline-block;
    width: 100%; /* 确保一次只显示一周 */
    height: 100%;
    .calendar-week-days {
      display: flex;
      height: 100%;
    }
  }
}

.calendar-day {
  width: calc(100% / 7); /* 每天占宽度的 1/7 */
  text-align: center;
  position: relative;
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &.past .calendar-day-weekday,
  &.past .calendar-day-date {
    color: #ccc; /* 过去日期显示为灰色 */
  }
}

.calendar-day-weekday {
  font-size: 12px;
  color: #999;
}

.calendar-day-date {
  font-size: 20px;
  font-weight: bold;
}

.selected {
  border-radius: 5px;
  background-color: #ffe58f;
}
</style>
