<template>
  <view class="form-container">
    <view class="form-title">{{ queryId ? "编辑课程" : "新建课程" }}</view>

    <uni-forms
      :modelValue="formData"
      ref="formRef"
      :rules="rules"
      @submit="submitForm"
      label-position="top"
      label-width="100">
      <!-- 星期几选择 -->
      <uni-forms-item name="day" label="请选择周几" required>
        <picker
          @change="onDayChange"
          :value="dayIndex"
          :range="dayList"
          range-key="text">
          <view class="form-input">{{ formData.day }}</view>
        </picker>
      </uni-forms-item>

      <!-- 时间选择 -->
      <uni-forms-item name="startTime" label="请选择课程开始时间" required>
        <picker
          mode="time"
          :value="formData.startTime"
          start="00:00"
          end="24:00"
          @change="($event) => onTimeChange($event, 'start')">
          <view class="form-input">
            {{ formData.startTime }}
          </view>
        </picker>
      </uni-forms-item>
      <uni-forms-item name="endTime" label="请选择课程结束时间" required>
        <picker
          mode="time"
          :value="formData.endTime"
          @change="($event) => onTimeChange($event, 'end')">
          <view class="form-input">
            {{ formData.endTime }}
          </view>
        </picker>
      </uni-forms-item>

      <!-- 课程种类选择 -->
      <uni-forms-item name="courseType" label="请选择课程种类" required>
        <picker
          mode="selector"
          :range="courseTypes"
          @change="onCourseTypeChange"
          range-key="text">
          <view class="form-input">
            {{ formData.courseType }}
          </view>
        </picker>
      </uni-forms-item>

      <!-- 课程难度 -->
      <uni-forms-item
        class="form-item"
        name="courseLevel"
        label="请选择课程难度"
        required>
        <picker
          mode="selector"
          :range="courseLevels"
          @change="onCourseLevelChange"
          range-key="text">
          <view class="form-input">
            {{ formData.courseLevel }}
          </view>
        </picker>
      </uni-forms-item>

      <!-- 单选框组：选择已有老师 or 新增老师 -->
      <uni-forms-item name="addTeacherType" label="上课老师选项" required>
        <radio-group name="group1" @change="onaddTeacherTypeChange">
          <label
            class="radio mr-40"
            v-for="item in radioList"
            :key="item.value">
            <radio :value="item.value" :checked="item.checked">
              {{ item.name }}
            </radio>
          </label>
        </radio-group>
      </uni-forms-item>

      <!-- 课程老师选择 如果老师不在列表中 请在下面的表单中输入老师信息 -->
      <uni-forms-item
        v-if="formData.addTeacherType === 'existing'"
        name="teacher"
        label="请选择上课老师">
        <picker
          mode="selector"
          :range="teachers.map((t) => t.name)"
          @change="onTeacherChange">
          <view class="form-input">
            {{ formData.selectedTeacherName }}
          </view>
        </picker>
      </uni-forms-item>
      <view v-if="formData.selectedTeacherName" class="teacher-preview">
        <image :src="formData.selectedTeacherPic" class="teacher-image" />
      </view>

      <uni-forms-item
        class="form-item"
        name="courseLevel"
        label="请输入上课老师名称"
        v-if="formData.addTeacherType === 'new'">
        <input class="form-input" v-model="formData.courseTeacherName" />
      </uni-forms-item>

      <!-- 课程老师图片上传 -->
      <uni-forms-item
        class="form-item"
        name="courseLevel"
        label="请上传老师图片"
        v-if="formData.addTeacherType === 'new'">
        <uni-file-picker
          fileMediatype="image"
          :limit="1"
          @success="onImageUploadSuccess"></uni-file-picker>
      </uni-forms-item>

      <!-- 操作按钮 -->
      <view class="form-buttons">
        <button class="cancel-btn" @click="cancelForm">取消</button>
        <button class="submit-btn" @click="submitForm">提交</button>
      </view>
    </uni-forms>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { onReady, onLoad } from "@dcloudio/uni-app";
import { formatTimestampToHHMM } from "../../common/util";

const db = uniCloud.database();
interface Teacher {
  name: string;
  courseTeacherPic: string;
}

let queryId = ref(); // 传过来的_id

onReady(() => {
  // 设置自定义表单校验规则，必须在节点渲染完毕后执行
  if (formRef.value) {
    formRef.value.setRules(rules);
  } else {
    console.error("formRef 未正确绑定");
  }
});

const formData = reactive({
  day: null,
  startTime: null,
  endTime: null,
  courseType: "",
  courseLevel: "",
  addTeacherType: null, // 默认选项为已有老师
  selectedTeacherName: "",
  selectedTeacherPic: "",
  courseTeacherName: "",
  courseTeacherPic: "",
});
const formRef = ref(null);
const teachers = ref<Teacher[]>([]);

