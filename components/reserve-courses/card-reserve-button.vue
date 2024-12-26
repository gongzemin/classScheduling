<template>
  <view>
    <view v-if="buttonStatus === '已结束'" class="reserve-btn">
      {{ buttonStatus }}
    </view>
    <!-- :disabled="buttonStatus !== '预约' && buttonStatus !== '进行中'" -->
    <button
      v-else
      class="reserve-btn"
      :class="{
        active: buttonStatus === '预约',
        ing: buttonStatus === '进行中',
      }">
      {{ buttonStatus }}
    </button>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { parseTimeToMinutes } from "../../common/util.js";

const userInfo = uni.getStorageSync("userInfo");
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
  classId: {
    type: String, // 格式为 HH:mm-HH:mm
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
const [startTime, endTime] = props.time.split("-").map(parseTimeToMinutes);

// 获取按钮状态
const buttonStatus = computed(() => {
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
    if (diffDays === 2) {
      // 只有当前时间超过今天的中午 12 点，才可以预约后天的课程
      if (now.value >= today12PM.value) {
        return "预约";
      } else {
        return "暂未开放预约"; // 今天还没到中午 12 点，不允许预约后天课程
      }
    }
    return "预约"; // 今天后的 1 天内的课程直接允许预约
  }
  return "暂未开放预约"; // 超过两天后的日期
});

// 点击事件
const bookCourse = async () => {
  // toISOString() 的输出示例：2024-12-17T06:55:00.000Z
  const formattedDate = props.clickDate.toISOString(); // 转换为 ISO 格式
  // 执行预约逻辑
  uni.navigateTo({
    url: `/pages-reserve/reserveDetail/reserveDetail?id=${props.classId}&date=${formattedDate}&time=${props.time}`,
  });
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
