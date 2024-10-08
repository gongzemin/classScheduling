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
    width: 100%;
    height: 100%;
    .calendar-week-days {
      display: flex;
      height: 100%;
    }
  }
}
</style>
