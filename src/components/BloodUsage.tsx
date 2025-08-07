import React, { useState, useEffect, useCallback } from 'react';
import './BloodUsage.css';

interface BloodUsageRecord {
  purpose: string;
  department: string;
  blood_group: string;
  volume_given_out: number;
  usage_date: string;
  individual_name: string;
  patient_location: string;
  usage_id: string;
  created_at: string;
  updated_at: string;
}

interface BloodUsageData {
  purpose: string;
  department: string;
  blood_group: string;
  volume_given_out: number | '';
  usage_date: string;
  individual_name: string;
  patient_location: string;
}

interface FilterParams {
  blood_group: string;
  usage_date_from: string;
  usage_date_to: string;
  patient_location: string;
  limit?: number;
  offset?: number;
}

const BloodUsage: React.FC = () => {
  const [usageRecords, setUsageRecords] = useState<BloodUsageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState<BloodUsageData>({
    purpose: '',
    department: '',
    blood_group: '',
    volume_given_out: '',
    usage_date: '',
    individual_name: '',
    patient_location: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<FilterParams>({
    blood_group: '',
    usage_date_from: '',
    usage_date_to: '',
    patient_location: '',
    limit: 100,
    offset: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const departments = [
    'Emergency Department',
    'Surgery',
    'ICU',
    'Cardiology',
    'Oncology',
    'Orthopedics',
    'Pediatrics',
    'Obstetrics',
    'Internal Medicine',
    'Trauma Unit'
  ];

  const handleCancel = useCallback(() => {
    setFormData({
      purpose: '',
      department: '',
      blood_group: '',
      volume_given_out: '',
      usage_date: '',
      individual_name: '',
      patient_location: ''
    });
    setError('');
    setSuccess('');
    setShowAddForm(false);
  }, []);

  useEffect(() => {
    fetchUsageRecords();
  }, []);

  // Modal keyboard and body scroll handling
  useEffect(() => {
    if (showAddForm) {
      // Disable body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Add ESC key listener
      const handleEscKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleCancel();
        }
      };
      
      document.addEventListener('keydown', handleEscKey);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [showAddForm, handleCancel]);

  const fetchUsageRecords = async (filterParams?: Partial<FilterParams>) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Use provided filters or current state filters
      const currentFilters = filterParams || filters;
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('limit', (currentFilters.limit ?? filters.limit ?? 100).toString());
      queryParams.append('offset', (currentFilters.offset ?? filters.offset ?? 0).toString());
      
      if (currentFilters.blood_group) {
        queryParams.append('blood_group', currentFilters.blood_group);
      }
      if (currentFilters.usage_date_from) {
        queryParams.append('usage_date_from', currentFilters.usage_date_from);
      }
      if (currentFilters.usage_date_to) {
        queryParams.append('usage_date_to', currentFilters.usage_date_to);
      }
      if (currentFilters.patient_location) {
        queryParams.append('patient_location', currentFilters.patient_location);
      }

      const response = await fetch(`https://blood-management-system-xplx.onrender.com/api/v1/blood-bank/usage?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch usage records');
      }

      const data = await response.json();
      setUsageRecords(Array.isArray(data) ? data : data.records || []);
      
      // If response includes total count, use it for pagination
      if (data.total !== undefined) {
        setTotalRecords(data.total);
      } else {
        setTotalRecords(Array.isArray(data) ? data.length : data.records?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching usage records:', error);
      setError(error instanceof Error ? error.message : 'Failed to load usage records');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('volume_given_out') 
        ? (value === '' ? '' : Number(value))
        : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      setError('');
    } else {
      setError('Please select a valid CSV file');
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name === 'limit' || name === 'offset' ? Number(value) : value
    }));
  };

  const applyFilters = () => {
    const newFilters = { ...filters, offset: 0 }; // Reset to first page
    setFilters(newFilters);
    fetchUsageRecords(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      blood_group: '',
      usage_date_from: '',
      usage_date_to: '',
      patient_location: '',
      limit: 100,
      offset: 0
    };
    setFilters(clearedFilters);
    fetchUsageRecords(clearedFilters);
  };

  const handlePageChange = (newOffset: number) => {
    const newFilters = { ...filters, offset: newOffset };
    setFilters(newFilters);
    fetchUsageRecords(newFilters);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Prepare the data for submission
      const submissionData = {
        purpose: formData.purpose,
        department: formData.department,
        blood_group: formData.blood_group,
        volume_given_out: formData.volume_given_out,
        usage_date: formData.usage_date,
        individual_name: formData.individual_name,
        patient_location: formData.patient_location
      };

      const response = await fetch('https://blood-management-system-xplx.onrender.com/api/v1/blood-bank/usage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to record blood usage');
      }

      const data = await response.json();
      setSuccess(`Blood usage recorded successfully! Usage ID: ${data.usage_id || data.id || 'Generated'}`);
      
      // Reset form
      setFormData({
        purpose: '',
        department: '',
        blood_group: '',
        volume_given_out: '',
        usage_date: '',
        individual_name: '',
        patient_location: ''
      });
      
      // Refresh the usage records list
      fetchUsageRecords();
      setShowAddForm(false);
      
    } catch (error) {
      console.error('Error recording blood usage:', error);
      setError(error instanceof Error ? error.message : 'Failed to record blood usage');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      setError('Please select a CSV file first');
      return;
    }

    setUploadLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('file', csvFile);

      const response = await fetch('https://blood-management-system-xplx.onrender.com/api/v1/blood-bank/usage/upload-csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload CSV file');
      }

      const data = await response.json();
      setSuccess(`CSV file uploaded successfully! ${data.message || 'Usage records processed.'}`);
      setCsvFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('csv-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error uploading CSV:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload CSV file');
    } finally {
      setUploadLoading(false);
    }
  };

  const navigateToAddSample = () => {
    window.location.href = '/add-sample';
  };

  const navigateToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const navigateToBloodUsage = () => {
    window.location.href = '/blood-usage';
  };

  const navigateToForecasting = () => {
    window.location.href = '/forecasting';
  };

  const navigateToFeedbackAnalytics = () => {
    window.location.href = '/feedback-analytics';
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    window.location.href = '/';
  };

  return (
    <div className="blood-usage-container">
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
              <span className="nav-text">Blood Samples</span>
            </div>
            
            <div className="nav-item active" onClick={navigateToBloodUsage}>
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
        <div className="content-container">
          <div className="page-header">
            <h1 className="page-title">Blood Usage Management</h1>
            <div className="header-actions">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="filter-toggle-btn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="add-usage-btn"
              >
                {showAddForm ? 'Cancel' : 'Add New Usage'}
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="filter-panel">
              <div className="filter-header">
                <h3 className="filter-title">Filter Records</h3>
              </div>
              
              <div className="filter-content">
                <div className="filter-row">
                  <div className="filter-group">
                    <label className="filter-label">Blood Group</label>
                    <select
                      name="blood_group"
                      value={filters.blood_group}
                      onChange={handleFilterChange}
                      className="filter-select"
                    >
                      <option value="">All Blood Groups</option>
                      {bloodTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">Patient Location</label>
                    <input
                      type="text"
                      name="patient_location"
                      value={filters.patient_location}
                      onChange={handleFilterChange}
                      placeholder="Enter location..."
                      className="filter-input"
                    />
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">Records per page</label>
                    <select
                      name="limit"
                      value={filters.limit}
                      onChange={handleFilterChange}
                      className="filter-select"
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                    </select>
                  </div>
                </div>

                <div className="filter-row">
                  <div className="filter-group">
                    <label className="filter-label">Usage Date From</label>
                    <input
                      type="date"
                      name="usage_date_from"
                      value={filters.usage_date_from}
                      onChange={handleFilterChange}
                      className="filter-input"
                    />
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">Usage Date To</label>
                    <input
                      type="date"
                      name="usage_date_to"
                      value={filters.usage_date_to}
                      onChange={handleFilterChange}
                      className="filter-input"
                    />
                  </div>
                </div>

                <div className="filter-actions">
                  <button
                    onClick={applyFilters}
                    className="apply-filters-btn"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={clearFilters}
                    className="clear-filters-btn"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}


          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading usage records...</p>
            </div>
          ) : (
            <>
              {/* Usage Records Table */}
              <div className="table-container">
                <h2 className="section-title">Blood Usage Records</h2>
                
                {usageRecords.length === 0 ? (
                  <div className="no-records">
                    <p>No usage records found.</p>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="usage-table">
                      <thead>
                        <tr>
                          <th>Usage ID</th>
                          <th>Individual Name</th>
                          <th>Blood Group</th>
                          <th>Volume (ml)</th>
                          <th>Purpose</th>
                          <th>Department</th>
                          <th>Location</th>
                          <th>Usage Date</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usageRecords.map((record) => (
                          <tr key={record.usage_id}>
                            <td className="usage-id">{record.usage_id}</td>
                            <td className="name">{record.individual_name}</td>
                            <td className="blood-group">
                              <span className={`blood-type-badge blood-type-${record.blood_group.replace('+', 'pos').replace('-', 'neg')}`}>
                                {record.blood_group}
                              </span>
                            </td>
                            <td className="volume">{record.volume_given_out} ml</td>
                            <td className="purpose">{record.purpose}</td>
                            <td className="department">{record.department}</td>
                            <td className="location">{record.patient_location}</td>
                            <td className="date">{new Date(record.usage_date).toLocaleDateString()}</td>
                            <td className="created">{new Date(record.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination Controls */}
                {usageRecords.length > 0 && (
                  <div className="pagination-container">
                    <div className="pagination-info">
                      <span>
                        Showing {(filters.offset ?? 0) + 1} to {Math.min((filters.offset ?? 0) + (filters.limit ?? 100), totalRecords)} of {totalRecords} records
                      </span>
                    </div>
                    
                    <div className="pagination-controls">
                      <button
                        onClick={() => handlePageChange(Math.max(0, (filters.offset ?? 0) - (filters.limit ?? 100)))}
                        disabled={(filters.offset ?? 0) === 0}
                        className="pagination-btn"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Previous
                      </button>
                      
                      <div className="pagination-numbers">
                        {Array.from({ length: Math.ceil(totalRecords / (filters.limit ?? 100)) }, (_, i) => i).map(pageIndex => {
                          const isCurrentPage = pageIndex * (filters.limit ?? 100) === (filters.offset ?? 0);
                          const pageNumber = pageIndex + 1;
                          
                          // Show only a few page numbers around current page
                          const currentPageIndex = Math.floor((filters.offset ?? 0) / (filters.limit ?? 100));
                          if (Math.abs(pageIndex - currentPageIndex) > 2 && pageIndex !== 0 && pageIndex !== Math.floor(totalRecords / (filters.limit ?? 100))) {
                            return null;
                          }
                          
                          return (
                            <button
                              key={pageIndex}
                              onClick={() => handlePageChange(pageIndex * (filters.limit ?? 100))}
                              className={`pagination-number ${isCurrentPage ? 'active' : ''}`}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => handlePageChange((filters.offset ?? 0) + (filters.limit ?? 100))}
                        disabled={(filters.offset ?? 0) + (filters.limit ?? 100) >= totalRecords}
                        className="pagination-btn"
                      >
                        Next
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Add Usage Form Modal */}
              {showAddForm && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCancel()}>
                  <div className="modal-container">
                    <div className="modal-header">
                      <h2 className="modal-title">Add New Blood Usage</h2>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="modal-close-btn"
                        aria-label="Close modal"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                    
                    <div className="modal-content">
                      <form onSubmit={handleSubmit} className="blood-usage-form">
                        {/* Individual Information Section */}
                        <div className="form-section">
                          <h3 className="section-title">Individual Information</h3>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <div className="input-wrapper">
                                <span className="input-icon">👤</span>
                                <input
                                  type="text"
                                  name="individual_name"
                                  placeholder="Individual Name *"
                                  value={formData.individual_name}
                                  onChange={handleInputChange}
                                  required
                                  className="form-input"
                                />
                              </div>
                            </div>

                            <div className="form-group">
                              <div className="input-wrapper">
                                <span className="input-icon">📍</span>
                                <input
                                  type="text"
                                  name="patient_location"
                                  placeholder="Patient Location *"
                                  value={formData.patient_location}
                                  onChange={handleInputChange}
                                  required
                                  className="form-input"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <div className="input-wrapper">
                                <span className="input-icon">🎯</span>
                                <input
                                  type="text"
                                  name="purpose"
                                  placeholder="Purpose/Reason *"
                                  value={formData.purpose}
                                  onChange={handleInputChange}
                                  required
                                  className="form-input"
                                />
                              </div>
                            </div>

                            <div className="form-group">
                              <div className="input-wrapper">
                                <span className="input-icon">🏥</span>
                                <select
                                  name="department"
                                  value={formData.department}
                                  onChange={handleInputChange}
                                  required
                                  className="form-input form-select"
                                >
                                  <option value="">Department *</option>
                                  {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Blood Usage Details Section */}
                        <div className="form-section">
                          <h3 className="section-title">Blood Usage Details</h3>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <div className="input-wrapper">
                                <span className="input-icon">🩸</span>
                                <select
                                  name="blood_group"
                                  value={formData.blood_group}
                                  onChange={handleInputChange}
                                  required
                                  className="form-input form-select"
                                >
                                  <option value="">Blood Group *</option>
                                  {bloodTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="form-group">
                              <div className="input-wrapper">
                                <span className="input-icon">🧪</span>
                                <input
                                  type="number"
                                  name="volume_given_out"
                                  placeholder="Volume Given Out (ml) *"
                                  value={formData.volume_given_out}
                                  onChange={handleInputChange}
                                  required
                                  className="form-input"
                                  min="1"
                                  max="5000"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <div className="input-wrapper">
                                <span className="input-icon">📅</span>
                                <input
                                  type="date"
                                  name="usage_date"
                                  value={formData.usage_date}
                                  onChange={handleInputChange}
                                  required
                                  className="form-input"
                                />
                                <label className="date-label">Usage Date:</label>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* CSV Upload Section */}
                        <div className="form-section">
                          <h3 className="section-title">Bulk Upload (Optional)</h3>
                          
                          {/* CSV Format Guide */}
                          <div className="csv-format-guide">
                            <h4 className="guide-title">📋 CSV Format Requirements</h4>
                            <p className="guide-description">Your CSV file must include the following columns with exact names:</p>
                            
                            <div className="format-grid">
                              <div className="format-item required">
                                <span className="field-name">purpose</span>
                                <span className="field-type">Required</span>
                                <span className="field-description">Purpose of blood usage (string)</span>
                              </div>
                              
                              <div className="format-item required">
                                <span className="field-name">department</span>
                                <span className="field-type">Required</span>
                                <span className="field-description">Department name</span>
                              </div>
                              
                              <div className="format-item required">
                                <span className="field-name">blood_group</span>
                                <span className="field-type">Required</span>
                                <span className="field-description">A+, A-, B+, B-, AB+, AB-, O+, O-</span>
                              </div>
                              
                              <div className="format-item required">
                                <span className="field-name">volume_given_out</span>
                                <span className="field-type">Required</span>
                                <span className="field-description">Volume in ml (1-10000, supports bulk usage)</span>
                              </div>
                              
                              <div className="format-item required">
                                <span className="field-name">usage_date</span>
                                <span className="field-type">Required</span>
                                <span className="field-description">Date in YYYY-MM-DD format</span>
                              </div>
                              
                              <div className="format-item optional">
                                <span className="field-name">individual_name</span>
                                <span className="field-type">Optional</span>
                                <span className="field-description">Patient name</span>
                              </div>
                              
                              <div className="format-item required">
                                <span className="field-name">patient_location</span>
                                <span className="field-type">Required</span>
                                <span className="field-description">Hospital/location name</span>
                              </div>
                            </div>
                            
                            <div className="format-example">
                              <strong>Example CSV header:</strong>
                              <code>purpose,department,blood_group,volume_given_out,usage_date,individual_name,patient_location</code>
                            </div>
                          </div>

                          <div className="csv-upload-container">
                            <div className="form-group">
                              <div className="input-wrapper">
                                <span className="input-icon">📄</span>
                                <input
                                  type="file"
                                  id="csv-file"
                                  accept=".csv"
                                  onChange={handleFileChange}
                                  className="form-input file-input"
                                />
                                <label htmlFor="csv-file" className="file-label">
                                  {csvFile ? csvFile.name : 'Choose CSV file for bulk usage upload...'}
                                </label>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleCsvUpload}
                              disabled={!csvFile || uploadLoading}
                              className="upload-btn"
                            >
                              {uploadLoading ? 'Uploading...' : 'Upload CSV'}
                            </button>
                          </div>
                        </div>

                        {/* Error and Success Messages */}
                        {error && (
                          <div className="modal-error-message">
                            {error}
                          </div>
                        )}

                        {success && (
                          <div className="modal-success-message">
                            {success}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="modal-actions">
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="save-btn"
                          >
                            {isLoading ? 'Recording...' : 'Record Usage'}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="cancel-btn"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BloodUsage;
