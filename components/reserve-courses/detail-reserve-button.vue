<template>
  <view class="reserve-btn-wrapper">
    <button
      class="reserve-btn"
      @click.stop="bookCourse"
      :class="{
        active:
          buttonStatus.includes('预约') && buttonStatus !== '暂未开放预约',
        ing: buttonStatus === '进行中',
        waitlist: buttonStatus.includes('候补'),
      }"
      :disabled="
        buttonStatus == '已结束' ||
        buttonStatus == '课程已取消' ||
        buttonStatus == '暂未开放预约'
      ">
      {{ buttonStatus }}
    </button>
  </view>
</template>

<script setup>
import {  computed } from "vue";
import { parseTimeToMinutes } from "../../common/util.js";

const db = uniCloud.database();
const userInfo = uni.getStorageSync("userInfo");
const emit = defineEmits(["book"]);
const props = defineProps({
  courseInfo: {
    type: Object,
    default: () => {},
  },
  isFull: {
    type: Boolean,
    default: false,
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

// 拆分开始时间和结束时间
const [startTime, endTime] = props.courseInfo.time
  ? props.courseInfo.time.split("-").map(parseTimeToMinutes)
  : [];

// 获取按钮状态
const buttonStatus = computed(() => {
  // 检查 props.courseInfo.isoDate 是否有效
  if (!props.courseInfo.isoDate) {
    return "加载中";
  }
  if (props.courseInfo.isCourseCancelled) {
    return "课程已取消";
  }

  console.log("props.courseInfo.isReserved", props.courseInfo);
  // ✅ 1. 若已预约
  if (props.courseInfo.isReserved) {
    return "取消预约";
  }

  if (props.courseInfo.isWaited) {
    return "取消候补";
  }

  // ✅ 2. 若课程已满（isFull=true）
  if (props.isFull) {
    return "候补";
  }

  // ✅ 3. 默认逻辑：正常状态
  return getBtnStatusBaseDate();
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

const checkMembershipValidity = async () => {
  try {
    const { result } = await db
      .collection("user-membership-card")
      .where({ user_id: userInfo.userId })
      .field("expirationDate,_id,remainingSessions")
      .get({ getOne: true });

    const cardData = result?.data || {};
    if (!cardData._id) {
      uni.showToast({ title: "未找到会员卡", icon: "none" });
      return null;
    }

    // 更新缓存
    const existingUserInfo = uni.getStorageSync("userInfo") || {};
    const updatedInfo = {
      ...existingUserInfo,
      cardId: cardData._id,
      remainingSessions: cardData.remainingSessions,
    };
    uni.setStorageSync("userInfo", updatedInfo);

    const expirationTimestamp = new Date(
      cardData.expirationDate || 0
    ).getTime();
    if (Date.now() > expirationTimestamp) {
      uni.showToast({ title: "会员卡已过期", icon: "none" });
      return null;
    }

    return cardData; // ✅ 返回卡信息对象
  } catch (error) {
    console.error("校验会员卡失败", error);
    uni.showToast({ title: "校验失败，请稍后重试", icon: "none" });
    return null;
  }
};

/**
 * 检查用户次卡剩余次数
 * @param {number} remainingSessions - 次卡剩余次数
 * @returns {Promise<boolean>} 是否有足够的剩余次数
 */
async function checkRemainingSessions(remainingSessions) {
  // “取消预约”状态不检查次数，否则为 0 次就无法取消
  if (["预约", "候补"].includes(buttonStatus.value)) {
    if (remainingSessions <= 0) {
      uni.showToast({
        title:
          buttonStatus.value === "候补"
            ? "卡剩余次数不足，无法候补"
            : "卡剩余次数不足，无法预约",
        icon: "none",
      });
      return false;
    }
  }

  return true;
}

const bookCourse = async () => {
  if (!userInfo?.mobile) {
    uni.navigateTo({
      url: "/pages/login/login",
    });
    return;
  }

  const currentStatus = buttonStatus.value ?? "";
  const isCancel = ["取消预约", "取消候补"].includes(currentStatus);

  // 取消预约/取消候补： 不校验会员卡
  if (isCancel) {
    emit("book", currentStatus);
    return;
  }

  const { cardType, userId } = userInfo;
  // 校验会员有效性
  const cardData = await checkMembershipValidity();
  if (!cardData) return;

  // ✅ 若是“预约”或“候补”，都需要校验次数
  if (["预约", "候补"].includes(currentStatus)) {
    if (cardType === "sessionCard") {
      const hasSessions = await checkRemainingSessions(
        cardData.remainingSessions
      );
      if (!hasSessions) {
        return;
      }
    }
    // 候补或预约都 emit
    emit("book", currentStatus);
    return;
  }

  // 其他状态（已结束、暂未开放预约等）不操作
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
  .reserve-btn.waitlist {
    background-color: #0b6309;
    color: #fff;
  }
}
</style>
