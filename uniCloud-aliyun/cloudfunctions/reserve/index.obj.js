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
   * @param {string} params.cardId - 会员卡ID
   * @param {string} params.cardType - 会员卡类型
   */
  async bookCourse(params) {
    const { userId, avatar, queryClassId, clickDate, cardId, cardType } =
      params;
    const db = uniCloud.database();
    const _ = db.command;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    // 获取当天的起始时间
    const startOfDay = new Date(clickDate);
    startOfDay.setHours(0, 0, 0, 0); // 设置为当天 00:00:00.000

    // 获取当天的结束时间
    const endOfDay = new Date(clickDate);
    endOfDay.setHours(23, 59, 59, 999); // 设置为当天 23:59:59.999

    try {
      // 1. 获取课程信息
      const classInfo = await db
        .collection("class-schedule")
        .doc(queryClassId)
        .get();
      if (!classInfo.data.length) {
        return {
          code: 404,
          message: "未找到课程信息",
        };
      }
      uniCloud.logger.info("classInfo", classInfo);
      const classData = classInfo.data[0];
      const classCapacity = classData.capacity || 10;
      uniCloud.logger.info("params", queryClassId, clickDate);

      // 2. 获取已确认预约人数
      const confirmedCount = (
        await db
          .collection("user-reserve")
          .where({
            class_id: queryClassId,
            reserve_class_date: _.gte(startOfDay).and(db.command.lte(endOfDay)),
            canceled: false,
            status: "confirmed",
          })
          .count()
      ).total;
      uniCloud.logger.info("confirmedCount", confirmedCount);

      // 3. 检查用户是否已有预约
      const existingReservation = await db
        .collection("user-reserve")
        .where({
          user_id: userId,
          class_id: queryClassId,
          reserve_class_date: _.gte(startOfDay).and(db.command.lte(endOfDay)), // 筛选上课日期今天及以后的 同一个日期不存在相同课程ID的课 不然过去预约了 现在就无法预约
        })
        .get();
      uniCloud.logger.info("Existing Reservation Data", existingReservation);

      if (existingReservation.data.length > 0) {
        const reservation = existingReservation.data[0];
		// 这个提示如果出现 就是前端判断逻辑出现问题 如果预约又没取消 是无法预约的
        if (!reservation.canceled) {
          return {
            code: 400,
            message: "该课程已预约，无需重复预约",
          };
        }

        // 曾取消过 → 恢复预约
        const newStatus =
          confirmedCount < classCapacity ? "confirmed" : "waitlist";

        // 如果是候补状态,需要计算候补位置
        let updateData = {
          canceled: false,
          reserve_class_date: clickDate,
          reserve_time: Date.now(),
          status: newStatus,
        };

        if (newStatus === "waitlist") {
          // 获取当前候补队列人数
          const waitlistCount = (
            await db
              .collection("user-reserve")
              .where({
                class_id: queryClassId,
                reserve_class_date: _.gte(startOfDay).and(
                  db.command.lte(endOfDay)
                ),
                status: "waitlist",
                canceled: false,
              })
              .count()
          ).total;

          updateData.waitlist_position = waitlistCount + 1;
        } else {
          // 如果是确认状态,清空候补位置
          updateData.waitlist_position = null;
        }

        await db
          .collection("user-reserve")
          .doc(reservation._id)
          .update(updateData);

        uniCloud.logger.info(
          "恢复预约状态",
          newStatus,
          updateData.waitlist_position
        );

        // 扣减次卡(仅确认状态)
        if (cardType === "sessionCard" && newStatus === "confirmed") {
          await db
            .collection("user-membership-card")
            .doc(cardId)
            .update({
              remainingSessions: _.inc(-1),
            });
        }

        return {
          code: 200,
          message:
            newStatus === "confirmed" ? "预约成功" : "课程已满,已进入候补名单",
          status: newStatus,
          waitlist_position: updateData.waitlist_position, // 返回候补位置信息
        };
      }

      // 4. 新预约
      let newReservationData = {
        user_id: userId,
        class_id: queryClassId,
        reserve_class_date: clickDate,
        reserve_time: Date.now(),
        canceled: false,
      };

      if (confirmedCount >= classCapacity) {
        const waitlistCount = (
          await db
            .collection("user-reserve")
            .where({
              class_id: queryClassId,
              reserve_class_date: _.gte(startOfDay).and(
                db.command.lte(endOfDay)
              ),
              status: "waitlist",
            })
            .count()
        ).total;
        uniCloud.logger.info("waitlistCount", waitlistCount);

        newReservationData.status = "waitlist";
        newReservationData.waitlist_position = waitlistCount + 1;
      } else {
        newReservationData.status = "confirmed";
        newReservationData.waitlist_position = null;
      }

      const addRes = await db
        .collection("user-reserve")
        .add(newReservationData);

      // 5. 扣减次卡
      if (
        cardType === "sessionCard" &&
        newReservationData.status === "confirmed"
      ) {
        await db
          .collection("user-membership-card")
          .doc(cardId)
          .update({
            remainingSessions: _.inc(-1),
          });
      }

      return {
        code: 200,
        message:
          newReservationData.status === "waitlist"
            ? "课程已满，已进入候补名单"
            : "预约成功",
        status: newReservationData.status,
        reservation_id: addRes.id,
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
   * @param {Object} params
   * @param {string} params.userId
   * @param {string} params.queryClassId
   * @param {string} params.cardType
   * @param {string} params.cardId
   */
  async cancelCourse(params) {
    const { userId, queryClassId, cardType, clickDate, cardId } = params;
    const db = uniCloud.database();
    const _ = db.command;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    // 获取当天的起始时间
    const startOfDay = new Date(clickDate);
    startOfDay.setHours(0, 0, 0, 0); // 设置为当天 00:00:00.000

    // 获取当天的结束时间
    const endOfDay = new Date(clickDate);
    endOfDay.setHours(23, 59, 59, 999); // 设置为当天 23:59:59.999

    try {
      // 1️ 查找有效预约记录
      const reservationRes = await db
        .collection("user-reserve")
        .where({
          user_id: userId,
          class_id: queryClassId,
          canceled: false,
          reserve_class_date: _.gte(startOfDay).and(db.command.lte(endOfDay)),
        })
        .get();
      console.log("reservationRes", reservationRes);
      if (!reservationRes.data.length) {
        return { code: 404, message: "未找到可取消的预约记录" };
      }

      const reservation = reservationRes.data[0];

      // 2️ 标记为取消
      await db.collection("user-reserve").doc(reservation._id).update({
        canceled: true,
      });

      let promotedUser = null;

      // 3️ 如果是 confirmed 状态 → 候补转正
      if (reservation.status === "confirmed") {
        const nextWaitlist = await db
          .collection("user-reserve")
          .where({
            class_id: queryClassId,
            canceled: false,
            status: "waitlist",
          })
          .orderBy("waitlist_position", "asc")
          .limit(1)
          .get();

        if (nextWaitlist.data.length) {
          const nextUser = nextWaitlist.data[0];
          const nextUserCheck = await db
            .collection("user-reserve")
            .doc(nextUser._id)
            .get();

          if (nextUserCheck.data[0]?.status === "waitlist") {
            // 转正第一个候补用户
            await db.collection("user-reserve").doc(nextUser._id).update({
              status: "confirmed",
              waitlist_position: null,
              reserve_time: Date.now(),
            });

            // 更新所有剩余候补用户的位置(减1)
            await db
              .collection("user-reserve")
              .where({
                class_id: queryClassId,
                canceled: false,
                status: "waitlist",
                waitlist_position: _.gt(nextUser.waitlist_position), // 比转正用户位置靠后的
              })
              .update({
                waitlist_position: _.inc(-1), // 位置前移
              });

            // 扣减候补用户次卡（若绑定）
            if (nextUser.card_id && nextUser.card_type === "sessionCard") {
              await db
                .collection("user-membership-card")
                .doc(nextUser.card_id)
                .update({
                  remainingSessions: _.inc(-1),
                });
            }

            promotedUser = nextUser.user_id;
          }
        }
      }

      // 4️ 🆕 如果取消的是候补状态 → 更新后续候补位置
      if (reservation.status === "waitlist" && reservation.waitlist_position) {
        await db
          .collection("user-reserve")
          .where({
            class_id: queryClassId,
            canceled: false,
            status: "waitlist",
            waitlist_position: _.gt(reservation.waitlist_position), // 比取消用户位置靠后的
          })
          .update({
            waitlist_position: _.inc(-1), // 位置前移
          });
      }

      // 5️ 恢复次卡次数
      if (cardType === "sessionCard" && reservation.status === "confirmed") {
        await db
          .collection("user-membership-card")
          .doc(cardId)
          .update({
            remainingSessions: _.inc(1),
          });
      }

      return {
        code: 200,
        message: "取消预约成功",
        data: { promoted_user: promotedUser },
      };
    } catch (error) {
      console.error("取消预约失败", error);
      return { code: 500, message: "取消预约失败", error };
    }
  },
};
