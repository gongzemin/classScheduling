<template>
  <view>
    <reserve-calendar @day-click="dayClick"></reserve-calendar>
    <reserve-courses
      :dayOfTheWeek="dayOfTheWeek"
      :clickDate="clickDate"></reserve-courses>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
const dayOfTheWeek = ref("");
const clickDate = ref(new Date());
const dayClick = (val) => {
  dayOfTheWeek.value = val.weekday;
  clickDate.value = val.date;
  console.log("val--dayClick-", val, val.date instanceof Date);
};

// 在组件挂载时，计算今天的课程
onMounted(() => {
  // console.log("onAddToFavorites(3333)000", typeof getCurrentPages);

  if (typeof getCurrentPages === "function" && getCurrentPages().length) {
    console.log("onAddToFavorites(3333)");
    wx.showShareMenu();
    const currentPage = getCurrentPages().slice(-1)[0];
    currentPage.onShareAppMessage = () => {
      return {
        title: "Pick Dance Studio",
        path: "/pages/reserve/reserve",
        // imageUrl: "../../static/images/share.jpg",
      };
    };
    currentPage.onShareTimeline = () => {
      return {
        title: "Pick Dance Studio",
        // imageUrl: "../../static/images/moment.jpg",
      };
    };
  }
});
</script>

<style lang="scss"></style>
