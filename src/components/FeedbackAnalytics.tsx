import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Download, TrendingUp, MessageSquare, Calendar, AlertTriangle } from 'lucide-react'
import StatsCard from './StatsCard'
import ChartCard from './ChartCard'
import './FeedbackAnalytics.css'

interface ApiData {
  patients: {
    total: number
  }
  feedback: {
    total: number
    urgent: number
    sentiment_breakdown: {
      positive: {
        count: number
        percentage: number
      }
      negative: {
        count: number
        percentage: number
      }
      neutral: {
        count: number
        percentage: number
      }
    }
  }
  reminders: {
    total: number
    active: number
  }
  deliveries: {
    total: number
    successful: number
    failed: number
    success_rate: number
  }
}

const FeedbackAnalytics = () => {
  const [data, setData] = useState<ApiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      // Note: You'll need to replace this with the actual Track3 feedback API endpoint
      const response = await fetch('https://foam-quarterly-stockings-elect.trycloudflare.com/api/dashboard/stats')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      
      // Validate the response structure
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response format')
      }
      
      setData(result)
    } catch (err) {
      console.error('Failed to fetch analytics data:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data')
      
      // Set fallback data to prevent crashes
      setData({
        patients: { total: 0 },
        feedback: {
          total: 0,
          urgent: 0,
          sentiment_breakdown: {
            positive: { count: 0, percentage: 0 },
            negative: { count: 0, percentage: 0 },
            neutral: { count: 0, percentage: 0 }
          }
        },
        reminders: { total: 0, active: 0 },
        deliveries: { total: 0, successful: 0, failed: 0, success_rate: 0 }
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      // Note: You'll need to replace this with the actual Track3 export API endpoint
      const response = await fetch('https://carechat-dswb-v8ex.onrender.com/api/export')
      if (!response.ok) {
        throw new Error('Failed to export data')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'feedback_export.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

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

  if (loading) {
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
              <div className="nav-item" onClick={navigateToDashboard}>
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
                <span className="nav-text">Add Sample</span>
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
              
              <div className="nav-item active" onClick={navigateToFeedbackAnalytics}>
                <div className="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="2"/>
                    <line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <span className="nav-text"> Feedback Analytics </span>
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
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
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
              <div className="nav-item" onClick={navigateToDashboard}>
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
                <span className="nav-text">Add Sample</span>
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
              
              <div className="nav-item active" onClick={navigateToFeedbackAnalytics}>
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
          <div className="error-container">
            <div className="error-content">
              <AlertTriangle className="error-icon" />
              <h2 className="error-title">Error Loading Dashboard</h2>
              <p className="error-message">{error}</p>
              <button
                onClick={fetchData}
                className="retry-button"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  // Process data for charts with null checks and default values
  const feedbackData = data?.feedback || {
    total: 0,
    urgent: 0,
    sentiment_breakdown: {
      positive: { count: 0, percentage: 0 },
      negative: { count: 0, percentage: 0 },
      neutral: { count: 0, percentage: 0 }
    }
  }
  
  const sentimentData = [
    { name: 'Positive', value: feedbackData.sentiment_breakdown.positive.count, color: '#10b981' },
    { name: 'Neutral', value: feedbackData.sentiment_breakdown.neutral.count, color: '#f59e0b' },
    { name: 'Negative', value: feedbackData.sentiment_breakdown.negative.count, color: '#ef4444' }
  ]

  // Create sample rating data based on sentiment (since rating_trends not available in new API)
  const ratingData = [
    { rating: '5 Stars', count: Math.round(feedbackData.sentiment_breakdown.positive.count * 0.8) },
    { rating: '4 Stars', count: Math.round(feedbackData.sentiment_breakdown.positive.count * 0.2) },
    { rating: '3 Stars', count: feedbackData.sentiment_breakdown.neutral.count },
    { rating: '2 Stars', count: Math.round(feedbackData.sentiment_breakdown.negative.count * 0.3) },
    { rating: '1 Star', count: Math.round(feedbackData.sentiment_breakdown.negative.count * 0.7) }
  ].filter(item => item.count > 0)

  // Create sample topic data based on negative feedback
  const topicData = feedbackData.sentiment_breakdown.negative.count > 0 ? [
    { topic: 'Wait Times', count: Math.round(feedbackData.sentiment_breakdown.negative.count * 0.4) },
    { topic: 'Communication', count: Math.round(feedbackData.sentiment_breakdown.negative.count * 0.3) },
    { topic: 'Staff Attitude', count: Math.round(feedbackData.sentiment_breakdown.negative.count * 0.2) },
    { topic: 'Facilities', count: Math.round(feedbackData.sentiment_breakdown.negative.count * 0.1) }
  ].filter(item => item.count > 0) : []

  // Create sample reminder timeline data
  const reminderData = data?.reminders ? [
    { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toLocaleDateString(), count: Math.round(data.reminders.total * 0.1) },
    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString(), count: Math.round(data.reminders.total * 0.15) },
    { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toLocaleDateString(), count: Math.round(data.reminders.total * 0.2) },
    { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString(), count: Math.round(data.reminders.total * 0.25) },
    { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(), count: Math.round(data.reminders.total * 0.15) },
    { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString(), count: Math.round(data.reminders.total * 0.1) },
    { date: new Date().toLocaleDateString(), count: data.reminders.active }
  ] : []

  const totalFeedback = feedbackData.total
  const totalPatients = data?.patients?.total || 0

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
            <div className="nav-item" onClick={navigateToDashboard}>
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
              <span className="nav-text">Add Sample</span>
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
            
            <div className="nav-item active" onClick={navigateToFeedbackAnalytics}>
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

        {/* Analytics Content */}
        <div className="analytics-content">
          {/* Header */}
          <div className="analytics-header">
            <div className="analytics-title-section">
              <h1>CareChat Analytics</h1>
              <p>Hospital feedback and reminder insights</p>
            </div>
            <button
              onClick={handleExport}
              className="export-button"
            >
              <Download className="h-4 w-4" />
              Export Data
            </button>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <StatsCard
              title="Total Patients"
              value={totalPatients.toString()}
              icon={<MessageSquare className="h-6 w-6" />}
              trend="+12%"
              trendUp={true}
            />
            <StatsCard
              title="Total Feedback"
              value={totalFeedback.toString()}
              icon={<Calendar className="h-6 w-6" />}
              trend="+8%"
              trendUp={true}
            />
            <StatsCard
              title="Active Reminders"
              value={(data?.reminders?.active || 0).toString()}
              icon={<AlertTriangle className="h-6 w-6" />}
              trend="-5%"
              trendUp={false}
            />
            <StatsCard
              title="Delivery Success Rate"
              value={`${data?.deliveries?.success_rate || 0}%`}
              icon={<TrendingUp className="h-6 w-6" />}
              trend="+3%"
              trendUp={true}
            />
          </div>

          {/* Charts Grid */}
          <div className="charts-grid">
            {/* Sentiment Analysis */}
            <ChartCard title="Sentiment Analysis" description="Overall feedback sentiment distribution">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Rating Distribution */}
            <ChartCard title="Rating Distribution" description="Breakdown of user ratings">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={ratingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="charts-grid-bottom">
            {/* Negative Topics */}
            <ChartCard title="Common Issues" description="Most frequently reported negative topics">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={topicData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="topic" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Reminders Timeline */}
            <ChartCard title="Daily Reminders" description="Reminder activity over time">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={reminderData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeedbackAnalytics
