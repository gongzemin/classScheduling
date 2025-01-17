<template>
  <view class="reservation-details">
    <!-- 老师照片 -->
    <view
      v-if="courseInfo.courseTeacherPic"
      class="teacher-photo"
      :style="{
        backgroundImage: `url(${courseInfo.courseTeacherPic})`,
      }"></view>

    <!-- 课程信息 -->
    <view class="class-info">
      <view class="card-title flex">
        <view>课程信息</view>
        <view class="icon-container">
          <uni-icons type="info" size="20" color="rgba(0, 56, 0, 0.9)" />
          <text class="tip-text">满5人开课</text>
        </view>
      </view>

      <view class="info-item-wrapper">
        <view class="info-item">
          <text class="label">课程名称：</text>
          <view class="relative w-220 flex flex-end">
            <view class="mr-10">{{ courseInfo.courseType }}</view>
            <view class="class-level">{{ courseInfo.courseLevel }}</view>
          </view>
        </view>

        <view class="info-item">
          <text class="label">课程难度：</text>
          <view class="stars">
            <view v-for="n in 3" :key="n" class="star">
              <text v-if="n <= starCount" class="filled">★</text>
              <text v-else>☆</text>
            </view>
          </view>
        </view>

        <view class="info-item">
          <text class="label">上课时间：</text>
          <text>{{ courseInfo.time }}</text>
        </view>
        <view class="info-item">
          <text class="label">老师姓名：</text>
          <text>{{ courseInfo.courseTeacherName }}</text>
        </view>
      </view>
    </view>

    <view
      class="class-info"
      v-if="courseInfo.reservedUsers && courseInfo.reservedUsers.length">
      <view class="card-title">预约信息</view>
      <view class="info-item-wrapper">
        <view class="info-item">
          <text class="label">已预约人数：</text>
          <text>
            {{ courseInfo.reservedUsers && courseInfo.reservedUsers.length }}/{{
              courseInfo.capacity || 20
            }}
          </text>
        </view>
        <view class="info-item">
          <reserve-user-list :reservedUsers="courseInfo.reservedUsers" />
        </view>
      </view>
    </view>

    <!-- 已取消 badge -->
    <view v-if="isCancelled" class="cancelled-badge animate-badge">
      课程已取消
    </view>

    <!-- 预约按钮 -->
    <reserve-button
      class="reserve"
      :courseInfo="courseInfo"
      @book="bookCourse"
      v-if="Object.keys(courseInfo).length && !isCancelled" />
  </view>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { onReady, onLoad } from "@dcloudio/uni-app";
import { formatCourseTime, formatDateToYYYYMMDD } from "../../common/util.js";
import reserveButton from "../../components/reserve-courses/detail-reserve-button.vue";
import reserveUserList from "../../components/reserve-courses/reserve-user-list.vue";

const db = uniCloud.database();
const collection = db.collection("class-schedule");
const userInfo = uni.getStorageSync("userInfo");
// TODO 有没有必要用ref
const storedUserInfo = ref(uni.getStorageSync("userInfo"));

const bookedCount = ref(12); // 已预约人数
const maxCapacity = 20; // 最大人数
const isCancelled = ref(false);

const courseInfo = reactive({});
const reserveUserArr = ref([]);

const starCount = computed(() => {
  if (courseInfo.courseLevel === "入门") {
    return 1;
  } else if (courseInfo.courseLevel === "基础") {
    return 2;
  } else if (courseInfo.courseLevel === "进阶") {
    return 3;
  }
});

