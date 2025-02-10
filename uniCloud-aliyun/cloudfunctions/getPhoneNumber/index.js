"use strict";
const axios = require("axios");
exports.main = async (event, context) => {
  //event为客户端上传的参数
  const { code } = event; // 从前端传来的code
  const db = uniCloud.database();
  const config = await db
    .collection("configurations")
    .doc("67a9bd3df2949cf72110d879")
    .get({ getOne: true });
  const appid = config.result.data.appid; // 替换为你的小程序 AppID
  const secret = config.result.data.secret; // 替换为你的 AppSecret

  try {
    // 1. 获取 access_token
    const tokenRes = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
    );
    const access_token = tokenRes.data.access_token;

    if (!access_token) {
      return { success: false, msg: "Failed to fetch access_token" };
    }

    // 2. 获取用户手机号
    uni.showLoading({
      title: "正在请求授权...",
      mask: true,
    });
    const phoneRes = await axios.post(
      `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${access_token}`,
      { code }
    );
    uni.hideLoading();

    if (phoneRes.data.errcode === 0 && phoneRes.data.phone_info) {
      return {
        success: true,
        phoneNumber: phoneRes.data.phone_info.phoneNumber,
      };
    } else {
      return { success: false, msg: phoneRes.data.errmsg || "Unknown error" };
    }
  } catch (error) {
    return { success: false, msg: "Internal server error" };
  }
};
