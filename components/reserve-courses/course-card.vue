<template>
  <view class="course-card" @click="goDetail">
    <!-- 背景展示老师图片 -->
    <view
      class="course-background"
      :class="isCancelled ? 'cancel-gray' : ''"
      :style="{ backgroundImage: `url(${courseInfo.courseTeacherPic})` }">
      <!-- 透明蒙版 -->
      <view class="overlay"></view>
      <!-- 课程内容 -->
      <view class="course-info">
        <view class="course-time">
          {{ courseInfo.time }}
        </view>
        <view class="course-name flex items-center">
          {{ courseInfo.courseType }}
          <view class="flex items-center ml-20 mt-5">
            <view class="course-level">{{ courseInfo.courseLevel }}</view>
            <view class="course-difficulty">
              <!-- <view class="label">难度:</view> -->
              <view class="stars">
                <view v-for="n in 3" :key="n" class="star">
                  <text v-if="n <= starCount" class="filled">★</text>
                  <text v-else>★</text>
                  <!--    <text v-else>🌟</text> -->
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="teacher-name mt-40">
          <view>{{ courseInfo.courseTeacherName }}</view>
        </view>
        <view class="reserve-static">
          已预约 {{ courseInfo?.reservedUsers?.length || 0 }}/{{
            courseInfo?.capacity || 20
          }}
        </view>

        <!-- 学生头像列表   {{ courseInfo.reservedUsers }}TODO 后面可以不用写 courseInfo.reservedUsers &&  -->
        <view class="pt-20 flex" v-if="courseInfo.reservedUsers?.length">
          <reserve-user-list
            :reservedUsers="courseInfo.reservedUsers.slice(0, 9)" />
          <view v-if="courseInfo.reservedUsers.length > 9" class="text-gray">
            ...
          </view>
        </view>
      </view>

      <!-- 已取消 badge -->
      <view v-if="isCancelled" class="cancelled-badge animate-badge">
        已取消
      </view>

      <view v-if="courseInfo.isReserved && !isCancelled" class="reserve-btn">
        已预约
      </view>

      <!-- 预约按钮 - 如果课程已取消，不显示预约按钮 -->
      <reserve-button
        v-else-if="!isCancelled"
        :time="courseInfo.time"
        :clickDate="clickDate"
        :classId="courseInfo._id"
        class="reserve-btn" />

      <!-- 管理员操作按钮 -->
      <view v-if="isAdmin" @click.stop="showMore">
        <uni-icons
          type="more-filled"
          class="more"
          size="40"
          color="rgba(255,255,255,0.5)"></uni-icons>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, reactive } from "vue";
import reserveUserList from "./reserve-user-list.vue";
import reserveButton from "./card-reserve-button.vue";

const props = defineProps({
  courseInfo: {
    type: Object,
    default: () => {},
  },
  clickDate: Date, // 点击的日期对象
});

const students = ref([]);
let reserveUserArr = ref([]);

const db = uniCloud.database();
const studioInfo = ref(uni.getStorageSync("studioInfo") || {});
const userInfo = uni.getStorageSync("userInfo");
// 导入云对象
const schedule = uniCloud.importObject("schedule");
const emit = defineEmits(["refreshList"]);
const bookInfo = reactive({
  count: 0,
  capacity: 45,
});
const starCount = computed(() => {
  if (props.courseInfo.courseLevel === "入门") {
    return 1;
  } else if (props.courseInfo.courseLevel === "基础") {
    return 2;
  } else if (props.courseInfo.courseLevel === "进阶") {
    return 3;
  }
});

const storedUserInfo = ref(uni.getStorageSync("userInfo"));
const isAdmin = computed(() =>
  storedUserInfo.value?.role === "superAdmin" ? true : false
);

// 提取课程开始时间
const getStartTime = () => {
  const timeRange = props.courseInfo.time; // 15:30-17:00
  const startTime = timeRange.split("-")[0]; // 获取 15:30
  const [hour, minute] = startTime.split(":").map(Number);
  const courseDate = new Date(props.clickDate);
  courseDate.setHours(hour, minute, 0); // 设置具体时间
  return courseDate;
};

// 计算课程是否已取消
const isCancelled = computed(() => {
  const courseStartTime = getStartTime().getTime();
  const currentTime = Date.now();

  // 提前小时数，默认为1小时
  const cancelDeadlineHours = studioInfo.value.cancelDeadlineHours
    ? Number(studioInfo.value.cancelDeadlineHours)
    : 1;

  const minParticipants = Number(studioInfo.value.minParticipants) || 5;
  const reservedCount = props.courseInfo?.reservedUsers?.length || 0;

  // 截止时间计算
  const cancelDeadlineTime =
    courseStartTime - cancelDeadlineHours * 60 * 60 * 1000;

  return currentTime >= cancelDeadlineTime && reservedCount < minParticipants;
});

// 删除前确认
function deleteCourse() {
  uni.showModal({
    title: "确认删除",
    content: "您确定要删除这条数据吗？删除后无法恢复。",
    success(res) {
      if (res.confirm) {
        // 用户点击确认，执行删除操作
        deleteData();
      } else {
        // 用户点击取消，不做任何操作
        console.log("用户取消删除");
      }
    },
  });
}

