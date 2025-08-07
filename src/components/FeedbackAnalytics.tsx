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
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <div className="logo" onClick={navigateToDashboard} style={{ cursor: 'pointer' }} title="Dashboard Home">
              🏠
            </div>
          </div>
          
          <div className="sidebar-menu">
            <div className="menu-item" onClick={navigateToAddSample} title="Add Sample">
              <span className="menu-icon">+</span>
            </div>
            <div className="menu-item" onClick={navigateToBloodUsage} title="Blood Usage">
              <span className="menu-icon">🩸</span>
            </div>
            <div className="menu-item" onClick={navigateToDashboard} title="Dashboard">
              <span className="menu-icon">🏠</span>
            </div>
            <div className="menu-item" onClick={navigateToForecasting} title="Forecasting">
              <span className="menu-icon">📊</span>
            </div>
            <div className="menu-item active" onClick={navigateToFeedbackAnalytics} title="Feedback Analytics">
              <span className="menu-icon">📈</span>
            </div>
          </div>

          <div className="sidebar-footer">
            <div className="menu-item logout" onClick={handleLogout} title="Logout">
              <span className="menu-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
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
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <div className="logo" onClick={navigateToDashboard} style={{ cursor: 'pointer' }} title="Dashboard Home">
              🏠
            </div>
          </div>
          
          <div className="sidebar-menu">
            <div className="menu-item" onClick={navigateToAddSample} title="Add Sample">
              <span className="menu-icon">+</span>
            </div>
            <div className="menu-item" onClick={navigateToBloodUsage} title="Blood Usage">
              <span className="menu-icon">🩸</span>
            </div>
            <div className="menu-item" onClick={navigateToDashboard} title="Dashboard">
              <span className="menu-icon">🏠</span>
            </div>
            <div className="menu-item" onClick={navigateToForecasting} title="Forecasting">
              <span className="menu-icon">📊</span>
            </div>
            <div className="menu-item active" onClick={navigateToFeedbackAnalytics} title="Feedback Analytics">
              <span className="menu-icon">📈</span>
            </div>
          </div>

          <div className="sidebar-footer">
            <div className="menu-item logout" onClick={handleLogout} title="Logout">
              <span className="menu-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
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
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo" onClick={navigateToDashboard} style={{ cursor: 'pointer' }} title="Dashboard Home">
            🏠
          </div>
        </div>
        
        <div className="sidebar-menu">
          <div className="menu-item" onClick={navigateToAddSample} title="Add Sample">
            <span className="menu-icon">+</span>
          </div>
          <div className="menu-item" onClick={navigateToBloodUsage} title="Blood Usage">
            <span className="menu-icon">🩸</span>
          </div>
          <div className="menu-item" onClick={navigateToDashboard} title="Dashboard">
            <span className="menu-icon">🏠</span>
          </div>
          <div className="menu-item" onClick={navigateToForecasting} title="Forecasting">
            <span className="menu-icon">📊</span>
          </div>
          <div className="menu-item active" onClick={navigateToFeedbackAnalytics} title="Feedback Analytics">
            <span className="menu-icon">📈</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="menu-item logout" onClick={handleLogout} title="Logout">
            <span className="menu-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
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
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="header-actions">
            <div className="language-selector">
              <span className="flag">🇺🇸</span>
              <span>English</span>
              <span className="dropdown-arrow">▼</span>
            </div>
            <div className="settings-icon">⚙️</div>
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
