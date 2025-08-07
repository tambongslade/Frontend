import React, { useState, useEffect } from 'react';
import './Dashboard.css';

interface BloodInventoryItem {
  blood_group: string;
  total_available: number;
  total_near_expiry: number;
  total_expired: number;
  available_units: number;
  last_updated: string;
}

const Dashboard: React.FC = () => {
  const [inventory, setInventory] = useState<BloodInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('https://blood-management-system-xplx.onrender.com/api/v1/blood-bank/inventory', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inventory data');
      }

      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError(error instanceof Error ? error.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    window.location.href = '/';
  };

  const navigateToAddSample = () => {
    window.location.href = '/add-sample';
  };

  const navigateToBloodUsage = () => {
    window.location.href = '/blood-usage';
  };

  const navigateToForecasting = () => {
    window.location.href = '/forecasting';
  };

  const navigateToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const navigateToFeedbackAnalytics = () => {
    window.location.href = '/feedback-analytics';
  };


  const getTimeToExpiryPercentage = (nearExpiry: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round(((total - nearExpiry) / total) * 100);
  };

  const getBloodTypeIcon = (): string => {
    return '🩸'; // Blood drop emoji for all types
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Professional Sidebar */}
      <div className="professional-sidebar">
        <div className="sidebar-header">
          <div className="brand-logo" onClick={navigateToDashboard} style={{ cursor: 'pointer' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="brand-text">CareChat</span>
          </div>
        </div>
        
        <nav className="sidebar-navigation">
          <div className="nav-section">
            <div className="nav-item active" onClick={navigateToDashboard}>
              <div className="nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="nav-text">BloodBank </span>
            </div>
            
            <div className="nav-item" onClick={navigateToAddSample}>
              <div className="nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2"/>
                  <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <span className="nav-text">Blood Samples</span>
            </div>
            
            <div className="nav-item" onClick={navigateToBloodUsage}>
              <div className="nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="nav-text">Blood Usage</span>
            </div>
            
            <div className="nav-item" onClick={navigateToForecasting}>
              <div className="nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="12" y1="20" x2="12" y2="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="18" y1="20" x2="18" y2="4" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="20" x2="6" y2="16" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <span className="nav-text">Forecasting</span>
            </div>
            
            <div className="nav-item" onClick={navigateToFeedbackAnalytics}>
              <div className="nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <span className="nav-text">Feedback Analytics </span>
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item logout-item" onClick={handleLogout}>
            <div className="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="nav-text">Logout</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search..." 
              className="search-input"
            />
            <div className="search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          
          <div className="header-actions">
            <div className="language-selector">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 12h20" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>English</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="6,9 12,15 18,9" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="settings-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-container">
          <div className="filter-group">
            <select className="filter-select">
              <option>Date Range</option>
            </select>
            <span className="filter-arrow">▼</span>
          </div>
          
          <div className="filter-group">
            <select className="filter-select">
              <option>Blood Type</option>
            </select>
            <span className="filter-arrow">▼</span>
          </div>
          
          <div className="filter-group">
            <select className="filter-select">
              <option>Location</option>
            </select>
            <span className="filter-arrow">▼</span>
          </div>
          
          <button className="reset-filters">Reset Filters</button>
          <button className="export-report">Export Report</button>
        </div>

        {/* Stock Overview */}
        <div className="content">
          <h2 className="page-title">Stock Overview</h2>
          
          <div className="blood-cards-grid">
            {inventory.map((item) => (
              <div key={item.blood_group} className="blood-card">
                <div className="blood-card-header">
                  <div className="blood-icon">
                    {getBloodTypeIcon()}
                  </div>
                  <div className="blood-type">
                    {item.blood_group}
                  </div>
                </div>
                
                <div className="units-info">
                  <div className="total-units">{item.available_units} UNITS</div>
                </div>
                
                <div className="status-bars">
                  <div className="status-item available">
                    <span className="status-count">{Math.round(item.total_available / 1000)}k Available</span>
                    <span className="status-count reserved">{Math.round(item.total_near_expiry / 1000)}k reserved</span>
                  </div>
                </div>
                
                <div className="status-bars">
                  <div className="status-item near-expiry">
                    <span className="status-count">{Math.round(item.total_near_expiry / 1000)}k Near Expiry</span>
                    <span className="status-count expired">{Math.round(item.total_expired / 1000)}k Expired</span>
                  </div>
                </div>
                
                <div className="expiry-info">
                  <div className="expiry-label">Time to Expiry</div>
                  <div className="expiry-percentage">{getTimeToExpiryPercentage(item.total_near_expiry, item.total_available)}%</div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${getTimeToExpiryPercentage(item.total_near_expiry, item.total_available)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
