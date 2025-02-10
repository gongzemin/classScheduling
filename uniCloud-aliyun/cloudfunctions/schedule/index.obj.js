// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
module.exports = {
  /**
   * 修改课程
   * @param {Object} event - 调用云对象传递的参数
   * @param {string} event.docId - 文档 ID
   * @param {Object} event.updateData - 要更新的字段和数据
   */
  async updateCourse(event, context) {
    const db = uniCloud.database();
    const { docId, role, updateData } = event; // 从事件参数中获取文档ID和用户角色

    // 获取用户角色信息
    const user = await db.collection("users").doc(docId).get();
    if (user.data.role !== role) {
      return { code: 403, message: "无权限操作" };
    }

    if (!docId || !role) {
      return { code: 400, message: "参数错误，缺少必要数据" };
    }

    try {
      const res = await db
        .collection("class-schedule")
        .doc(docId)
        .update(updateData);
      if (res.updated === 1) {
        return { code: 200, message: "更新成功" };
      } else {
        return { code: 404, message: "未找到对应课程" };
      }
    } catch (error) {
      return { code: 500, message: "更新失败", error: error.message };
    }
  },

  /**
   * 删除课程
   * @param {Object} event - 调用云对象传递的参数
   * @param {string} event.docId - 文档 ID
   */
  async removeCourse(event, context) {
    const db = uniCloud.database();

    const { docId, userId } = event;

    // 参数校验
    if (!docId || typeof docId !== "string") {
      return { code: 400, message: "无效的课程ID" };
    }

    if (!userId || typeof userId !== "string") {
      return { code: 400, message: "无效的用户ID" };
    }

    try {
      // 查询用户信息
      const user = await db.collection("users").doc(userId).get();
      if (!user?.result?.data || user?.result?.data[0]?.role !== "superAdmin") {
        return { code: 403, message: "无权限操作" };
      }

      // 删除课程
      const res = await db.collection("class-schedule").doc(docId).remove();
      if (res.deleted === 1) {
        return { code: 200, message: "删除成功" };
      } else {
        return { code: 404, message: "未找到对应课程" };
      }
    } catch (error) {
      console.error("删除课程错误：", error);
      return { code: 500, message: "删除失败", error: error.message };
    }
  },
};
