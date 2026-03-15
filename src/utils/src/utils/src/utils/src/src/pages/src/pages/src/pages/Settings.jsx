import React, { useState, useEffect } from 'react';
import { getFirebaseConfig, updateFirebaseConfig, testFirebaseConnection } from '../services/firebaseService';

const Settings = () => {
  const [config, setConfig] = useState({
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });

  const [formValues, setFormValues] = useState(config);
  const [savedMessage, setSavedMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    const currentConfig = getFirebaseConfig();
    setConfig(currentConfig);
    setFormValues(currentConfig);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    setSavedMessage('');
    setErrorMessage('');
  };

  const handleSaveConfig = () => {
    if (!formValues.databaseURL) {
      setErrorMessage('Database URL là bắt buộc');
      return;
    }

    try {
      updateFirebaseConfig(formValues);
      setSavedMessage('Cấu hình đã được lưu thành công');
      setConfig(formValues);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Lỗi khi lưu cấu hình: ' + error.message);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);

    try {
      const result = await testFirebaseConnection(formValues);
      setConnectionStatus(result);
      if (result.success) {
        setSavedMessage(result.message);
        setErrorMessage('');
      } else {
        setErrorMessage(result.message);
        setSavedMessage('');
      }
    } catch (error) {
      setErrorMessage('Lỗi khi kiểm tra kết nối: ' + error.message);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleResetConfig = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại cấu hình mặc định không?')) {
      setFormValues({
        apiKey: 'AIzaSyDummyKey',
        authDomain: 'forest-air-polution.firebaseapp.com',
        databaseURL: 'https://forest-air-polution-default-rtdb.firebaseio.com',
        projectId: 'forest-air-polution',
        storageBucket: 'forest-air-polution.appspot.com',
        messagingSenderId: '123456789',
        appId: '1:123456789:web:abc123def456'
      });
      setSavedMessage('');
      setErrorMessage('');
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h2 className="card-title">
          <i className="fas fa-cogs"></i>
          Cài đặt Firebase
        </h2>

        {savedMessage && (
          <div className="alert alert-success">
            <i className="fas fa-check-circle"></i>
            {savedMessage}
          </div>
        )}

        {errorMessage && (
          <div className="alert alert-danger">
            <i className="fas fa-times-circle"></i>
            {errorMessage}
          </div>
        )}

        <div className="settings-section">
          <h3>Cấu hình kết nối Firebase</h3>

          <div className="form-group">
            <label>Database URL *</label>
            <input
              type="url"
              name="databaseURL"
              placeholder="https://your-project-rtdb.firebaseio.com"
              value={formValues.databaseURL}
              onChange={handleInputChange}
            />
            <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
              URL cơ sở dữ liệu Realtime từ Firebase Console
            </small>
          </div>

          <div className="form-group">
            <label>API Key</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <input
                type={showApiKey ? 'text' : 'password'}
                name="apiKey"
                placeholder="Nhập API Key của bạn"
                value={formValues.apiKey}
                onChange={handleInputChange}
              />
              <button
                className="button button-sm"
                onClick={() => setShowApiKey(!showApiKey)}
                type="button"
              >
                <i className={`fas ${showApiKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Auth Domain</label>
            <input
              type="text"
              name="authDomain"
              placeholder="your-project.firebaseapp.com"
              value={formValues.authDomain}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Project ID</label>
            <input
              type="text"
              name="projectId"
              placeholder="your-project-id"
              value={formValues.projectId}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Storage Bucket</label>
            <input
              type="text"
              name="storageBucket"
              placeholder="your-project.appspot.com"
              value={formValues.storageBucket}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Messaging Sender ID</label>
            <input
              type="text"
              name="messagingSenderId"
              placeholder="123456789"
              value={formValues.messagingSenderId}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>App ID</label>
            <input
              type="text"
              name="appId"
              placeholder="1:123456789:web:abc123def456"
              value={formValues.appId}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="button-group">
          <button
            className="button button-success"
            onClick={handleSaveConfig}
          >
            <i className="fas fa-save"></i> Lưu cấu hình
          </button>
          <button
            className="button"
            onClick={handleTestConnection}
            disabled={testingConnection}
          >
            <i className={`fas ${testingConnection ? 'fa-spinner fa-spin' : 'fa-plug'}`}></i>
            {testingConnection ? ' Đang kiểm tra...' : ' Kiểm tra kết nối'}
          </button>
          <button
            className="button button-danger"
            onClick={handleResetConfig}
          >
            <i className="fas fa-redo"></i> Đặt lại mặc định
          </button>
        </div>

        {connectionStatus && (
          <div style={{ marginTop: '20px' }}>
            <div className={`alert ${connectionStatus.success ? 'alert-success' : 'alert-danger'}`}>
              <i className={`fas ${connectionStatus.success ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
              {connectionStatus.message}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="card-title">
          <i className="fas fa-book"></i>
          Hướng dẫn sử dụng
        </h2>

        <div style={{ lineHeight: '1.8', color: '#333' }}>
          <h4 style={{ marginTop: '20px', marginBottom: '10px', color: '#667eea' }}>Cách cấu hình Firebase:</h4>
          <ol style={{ paddingLeft: '20px' }}>
            <li>Truy cập <strong>Firebase Console</strong> (console.firebase.google.com)</li>
            <li>Chọn dự án của bạn hoặc tạo dự án mới</li>
            <li>Vào phần <strong>Realtime Database</strong></li>
            <li>Sao chép <strong>Database URL</strong> và dán vào trường phía trên</li>
            <li>Vào <strong>Project Settings</strong> để lấy các thông tin khác</li>
            <li>Dán tất cả thông tin vào các trường tương ứng</li>
            <li>Nhấp nút <strong>Kiểm tra kết nối</strong> để xác minh</li>
            <li>Nhấp <strong>Lưu cấu hình</strong> để hoàn thành</li>
          </ol>

          <h4 style={{ marginTop: '20px', marginBottom: '10px', color: '#667eea' }}>Cấu trúc dữ liệu Firebase:</h4>
          <pre style={{
            backgroundColor: '#f5f5f5',
            padding: '15px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
{`{
  "current": {
    "temperature": 28.5,
    "humidity": 65,
    "pm25": 15.2,
    "pm10": 25.5,
    "timestamp": "2024-03-15T10:30:00Z"
  },
  "history": {
    "record1": {
      "temperature": 27.3,
      "humidity": 60,
      "pm25": 12.5,
      "pm10": 22.3,
      "timestamp": "2024-03-15T09:30:00Z"
    }
  }
}`}
          </pre>

          <h4 style={{ marginTop: '20px', marginBottom: '10px', color: '#667eea' }}>Quy tắc bảo mật Firebase:</h4>
          <pre style={{
            backgroundColor: '#f5f5f5',
            padding: '15px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
{`{
  "rules": {
    ".read": true,
    ".write": false
  }
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Settings;
