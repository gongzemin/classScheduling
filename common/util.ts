export function formatTimestampToHHMM(timestamp) {
  const date = new Date(timestamp);
  // 调整为北京时间（UTC+8）
  const beijingTime = new Date(date.getTime() + 8 * 60 * 60 * 1000); // 将 UTC 转为 北京时间
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// 工具函数：格式化课程时间
export const formatCourseTime = (startTime, endTime) =>
  `${formatTimestampToHHMM(startTime)}-${formatTimestampToHHMM(endTime)}`;

// 时间字符串转为分钟数
export const parseTimeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * 格式化日期对象为 yyyy-mm-dd 字符串
 * @param {Date} dateObj - 要格式化的日期对象
 * @returns {string} 格式化后的日期字符串
 */
export function formatDateToYYYYMMDD(dateObj) {
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    console.error("Invalid Date Object");
    return "";
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // 月份从 0 开始
  const day = String(dateObj.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// 日期格式化函数  2025-06-30T23:59:59Z 格式的日期转换成 yyyy-mm-dd hh:mm:ss
export function formatISOToFullDateTime(dateString: string): string {
  const date = new Date(dateString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0"); // 月份从0开始
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

// 获取当前时间的HH:MM形式
export function getCurrentTimeInHHMM() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// 把时间戳转成HH:MM 比较时间大小
export function compareTimeStrings(time1:string, time2:string) {
  const [hours1, minutes1] = time1.split(":").map(Number);
  const [hours2, minutes2] = time2.split(":").map(Number);

  // Convert both times to total minutes from midnight
  const time1InMinutes = hours1 * 60 + minutes1;
  const time2InMinutes = hours2 * 60 + minutes2;

  if (time1InMinutes < time2InMinutes) {
    return -1; // time1 is earlier than time2
  } else if (time1InMinutes > time2InMinutes) {
    return 1; // time1 is later than time2
  } else {
    return 0; // both times are equal
  }
}