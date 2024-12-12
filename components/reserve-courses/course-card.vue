<template>
  <view class="course-card">
    <!-- 背景展示老师图片 -->
    <view
      class="course-background"
      :style="{ backgroundImage: `url(${courseObj.courseTeacherPic})` }">
      <!-- 透明蒙版 -->
      <view class="overlay"></view>
      <!-- 课程内容 -->
      <view class="course-info">
        <view class="course-time">
          {{ courseObj.time }}
        </view>
        <view class="course-name flex items-center">
          {{ courseObj.courseType }}
          <view class="flex items-center ml-20 mt-5">
            <view class="course-level">{{ courseObj.courseLevel }}</view>
            <view class="course-difficulty">
              <!-- <view class="label">难度:</view> -->
              <view class="stars">
                <view v-for="n in 3" :key="n" class="star">
                  <text v-if="n <= starCount" class="filled">★</text>
                  <text v-else>☆</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="teacher-name mt-40">
          <view>{{ courseObj.courseTeacherName }}</view>
        </view>
        <view class="reserve-static">
          已预约 {{ bookInfo.count }}/{{ bookInfo.capacity }}
        </view>

        <!-- 学生头像列表 -->
        <view class="student-avatar-list" v-if="students.length">
          <view
            v-for="(student, index) in starCount"
            :key="index"
            class="avatar-wrapper">
            <image :src="student.avatar" class="avatar" />
          </view>
        </view>
      </view>

      <!-- 预约按钮 -->
      <reserve-button
        :time="courseObj.time"
        :clickDate="clickDate"
        class="reserve-btn" />

      <!-- 管理员操作按钮 -->
      <view v-if="isAdmin">
        <uni-icons
          type="more-filled"
          class="more"
          size="40"
          color="rgba(255,255,255,0.5)"
          @click="showMore"></uni-icons>
        <!-- <button class="delete-btn" @click="deleteCourse">删除</button>
        <button class="edit-btn" @click="editCourse">修改</button> -->
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, reactive } from "vue";
import reserveButton from "./reserve-button.vue";

const props = defineProps({
  courseObj: {
    type: Object,
    default: () => {},
  },
  clickDate: Date, // 点击的日期对象
});
const students = ref([]);

const db = uniCloud.database();
const userInfo = uni.getStorageSync("userInfo");
// 导入云对象
const schedule = uniCloud.importObject("schedule");
const emit = defineEmits(["refreshList"]);
const bookInfo = reactive({
  count: 0,
  capacity: 45,
});
const starCount = computed(() => {
  if (props.courseObj.courseLevel === "入门") {
    return 1;
  } else if (props.courseObj.courseLevel === "基础") {
    return 2;
  } else if (props.courseObj.courseLevel === "进阶") {
    return 3;
  }
});

const storedUserInfo = ref(uni.getStorageSync("userInfo"));
const isAdmin = computed(() =>
  storedUserInfo.value?.role === "superAdmin" ? true : false
);

const bookCourse = async (props) => {
  console.log("userInfo", userInfo);
  if (!userInfo || (userInfo && !userInfo.mobile)) {
    uni.navigateTo({
      url: "/pages/login/login",
    });
  } else {
  }
  // const { success } = await cloud.callFunction('bookCourse', { userId, courseId: co})
  // uni.showToast({
  //   title: "已预约",
  //   icon: "success",
  // });
};

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
    url: `/pages-courses/newCourse/newCourse?id=${props.courseObj._id}`,
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
  console.log("adminnnnnn00000-");
  if (userInfo && userInfo.role === "superAdmin") {
    console.log("adminnnnnn", userInfo.userId);
    db.collection("class-schedule")
      .doc(props.courseObj._id)
      .remove()
      .then((res) => {
        uni.showToast({
          icon: "none",
          title: "删除成功！",
        });
        emit("refreshList");
        console.log("res88888", res);
      })
      .catch((err) => {
        console.log("err", err);
      });

    // schedule
    //   .removeCourse({
    //     docId: props.courseId,
    //     userId: userInfo.userId,
    //   })
    //   .then((res) => {
    //     if (res.code === 200) {
    //       console.log("课程删除成功", res.message);
    //     } else {
    //       console.error("删除失败", res.message);
    //     }
    //   })
    //   .catch((err) => {
    //     console.error("调用失败", err);
    //   });
  } else {
    uni.showToast({
      title: "无权限删除",
      icon: "none",
    });
  }
}
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

    .student-avatar-list {
      display: flex;
      margin-top: 10px;
      padding: 0 10px;
      .avatar-wrapper {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 5px;
        border: 0.5px solid rgba(255, 255, 255, 0.3);

        .avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }

    .reserve-btn {
      position: absolute;
      right: 25rpx;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2; /* 确保按钮在蒙版上方 */
    }

    /* 管理员操作按钮样式 */
    .more {
      position: absolute;
      top: 10rpx;
      right: 50rpx;
      z-index: 3;
      color: rgba(255, 255, 255, 0.5);
    }
    .edit-btn,
    .delete-btn {
      position: absolute;
      top: 10px;
      background-color: #006b52;
      border: none;
      color: #fff;
      font-size: 16px;
      text-align: center;
      border-radius: 5px;
      z-index: 3;
    }

    .delete-btn {
      right: 165rpx;
      background-color: #92181b;
    }

    .edit-btn {
      right: 25rpx;
    }
  }
}
</style>