const rules = {
  day: {
    rules: [{ required: true, errorMessage: "请选择星期几" }],
  },
  startTime: {
    rules: [{ required: true, errorMessage: "请选择开始时间" }],
  },
  endTime: {
    rules: [{ required: true, errorMessage: "请选择结束时间" }],
  },
  courseType: {
    rules: [{ required: true, errorMessage: "请选择课程种类" }],
  },
  courseLevel: {
    rules: [{ required: true, errorMessage: "请选择课程种类" }],
  },
  addTeacherType: {
    rules: [{ required: true, errorMessage: "请选择上课老师选项" }],
  },
};

let radioList = ref([
  { name: "选择已有的老师", value: "existing", checked: false },
  { name: "新增上课老师", value: "new", checked: false },
]);

const radioChange = (e) => {
  let radioItems = radioList.value;
  for (let i = 0, len = radioItems.length; i < len; ++i) {
    radioItems[i].checked = radioItems[i].value === e.detail.value;
  }
  radioList.value = radioItems;
};

const dayList = ref([
  { value: "周一", text: "周一" },
  { value: "周二", text: "周二" },
  { value: "周三", text: "周三" },
  { value: "周四", text: "周四" },
  { value: "周五", text: "周五" },
  { value: "周六", text: "周六" },
  { value: "周日", text: "周日" },
]);
const courseTypes = ref([
  { value: "Kpop", text: "Kpop" },
  { value: "Hiphop", text: "Hiphop" },
  { value: "Jazz", text: "Jazz" },
  { value: "编舞", text: "编舞" },
  { value: "Heel", text: "Heel" },
  { value: "国风", text: "国风" },
]);
const courseLevels = ref([
  { value: "入门", text: "入门" },
  { value: "基础", text: "基础" },
  { value: "进阶", text: "进阶" },
]);

const selectedTeacher = ref<Teacher | null>(null);
const timeRange = ref<{ start: string; end: string }>({ start: "", end: "" });
const dayIndex = ref(0); // 默认选中第一个，可改为 -1 表示未选中

const onDayChange = (e) => {
  const index = e.detail.value;
  formData.day = dayList.value[index].text; // 根据索引获取对应的 `text`
  dayIndex.value = index; // 更新当前索引
};
// const emit = defineEmits(["refreshList"]);

const onaddTeacherTypeChange = (e) => {
  console.log("heart-", e.detail);
  formData.addTeacherType = e.detail.value; // 获取选中的值
  let radioItems = radioList.value;
  for (let i = 0, len = radioItems.length; i < len; ++i) {
    radioItems[i].checked = radioItems[i].value === e.detail.value;
  }
  radioList.value = radioItems;
  formData.courseTeacherName = "";
  formData.courseTeacherPic = "";
  formData.selectedTeacherName = "";
  formData.selectedTeacherPic = "";
};

// 选择教师
const onTeacherChange = (event: any) => {
  const index = event.detail.value; // 获取选中索引
  formData.selectedTeacherName = teachers.value[index].name;
  formData.selectedTeacherPic = teachers.value[index].courseTeacherPic;
};
// 课程种类
const onCourseTypeChange = (e: any) => {
  const index = e.detail.value;
  formData.courseType = courseTypes.value[index].text; // 根据索引获取对应的 `text`
};
// 课程难度
const onCourseLevelChange = (e: any) => {
  const index = e.detail.value;
  formData.courseLevel = courseLevels.value[index].text; // 根据索引获取对应的 `text`
};

// 处理图片上传
const onImageUploadSuccess = (res) => {
  // res.file.url 是上传成功后的云存储地址
  formData.courseTeacherPic = res.tempFilePaths[0];
  console.log("Uploaded image URL: ", res);
};

const getTimestamp = (value) => {
  const [hours, minutes] = value.split(":").map(Number);

  // 将时间字符串转换为当日的时间戳
  const currentDate = new Date();
  const timestamp = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    hours,
    minutes,
    0,
    0
  ).getTime();
  return timestamp;
};
const onTimeChange = (event: any, type: "start" | "end") => {
  const value = event.detail.value; // 获取选中的时间字符串，如 "10:00"
  if (!value) return; // 防止无效输入
  // 更新表单数据
  if (type === "start") {
    formData.startTime = value; // 存储为时间戳
  } else if (type === "end") {
    formData.endTime = value; // 另一种时间
  }
};

const uploadImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ["original"],
    success: (res) => {
      formData.courseTeacherPic = res.tempFilePaths[0];
    },
  });
};

db.collection("teachers")
  .get()
  .then((res) => {
    console.log("teachers", res);
    if (res.result?.errCode === 0) {
      teachers.value = res.result.data;
    }
  });

const resetForm = () => {
  Object.keys(formData).forEach((key) => {
    formData[key] = key === "addTeacherType" ? null : ""; // 特殊处理 `addTeacherType`
  });

  // 单独处理 `radioList` 的逻辑
  radioList.value.forEach((item) => (item.checked = false));
};

