"use strict";
const axios = require("axios");
exports.main = async (event, context) => {
  //event为客户端上传的参数
  const { code } = event;

  const appId = "wxd01f89eda8c5588e";
  const appSecret = "";
  try {
    const response = await axios.get(
      `https://api.weixin.qq.com/sns/jscode2session`,
      {
        params: {
          appid: appId,
          secret: appSecret,
          js_code: code,
          grant_type: "authorization_code",
        },
      }
    );
    return {
      statusCode: 200,
      body: response.data,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: {
        error: "Server Error",
      },
    };
  }
  console.log("event : ", event);

  //返回数据给客户端
  return event;
};
