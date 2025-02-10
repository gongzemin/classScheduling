const db = uniCloud.database();

exports.main = async (event, context) => {
  const { month, year, userId } = event;

  try {
    const startDate = new Date(year, month - 1, 1); //new Date().getFullYear()
    const endDate = new Date(year, month, 1);

    // 1. 查询用户预约记录
    const reserveRes = await db
      .collection("user-reserve")
      .where({
        user_id: userId,
        reserve_class_date: db.command
          .gte(startDate)
          .and(db.command.lt(endDate)),
        canceled: false,
      })
      .get();

    const reserveList = reserveRes.data;
    const totalCourses = reserveRes.affectedDocs;

    if (reserveList.length === 0) {
      return {
        code: 0,
        data: {
          totalCourses: 0,
          trainingDays: 0,
          dailyCourses: [],
          courseDistribution: [],
        },
      };
    }

    // 2. 提取 class_id 列表，去重以减少查询
    const classIdList = [...new Set(reserveList.map((item) => item.class_id))];

    // 3. 查询课程信息
    const classRes = await db
      .collection("class-schedule")
      .where({
        _id: db.command.in(classIdList),
      })
      .get();

    const classMap = {};
    classRes.data.forEach((cls) => {
      classMap[cls._id] = {
        courseType: cls.courseType,
        courseLevel: cls.courseLevel,
      };
    });

    // 4. 数据统计
    const dailyCount = {};
    const typeLevelCount = {};
    const trainingDaysSet = new Set();

    reserveList.forEach((item) => {
      const dateKey = item.reserve_class_date.toISOString().split("T")[0];

      // 统计每日课程节数
      if (dailyCount[dateKey]) {
        dailyCount[dateKey]++;
      } else {
        dailyCount[dateKey] = 1;
      }

      // 记录训练天数
      trainingDaysSet.add(dateKey);

      // 统计课程种类和难度
      const classInfo = classMap[item.class_id] || {};
      const typeLevelKey = `${classInfo.courseType || "未知"}${
        classInfo.courseLevel || "未知"
      }`;

      if (typeLevelCount[typeLevelKey]) {
        typeLevelCount[typeLevelKey]++;
      } else {
        typeLevelCount[typeLevelKey] = 1;
      }
    });

    // 5. 格式化数据
    const dailyCourses = Object.keys(dailyCount).map((key) => ({
      date: key,
      count: dailyCount[key],
    }));

    const courseDistribution = Object.keys(typeLevelCount).map((key) => ({
      name: key,
      value: typeLevelCount[key],
    }));

    return {
      code: 0,
      data: {
        totalCourses,
        trainingDays: trainingDaysSet.size,
        dailyCourses,
        courseDistribution,
      },
    };
  } catch (error) {
    return {
      code: 1,
      message: "获取数据失败",
      error,
    };
  }
};
