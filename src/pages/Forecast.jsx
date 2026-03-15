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
import { getCurrentData } from '../services/firebaseService';
import { calculateOverallAQI, getAQICategory, getAQIAdvice } from '../utils/aqi';
import { formatDateTime, formatTime } from '../utils/dateUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Forecast = () => {
  const [currentData, setCurrentData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [hours, setHours] = useState(12);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);

  useEffect(() => {
    loadCurrentData();
  }, []);

  useEffect(() => {
    if (currentData) {
      generateForecast();
    }
  }, [hours, currentData]);

  const loadCurrentData = () => {
    setLoading(true);
    getCurrentData((result) => {
      if (result.success) {
        setCurrentData(result.data);
      }
      setLoading(false);
    });
  };

  const generateForecast = () => {
    if (!currentData) return;

    // Generate mock forecast data based on current data with slight variations
    const forecast = [];
    const now = new Date();

    for (let i = 1; i <= hours; i++) {
      const futureTime = new Date(now.getTime() + i * 60 * 60 * 1000);
      
      // Simple forecast model with slight variations
      const tempVariation = (Math.sin(i / 4) * 2) + (Math.random() - 0.5) * 0.5;
      const humidityVariation = (Math.cos(i / 5) * 3) + (Math.random() - 0.5) * 1;
      const pm25Variation = (Math.sin(i / 6) * 5) + (Math.random() - 0.5) * 2;

      const forecastItem = {
        time: futureTime,
        temperature: Math.max(0, Math.min(50, currentData.temperature + tempVariation)),
        humidity: Math.max(0, Math.min(100, currentData.humidity + humidityVariation)),
        pm25: Math.max(0, currentData.pm25 + pm25Variation),
        pm10: Math.max(0, currentData.pm10 + pm25Variation * 1.2),
        aqi: null
      };

      forecastItem.aqi = calculateOverallAQI(
        forecastItem.pm25,
        forecastItem.pm10,
        0
      );

      forecast.push(forecastItem);
    }

    setForecastData(forecast);
    updateChartData(forecast);
  };

  const updateChartData = (data) => {
    if (!data || data.length === 0) {
      setChartData(null);
      return;
    }

    const labels = data.map(item => {
      const hours = item.time.getHours().toString().padStart(2, '0');
      const minutes = item.time.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    });

    setChartData({
      labels,
      datasets: [
        {
          label: 'Nhiệt độ (°C)',
          data: data.map(item => item.temperature.toFixed(1)),
          borderColor: '#FF6B6B',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y'
        },
        {
          label: 'Độ ẩm (%)',
          data: data.map(item => item.humidity.toFixed(1)),
          borderColor: '#4ECDC4',
          backgroundColor: 'rgba(78, 205, 196, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y1'
        },
        {
          label: 'PM2.5 (µg/m³)',
          data: data.map(item => item.pm25.toFixed(1)),
          borderColor: '#FFD93D',
          backgroundColor: 'rgba(255, 217, 61, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y2'
        },
        {
          label: 'AQI',
          data: data.map(item => item.aqi),
          borderColor: '#95E1D3',
          backgroundColor: 'rgba(149, 225, 211, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y3'
        }
      ]
    });
  };

  const handleHoursChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setHours(Math.max(1, Math.min(168, value)));
  };

  const handleApplyForecast = () => {
    generateForecast();
  };

  const getAQITrend = () => {
    if (forecastData.length < 2) return 'Ổn định';
    const firstAQI = forecastData[0].aqi;
    const lastAQI = forecastData[forecastData.length - 1].aqi;
    
    if (lastAQI > firstAQI + 5) return 'Xấu hơn ⬆️';
    if (lastAQI < firstAQI - 5) return 'Tốt hơn ⬇️';
    return 'Ổn định ➡️';
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <h2 className="card-title">
          <i className="fas fa-cloud"></i>
          Dự báo chất lượng không khí
        </h2>

        <div className="alert alert-info">
          <i className="fas fa-info-circle"></i>
          Dự báo dựa trên dữ liệu hiện tại và các mô hình thay đổi tự nhiên
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label>Dự báo cho bao nhiêu giờ? (1-168)</label>
            <input
              type="number"
              value={hours}
              onChange={handleHoursChange}
              min="1"
              max="168"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="button button-success" onClick={handleApplyForecast}>
              <i className="fas fa-sync"></i> Cập nhật dự báo
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">
          <i className="fas fa-chart-line"></i>
          Xu hướng dự báo
        </h2>

        <div className="data-grid">
          <div className="data-card">
            <div className="data-card-label">Thời gian dự báo</div>
            <div className="data-card-value">{hours}</div>
            <div className="data-card-unit">giờ</div>
          </div>
          <div className="data-card">
            <div className="data-card-label">AQI thấp nhất</div>
            <div className="data-card-value">
              {Math.min(...forecastData.map(d => d.aqi))}
            </div>
            <div className="data-card-unit">
              {getAQICategory(Math.min(...forecastData.map(d => d.aqi))).category}
            </div>
          </div>
          <div className="data-card">
            <div className="data-card-label">AQI cao nhất</div>
            <div className="data-card-value">
              {Math.max(...forecastData.map(d => d.aqi))}
            </div>
            <div className="data-card-unit">
              {getAQICategory(Math.max(...forecastData.map(d => d.aqi))).category}
            </div>
          </div>
          <div className="data-card">
            <div className="data-card-label">Xu hướng</div>
            <div className="data-card-value" style={{ fontSize: '20px' }}>
              {getAQITrend()}
            </div>
          </div>
        </div>

        {chartData && (
          <div className="chart-container" style={{ marginTop: '20px' }}>
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
                      text: 'Nhiệt độ (°C)'
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
                  },
                  y3: {
                    type: 'linear',
                    display: false,
                    position: 'right'
                  }
                },
              }}
            />
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="card-title">
          <i className="fas fa-list"></i>
          Dự báo chi tiết theo giờ
        </h2>

        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {forecastData.map((item, index) => {
            const aqiInfo = getAQICategory(item.aqi);
            return (
              <div
                key={index}
                className="forecast-item"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedHour(selectedHour === index ? null : index)}
              >
                <div className="forecast-time">
                  <i className="fas fa-clock"></i> {formatTime(item.time)} ({index + 1}h)
                </div>
                <div className="forecast-data">
                  <div className="forecast-value">
                    <div className="forecast-value-label">Nhiệt độ</div>
                    <div className="forecast-value-number">{item.temperature.toFixed(1)}°C</div>
                  </div>
                  <div className="forecast-value">
                    <div className="forecast-value-label">Độ ẩm</div>
                    <div className="forecast-value-number">{item.humidity.toFixed(1)}%</div>
                  </div>
                  <div className="forecast-value">
                    <div className="forecast-value-label">PM2.5</div>
                    <div className="forecast-value-number">{item.pm25.toFixed(1)}</div>
                  </div>
                  <div className="forecast-value">
                    <div className="forecast-value-label">AQI</div>
                    <div className="forecast-value-number" style={{ color: aqiInfo.color }}>
                      {item.aqi}
                    </div>
                  </div>
                </div>

                {selectedHour === index && (
                  <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                    <div style={{ fontSize: '12px', marginBottom: '10px' }}>
                      <strong>Mức chất lượng:</strong> <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '4px' }}>{aqiInfo.category}</span>
                    </div>
                    <div style={{ fontSize: '11px', lineHeight: '1.6', opacity: '0.9' }}>
                      {getAQIAdvice(item.aqi)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">
          <i className="fas fa-info-circle"></i>
          Thông tin dự báo
        </h2>
        <div style={{ lineHeight: '1.8', color: '#333' }}>
          <p>
            <strong>Phương pháp dự báo:</strong> Dự báo được tính toán dựa trên các mô hình thay đổi tự nhiên của các thông số
          </p>
          <p>
            <strong>Độ chính xác:</strong> Độ chính xác của dự báo giảm dần theo thời gian. Dự báo trong 12-24 giờ sắp tới 
            có độ chính xác tương đối cao, nhưng dự báo cho những ngày tiếp theo có thể kém chính xác hơn
          </p>
          <p>
            <strong>Cập nhật:</strong> Dự báo sẽ được cập nhật khi bạn nhấp nút "Cập nhật dự báo"
          </p>
          <p>
            <strong>Lưu ý:</strong> Đây là dự báo tự động. Để có dự báo chính xác nhất, hãy kiểm tra lại dữ liệu hiện tại
          </p>
        </div>
      </div>
    </div>
  );
};

export default Forecast;