// const tt = [
//   {
//     user_id: "6763d1654b9247079917bee5",
//     avatar:
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/avatar/v7fcx1KhN88lf4829a5f6dec30f81bffa90a7bf4bb03.jpg",
//   },
//   {
//     user_id: "67526d0789bd27450be85c4e",
//     avatar:
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/avatar/vijySG3IdJP362fdb3d8f5338c0f22ae9c298e3ddedf.jpeg",
//   },
//   {
//     user_id: "6763d1654b9247079917bee5",
//     avatar:
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/avatar/v7fcx1KhN88lf4829a5f6dec30f81bffa90a7bf4bb03.jpg",
//   },
//   {
//     user_id: "67526d0789bd27450be85c4e",
//     avatar:
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/avatar/vijySG3IdJP362fdb3d8f5338c0f22ae9c298e3ddedf.jpeg",
//   },
//   {
//     user_id: "6763d1654b9247079917bee5",
//     avatar:
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/avatar/v7fcx1KhN88lf4829a5f6dec30f81bffa90a7bf4bb03.jpg",
//   },
//   {
//     user_id: "67526d0789bd27450be85c4e",
//     avatar:
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/avatar/vijySG3IdJP362fdb3d8f5338c0f22ae9c298e3ddedf.jpeg",
//   },
//   {
//     user_id: "6763d1654b9247079917bee5",
//     avatar:
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/avatar/v7fcx1KhN88lf4829a5f6dec30f81bffa90a7bf4bb03.jpg",
//   },
//   {
//     user_id: "67526d0789bd27450be85c4e",
//     avatar:
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/avatar/vijySG3IdJP362fdb3d8f5338c0f22ae9c298e3ddedf.jpeg",
//   },
//   {
//     user_id: "6763d1654b9247079917bee5",
//     avatar:
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/avatar/v7fcx1KhN88lf4829a5f6dec30f81bffa90a7bf4bb03.jpg",
//   },
//   {
//     user_id: "67526d0789bd27450be85c4e",
//     avatar:
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/avatar/vijySG3IdJP362fdb3d8f5338c0f22ae9c298e3ddedf.jpeg",
//   },
//   {
//     user_id: "6763d1654b9247079917bee5",
//     avatar:
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/avatar/v7fcx1KhN88lf4829a5f6dec30f81bffa90a7bf4bb03.jpg",
//   },
//   {
//     user_id: "67526d0789bd27450be85c4e",
//     avatar:
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/avatar/vijySG3IdJP362fdb3d8f5338c0f22ae9c298e3ddedf.jpeg",
//   },
//   {
//     user_id: "6763d1654b9247079917bee5",
//     avatar:
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/avatar/v7fcx1KhN88lf4829a5f6dec30f81bffa90a7bf4bb03.jpg",
//   },
//   {
//     user_id: "67526d0789bd27450be85c4e",
//     avatar:
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/avatar/vijySG3IdJP362fdb3d8f5338c0f22ae9c298e3ddedf.jpeg",
//   },
//   {
//     user_id: "6763d1654b9247079917bee5",
//     avatar:
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/avatar/v7fcx1KhN88lf4829a5f6dec30f81bffa90a7bf4bb03.jpg",
//   },
//   {
//     user_id: "67526d0789bd27450be85c4e",
//     avatar:
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/avatar/vijySG3IdJP362fdb3d8f5338c0f22ae9c298e3ddedf.jpeg",
//   },
//   {
//     user_id: "6763d1654b9247079917bee5",
//     avatar:
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/avatar/v7fcx1KhN88lf4829a5f6dec30f81bffa90a7bf4bb03.jpg",
//   },
//   {
//     user_id: "67526d0789bd27450be85c4e",
//     avatar:
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/avatar/vijySG3IdJP362fdb3d8f5338c0f22ae9c298e3ddedf.jpeg",
//   },
//   {
//     user_id: "67526d0789bd27450be85c4e",
//     avatar:
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/avatar/vijySG3IdJP362fdb3d8f5338c0f22ae9c298e3ddedf.jpeg",
//   },
//   {
//     user_id: "6763d1654b9247079917bee5",
//     avatar:
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/avatar/v7fcx1KhN88lf4829a5f6dec30f81bffa90a7bf4bb03.jpg",
//   },
//   {
//     user_id: "67526d0789bd27450be85c4e",
//     avatar:
//       "https://mp-6f936094-f8b1-4265-9a2d-a025837362d1.cdn.bspapp.com/avatar/vijySG3IdJP362fdb3d8f5338c0f22ae9c298e3ddedf.jpeg",
//   },
// ];

// 设置用户头像

const getReserveUser = (course, targetDate) => {
  // 获取当天的起始时间
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0); // 设置为当天 00:00:00.000

  // 获取当天的结束时间
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999); // 设置为当天 23:59:59.999

  let reserveTemp = db
    .collection("user-reserve")
    .where({
      class_id: course._id,
      canceled: false, // 增加canceled为false的条件
      reserve_class_date: db.command
        .gte(startOfDay)
        .and(db.command.lte(endOfDay)), // 日期范围查询})
    })
    .getTemp();
  let userTemp = db.collection("users").field("_id, avatar").getTemp();
  return db
    .collection(reserveTemp, userTemp)
    .orderBy("reserve_time desc")
    .limit(course.capacity)
    .get();
};

