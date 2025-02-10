module.exports = {
  // 云对象初始化
  _before: function () {
    console.log("云对象 bookCourse 开始执行");
  },

  /**
   * 预约课程方法
   * @param {Object} params - 参数对象
   * @param {string} params.userId - 用户ID
   * @param {string} params.avatar - 用户头像
   * @param {string} params.queryClassId - 课程ID
   * @param {string} params.clickDate - 预约课程上课日期
   * @param {string} params.cardType - 会员卡类型
   */
  async bookCourse(params) {
    const { userId, avatar, queryClassId, clickDate, cardId, cardType } =
      params;

    const db = uniCloud.database();
    const _ = db.command;
    const now = new Date();
    now.setHours(0, 0, 0, 0); // 设置为当天 00:00:00，确保只比较日期

    try {
      // 查询是否已存在预约记录
      const existingReservation = await db
        .collection("user-reserve")
        .where({
          user_id: userId,
          class_id: queryClassId,
          reserve_class_date: db.command.gte(now), // 筛选今天及未来的预约记录 不然过去预约了 现在就无法预约
        })
        .get();

      //uniCloud.logger.info("Existing Reservation Data", existingReservation);

      if (existingReservation.data.length > 0) {
        // 如果记录存在且已取消，将其恢复
        const reservation = existingReservation.data[0];
        if (reservation.canceled) {
          await db.collection("user-reserve").doc(reservation._id).update({
            canceled: false,
            reserve_class_date: clickDate,
            reserve_time: new Date().getTime(),
          });
        } else {
          return {
            code: 400,
            message: "该课程已预约，无需重复预约",
          };
        }
      } else {
        // 如果没有记录，则新增预约
        await db.collection("user-reserve").add({
          user_id: userId,
          class_id: queryClassId,
          reserve_class_date: clickDate,
          reserve_time: new Date().getTime(),
          canceled: false,
        });
      }

      // 处理次卡扣减逻辑
      if (cardType === "sessionCard") {
        await db
          .collection("user-membership-card")
          .doc(cardId)
          .update({
            remainingSessions: _.inc(-1),
          });
      }

      return {
        code: 200,
        message: "预约成功",
      };
    } catch (error) {
      console.error("预约失败", error);
      return {
        code: 500,
        message: "预约失败",
        error,
      };
    }
  },

  /**
   * 取消预约方法
   * @param {Object} params - 参数对象
   * @param {string} params.userId - 用户ID
   * @param {string} params.queryClassId - 课程ID
   * @param {string} params.cardType - 会员卡类型
   */
  async cancelCourse(params) {
    const { userId, queryClassId, cardType, cardId } = params;

    const db = uniCloud.database();
    const _ = db.command;

    try {
      // 将预约记录标记为已取消
      const result = await db
        .collection("user-reserve")
        .where({
          user_id: userId,
          class_id: queryClassId,
        })
        .update({
          canceled: true,
        });

      // 如果是次卡，增加剩余次数
      if (cardType === "sessionCard") {
        await db
          .collection("user-membership-card")
          .doc(cardId)
          .update({
            remainingSessions: _.inc(1),
          });
      }

      if (result.updated === 0) {
        return {
          code: 404,
          message: "未找到可取消的预约记录",
        };
      }

      return {
        code: 200,
        message: "取消预约成功",
      };
    } catch (error) {
      console.error("取消预约失败", error);
      return {
        code: 500,
        message: "取消预约失败",
        error,
      };
    }
  },
};
