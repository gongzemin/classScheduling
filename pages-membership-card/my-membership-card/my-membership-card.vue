<template>
  <view class="my-member">
    <view class="title">我的会员卡</view>

    <!-- 当前会员卡 -->
    <MemberCard
      v-if="currentCard"
      :cardType="currentCard.cardType"
      :validityPeriod="currentCard.validityPeriod"
      :totalSessions="currentCard.totalSessions"
      :remainingSessions="currentCard.remainingSessions"
      :startDate="currentCard.startDate"
      :expirationDate="currentCard.expirationDate" />

    <view v-if="historyCards.length">
      <view class="history-title">历史会员卡</view>
      <MemberCard
        v-for="(card, index) in historyCards"
        :key="index"
        :cardType="card.cardType"
        :validityPeriod="card.validityPeriod"
        :totalSessions="card.totalSessions"
        :remainingSessions="card.remainingSessions"
        :startDate="card.startDate"
        :expirationDate="card.expirationDate" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import MemberCard from "./MemberCard.vue";
import { formatISOToFullDateTime } from "../../common/util.js";

const userInfo = uni.getStorageSync("userInfo");

// 定义 Card 类型
interface Card {
  cardType: string;
  validityPeriod: string;
  totalSessions?: number;
  remainingSessions?: number;
  startDate: string;
  expirationDate: string;
  historyCards?: Card[]; // 如果有历史会员卡字段
}

// 使用 reactive 定义 currentCard 和 historyCards
// 使用 reactive 定义 currentCard，默认是一个空对象
const currentCard = reactive<Card>({
  cardType: "",
  validityPeriod: "",
  totalSessions: 0,
  remainingSessions: 0,
  startDate: "",
  expirationDate: "",
  historyCards: [],
});
const historyCards = ref<Card[]>([]);

onMounted(async () => {
  try {
    const db = uniCloud.database();
    uni.showLoading({
      mask: true,
    });
    const res = await db
      .collection("user-membership-card")
      .where({ user_id: userInfo.userId })
      .orderBy("expirationDate", "desc")
      .get({
        getOne: true,
      });
    uni.hideLoading();
    if (res.result.errCode === 0 && res.result.data) {
      // 当前会员卡
      const { startDate, expirationDate } = res.result.data;
      console.log("sssss", res.result.data);
      Object.assign(currentCard, res.result.data);
      // 格式化当前会员卡的有效期和开始日期
      currentCard.expirationDate = formatISOToFullDateTime(expirationDate);
      currentCard.startDate = formatISOToFullDateTime(startDate);

      // 如果表中包含历史会员卡字段，直接赋值
      historyCards.value =
        currentCard.historyCards?.map((card) => {
          card.expirationDate = formatISOToFullDateTime(card.expirationDate);
          card.startDate = formatISOToFullDateTime(card.startDate);
          return card;
        }) || [];
    }
  } catch (error) {
    console.error("会员卡查询失败:", error);
  }
});
</script>

<style scoped lang="scss">
.my-member {
  padding: 30rpx;
  .title {
    font-size: 36rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
    color: #333;
    padding: 0 15rpx;
  }

  .history-title {
    font-size: 32rpx;
    font-weight: bold;
    margin-top: 40rpx;
    color: #555;
    padding: 0 15rpx;
  }
}
</style>
