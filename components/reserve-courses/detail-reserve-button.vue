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
import { ref, reactive, computed, watch } from "vue";
import { parseTimeToMinutes } from "../../common/util.js";
import { onLoad } from "@dcloudio/uni-app";

const db = uniCloud.database();
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

watch(
  () => props.courseInfo.isReserved,
  () => {
    console.log("props.courseInfo.isReserved", props.courseInfo.isReserved);
  }
);

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
const checkMembershipValidity = async () => {
  try {
    const { result } = await db
      .collection("user-membership-card")
      .where({ user_id: userInfo.userId })
      .field("expirationDate,_id")
      .get({ getOne: true });

    const cardData = result?.data || {};
    console.log("carD", cardData);
    const existingUserInfo = uni.getStorageSync("userInfo") || {};

    // 更新缓存中的 userInfo，避免 cardId 缺失
    uni.setStorageSync("userInfo", {
      ...existingUserInfo,
      cardId: cardData._id || "", // 防止 _id 为 undefined
    });

    const expirationTimestamp = new Date(
      cardData.expirationDate || 0
    ).getTime();
    const now = Date.now();

    if (now < expirationTimestamp) {
      return true; // 会员卡有效
    } else {
      // 会员卡过期提示
      uni.showToast({ title: "会员卡已过期", icon: "none" });
      return false;
    }
  } catch (error) {
    console.error("校验会员卡失败", error);
    uni.showToast({ title: "校验失败，请稍后重试", icon: "none" });
    return false;
  }
};

/**
 * 检查用户次卡剩余次数
 * @param {string} userId - 用户ID
 * @param {Object} db - 数据库实例
 * @returns {Promise<boolean>} 是否有足够的剩余次数
 * @throws {Error} 用户不存在或次卡不足
 */
async function checkRemainingSessions(remainingSessions) {
  console.log("remainingSessions", remainingSessions);
  // 取消预约就不要判断次数是不是为0 不然为0次就没法取消
  if (remainingSessions <= 0 && buttonStatus.value === "预约") {
    uni.showToast({
      title: "卡剩余次数不足",
    });
    return false;
  }
  return true;
}

// 点击事件
const bookCourse = async () => {
  console.log("inner", userInfo);
  if (!userInfo || (userInfo && !userInfo.mobile)) {
    uni.navigateTo({
      url: "/pages/login/login",
    });
  } else {
    const { cardType, userId } = userInfo;
    // 预约时调用
    if (checkMembershipValidity()) {
      if (cardType === "sessionCard") {
        const hasSessions = await checkRemainingSessions(
          userInfo.remainingSessions
        );
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
