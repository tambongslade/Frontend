import React, { useState } from 'react';
import './BloodUsage.css';

interface BloodUsageData {
  patient_id: string;
  patient_name: string;
  patient_age: number | '';
  patient_gender: string;
  blood_type: string;
  usage_date: string;
  hospital_department: string;
  notes?: string;
}

const BloodUsage: React.FC = () => {
  const [formData, setFormData] = useState<BloodUsageData>({
    patient_id: '',
    patient_name: '',
    patient_age: '',
    patient_gender: '',
    blood_type: '',
    usage_date: '',
    hospital_department: '',
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['M', 'F', 'Other'];
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('age') 
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
        patient_id: formData.patient_id,
        patient_name: formData.patient_name,
        patient_age: formData.patient_age,
        patient_gender: formData.patient_gender,
        blood_type: formData.blood_type,
        usage_date: formData.usage_date,
        hospital_department: formData.hospital_department,
        notes: formData.notes
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
      setSuccess(`Blood usage recorded successfully! Usage ID: ${data.usage_record_id || data.id || 'Generated'}`);
      
      // Reset form
      setFormData({
        patient_id: '',
        patient_name: '',
        patient_age: '',
        patient_gender: '',
        blood_type: '',
        usage_date: '',
        hospital_department: '',
        notes: ''
      });
      
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

  const handleCancel = () => {
    setFormData({
      patient_id: '',
      patient_name: '',
      patient_age: '',
      patient_gender: '',
      blood_type: '',
      usage_date: '',
      hospital_department: '',
      notes: ''
    });
    setError('');
    setSuccess('');
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
              <span className="nav-text">Add Sample</span>
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
        <div className="form-container">
          <h1 className="form-title">Blood Usage Entry</h1>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="blood-usage-form">
            {/* Patient Information Section */}
            <div className="form-section">
              <h2 className="section-title">Patient Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <div className="input-wrapper">
                    <span className="input-icon">🆔</span>
                    <input
                      type="text"
                      name="patient_id"
                      placeholder="Patient ID"
                      value={formData.patient_id}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <span className="input-icon">👤</span>
                    <input
                      type="text"
                      name="patient_name"
                      placeholder="Patient Name"
                      value={formData.patient_name}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <div className="input-wrapper">
                    <span className="input-icon">🎂</span>
                    <input
                      type="number"
                      name="patient_age"
                      placeholder="Patient Age *"
                      value={formData.patient_age}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      min="0"
                      max="120"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <span className="input-icon">⚧</span>
                    <select
                      name="patient_gender"
                      value={formData.patient_gender}
                      onChange={handleInputChange}
                      required
                      className="form-input form-select"
                    >
                      <option value="">Patient Gender *</option>
                      {genders.map(gender => (
                        <option key={gender} value={gender}>
                          {gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : 'Other'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Blood Usage Details Section */}
            <div className="form-section">
              <h2 className="section-title">Blood Usage Details</h2>
              
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
                    <span className="input-icon"></span>
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

            {/* Medical Information Section */}
            <div className="form-section">
              <h2 className="section-title">Medical Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <div className="input-wrapper">
                    <span className="input-icon">🏥</span>
                    <select
                      name="hospital_department"
                      value={formData.hospital_department}
                      onChange={handleInputChange}
                      required
                      className="form-input form-select"
                    >
                      <option value="">Hospital Department *</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <span className="input-icon"></span>
                    <textarea
                      name="notes"
                      placeholder="Additional Notes (Optional)"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="form-input form-textarea"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CSV Upload Section */}
            <div className="form-section">
              <h2 className="section-title">Bulk Upload</h2>
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

            {/* Action Buttons */}
            <div className="form-actions">
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
  );
};

export default BloodUsage;
