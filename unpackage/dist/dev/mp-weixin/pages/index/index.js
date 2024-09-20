"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {};
if (!Array) {
  const _easycom_home_header2 = common_vendor.resolveComponent("home-header");
  const _easycom_home_overview2 = common_vendor.resolveComponent("home-overview");
  const _easycom_home_teachers2 = common_vendor.resolveComponent("home-teachers");
  const _easycom_home_contact2 = common_vendor.resolveComponent("home-contact");
  (_easycom_home_header2 + _easycom_home_overview2 + _easycom_home_teachers2 + _easycom_home_contact2)();
}
const _easycom_home_header = () => "../../components/home-header/home-header.js";
const _easycom_home_overview = () => "../../components/home-overview/home-overview.js";
const _easycom_home_teachers = () => "../../components/home-teachers/home-teachers.js";
const _easycom_home_contact = () => "../../components/home-contact/home-contact.js";
if (!Math) {
  (_easycom_home_header + _easycom_home_overview + _easycom_home_teachers + _easycom_home_contact)();
}
function _sfc_render(_ctx, _cache) {
  return {};
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