const submitForm = () => {
  formRef.value
    .validate()
    .then(async (res) => {
      console.log("success", res, queryId.value);
      if (!formData.selectedTeacherName) {
        // 如果没有选择教师，检查名称和图片是否已填写
        if (!formData.courseTeacherName || !formData.courseTeacherPic) {
          uni.showToast({
            title: `请完善教师信息`,
            icon: "none", // 使用更清晰的提示样式
          });
          return; // 提前终止流程
        }
      }

      const collection = db.collection("class-schedule"); // 替换为你的云数据库集合名称

      const dataToSave = {
        day: formData.day,
        startTime: getTimestamp(formData.startTime),
        endTime: getTimestamp(formData.endTime),
        courseType: formData.courseType,
        courseLevel: formData.courseLevel,
        courseTeacherName:
          formData.selectedTeacherName || formData.courseTeacherName, // 如果未选择下拉框中的教师，使用手动输入的教师名
        courseTeacherPic: formData.selectedTeacherName
          ? formData.selectedTeacherPic
          : formData.courseTeacherPic, // 教师图片
      };
      uni.showLoading({
        mask: true,
      });
      let result;
      if (queryId.value) {
        // 编辑操作
        result = await collection.doc(queryId.value).update(dataToSave);
        console.log("result----update");
        if (result.updated === 1) {
          console.log("更新成功");
        } else {
          console.error("未找到对应记录或更新失败");
        }
      } else {
        result = await collection.add(dataToSave);
      }
      uni.hideLoading();
      if (!formData.selectedTeacherName) {
        const collectionTeacher = db.collection("teachers"); // 替换为你的云数据库集合名称
        const resu = await collectionTeacher.add({
          name: formData.courseTeacherName,
          courseTeacherPic: formData.courseTeacherPic,
        });
        console.log("resu", resu);
      }
      console.log("保存成功", result);

      uni.showToast({
        title: "提交成功",
        icon: "success",
      });
      // 清空表单数据
      resetForm();
      uni.$emit("refreshList", { msg: "更新列表" });
      uni.switchTab({
        url: "/pages/reserve/reserve",
      });
    })
    .catch((err) => {
      console.error("提交失败", err);
      uni.showToast({
        title: "提交失败，请重试",
        icon: "none",
      });
    });
};

const cancelForm = () => {
  uni.navigateBack();
};

const getDetail = async () => {
  let {
    result: { errCode, data },
  } = await db
    .collection("class-schedule")
    .where({
      _id: queryId.value,
    })
    .get({
      getOne: true,
    });
  if (errCode === 0) {
    // day: formData.day,
    // startTime: getTimestamp(formData.startTime),
    // endTime: getTimestamp(formData.endTime),
    // courseType: formData.courseType,
    // courseLevel: formData.courseLevel,
    // courseTeacherName:
    //   formData.selectedTeacherName || formData.courseTeacherName, // 如果未选择下拉框中的教师，使用手动输入的教师名
    // courseTeacherPic: formData.selectedTeacherName
    //   ? formData.selectedTeacherPic
    //   : formData.courseTeacherPic, // 教师图片
    console.log("data---", data);
    let dataCopy = JSON.parse(JSON.stringify(data));
    dataCopy.startTime = formatTimestampToHHMM(dataCopy.startTime);
    dataCopy.endTime = formatTimestampToHHMM(dataCopy.endTime);
    Object.assign(formData, dataCopy);
    for (let i = 0, len = radioList.value.length; i < len; ++i) {
      radioList.value[i].checked =
        radioList.value[i].value === data.addTeacherType;
    }
    if (data.addTeacherType === "existing") {
      formData.selectedTeacherName = data.courseTeacherName;
      formData.selectedTeacherPic = data.courseTeacherPic;
    } else {
      formData.courseTeacherName = data.courseTeacherName;
      formData.courseTeacherPic = data.courseTeacherPic;
    }
  }
  uni.hideLoading();
};

onLoad((e) => {
  queryId.value = e.id;
  if (e.id) {
    uni.showLoading({
      title: "加载中...",
    });
    getDetail();
    uni.setNavigationBarTitle({
      title: "编辑课表",
    });
  }
});
</script>

<style>
.uni-select {
  background-color: #fff;
}
.uni-forms-item {
  margin-bottom: 0px;
}
</style>
<style scoped lang="scss">
.form-container {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;

  .form-title {
    font-size: 22px;
    font-weight: bold;
    text-align: left;
    margin-bottom: 35rpx;
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
    height: 35rpx;
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

  // .upload-btn {
  //   padding: 6px 12px;
  //   background: #007aff;
  //   color: #fff;
  //   border-radius: 4px;
  //   text-align: center;
  //   font-size: 12px;
  // }

  .form-buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 24px;
  }
  .mr-10 {
    margin-right: 10px;
  }

  .submit-btn,
  .cancel-btn {
    width: 100%;
    padding: 14px;
    font-size: 16px;
    border-radius: 4px;
  }

  .submit-btn {
    background: #007aff;
    color: white;
  }

  .cancel-btn {
    margin-right: 20px;
  }
}
</style>
