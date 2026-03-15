import * as XLSX from 'xlsx';
import { formatDateTime } from './dateUtils';

export const exportHistoryToExcel = (data, fileName = 'air-quality-history.xlsx') => {
  try {
    const worksheetData = data.map(item => ({
      'Thời gian': formatDateTime(item.timestamp),
      'Nhiệt độ (°C)': item.temperature || 'N/A',
      'Độ ẩm (%)': item.humidity || 'N/A',
      'Bụi PM2.5 (µg/m³)': item.pm25 || 'N/A',
      'Bụi PM10 (µg/m³)': item.pm10 || 'N/A',
      'AQI': item.aqi || 'N/A',
      'Mức AQI': item.aqiLevel || 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lịch sử không khí');

    // Set column widths
    const colWidths = [20, 15, 15, 18, 18, 10, 15];
    worksheet['!cols'] = colWidths.map(width => ({ wch: width }));

    XLSX.writeFile(workbook, fileName);
    return { success: true, message: 'File Excel exported successfully' };
  } catch (error) {
    console.error('Excel export error:', error);
    return { success: false, message: error.message };
  }
};

export const exportCurrentDataToExcel = (data, fileName = 'air-quality-current.xlsx') => {
  try {
    const worksheetData = [{
      'Thông số': 'Giá trị',
      'Nhiệt độ (°C)': data.temperature || 'N/A',
      'Độ ẩm (%)': data.humidity || 'N/A',
      'Bụi PM2.5 (µg/m³)': data.pm25 || 'N/A',
      'Bụi PM10 (µg/m³)': data.pm10 || 'N/A',
      'AQI': data.aqi || 'N/A',
      'Cập nhật lúc': formatDateTime(data.timestamp)
    }];

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dữ liệu hiện tại');

    worksheet['!cols'] = [
      { wch: 30 },
      { wch: 20 }
    ];

    XLSX.writeFile(workbook, fileName);
    return { success: true, message: 'File Excel exported successfully' };
  } catch (error) {
    console.error('Excel export error:', error);
    return { success: false, message: error.message };
  }
};

export default {
  exportHistoryToExcel,
  exportCurrentDataToExcel
};
