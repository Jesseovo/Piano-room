/**
 * 日期格式化工具类
 */


// 格式化日期时间为后端需要的格式
export function formatDateTimeForBackend(date) {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  // 注意这里使用T作为日期和时间的分隔符
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * 格式化日期
 * @param {Date} date - 要格式化的日期对象
 * @param {string} fmt - 格式化模板，例如 'yyyy-MM-dd HH:mm:ss'
 * @returns {string} - 格式化后的日期字符串
 */
export function formatDate(date, fmt) {
  if (!date) {
    return '';
  }
  
  if (typeof date === 'string') {
    // 如果传入的是字符串，尝试转换为日期对象
    date = new Date(date);
  }
  
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    console.error('无效的日期:', date);
    return '';
  }
  
  const o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'H+': date.getHours(), // 小时
    'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, // 12小时制
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    'S': date.getMilliseconds() // 毫秒
  };
  
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1, 
        RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      );
    }
  }
  
  return fmt;
}

/**
 * 获取相对时间描述
 * @param {Date|string} date - 日期对象或日期字符串
 * @returns {string} - 相对时间描述，如"刚刚"、"5分钟前"、"1小时前"等
 */
export function getRelativeTime(date) {
  if (!date) {
    return '';
  }
  
  if (typeof date === 'string') {
    // 如果传入的是字符串，尝试转换为日期对象
    date = new Date(date);
  }
  
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    console.error('无效的日期:', date);
    return '';
  }
  
  const now = new Date();
  const diff = now.getTime() - date.getTime(); // 时间差（毫秒）
  
  if (diff < 0) {
    return formatDate(date, 'yyyy-MM-dd HH:mm:ss');
  }
  
  const minute = 60 * 1000; // 1分钟
  const hour = 60 * minute; // 1小时
  const day = 24 * hour; // 1天
  const week = 7 * day; // 1周
  const month = 30 * day; // 1个月（约）
  
  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前';
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前';
  } else if (diff < week) {
    return Math.floor(diff / day) + '天前';
  } else if (diff < month) {
    return Math.floor(diff / week) + '周前';
  } else {
    return formatDate(date, 'yyyy-MM-dd');
  }
}

/**
 * 日期比较
 * @param {Date|string} date1 - 第一个日期
 * @param {Date|string} date2 - 第二个日期
 * @returns {number} - 如果date1早于date2，返回-1；如果date1晚于date2，返回1；如果相等，返回0
 */
export function compareDate(date1, date2) {
  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);
  
  const time1 = d1.getTime();
  const time2 = d2.getTime();
  
  if (time1 < time2) {
    return -1;
  } else if (time1 > time2) {
    return 1;
  } else {
    return 0;
  }
}

/**
 * 获取日期范围
 * @param {string} type - 范围类型，如'today', 'week', 'month', 'year'
 * @returns {Array} - 返回[开始日期, 结束日期]
 */
export function getDateRange(type) {
  const now = new Date();
  let start = new Date();
  let end = new Date();
  
  switch (type) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case 'week':
      // 获取本周的开始日期（周一）和结束日期（周日）
      const day = now.getDay() || 7; // 如果是周日，day为0，转换为7
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - day), 23, 59, 59);
      break;
    case 'month':
      // 获取本月的开始日期和结束日期
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
    case 'year':
      // 获取本年的开始日期和结束日期
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;
    default:
      break;
  }
  
  return [start, end];
}

/**
 * 将日期添加指定的时间
 * @param {Date|string} date - 起始日期
 * @param {number} num - 要添加的数量
 * @param {string} unit - 单位，如 'year', 'month', 'day', 'hour', 'minute', 'second'
 * @returns {Date} - 计算后的新日期
 */
export function addTime(date, num, unit) {
  if (!date) {
    return null;
  }
  
  const d = date instanceof Date ? new Date(date.getTime()) : new Date(date);
  
  switch (unit) {
    case 'year':
      d.setFullYear(d.getFullYear() + num);
      break;
    case 'month':
      d.setMonth(d.getMonth() + num);
      break;
    case 'day':
      d.setDate(d.getDate() + num);
      break;
    case 'hour':
      d.setHours(d.getHours() + num);
      break;
    case 'minute':
      d.setMinutes(d.getMinutes() + num);
      break;
    case 'second':
      d.setSeconds(d.getSeconds() + num);
      break;
    default:
      return d;
  }
  
  return d;
} 