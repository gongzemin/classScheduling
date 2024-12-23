export function formatTimestampToHHMM(timestamp) {
  const date = new Date(timestamp);
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
