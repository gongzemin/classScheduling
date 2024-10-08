<template>
  <view>
    <reserve-calendar @day-click="dayClick"></reserve-calendar>
    <reserve-courses :dayOfTheWeek="dayOfTheWeek"></reserve-courses>
  </view>
</template>

<script setup>
import { ref } from "vue";
const dayOfTheWeek = ref("");
const dayClick = (val) => {
  dayOfTheWeek.value = val;
  console.log("val---", val);
};
</script>

<style lang="scss"></style>