const editCourse = () => {
  uni.navigateTo({
    url: `/pages-courses/newCourse/newCourse?id=${props.courseInfo._id}`,
  });
};

const showMore = () => {
  uni.showActionSheet({
    itemList: ["编辑", "删除"],
    success: function (res) {
      if (res.tapIndex === 0) {
        editCourse();
      } else if (res.tapIndex === 1) {
        deleteCourse();
      }
      console.log("选中了第" + (res.tapIndex + 1) + "个按钮");
    },
    fail: function (res) {
      console.log(res.errMsg);
    },
  });
};

// 执行删除操作
// 前端调用云函数进行删除
async function deleteData() {
  const userInfo = uni.getStorageSync("userInfo");
  if (userInfo && userInfo.role === "superAdmin") {
    db.collection("class-schedule")
      .doc(props.courseInfo._id)
      .remove()
      .then((res) => {
        uni.showToast({
          icon: "none",
          title: "删除成功！",
        });
        emit("refreshList");
      })
      .catch((err) => {
        console.log("err", err);
      });
  } else {
    uni.showToast({
      title: "无权限删除",
      icon: "none",
    });
  }
}
const goDetail = () => {
  console.log("card");
  const formattedDate = props.clickDate.toISOString(); // 转换为 ISO 格式
  const courseObj = {
    ...props.courseInfo,
    isoDate: formattedDate,
  };
  const queryString = encodeURIComponent(JSON.stringify(courseObj));
  uni.navigateTo({
    url: `/pages-reserve/reserveDetail/reserveDetail?courseData=${queryString}`,
  });
};
</script>

<style scoped lang="scss">
.course-card {
  width: 100%;
  // height: 330rpx;
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  height: 200px;
  margin-top: 40rpx;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  .cancel-gray {
    filter: grayscale(100%);
    pointer-events: none;
  }
  .course-background {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    display: flex;
    flex-direction: column;
    // justify-content: space-between;
    color: #fff;

    /* 透明蒙版 */
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5); /* 黑色背景，透明度为 0.4 */
      z-index: 1;
    }

    .course-info,
    .student-avatar-list,
    .reserve-btn {
      position: relative;
      z-index: 2; /* 确保内容在蒙版上方 */
    }

    .course-info {
      // background: rgba(0, 0, 0, 0.5);
      padding: 10px 20px;
      border-radius: 5px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      .course-time {
        font-size: 18px;
      }
      .teacher-name {
        font-size: 16px;
      }
      .course-name {
        font-size: 19px;
      }
      .course-level {
        font-size: 11px;
        color: #e1e1e1;
      }
      .reserve-static {
        font-size: 11px;
        margin-top: 5rpx;
      }

      .course-difficulty {
        margin-top: -1rpx;
        display: flex;
        align-items: center;
        color: #e1e1e1;

        .label {
          font-size: 12px;
        }

        .stars {
          display: flex;
          margin-left: 5px;
          margin-top: -1rpx;
          .star {
            font-size: 12px;
            margin-right: 2px;
          }
          .filled {
            color: gold;
          }
        }
      }
    }

    // .student-avatar-list {
    //   display: flex;
    //   margin-top: 10px;
    //   padding: 0 10px;
    //   .avatar-wrapper {
    //     width: 22px;
    //     height: 22px;
    //     border-radius: 50%;
    //     overflow: hidden;
    //     margin-right: 5px;
    //     border: 0.5px solid rgba(255, 255, 255, 0.3);

    //     .avatar {
    //       width: 100%;
    //       height: 100%;
    //       object-fit: cover;
    //     }
    //   }
    // }

    .reserve-btn {
      position: absolute;
      right: 25rpx;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2; /* 确保按钮在蒙版上方 */
    }
    .cancelled-badge {
      position: absolute;
      right: 30rpx;
      top: 50%;
      transform: translateY(-50%);
      background: linear-gradient(135deg, #ff416c, #ff4b2b);
      color: #fff;
      padding: 12rpx 30rpx;
      border-radius: 50rpx;
      font-size: 28rpx;
      font-weight: bold;
      box-shadow: 0 8rpx 16rpx rgba(255, 75, 43, 0.5);
      text-align: center;
      z-index: 10;
    }

    /* 动画效果 */
    // .animate-badge {
    //   animation: pulse 1.5s infinite;
    // }

    // /* 动画定义 */
    // @keyframes pulse {
    //   0% {
    //     transform: translateY(-50%) scale(1);
    //   }
    //   50% {
    //     transform: translateY(-50%) scale(1.1);
    //   }
    //   100% {
    //     transform: translateY(-50%) scale(1);
    //   }
    // }

    /* 管理员操作按钮样式 */
    .more {
      position: absolute;
      top: 10rpx;
      right: 30rpx;
      z-index: 3;
      padding: 10rpx 20rpx;
      color: rgba(255, 255, 255, 0.5);
    }
  }
}
</style>