const updateUser = async () => {
  console.log("updateUser");
  const res = await getReserveUser(courseInfo, courseInfo.isoDate); // 获取预约用户信息
  if (res.result.errCode === 0) {
    // console.log(
    //   "9999",
    //   res.result.data,
    //   props.clickDate,
    //   typeof props.clickDate
    // );
    if (res.result.data.length) {
      let users = res.result.data
        .map((item) => item.user_id.length && item.user_id)
        .flat();
      console.log("999999991", users);
      courseInfo.reservedUsers = users.map((item) => item.avatar);
      courseInfo.isReserved = users
        .map((item) => item._id)
        .includes(storedUserInfo.value.userId);
    } else {
      courseInfo.isReserved = false;
      courseInfo.reservedUsers = [];
    }
  }
};

function getAvatar(item) {
  return item.avatar || "../../static/images/defAvatar.png";
}

const reserveCourse = async () => {
  // TODO 用户第一次登录的时候没有cardId
  const { result } = await db
    .collection("user-membership-card")
    .where({ user_id: userInfo.userId })
    .field("expirationDate,_id")
    .get({ getOne: true });

  const cardData = result?.data || {};
  const { userId = "", avatar = "", cardType = "" } = userInfo || {};
  console.log("handleBook", userInfo);
  // 调用云对象
  // TODO 这样有个问题 如果预约了 然后更换了用户头像 这时候显示的头像是不是最新的
  uniCloud
    .importObject("reserve")
    .bookCourse({
      userId,
      cardId: cardData._id,
      avatar,
      cardType,
      queryClassId: courseInfo._id,
      clickDate: new Date(courseInfo.isoDate),
    })
    .then((res) => {
      const { code, message } = res;
      if (code === 200) {
        const existingUserInfo = uni.getStorageSync("userInfo") || {};
        uni.setStorageSync("userInfo", {
          ...existingUserInfo,
          remainingSessions: Number(existingUserInfo.remainingSessions) - 1,
        });
        updateUser();
        uni.$emit("refreshList", { msg: "更新列表" });

        // uni.navigateBack();
        console.log("预约成功");
      } else {
        throw new Error(message);
      }
    })
    .catch((err) => {
      console.error("预约失败", err);
    });
};

const handleBook = () => {
  reserveCourse();
};

const handleCancel = async () => {
  const { result } = await db
    .collection("user-membership-card")
    .where({ user_id: userInfo.userId })
    .field("expirationDate,_id")
    .get({ getOne: true });

  const cardData = result?.data || {};
  const { userId, cardType } = userInfo;
  console.log("cardId", userInfo, cardData);
  // 调用云对象取消预约逻辑
  uniCloud
    .importObject("reserve")
    .cancelCourse({
      userId,
      queryClassId: courseInfo._id,
      cardType,
      cardId: cardData._id,
    })
    .then((res) => {
      const { code, message } = res;
      if (code === 200) {
        updateUser();
        uni.$emit("refreshList", { msg: "更新列表" });
        // uni.navigateBack();
        console.log("取消预约成功");
      } else {
        throw new Error(message);
      }
    })
    .catch((err) => {
      console.error("取消预约失败", err);
    });
};

function checkCourseCancellation(courseTimeStr) {
  const now = new Date(); // 当前时间
  const courseDate = new Date(courseTimeStr.split(" ")[0]); // 提取日期部分
  const startTime = courseTimeStr.split(" ")[1].split("-")[0]; // 提取开始时间
  const [startHour, startMinute] = startTime.split(":").map(Number); // 提取小时和分钟

  // 设置课程开始前一小时
  const courseStartBefore1Hour = new Date(courseDate);

  // 获取存储中的 cancelDeadlineHours
  const studioInfo = uni.getStorageSync("studioInfo");
  const cancelDeadlineHours = studioInfo
    ? Number(studioInfo.cancelDeadlineHours)
    : 1; // 使用 Number() 转换为数字，默认为1小时

  courseStartBefore1Hour.setHours(
    startHour - cancelDeadlineHours,
    startMinute,
    0,
    0
  );

  // 检查是否是今天
  const isToday = now.toDateString() === courseDate.toDateString();

  // 检查当前时间是否大于课程开始前1小时
  if (isToday && now > courseStartBefore1Hour) {
    uni.showToast({
      title: `离上课时间不足${cancelDeadlineHours}小时，不可以取消`,
      icon: "none",
    });
    return false; // 不允许取消
  }
  return true; // 允许取消
}

