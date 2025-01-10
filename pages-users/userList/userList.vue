<template>
  <view class="user-page">
    <!-- 查询条件 -->
    <view class="filters">
      <view class="row">
        <input
          v-model="filters.mobile"
          placeholder="输入手机号"
          clearable
          type="number" />
      </view>
      <view class="row">
        <picker
          mode="date"
          :value="filters.startDate"
          @change="onDateChange('startDate', $event)">
          <view class="picker">
            起始日期: {{ filters.startDate || "选择日期" }}
          </view>
        </picker>
        <picker
          mode="date"
          :value="filters.endDate"
          @change="onDateChange('endDate', $event)">
          <view class="picker">
            结束日期: {{ filters.endDate || "选择日期" }}
          </view>
        </picker>
      </view>
      <view class="row">
        <picker
          @change="onCardTypeChange"
          :range="cardTypeOptions"
          range-key="text">
          <view class="picker">
            {{
              filters.cardType === ""
                ? "全部会员卡类型"
                : cardTypeOptions.find(
                    (option) => option.value === filters.cardType
                  ).text
            }}
          </view>
        </picker>
        <button class="query-btn" @click="onSearch" :disabled="loading">
          查询
        </button>
      </view>
    </view>

    <!-- 用户列表 -->
    <view v-if="loading" class="loading">加载中...</view>
    <view v-else>
      <!-- 如果有用户数据 -->
      <view v-if="users.length > 0" class="user-list">
        <view class="user-card" v-for="user in users" :key="user._id">
          <image
            class="avatar"
            :src="user.userInfo.avatar"
            v-if="user.userInfo.avatar" />
          <image
            class="avatar"
            src="../../static/images/defAvatar.png"
            v-else />
          <view class="details" v-if="user.cardType">
            <view class="nickname">
              {{ user.userInfo.nickname }} {{ user.userInfo.mobile }}
            </view>
            <view class="flex">
              <view class="card-type mr-40">
                类型: {{ user.cardType === "timeCard" ? "时间卡" : "次卡" }}
              </view>
              <view
                class="remaining-sessions"
                v-if="user.cardType === 'sessionCard'">
                剩余次数: {{ user.remainingSessions || "N/A" }}
              </view>
            </view>

            <view class="status">
              状态: {{ user.status === 1 ? "正常" : "异常" }}
            </view>
            <view class="expiration-date">
              有效期至: {{ user.expirationDate }}
            </view>
          </view>
        </view>
        <!-- 分页 -->
        <view class="pagination">
          <button
            class="page-btn"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)">
            上一页
          </button>
          <view class="page-info">
            第 {{ currentPage }} / {{ totalPages }} 页 共{{ totalCount }}条
          </view>
          <button
            class="page-btn"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)">
            下一页
          </button>
        </view>
      </view>
      <!-- 如果没有用户数据 -->
      <view v-else class="no-data">无数据</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { formatISOToFullDateTime } from "../../common/util.js";

const db = uniCloud.database();

// 状态
const users = ref([]);
const currentPage = ref(1);
const pageSize = 5;

// 筛选条件
const filters = ref({
  mobile: "",
  startDate: "",
  endDate: "",
  cardType: "", // 默认选中 "全部"
});

// 卡类型选项（text-value 格式）
const cardTypeOptions = [
  { text: "全部", value: "" },
  { text: "时间卡", value: "timeCard" },
  { text: "次卡", value: "sessionCard" },
];

