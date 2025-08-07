import React, { useState, useEffect, useCallback } from 'react';
import './AddSample.css';

interface SampleRecord {
  donor_age: number;
  donor_gender: string;
  donor_occupation: string;
  blood_type: string;
  collection_site: string;
  donation_date: string;
  expiry_date: string;
  collection_volume_ml: number;
  hemoglobin_g_dl: number;
  donation_record_id: string;
  created_at: string;
  updated_at: string;
}

interface DonorData {
  donor_age: number | '';
  donor_gender: string;
  donor_occupation: string;
  blood_type: string;
  collection_site: string;
  donation_date: string;
  expiry_date: string;
  collection_volume_ml: number | '';
  hemoglobin_g_dl: number | '';
}

interface FilterParams {
  blood_type: string;
  collection_date_from: string;
  collection_date_to: string;
  limit?: number;
  offset?: number;
}

const AddSample: React.FC = () => {
  const [sampleRecords, setSampleRecords] = useState<SampleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState<DonorData>({
    donor_age: '',
    donor_gender: '',
    donor_occupation: '',
    blood_type: '',
    collection_site: '',
    donation_date: '',
    expiry_date: '',
    collection_volume_ml: '',
    hemoglobin_g_dl: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<FilterParams>({
    blood_type: '',
    collection_date_from: '',
    collection_date_to: '',
    limit: 100,
    offset: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['M', 'F', 'Other'];
  const volumes = ['250', '350', '450', '500'];

  const handleCancel = useCallback(() => {
    setFormData({
      donor_age: '',
      donor_gender: '',
      donor_occupation: '',
      blood_type: '',
      collection_site: '',
      donation_date: '',
      expiry_date: '',
      collection_volume_ml: '',
      hemoglobin_g_dl: ''
    });
    setError('');
    setSuccess('');
    setShowAddForm(false);
  }, []);

  useEffect(() => {
    fetchSampleRecords();
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

  const fetchSampleRecords = async (filterParams?: Partial<FilterParams>) => {
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
      
      if (currentFilters.blood_type) {
        queryParams.append('blood_type', currentFilters.blood_type);
      }
      if (currentFilters.collection_date_from) {
        queryParams.append('collection_date_from', currentFilters.collection_date_from);
      }
      if (currentFilters.collection_date_to) {
        queryParams.append('collection_date_to', currentFilters.collection_date_to);
      }

      const response = await fetch(`https://blood-management-system-xplx.onrender.com/api/v1/blood-bank/collections?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sample records');
      }

      const data = await response.json();
      setSampleRecords(Array.isArray(data) ? data : data.records || []);
      
      // If response includes total count, use it for pagination
      if (data.total !== undefined) {
        setTotalRecords(data.total);
      } else {
        setTotalRecords(Array.isArray(data) ? data.length : data.records?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching sample records:', error);
      setError(error instanceof Error ? error.message : 'Failed to load sample records');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('age') || name.includes('ml') || name.includes('g_dl') 
        ? (value === '' ? '' : Number(value))
        : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
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
    fetchSampleRecords(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      blood_type: '',
      collection_date_from: '',
      collection_date_to: '',
      limit: 100,
      offset: 0
    };
    setFilters(clearedFilters);
    fetchSampleRecords(clearedFilters);
  };

  const handlePageChange = (newOffset: number) => {
    const newFilters = { ...filters, offset: newOffset };
    setFilters(newFilters);
    fetchSampleRecords(newFilters);
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

      const response = await fetch('https://blood-management-system-xplx.onrender.com/api/v1/blood-bank/collections', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add blood collection record');
      }

      const data = await response.json();
      setSuccess(`Blood collection record added successfully! ID: ${data.donation_record_id}`);
      
      // Reset form
      setFormData({
        donor_age: '',
        donor_gender: '',
        donor_occupation: '',
        blood_type: '',
        collection_site: '',
        donation_date: '',
        expiry_date: '',
        collection_volume_ml: '',
        hemoglobin_g_dl: ''
      });
      
      // Refresh the sample records list
      fetchSampleRecords();
      setShowAddForm(false);
      
    } catch (error) {
      console.error('Error adding blood collection:', error);
      setError(error instanceof Error ? error.message : 'Failed to add blood collection record');
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

      const response = await fetch('https://blood-management-system-xplx.onrender.com/api/v1/blood-bank/collections/upload-csv', {
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
      setSuccess(`CSV file uploaded successfully! ${data.message || 'Records processed.'}`);
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

  const navigateToBloodUsage = () => {
    window.location.href = '/blood-usage';
  };

  const navigateToDashboard = () => {
    window.location.href = '/dashboard';
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
    <div className="add-sample-container">
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
            
            <div className="nav-item active" onClick={navigateToAddSample}>
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
        <div className="content-container">
          <div className="page-header">
            <h1 className="page-title">Blood Collection Management</h1>
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
                className="add-sample-btn"
              >
                {showAddForm ? 'Cancel' : 'Add New Sample'}
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
                    <label className="filter-label">Blood Type</label>
                    <select
                      name="blood_type"
                      value={filters.blood_type}
                      onChange={handleFilterChange}
                      className="filter-select"
                    >
                      <option value="">All Blood Types</option>
                      {bloodTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
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
                    <label className="filter-label">Collection Date From</label>
                    <input
                      type="date"
                      name="collection_date_from"
                      value={filters.collection_date_from}
                      onChange={handleFilterChange}
                      className="filter-input"
                    />
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">Collection Date To</label>
                    <input
                      type="date"
                      name="collection_date_to"
                      value={filters.collection_date_to}
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
              <p>Loading sample records...</p>
            </div>
          ) : (
            <>
              {/* Sample Records Table */}
              <div className="table-container">
                <h2 className="section-title">Blood Collection Records</h2>
                
                {sampleRecords.length === 0 ? (
                  <div className="no-records">
                    <p>No sample records found.</p>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="sample-table">
                      <thead>
                        <tr>
                          <th>Record ID</th>
                          <th>Donor Age</th>
                          <th>Gender</th>
                          <th>Blood Type</th>
                          <th>Volume (ml)</th>
                          <th>Collection Site</th>
                          <th>Hemoglobin (g/dL)</th>
                          <th>Donation Date</th>
                          <th>Expiry Date</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sampleRecords.map((record) => (
                          <tr key={record.donation_record_id}>
                            <td className="record-id">{record.donation_record_id}</td>
                            <td className="age">{record.donor_age}</td>
                            <td className="gender">
                              <span className={`gender-badge ${record.donor_gender.toLowerCase()}`}>
                                {record.donor_gender === 'M' ? 'Male' : record.donor_gender === 'F' ? 'Female' : 'Other'}
                              </span>
                            </td>
                            <td className="blood-group">
                              <span className={`blood-type-badge blood-type-${record.blood_type.replace('+', 'pos').replace('-', 'neg')}`}>
                                {record.blood_type}
                              </span>
                            </td>
                            <td className="volume">{record.collection_volume_ml} ml</td>
                            <td className="site">{record.collection_site}</td>
                            <td className="hemoglobin">{record.hemoglobin_g_dl}</td>
                            <td className="date">{new Date(record.donation_date).toLocaleDateString()}</td>
                            <td className="expiry">{new Date(record.expiry_date).toLocaleDateString()}</td>
                            <td className="created">{new Date(record.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination Controls */}
                {sampleRecords.length > 0 && (
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

              {/* Add Sample Form Modal */}
              {showAddForm && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCancel()}>
                  <div className="modal-container">
                    <div className="modal-header">
                      <h2 className="modal-title">Add New Blood Collection</h2>
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
                      <form onSubmit={handleSubmit} className="add-sample-form">
                        {/* Donor Demographics Section */}
                        <div className="form-section">
                          <h3 className="section-title">Donor Demographics</h3>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <div className="input-wrapper">
                                <span className="input-icon">👤</span>
                                <input
                                  type="number"
                                  name="donor_age"
                                  placeholder="Enter Donor Age *"
                                  value={formData.donor_age}
                                  onChange={handleInputChange}
                                  required
                                  className="form-input"
                                  min="16"
                                  max="65"
                                />
                              </div>
                            </div>

                            <div className="form-group">
                              <div className="input-wrapper">
                                <span className="input-icon">⚧</span>
                                <select
                                  name="donor_gender"
                                  value={formData.donor_gender}
                                  onChange={handleInputChange}
                                  required
                                  className="form-input form-select"
                                >
                                  <option value="">Gender *</option>
                                  {genders.map(gender => (
                                    <option key={gender} value={gender}>
                                      {gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : 'Other'}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group full-width">
                              <div className="input-wrapper">
                                <span className="input-icon">💼</span>
                                <input
                                  type="text"
                                  name="donor_occupation"
                                  placeholder="Occupation"
                                  value={formData.donor_occupation}
                                  onChange={handleInputChange}
                                  className="form-input"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Clinical Data Section */}
                        <div className="form-section">
                          <h3 className="section-title">Clinical Data</h3>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <div className="input-wrapper">
                                <span className="input-icon">🩸</span>
                                <select
                                  name="blood_type"
                                  value={formData.blood_type}
                                  onChange={handleInputChange}
                                  required
                                  className="form-input form-select"
                                >
                                  <option value="">Blood Type *</option>
                                  {bloodTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="form-group">
                              <div className="input-wrapper">
                                <span className="input-icon">💧</span>
                                <select
                                  name="collection_volume_ml"
                                  value={formData.collection_volume_ml}
                                  onChange={handleInputChange}
                                  required
                                  className="form-input form-select"
                                >
                                  <option value="">Volume(bags)</option>
                                  {volumes.map(volume => (
                                    <option key={volume} value={volume}>{volume}ml</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <div className="input-wrapper">
                                <span className="input-icon">🏥</span>
                                <input
                                  type="text"
                                  name="collection_site"
                                  placeholder="Collection Site"
                                  value={formData.collection_site}
                                  onChange={handleInputChange}
                                  required
                                  className="form-input"
                                />
                              </div>
                            </div>

                            <div className="form-group">
                              <div className="input-wrapper">
                                <span className="input-icon">🔬</span>
                                <input
                                  type="number"
                                  name="hemoglobin_g_dl"
                                  placeholder="Hemoglobin Level (g/dL)"
                                  value={formData.hemoglobin_g_dl}
                                  onChange={handleInputChange}
                                  className="form-input"
                                  step="0.1"
                                  min="0"
                                  max="20"
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
                                  name="donation_date"
                                  value={formData.donation_date}
                                  onChange={handleInputChange}
                                  required
                                  className="form-input"
                                />
                                <label className="date-label">Date:</label>
                              </div>
                            </div>

                            <div className="form-group">
                              <div className="input-wrapper">
                                <span className="input-icon">⏰</span>
                                <input
                                  type="date"
                                  name="expiry_date"
                                  value={formData.expiry_date}
                                  onChange={handleInputChange}
                                  required
                                  className="form-input"
                                />
                                <label className="date-label">Expiry:</label>
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
                                <span className="field-name">donor_age</span>
                                <span className="field-type">Required</span>
                                <span className="field-description">Donor age in years (16-65)</span>
                              </div>
                              
                              <div className="format-item required">
                                <span className="field-name">donor_gender</span>
                                <span className="field-type">Required</span>
                                <span className="field-description">M, F, or Other</span>
                              </div>
                              
                              <div className="format-item optional">
                                <span className="field-name">donor_occupation</span>
                                <span className="field-type">Optional</span>
                                <span className="field-description">Donor's occupation (string)</span>
                              </div>
                              
                              <div className="format-item required">
                                <span className="field-name">blood_type</span>
                                <span className="field-type">Required</span>
                                <span className="field-description">A+, A-, B+, B-, AB+, AB-, O+, O-</span>
                              </div>
                              
                              <div className="format-item required">
                                <span className="field-name">collection_site</span>
                                <span className="field-type">Required</span>
                                <span className="field-description">Collection location/site name</span>
                              </div>
                              
                              <div className="format-item required">
                                <span className="field-name">donation_date</span>
                                <span className="field-type">Required</span>
                                <span className="field-description">Date in YYYY-MM-DD format</span>
                              </div>
                              
                              <div className="format-item required">
                                <span className="field-name">expiry_date</span>
                                <span className="field-type">Required</span>
                                <span className="field-description">Expiry date in YYYY-MM-DD format</span>
                              </div>
                              
                              <div className="format-item required">
                                <span className="field-name">collection_volume_ml</span>
                                <span className="field-type">Required</span>
                                <span className="field-description">Volume in ml (250, 350, 450, 500)</span>
                              </div>
                              
                              <div className="format-item optional">
                                <span className="field-name">hemoglobin_g_dl</span>
                                <span className="field-type">Optional</span>
                                <span className="field-description">Hemoglobin level in g/dL (0-20)</span>
                              </div>
                            </div>
                            
                            <div className="format-example">
                              <strong>Example CSV header:</strong>
                              <code>donor_age,donor_gender,donor_occupation,blood_type,collection_site,donation_date,expiry_date,collection_volume_ml,hemoglobin_g_dl</code>
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
                                  {csvFile ? csvFile.name : 'Choose CSV file for bulk collection upload...'}
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
                            {isLoading ? 'Saving...' : 'Save Sample'}
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

export default AddSample;
