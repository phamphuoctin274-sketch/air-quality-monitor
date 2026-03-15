import { format, parse, addHours, subHours, startOfDay, endOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';

export const formatDateTime = (date) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'dd/MM/yyyy HH:mm:ss', { locale: vi });
  } catch (error) {
    return '';
  }
};

export const formatDate = (date) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'dd/MM/yyyy', { locale: vi });
  } catch (error) {
    return '';
  }
};

export const formatTime = (date) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'HH:mm:ss', { locale: vi });
  } catch (error) {
    return '';
  }
};

export const formatDateISO = (date) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'yyyy-MM-dd');
  } catch (error) {
    return '';
  }
};

export const formatTimeISO = (date) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'HH:mm:ss');
  } catch (error) {
    return '';
  }
};

export const getLastHours = (hours) => {
  const now = new Date();
  const start = subHours(now, hours);
  return {
    start: start.toISOString(),
    end: now.toISOString()
  };
};

export const getTodayRange = () => {
  const today = new Date();
  return {
    start: startOfDay(today).toISOString(),
    end: endOfDay(today).toISOString()
  };
};

export const getThisWeekRange = () => {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  return {
    start: startOfDay(weekStart).toISOString(),
    end: endOfDay(now).toISOString()
  };
};

export const getThisMonthRange = () => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    start: startOfDay(monthStart).toISOString(),
    end: endOfDay(now).toISOString()
  };
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const parseDateTime = (dateStr, timeStr) => {
  try {
    const combined = `${dateStr}T${timeStr}`;
    return new Date(combined).toISOString();
  } catch (error) {
    return null;
  }
};

export const isToday = (date) => {
  const today = new Date();
  const compareDate = new Date(date);
  return compareDate.getDate() === today.getDate() &&
    compareDate.getMonth() === today.getMonth() &&
    compareDate.getFullYear() === today.getFullYear();
};

export const formatRelativeTime = (date) => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  
  return formatDateTime(date);
};

export default {
  formatDateTime,
  formatDate,
  formatTime,
  formatDateISO,
  formatTimeISO,
  getLastHours,
  getTodayRange,
  getThisWeekRange,
  getThisMonthRange,
  addDays,
  parseDateTime,
  isToday,
  formatRelativeTime
};