const totalCount = ref(0); // 总记录数
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize)); // 总页数
const loading = ref(false);
// 查询用户数据
async function fetchUsers() {
  if (loading.value) return;
  loading.value = true;
  // uni.showLoading();
  try {
    const skipCount = (currentPage.value - 1) * pageSize;

    // 获取 users 的结果
    const userQuery = await db
      .collection("users")
      .where({
        ...(filters.value.mobile && {
          mobile: new RegExp(`^${filters.value.mobile}`), // 模糊匹配手机号
        }),
      })
      .field("_id, avatar, nickname, mobile")
      .get();

    // 提取 user_id 列表
    const userIds = userQuery.result.data.map((user) => user._id);

    if (!userIds.length) {
      // 如果没有匹配到用户，直接返回空结果
      users.value = [];
      totalCount.value = 0;
      return;
    }
    console.log("userIds", userIds, filters.value);

    // 获取 user-membership-card 的数据，使用 user_id 过滤
    const membershipCardQuery = await db
      .collection("user-membership-card")
      .where({
        ...(filters.value.startDate &&
          filters.value.endDate && {
            expirationDate: db.command
              .gte(new Date(filters.value.startDate))
              .lte(new Date(filters.value.endDate)),
          }),
        ...(filters.value.cardType && { cardType: filters.value.cardType }), // 精确匹配
        user_id: db.command.in(userIds), // 根据 userIds 过滤
      })
      .orderBy("expirationDate asc")
      .skip(skipCount)
      .limit(pageSize)
      .field(
        "_id, user_id, cardType, remainingSessions, expirationDate, status"
      )
      .get();

    // 处理数据并更新到页面
    users.value = membershipCardQuery.result.data.map((card) => {
      const userInfo = userQuery.result.data.find(
        (user) => user._id === card.user_id
      );
      return {
        ...card,
        expirationDate: formatISOToFullDateTime(card.expirationDate),
        userInfo: userInfo || {}, // 将用户信息合并到结果中
      };
    });
    console.log("users.value", users.value);

    // 设置总记录数
    const res1 = await db
      .collection("user-membership-card")
      .where({
        ...(filters.value.startDate &&
          filters.value.endDate && {
            expirationDate: db.command
              .gte(new Date(filters.value.startDate))
              .lte(new Date(filters.value.endDate)),
          }),
        ...(filters.value.cardType && { cardType: filters.value.cardType }), // 精确匹配
        user_id: db.command.in(userIds), // 根据 userIds 过滤
      })
      .count();
    console.log("res1", res1);
    totalCount.value = res1.result.total;
  } catch (error) {
    console.error("查询失败:", error);
  } finally {
    loading.value = false;
  }
}

// 切换页码
function changePage(page) {
  currentPage.value = page;
  fetchUsers();
}

// 处理日期选择
function onDateChange(key, event) {
  filters.value[key] = event.detail.value;
  onSearch();
}

// 处理会员卡类型选择
function onCardTypeChange(event) {
  filters.value.cardType = cardTypeOptions[event.detail.value].value;
  onSearch();
}

const onSearch = () => {
  currentPage.value = 1;
  fetchUsers();
};
// 页面加载时获取数据
onMounted(fetchUsers);
</script>

<style lang="scss" scoped>
.user-page {
  padding: 16px;

  .filters {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;

    .row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: space-between;

      input {
        flex: 1;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }

      picker {
        flex: 1;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: #f9f9f9;
      }

      .query-btn {
        background: #007aff;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
          background: #005bb5;
        }
      }
    }
  }

  .user-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .user-card {
      display: flex;
      align-items: center;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #f9f9f9;

      .avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        margin-right: 12px;
      }

      .details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .nickname {
          font-size: 16px;
          font-weight: bold;
        }

        .card-type,
        .remaining-sessions,
        .status,
        .expiration-date {
          font-size: 14px;
          color: #666;
        }
      }
    }
  }
  .loading {
    text-align: center;
    color: #666;
    font-size: 16px;
    padding: 16px;
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 10px;

    .page-btn {
      padding: 4px 12px;
      background: #007aff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;

      &:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
    }

    .page-info {
      font-size: 14px;
      color: #666;
    }
  }
  .no-data {
    text-align: center;
    color: #666;
    font-size: 16px;
    padding: 16px;
  }
}
</style>
