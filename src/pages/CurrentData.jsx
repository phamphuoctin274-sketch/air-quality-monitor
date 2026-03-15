import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getCurrentData, getDataWithinTimeRange } from '../services/firebaseService';
import { calculateOverallAQI, getAQICategory, getAQIAdvice } from '../utils/aqi';
import { formatDateTime, formatRelativeTime, getLastHours } from '../utils/dateUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CurrentData = () => {
  const [currentData, setCurrentData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('3h');
  const [customHours, setCustomHours] = useState(3);
  const [chartData, setChartData] = useState(null);
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    loadCurrentData();
  }, []);

  useEffect(() => {
    loadHistoricalData();
  }, [timeRange, customHours]);

  const loadCurrentData = () => {
    setLoading(true);
    getCurrentData((result) => {
      if (result.success) {
        setCurrentData(result.data);
      }
      setLoading(false);
    });
  };

  const loadHistoricalData = () => {
    const hours = timeRange === 'custom' ? customHours : parseInt(timeRange);
    getDataWithinTimeRange(hours, (result) => {
      if (result.success) {
        setHistoricalData(result.data);
        updateChartData(result.data);
      }
    });
  };

  const updateChartData = (data) => {
    if (!data || data.length === 0) {
      setChartData(null);
      return;
    }

    const labels = data.map(item => {
      const date = new Date(item.timestamp);
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    });

    setChartData({
      labels,
      datasets: [
        {
          label: 'Nhiệt độ (°C)',
          data: data.map(item => item.temperature || 0),
          borderColor: '#FF6B6B',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y'
        },
        {
          label: 'Độ ẩm (%)',
          data: data.map(item => item.humidity || 0),
          borderColor: '#4ECDC4',
          backgroundColor: 'rgba(78, 205, 196, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y1'
        },
        {
          label: 'PM2.5 (µg/m³)',
          data: data.map(item => item.pm25 || 0),
          borderColor: '#FFD93D',
          backgroundColor: 'rgba(255, 217, 61, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y2'
        }
      ]
    });
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    if (range !== 'custom') {
      setShowCustomInput(false);
    }
  };

  const handleCustomHoursChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setCustomHours(Math.max(1, Math.min(168, value))); // Min 1 hour, Max 7 days
  };

  const applyCustomHours = () => {
    setTimeRange('custom');
    loadHistoricalData();
  };

  if (loading && !currentData) {
    return (
      <div className="page">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  const aqi = currentData ? calculateOverallAQI(
    currentData.pm25 || 0,
    currentData.pm10 || 0,
    0
  ) : 0;
  const aqiInfo = getAQICategory(aqi);

  return (
    <div className="page">
      <div className="card">
        <h2 className="card-title">
          <i className="fas fa-wind"></i>
          Dữ liệu chất lượng không khí hiện tại
        </h2>

        {currentData && (
          <>
            <div className="alert alert-info">
              <i className="fas fa-info-circle"></i>
              Cập nhật lần cuối: {formatRelativeTime(currentData.timestamp)}
            </div>

            <div className="data-grid">
              <div className="data-card">
                <div className="data-card-label">Nhiệt độ</div>
                <div className="data-card-value">{currentData.temperature || '--'}</div>
                <div className="data-card-unit">°C</div>
              </div>
              <div className="data-card">
                <div className="data-card-label">Độ ẩm</div>
                <div className="data-card-value">{currentData.humidity || '--'}</div>
                <div className="data-card-unit">%</div>
              </div>
              <div className="data-card">
                <div className="data-card-label">PM 2.5</div>
                <div className="data-card-value">{currentData.pm25 || '--'}</div>
                <div className="data-card-unit">µg/m³</div>
              </div>
              <div className="data-card">
                <div className="data-card-label">PM 10</div>
                <div className="data-card-value">{currentData.pm10 || '--'}</div>
                <div className="data-card-unit">µg/m³</div>
              </div>
              <div className="data-card">
                <div className="data-card-label">AQI</div>
                <div className="data-card-value">{aqi}</div>
                <div style={{ 
                  marginTop: '10px',
                  padding: '5px 10px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '5px',
                  fontSize: '12px'
                }}>
                  {aqiInfo.category}
                </div>
              </div>
            </div>

            <div className={`alert ${
              aqi <= 50 ? 'alert-success' :
              aqi <= 100 ? 'alert-info' :
              aqi <= 150 ? 'alert-warning' :
              'alert-danger'
            }`}>
              <i className={`fas ${
                aqi <= 50 ? 'fa-check-circle' :
                aqi <= 100 ? 'fa-info-circle' :
                aqi <= 150 ? 'fa-exclamation-circle' :
                'fa-times-circle'
              }`}></i>
              {getAQIAdvice(aqi)}
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h2 className="card-title">
          <i className="fas fa-chart-area"></i>
          Biểu đồ khoảng thời gian
        </h2>

        <div className="time-filter">
          <button 
            className={timeRange === '3h' ? 'button active' : 'button'}
            onClick={() => handleTimeRangeChange('3h')}
          >
            3 giờ qua
          </button>
          <button 
            className={timeRange === '6h' ? 'button active' : 'button'}
            onClick={() => handleTimeRangeChange('6h')}
          >
            6 giờ qua
          </button>
          <button 
            className={timeRange === 'custom' ? 'button active' : 'button'}
            onClick={() => setShowCustomInput(!showCustomInput)}
          >
            <i className="fas fa-cog"></i> Tùy chỉnh
          </button>
        </div>

        {showCustomInput && (
          <div className="form-group">
            <label>Nhập số giờ (1-168):</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="number"
                value={customHours}
                onChange={handleCustomHoursChange}
                min="1"
                max="168"
              />
              <button className="button button-success" onClick={applyCustomHours}>
                <i className="fas fa-check"></i> Áp dụng
              </button>
            </div>
          </div>
        )}

        {chartData && (
          <div className="chart-container">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                      display: true,
                      text: 'Nhiệt độ (°C) / Độ ẩm (%)'
                    }
                  },
                  y1: {
                    type: 'linear',
                    display: false,
                    position: 'left'
                  },
                  y2: {
                    type: 'linear',
                    display: false,
                    position: 'right'
                  }
                },
              }}
            />
          </div>
        )}

        {!chartData && (
          <div className="alert alert-info">
            <i className="fas fa-info-circle"></i>
            Không có dữ liệu để hiển thị biểu đồ
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentData;
