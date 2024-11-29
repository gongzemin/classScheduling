<template>
  <view class="form-container">
    <text class="form-title">新建课程</text>

    <!-- 星期几选择 -->
    <view class="form-item">
      <text class="form-label">选择周几</text>
      <picker mode="multiSelector" :range="weekdays" @change="onWeekdaysChange">
        <view class="form-input">
          {{
            selectedWeekdays.length > 0
              ? selectedWeekdays.join("、")
              : "请选择星期几（必填）"
          }}
        </view>
      </picker>
    </view>

    <!-- 时间选择 -->
    <view class="form-item">
      <text class="form-label">开始时间</text>
      <picker mode="time" @change="onTimeChange('start')">
        <view class="form-input">
          {{ timeRange.start || "请选择开始时间（必填）" }}
        </view>
      </picker>
    </view>
    <view class="form-item">
      <text class="form-label">结束时间</text>
      <picker mode="time" @change="onTimeChange('end')">
        <view class="form-input">
          {{ timeRange.end || "请选择结束时间（必填）" }}
        </view>
      </picker>
    </view>

    <!-- 课程列表选择 -->
    <view class="form-item">
      <text class="form-label">课程列表</text>
      <picker mode="selector" :range="courseTypes" @change="onCourseTypeChange">
        <view class="form-input">
          {{ selectedCourseType || "请选择课程种类（必填）" }}
        </view>
      </picker>
    </view>

    <!-- 课程名称 -->
    <view v-if="!selectedCourseType" class="form-item">
      <text class="form-label">课程名称</text>
      <input
        class="form-input"
        placeholder="请输入课程名称（必填）"
        v-model="courseName" />
    </view>

    <!-- 课程老师 -->
    <!-- 课程老师选择 -->
    <view class="form-item">
      <text class="form-label">课程老师</text>
      <picker
        mode="selector"
        :range="teachers.map((t) => t.name)"
        @change="onTeacherChange">
        <view class="form-input">
          {{ selectedTeacher?.name || "请选择课程老师" }}
        </view>
      </picker>
    </view>
    <view v-if="selectedTeacher" class="teacher-preview">
      <image :src="selectedTeacher.image" class="teacher-image" />
    </view>

    <view v-if="!selectedCourseType" class="form-item">
      <text class="form-label">课程老师</text>
      <input
        class="form-input"
        placeholder="请输入课程老师名称（必填）"
        v-model="teacherName" />
    </view>

    <!-- 课程老师图片上传 -->
    <view class="form-item">
      <text class="form-label">课程老师图片</text>
      <button @click="uploadImage" class="upload-btn">上传图片</button>
      <view v-if="uploadedImage" class="teacher-preview">
        <image :src="uploadedImage" class="teacher-image" />
      </view>
    </view>

    <!-- 课程难度 -->
    <view class="form-item">
      <text class="form-label">课程难度</text>
      <picker
        mode="selector"
        :range="difficultyLevels"
        @change="onDifficultyChange">
        <view class="form-input">
          {{ selectedDifficulty || "请选择课程难度（必填）" }}
        </view>
      </picker>
    </view>

    <!-- 操作按钮 -->
    <view class="form-buttons">
      <button class="submit-btn" @click="submitForm">提交</button>
      <button class="cancel-btn" @click="cancelForm">取消</button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const courseTypes = ref([
  "Kpop入门",
  "Kpop",
  "Hiphop入门",
  "Hiphop基础",
  "Hiphop进阶",
  "Jazz入门",
  "Jazz基础",
  "Jazz进阶",
]);

interface Teacher {
  name: string;
  image: string;
}

const teachers = ref<Teacher[]>([
  { name: "张老师", image: "/static/teacher1.png" },
  { name: "李老师", image: "/static/teacher2.png" },
]);

const weekdays = ref(["周一", "周二", "周三", "周四", "周五", "周六", "周日"]);
const difficultyLevels = ref(["0星", "1星", "2星", "3星"]);
const selectedTeacher = ref<Teacher | null>(null);
const selectedCourseType = ref<string>("");
const courseName = ref<string>("");
const teacherName = ref<string>("");
const uploadedImage = ref<string>("");
const selectedWeekdays = ref<string[]>([]);
const timeRange = ref<{ start: string; end: string }>({ start: "", end: "" });
const selectedDifficulty = ref<string>("");

// 方法
const onTeacherChange = (e: any) => {
  selectedTeacher.value = teachers.value[e.detail.value];
};

const onCourseTypeChange = (e: any) => {
  selectedCourseType.value = courseTypes.value[e.detail.value];
};

const onWeekdaysChange = (e: any) => {
  selectedWeekdays.value = e.detail.value.map(
    (index: number) => weekdays.value[index]
  );
};

const onTimeChange = (type: "start" | "end") => (e: any) => {
  timeRange.value[type] = e.detail.value;
};

const onDifficultyChange = (e: any) => {
  selectedDifficulty.value = difficultyLevels.value[e.detail.value];
};

const uploadImage = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      uploadedImage.value = res.tempFilePaths[0];
    },
  });
};

const submitForm = () => {
  if (
    (!selectedCourseType.value && (!courseName.value || !teacherName.value)) ||
    selectedWeekdays.value.length === 0 ||
    !timeRange.value.start ||
    !timeRange.value.end ||
    !selectedDifficulty.value
  ) {
    uni.showToast({
      title: "请填写完整信息！",
      icon: "none",
    });
    return;
  }

  console.log("提交数据", {
    courseType: selectedCourseType.value,
    courseName: courseName.value,
    teacherName: teacherName.value,
    uploadedImage: uploadedImage.value,
    weekdays: selectedWeekdays.value,
    timeRange: timeRange.value,
    difficulty: selectedDifficulty.value,
  });

  uni.showToast({
    title: "提交成功！",
    icon: "success",
  });
};

const cancelForm = () => {
  uni.navigateBack();
};
</script>

<style scoped>
.form-container {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.form-title {
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 24px;
}

.form-item {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.form-input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
}

.teacher-preview {
  margin-top: 8px;
}

.teacher-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.upload-btn {
  padding: 6px 12px;
  background: #007aff;
  color: #fff;
  border-radius: 4px;
  text-align: center;
  font-size: 12px;
}

.form-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}

.submit-btn,
.cancel-btn {
  flex: 1;
  padding: 14px;
  margin: 0 8px;
  font-size: 16px;
  border-radius: 4px;
}

.submit-btn {
  background: #28a745;
  color: white;
}

.cancel-btn {
  background: #dc3545;
  color: white;
}
</style>
