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
              courseInfo.capacity
            }}
          </text>
        </view>
        <view class="info-item">
          <reserve-user-list :reservedUsers="courseInfo.reservedUsers" />
        </view>
      </view>
    </view>

    <!-- 预约按钮 -->
    <reserve-button
      class="reserve"
      :courseInfo="courseInfo"
      @book="bookCourse"
      v-if="Object.keys(courseInfo).length" />
  </view>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { onReady, onLoad } from "@dcloudio/uni-app";
import { formatCourseTime, formatDateToYYYYMMDD } from "../../common/util";
import reserveButton from "../../components/reserve-courses/detail-reserve-button.vue";
import reserveUserList from "../../components/reserve-courses/reserve-user-list.vue";

const db = uniCloud.database();
const collection = db.collection("class-schedule");
const userInfo = uni.getStorageSync("userInfo");

const bookedCount = ref(12); // 已预约人数
const maxCapacity = 20; // 最大人数

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

function getAvatar(item) {
  return item.avatar || "../../static/images/defAvatar.png";
}

const handleBook = () => {
  const { userId, avatar, cardType } = userInfo;
  // 调用云对象
  // TODO 这样有个问题 如果预约了 然后更换了用户头像 这时候显示的头像是不是最新的
  uniCloud
    .importObject("reserve")
    .bookCourse({
      userId,
      avatar,
      cardType,
      queryClassId: courseInfo._id,
      clickDate: new Date(courseInfo.isoDate),
    })
    .then((res) => {
      const { code, message } = res;
      if (code === 200) {
        uni.hideLoading();
        uni.$emit("refreshList", { msg: "更新列表" });
        uni.navigateBack();
        console.log("预约成功");
      } else {
        throw new Error(message);
      }
    })
    .catch((err) => {
      uni.hideLoading();
      console.error("预约失败", err);
    });
};

const handleCancel = () => {
  const { userId, cardType } = userInfo;
  // 调用云对象取消预约逻辑
  uniCloud
    .importObject("reserve")
    .cancelCourse({
      userId,
      queryClassId: courseInfo._id,
      cardType,
    })
    .then((res) => {
      const { code, message } = res;
      if (code === 200) {
        uni.hideLoading();
        uni.$emit("refreshList", { msg: "更新列表" });
        uni.navigateBack();
        console.log("取消预约成功");
      } else {
        throw new Error(message);
      }
    })
    .catch((err) => {
      uni.hideLoading();
      console.error("取消预约失败", err);
    });
};

const bookCourse = async (val) => {
  uni.showLoading({
    mask: true,
  });
  const { userId, avatar, cardType } = userInfo;
  if (val === "预约") {
    // 如果是次卡，先检查用户的剩余次数
    if (cardType === "sessionCard") {
      const { result } = await db
        .collection("users")
        .doc(userId)
        .field("remainingSessions")
        .get({
          getOne: true,
        });

      if (!Object.keys(result.data).length) {
        throw new Error("用户不存在");
      }
      const remainingSessions = result.data?.remainingSessions || 0;
      console.log("remainingSessions", remainingSessions);

      // 检查剩余次数是否足够
      if (remainingSessions <= 0) {
        uni.showToast({
          title: `卡剩余次数不足`,
        });
        uni.hideLoading();
        return;
      }
    }
    handleBook();
  } else if (val === "取消预约") {
    handleCancel();
  }
};

const getReserveUser = () => {
  let reserveTemp = db
    .collection("user_reserve")
    .where(`class_id == "${courseInfo._id}"`)
    .getTemp();
  let userTemp = db.collection("users").field("_id, avatar").getTemp();
  db.collection(reserveTemp, userTemp)
    .orderBy("reserve_time desc")
    .limit(20)
    .get()
    .then((res) => {
      reserveUserArr.value = res.result.data;
      console.log("res----", res);
    });
};

onLoad((options) => {
  const courseData = options.courseData;
  if (courseData) {
    const courseObj = JSON.parse(decodeURIComponent(courseData));
    courseObj.time = `${formatDateToYYYYMMDD(new Date(courseObj.isoDate))} ${
      courseObj.time
    }`;
    console.log(courseObj, "courseObj");
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
}
</style>
