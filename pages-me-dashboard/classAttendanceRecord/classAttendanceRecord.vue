<template>
  <view class="container">
    <view class="stats-card">
      <view class="header">
        <view class="date-select">
          <picker
            mode="selector"
            :value="selectedYearIndex"
            :range="yearOptions"
            @change="onYearChange">
            <view class="picker">{{ yearOptions[selectedYearIndex] }} 年</view>
          </picker>

          <picker
            mode="selector"
            :value="selectedMonthIndex"
            :range="monthOptions"
            @change="onMonthChange">
            <view class="picker">{{ monthOptions[selectedMonthIndex] }}</view>
          </picker>
        </view>
      </view>

      <view v-if="loading" class="loading">
        <uni-load-more status="loading"></uni-load-more>
      </view>

      <view v-else class="stats-content">
        <view class="stat-item">
          <text class="label">总课程节数</text>
          <text class="value">
            {{ statistics.totalCourses }}
            <text class="label">节</text>
          </text>
        </view>
        <view class="stat-item mb-20">
          <text class="label">出勤统计</text>
          <text class="value">
            {{ statistics.trainingDays }}
            <text class="label">天</text>
          </text>
        </view>

        <!-- Line Chart -->
        <view style="width: 90vw; height: 750rpx">
          <l-echart ref="lineChartRef"></l-echart>
        </view>

        <!-- Pie Chart -->
        <view
          style="
            width: 85vw;
            height: 550rpx;
            margin-top: 20px;
            overflow: hidden;
          ">
          <l-echart ref="pieChartRef"></l-echart>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
// Import echarts
import lEchart from "../uni_modules/lime-echart/components/l-echart/l-echart.vue";
const echarts = require("../uni_modules/lime-echart/static/echarts.min");

interface Statistics {
  totalCourses: number;
  trainingDays: number;
  courseDistribution: { name: string; value: number }[];
  dailyCourses: { date: string; count: number }[];
}

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();

const yearOptions = Array.from({ length: 5 }, (_, i) => `${currentYear - i}`);
const monthOptions = Array.from({ length: 12 }, (_, i) => `${i + 1} 月`);

const selectedYearIndex = ref(0);
const selectedMonthIndex = ref(currentMonth);

const statistics = ref<Statistics>({
  totalCourses: 0,
  trainingDays: 0,
  courseDistribution: [],
  dailyCourses: [],
});
const loading = ref(false);

const onYearChange = (e: any) => {
  selectedYearIndex.value = e.detail.value;
  fetchStatistics();
};

const onMonthChange = (e: any) => {
  selectedMonthIndex.value = e.detail.value;
  fetchStatistics();
};

const fetchStatistics = async () => {
  loading.value = true;

  try {
    console.log(
      "year-month",
      yearOptions[selectedYearIndex.value],
      Number(selectedMonthIndex.value) + 1
    );
    const res = await uniCloud.callFunction({
      name: "getMonthlyStatistics",
      data: {
        userId: uni.getStorageSync("userInfo").userId,
        year: yearOptions[selectedYearIndex.value],
        month: Number(selectedMonthIndex.value) + 1,
      },
    });

    if (res.result.code === 0) {
      statistics.value = res.result.data;
      //console.log("charts-----", res.result.data);
      renderCharts();
    }
  } catch (error) {
    console.error("获取统计数据失败", error);
  } finally {
    loading.value = false;
  }
};

const lineChartRef = ref(null);
const pieChartRef = ref(null);

const renderCharts = async () => {
  // Line Chart
  setTimeout(async () => {
    // console.log("charts111-----", echarts, lineChartRef.value);
    if (!lineChartRef.value) return;

    const dailyCourses = statistics.value.dailyCourses;
    const dates = dailyCourses.map((item) => item.date);
    const counts = dailyCourses.map((item) => item.count);

    const lineChartOption = {
      title: {
        text: "每日上课统计",
        left: "left",
        top: 10,
        textStyle: {
          fontSize: 18,
          fontWeight: "bold",
          color: "#333",
        },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
        },
      },
      xAxis: {
        type: "category",
        data: dates,
        axisLine: {
          lineStyle: {
            color: "#999999",
          },
        },
        axisLabel: {
          color: "#666666",
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: "value",
        axisLine: {
          lineStyle: {
            color: "#999999",
          },
        },
        axisLabel: {
          color: "#666666",
        },
        axisTick: {
          show: false,
        },
      },
      series: [
        {
          name: "课程节数",
          type: "line",
          data: counts,
          smooth: true,
        },
      ],
    };
    // console.log("echarts", echarts);
    const lineChart = await lineChartRef.value.init(echarts);
    lineChart.setOption(lineChartOption);
  }, 300);

  // Pie Chart
  setTimeout(async () => {
    if (!pieChartRef.value) return;

    const courseDistribution = statistics.value.courseDistribution;

    const pieChartOption = {
      title: {
        text: "课程分布",
        left: "left",
        top: 10,
        textStyle: {
          fontSize: 18,
          fontWeight: "bold",
          color: "#333",
        },
      },
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
      },
      series: [
        {
          name: "课程分布",
          type: "pie",
          radius: ["30%", "50%"],
          label: {
            show: true,
            position: "outside",
            formatter: "{b}: {c} ({d}%)",
          },
          data: courseDistribution.map((item) => ({
            name: item.name,
            value: item.value,
          })),
        },
      ],
    };
    const pieChart = await pieChartRef.value.init(echarts);
    pieChart.setOption(pieChartOption);
  }, 300);
};

onMounted(() => {
  fetchStatistics();
});
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  // height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
  box-sizing: border-box;
}

.stats-card {
  width: 100%;
  max-width: 650px;
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
}

.date-select {
  display: flex;
  gap: 15px;
}

.picker {
  padding: 8px 20px;
  background-color: #f0f0f0;
  border-radius: 8px;
  font-size: 16px;
  text-align: center;
}

.stats-content {
  display: flex;
  flex-direction: column;
  // gap: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0; // 减小 padding 让行距更紧凑
  border-bottom: 1px solid #eee;

  .label {
    font-size: 14px; // 标签字体调小
    color: #666;
  }

  .value {
    font-size: 22px; // 数值字体加大
    font-weight: bold; // 加粗数值
    color: #333;
  }
}

.chart {
  height: 300px;
  margin-top: 20px;
}
</style>
