import React, { useState, useEffect } from 'react';
import { getHistoricalData } from '../services/firebaseService';
import { calculatePM25AQI, getAQICategory, getAQIAdvice } from '../utils/aqi';
import { formatDateTime, parseDateTime, formatDateISO, formatTimeISO } from '../utils/dateUtils';
import { exportHistoryToExcel } from '../utils/excelExport';

const History = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(formatDateISO(new Date(Date.now() - 86400000))); // Yesterday
  const [startTime, setStartTime] = useState('00:00');
  const [endDate, setEndDate] = useState(formatDateISO(new Date()));
  const [endTime, setEndTime] = useState('23:59');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedRows, setSelectedRows] = useState([]);
  const [filterAQILevel, setFilterAQILevel] = useState('all');

  useEffect(() => {
    loadHistoricalData();
  }, []);

  useEffect(() => {
    filterAndSortData();
  }, [data, startDate, startTime, endDate, endTime, sortBy, sortOrder, filterAQILevel]);

  const loadHistoricalData = () => {
    setLoading(true);
    const startDateTime = parseDateTime(startDate, startTime);
    const endDateTime = parseDateTime(endDate, endTime);

    getHistoricalData(startDateTime, endDateTime, (result) => {
      if (result.success) {
        const dataWithAQI = result.data.map(item => ({
          ...item,
          aqi: calculatePM25AQI(item.pm25 || 0),
          aqiLevel: getAQICategory(calculatePM25AQI(item.pm25 || 0)).category
        }));
        setData(dataWithAQI);
      }
      setLoading(false);
    });
  };

  const filterAndSortData = () => {
    let filtered = [...data];

    // Filter by AQI level
    if (filterAQILevel !== 'all') {
      filtered = filtered.filter(item => item.aqiLevel === filterAQILevel);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'timestamp') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'startDate':
        setStartDate(value);
        break;
      case 'startTime':
        setStartTime(value);
        break;
      case 'endDate':
        setEndDate(value);
        break;
      case 'endTime':
        setEndTime(value);
        break;
      default:
        break;
    }
  };

  const handleApplyFilter = () => {
    loadHistoricalData();
  };

  const handleExportExcel = () => {
    const exportData = selectedRows.length > 0 
      ? filteredData.filter(item => selectedRows.includes(item.id))
      : filteredData;

    if (exportData.length === 0) {
      alert('Vui lòng chọn dữ liệu để xuất');
      return;
    }

    const result = exportHistoryToExcel(exportData, `air-quality-${new Date().getTime()}.xlsx`);
    if (result.success) {
      alert(result.message);
    } else {
      alert('Lỗi: ' + result.message);
    }
  };

  const toggleRowSelection = (id) => {
    setSelectedRows(prev =>
      prev.includes(id)
        ? prev.filter(rid => rid !== id)
        : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedRows.length === filteredData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredData.map(item => item.id));
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getAQIStatusIcon = (aqi) => {
    if (aqi <= 50) return <span style={{ color: '#4caf50' }}><i className="fas fa-check-circle"></i></span>;
    if (aqi <= 100) return <span style={{ color: '#8bc34a' }}><i className="fas fa-info-circle"></i></span>;
    if (aqi <= 150) return <span style={{ color: '#ffc107' }}><i className="fas fa-exclamation-circle"></i></span>;
    return <span style={{ color: '#f44336' }}><i className="fas fa-times-circle"></i></span>;
  };

  return (
    <div className="page">
      <div className="card">
        <h2 className="card-title">
          <i className="fas fa-history"></i>
          Lịch sử chất lượng không khí
        </h2>

        <div className="grid-2">
          <div className="form-group">
            <label>Ngày bắt đầu:</label>
            <input
              type="date"
              name="startDate"
              value={startDate}
              onChange={handleDateRangeChange}
            />
          </div>
          <div className="form-group">
            <label>Thời gian bắt đầu:</label>
            <input
              type="time"
              name="startTime"
              value={startTime}
              onChange={handleDateRangeChange}
            />
          </div>
          <div className="form-group">
            <label>Ngày kết thúc:</label>
            <input
              type="date"
              name="endDate"
              value={endDate}
              onChange={handleDateRangeChange}
            />
          </div>
          <div className="form-group">
            <label>Thời gian kết thúc:</label>
            <input
              type="time"
              name="endTime"
              value={endTime}
              onChange={handleDateRangeChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Lọc theo mức AQI:</label>
          <select value={filterAQILevel} onChange={(e) => setFilterAQILevel(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="Good">Tốt</option>
            <option value="Fair">Bình thường</option>
            <option value="Moderate">Trung bình</option>
            <option value="Poor">Xấu</option>
            <option value="Very Poor">Rất xấu</option>
          </select>
        </div>

        <div className="button-group">
          <button className="button button-success" onClick={handleApplyFilter}>
            <i className="fas fa-search"></i> Tìm kiếm
          </button>
          <button className="button button-success" onClick={handleExportExcel}>
            <i className="fas fa-download"></i> Tải Excel
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">
          <i className="fas fa-table"></i>
          Bảng dữ liệu ({filteredData.length} bản ghi)
        </h2>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="alert alert-info">
            <i className="fas fa-info-circle"></i>
            Không tìm thấy dữ liệu nào
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                        onChange={toggleAllSelection}
                      />
                    </th>
                    <th onClick={() => handleSort('timestamp')} style={{ cursor: 'pointer' }}>
                      Thời gian {sortBy === 'timestamp' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('temperature')} style={{ cursor: 'pointer' }}>
                      Nhiệt độ (°C) {sortBy === 'temperature' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('humidity')} style={{ cursor: 'pointer' }}>
                      Độ ẩm (%) {sortBy === 'humidity' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('pm25')} style={{ cursor: 'pointer' }}>
                      PM 2.5 (µg/m³) {sortBy === 'pm25' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('pm10')} style={{ cursor: 'pointer' }}>
                      PM 10 (µg/m³) {sortBy === 'pm10' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('aqi')} style={{ cursor: 'pointer' }}>
                      AQI {sortBy === 'aqi' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>Mức</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map(item => (
                    <tr key={item.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(item.id)}
                          onChange={() => toggleRowSelection(item.id)}
                        />
                      </td>
                      <td>{formatDateTime(item.timestamp)}</td>
                      <td>{item.temperature?.toFixed(1) || '--'}</td>
                      <td>{item.humidity?.toFixed(1) || '--'}</td>
                      <td>{item.pm25?.toFixed(1) || '--'}</td>
                      <td>{item.pm10?.toFixed(1) || '--'}</td>
                      <td>{item.aqi}</td>
                      <td>
                        {getAQIStatusIcon(item.aqi)} {item.aqiLevel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                Trang {currentPage} / {totalPages}
              </div>
              <div className="button-group">
                <button
                  className="button button-sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <i className="fas fa-chevron-left"></i> Trước
                </button>
                <button
                  className="button button-sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Sau <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h2 className="card-title">
          <i className="fas fa-lightbulb"></i>
          Hướng dẫn giải thích AQI
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{ padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', borderLeft: '4px solid #4caf50' }}>
            <strong>Tốt (0-50):</strong> Không có vấn đề sức khỏe
          </div>
          <div style={{ padding: '15px', backgroundColor: '#f1f8e9', borderRadius: '8px', borderLeft: '4px solid #8bc34a' }}>
            <strong>Bình thường (51-100):</strong> Có thể gây ảnh hưởng nhỏ
          </div>
          <div style={{ padding: '15px', backgroundColor: '#fffde7', borderRadius: '8px', borderLeft: '4px solid #ffc107' }}>
            <strong>Trung bình (101-150):</strong> Có thể gây ảnh hưởng sức khỏe
          </div>
          <div style={{ padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px', borderLeft: '4px solid #ff9800' }}>
            <strong>Xấu (151-200):</strong> Ảnh hưởng sức khỏe cao
          </div>
          <div style={{ padding: '15px', backgroundColor: '#ffebee', borderRadius: '8px', borderLeft: '4px solid #f44336' }}>
            <strong>Rất xấu (201+):</strong> Ảnh hưởng sức khỏe rất cao
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
