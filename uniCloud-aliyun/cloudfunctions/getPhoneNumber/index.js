"use strict";
const axios = require("axios");
exports.main = async (event, context) => {
  //event为客户端上传的参数
  const { code } = event; // 从前端传来的code
  const appid = "wxdc6f7096d4b98844"; // 替换为你的小程序 AppID
  const secret = "199bb71d4ca47170bf6e7c7d2a42386e"; // 替换为你的 AppSecret

  try {
    // 1. 获取 access_token
    const tokenRes = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
    );
    const access_token = tokenRes.data.access_token;

    if (!access_token) {
      return { success: false, msg: "Failed to fetch access_token" };
    }
    console.log("access_token", access_token);
    console.log("code", code);

    // 2. 获取用户手机号
    const phoneRes = await axios.post(
      `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${access_token}`,
      { code }
    );

    if (phoneRes.data.errcode === 0 && phoneRes.data.phone_info) {
      return {
        success: true,
        phoneNumber: phoneRes.data.phone_info.phoneNumber,
      };
    } else {
      return { success: false, msg: phoneRes.data.errmsg || "Unknown error" };
    }
  } catch (error) {
    console.error("Error in cloud function:", error);
    return { success: false, msg: "Internal server error" };
  }
};