const bookCourse = async (val) => {
  // uni.showLoading({
  //   mask: true,
  // });
  const { userId, avatar, cardType } = userInfo;
  if (val === "预约") {
    // 如果是次卡，先检查用户的剩余次数
    handleBook();
  } else if (val === "取消预约") {
    // courseInfo.time = "2024/12/31 12:10";
    const canCancel = checkCourseCancellation(courseInfo.time);
    // console.log("取消", courseInfo);
    if (canCancel) {
      handleCancel();
    }
  }
};

onLoad((options) => {
  const courseData = options.courseData;
  if (courseData) {
    const courseObj = JSON.parse(decodeURIComponent(courseData));
    courseObj.time = `${formatDateToYYYYMMDD(new Date(courseObj.isoDate))} ${
      courseObj.time
    }`;
    // console.log("courseObj---", courseObj);
    isCancelled.value = courseObj.isCancelled;
    // 现在可以访问 courseObj.id, courseObj.date, courseObj.time 等
    Object.assign(courseInfo, courseObj);
    uni.setNavigationBarTitle({
      title: "预约",
    });
    console.log("1110000", courseObj.isoDate, new Date(courseObj.isoDate));
  }
});
</script>

<style scoped lang="scss">
.reservation-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 400px;
  margin: auto;
  padding: 0px 14px 20px;
  /*  border: 1px solid #ccc; */
  border-radius: 8px;
  background-color: #fff;

  .class-info {
    width: 100%;
    margin-bottom: 20px;
    background-color: #f8f8f8;
    border-radius: 10px;
    padding: 0rpx 15rpx 20rpx;
    position: relative;
    // box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    /* 卡片标题样式 */
    .card-title {
      font-size: 15px;
      color: #333;
      padding: 20rpx 20rpx;
      justify-content: space-between;
      // margin: 15px 0 10px 15px;
    }
    .info-item-wrapper {
      background-color: #fff;
    }
    .icon-container {
      display: flex;
      align-items: center;
      color: rgba(0, 56, 0, 0.9);
      .uni-icon {
        display: inline-block;
      }

      .tip-text {
        font-size: 14px;
        color: #666;
        margin-left: 3px; /* 图标与文本之间的间距 */
      }
    }
    .info-item {
      display: flex;
      justify-content: space-between;
      font-size: 16px;
      border-bottom: 1px solid #f1f1f1c2;
      padding: 20rpx;
    }
    .info-item:last-child {
      border-bottom: none; /* 去掉最后一项的下划线 */
    }
  }

  .teacher-photo {
    width: 100%;
    height: 400rpx;
    background-size: cover;
    border-radius: 18rpx;
    // border-top-left-radius: 50rpx 50rpx;
    // border-bottom-right-radius: 50rpx 50rpx;
    margin-bottom: 20px;
  }

  .reserve-btn {
    padding: 10px 20px;
    font-size: 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .active-btn {
    background-color: #ff6600;
    color: #fff;
  }

  .disabled-btn {
    background-color: #ccc;
    color: #666;
    cursor: not-allowed;
  }
  .w-220 {
    width: 220rpx;
  }
  .class-level {
    // position: absolute;
    // top: 0;
    // right: 0;
    background-color: rgb(0 56 0 / 90%);
    color: #fff;
    padding: 2px 5px;
    font-size: 12px;
    border-radius: 10rpx;
  }
  .stars {
    display: flex;
    margin-left: 5px;
    margin-top: -1rpx;
    .star {
      font-size: 33rpx;
      margin-right: 2px;
    }
    .filled {
      color: rgba(0, 56, 0, 0.9);
    }
  }

  .reserve {
    // position: absolute;
    // bottom: 0;
    // width: 100vw;
  }
  .cancelled-badge {
    display: inline-block;
    padding: 26rpx 122rpx;
    color: #fff;
    background-color: #f56c6c; // 红色背景
    border-radius: 20rpx; // 圆角
    font-size: 28rpx; // 字体大小
    font-weight: bold;
    text-align: center;
    width: 95vw;
    // box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2); // 阴影效果
  }

  .animate-badge {
    animation: fadeIn 0.8s ease-in-out; // 淡入动画
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
}
</style>
