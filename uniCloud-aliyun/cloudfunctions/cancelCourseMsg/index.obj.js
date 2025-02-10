const db = uniCloud.database();
module.exports = {
  /**
   * 获取用户openid
   * @param {Object} event
   * @returns {Object}
   */

  async getOpenid(event) {
    const { code, userId } = event; // 从前端传入 userId
    const db = uniCloud.database();
    const config = await db
      .collection("configurations")
      .doc("67a9bd3df2949cf72110d879")
      .get({ getOne: true });
    const appid = config.result.data.appid; // 替换为你的小程序 AppID
    const secret = config.result.data.secret; // 替换为你的 AppSecret
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
    const axios = require("axios");

    try {
      const response = await axios.get(url);
      const data = response.data;

      if (data.openid) {
        const openid = data.openid;
        const unionid = data.unionid;

        // 查询当前用户是否存在（根据 userId）
        const userCollection = db.collection("users");
        const queryResult = await userCollection.doc(userId).get();

        if (queryResult.data.length > 0) {
          // 如果用户已存在，更新记录
          await userCollection.doc(userId).update({
            openid: openid,
            unionid: unionid,
            updateTime: new Date(),
          });
        } else {
          // 如果用户不存在，可以选择新增或报错
          return {
            success: false,
            message: "用户不存在",
          };
        }

        // 返回 openid 和 session_key
        return {
          openid: openid,
          session_key: data.session_key,
          unionid: unionid,
        };
      } else {
        return {
          success: false,
          error: data,
        };
      }
    } catch (err) {
      console.error("获取openid失败", err);
      return {
        success: false,
        error: err,
      };
    }
  },

  /**
   * 发送成功预约消息
   * @param {Object} event
   * @returns {Object}
   */
  async sendSuccessSubscribeMessage(event) {
    const { openid, courseName, courseTime } = event;
    const axios = require("axios");

    // 获取 access_token
    async function getAccessToken(appid, secret) {
      const response = await axios.get(
        `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
      );
      return response.data.access_token;
    }

    try {
      const accessToken = await getAccessToken(appid, secret);
      const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`;
      const messageData = {
        touser: openid,
        template_id: "6VJls8Lis07mY5TgB0fHzzklTQiSmc6uTIUY3AA5Emg",
        data: {
          phrase12: {
            value: "成功预约", // 预约状态,
          },
          thing41: {
            value: courseName || "预约时段未填写",
          },
          thing13: {
            value: courseTime,
          },
        },
      };

      const result = await axios.post(url, messageData);
      return result.data;
    } catch (err) {
      console.error("订阅消息发送失败", err);
      return {
        success: false,
        error: err,
      };
    }
  },
  /**
   * 发送课程取消消息
   * @param {Object} event
   * @returns {Object}
   */
  async sendCancelSubscribeMessage(event) {
    const { openid, courseName, courseTime, courseTeacherName } = event;
    const axios = require("axios");

    // 获取 access_token
    async function getAccessToken(appid, secret) {
      const response = await axios.get(
        `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
      );
      return response.data.access_token;
    }

    try {
      const accessToken = await getAccessToken(appid, secret);
      const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`;
      const messageData = {
        touser: openid,
        template_id: "5HlqLI0I0I4m-peYdNEsr4CcVAH4aeKRKt2Khms2Hbg",
        page: "pages/index/index",
        data: {
          thing28: {
            value: courseName, // 课程名称
          },
          time30: {
            value: courseTime, // 上课时间
          },
          thing29: {
            value: courseTeacherName, // 上课教练
          },
          thing4: {
            value: "预约人数不足", // 预约状态,
          },
        },
      };
      const result = await axios.post(url, messageData);
      return result.data;
    } catch (err) {
      console.error("订阅消息发送失败", err);
      return {
        success: false,
        error: err,
      };
    }
  },
};
