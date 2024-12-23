<template>
  <view class="reserve-btn-wrapper">
    <button
      class="reserve-btn"
      @click.stop="bookCourse"
      :class="{
        active:
          buttonStatus.includes('预约') && buttonStatus !== '暂未开放预约',
        ing: buttonStatus === '进行中',
      }"
      :disabled="buttonStatus == '已结束' || buttonStatus == '暂未开放预约'">
      {{ buttonStatus }}
    </button>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { parseTimeToMinutes } from "../../common/util";
import { onLoad } from "@dcloudio/uni-app";

const userInfo = uni.getStorageSync("userInfo");
const emit = defineEmits(["book"]);
const props = defineProps({
  courseInfo: {
    type: Object,
    default: () => {},
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

console.log("props.courseInfo----", props.courseInfo);
// 拆分开始时间和结束时间
const [startTime, endTime] = props.courseInfo.time
  .split("-")
  .map(parseTimeToMinutes);

// 获取按钮状态
const buttonStatus = computed(() => {
  // 检查 props.courseInfo.isoDate 是否有效
  if (!props.courseInfo.isoDate) {
    return "加载中"; // 还没有加载到有效日期时的状态
  }

  if (props.courseInfo.isReserved) {
    return "取消预约";
  } else {
    return getBtnStatusBaseDate();
  }
});

const getBtnStatusBaseDate = () => {
  const currentMinutes = now.value.getHours() * 60 + now.value.getMinutes(); // 当前时间分钟数
  let classDate = new Date(props.courseInfo.isoDate);
  const diffDays = Math.floor(
    (classDate.getTime() - today.value.getTime()) / (1000 * 60 * 60 * 24)
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
};

// 用户预约时的校验逻辑
function checkMembershipValidity(expirationDate) {
  const now = Date.now(); // 当前时间戳
  const expirationTimestamp = new Date(expirationDate).getTime(); // 转换为时间戳

  if (now < expirationTimestamp) {
    return true; // 返回成功标志
  } else {
    // 会员卡已过期
    uni.showToast({
      title: "会员卡已过期",
      icon: "none",
    });
    return false; // 返回失败标志
  }
}

/**
 * 检查用户次卡剩余次数
 * @param {string} userId - 用户ID
 * @param {Object} db - 数据库实例
 * @returns {Promise<boolean>} 是否有足够的剩余次数
 * @throws {Error} 用户不存在或次卡不足
 */
async function checkRemainingSessions(userId) {
  const db = uniCloud.database();
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
  // 取消预约就不要判断次数是不是为0 不然为0次就没法取消
  if (remainingSessions <= 0 && buttonStatus.value === "预约") {
    uni.showToast({
      title: "卡剩余次数不足",
    });
    uni.hideLoading();
    return false;
  }
  return true;
}

// 点击事件
const bookCourse = async () => {
  console.log("inner");
  if (!userInfo || (userInfo && !userInfo.mobile)) {
    uni.navigateTo({
      url: "/pages/login/login",
    });
  } else {
    const { expirationDate, cardType, userId } = userInfo;
    // 预约时调用
    console.log("expirationDate", expirationDate);
    if (checkMembershipValidity(expirationDate)) {
      if (cardType === "sessionCard") {
        const hasSessions = await checkRemainingSessions(userId);
        if (!hasSessions) {
          return;
        }
      }
      emit("book", buttonStatus.value);
    } else {
      console.log("预约失败");
    }
  }
};
</script>

<style lang="scss">
.reserve-btn-wrapper {
  // position: absolute;
  // bottom: 0;
  width: 95vw;
  height: 160rpx;
  .reserve-btn {
    font-size: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    border: none;
    width: 100%;
    height: 90rpx;
  }
  .reserve-btn.active {
    background-color: #ff6600;
    //rgba(0, 56, 0, 0.9)
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
}
</style>
