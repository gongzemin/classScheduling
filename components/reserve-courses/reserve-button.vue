<template>
  <div>
    <button
      class="reserve-btn"
      @click="handleClick"
      :class="{
        active: buttonStatus === '预约',
        ing: buttonStatus === '进行中',
      }"
      :disabled="buttonStatus !== '预约'">
      {{ buttonStatus }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// Props 接收
const props = defineProps({
  time: {
    type: String, // 格式为 HH:mm-HH:mm
    required: true,
    validator: (value) => /^(\d{2}:\d{2})-(\d{2}:\d{2})$/.test(value), // 校验格式
  },
  clickDate: {
    type: Date, // 按钮对应的日期
    required: true,
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

// 时间字符串转为分钟数
const parseTimeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// 拆分开始时间和结束时间
const [startTime, endTime] = props.time.split("-").map(parseTimeToMinutes);
// console.log("startTime,", startTime, endTime);

// 获取按钮状态
const buttonStatus = computed(() => {
  console.log("props.clickDate", props.clickDate);
  const currentMinutes = now.value.getHours() * 60 + now.value.getMinutes(); // 当前时间分钟数
  const diffDays = Math.floor(
    (props.clickDate.getTime() - today.value.getTime()) / (1000 * 60 * 60 * 24)
  ); // 按钮日期与今天的天数差

  if (diffDays < 0) {
    return "已结束"; // 今天之前的日期
  }
  if (diffDays === 0) {
    if (currentMinutes > endTime) {
      return "已结束"; // 今天且结束时间已过
    }
    if (currentMinutes >= startTime && currentMinutes <= endTime) {
      return "进行中"; // 今天且进行中
    }
    return "预约"; // 今天且尚未开始
  }
  if (diffDays > 0 && diffDays <= 2) {
    if (diffDays === 2 && now.value >= today12PM.value) {
      return "预约"; // 今天中午 12 点后可预约后天的课程
    }
    return "预约"; // 今天后的两天内
  }
  return "暂未开放预约"; // 超过两天后的日期
});

// 点击事件
const handleClick = () => {
  alert(`按钮状态: ${buttonStatus.value}`);
};
</script>

<style>
.reserve-btn {
  font-size: 16px;
  text-align: center;
  border-radius: 5px;
  border: none;
}
.reserve-btn.active {
  background-color: #ff6600;
  color: #fff;
  cursor: pointer;
}
.reserve-btn:disabled {
  background-color: #ddd;
  color: #333;
  cursor: not-allowed;
}
.reserve-btn.ing {
  background-color: #74dbef !important;
  color: #333;
  cursor: not-allowed;
}
</style>
