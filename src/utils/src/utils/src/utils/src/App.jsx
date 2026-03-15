import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import CurrentData from './pages/CurrentData';
import History from './pages/History';
import Settings from './pages/Settings';
import Forecast from './pages/Forecast';
import './index.css';

const App = () => {
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dữ liệu hiện tại', icon: 'fas fa-chart-line' },
    { path: '/history', label: 'Lịch sử', icon: 'fas fa-history' },
    { path: '/settings', label: 'Cài đặt', icon: 'fas fa-cogs' },
    { path: '/forecast', label: 'Dự đoán', icon: 'fas fa-cloud' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <i className="fas fa-wind"></i>
            Air Quality Monitor
          </div>
          <ul className="nav-links">
            {navItems.map(item => (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  className={isActive(item.path) ? 'active' : ''}
                >
                  <i className={item.icon}></i> {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<CurrentData />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/forecast" element={<Forecast />} />
        </Routes>
      </div>
    </div>
  );
};

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
