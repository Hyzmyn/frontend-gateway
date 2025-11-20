import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Button, Loading } from '../components/common';
import toast from 'react-hot-toast';
import './ExaminerManage.css';

const EXAMINERS_API_URL = 'https://examiners-service.onrender.com';
const SUBMISSIONS_API_URL = 'https://submissions-service.onrender.com';
const EXAMS_API_URL = 'https://exams-service.onrender.com';

const ExaminerManage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [examinerData, setExaminerData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, completed
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [examMaterials, setExamMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmissionForGrade, setSelectedSubmissionForGrade] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    score: '',
    gradedBy: '',
    notes: ''
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    
    if (!currentUser || currentUser.role !== 'Examiner') {
      toast.error('Access denied. Examiner only.');
      navigate('/');
      return;
    }

    setUser(currentUser);
    
    // Decode token to get email
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const email = decoded.email || decoded.sub || decoded.unique_name || '';
        setUserEmail(email);
        fetchExaminers(email);
      } catch (error) {
        console.error('Error decoding token:', error);
        toast.error('Invalid token');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    applyFilter();
  }, [assignments, filterStatus]);

  const fetchExaminers = async (email) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${EXAMINERS_API_URL}/examiners`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Find examiner data that matches the email
      const examinerList = Array.isArray(response.data) ? response.data : [response.data];
      const currentExaminer = examinerList.find(examiner => 
        examiner.email && examiner.email.toLowerCase() === email.toLowerCase()
      );
      
      if (currentExaminer) {
        setExaminerData(currentExaminer);
        setAssignments(currentExaminer.assignments || []);
      } else {
        toast.error('Examiner data not found');
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error fetching examiner data:', error);
      toast.error('Failed to load examiner data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...assignments];
    
    if (filterStatus === 'completed') {
      filtered = filtered.filter(assignment => assignment.isLead === false);
    } else if (filterStatus === 'lead') {
      filtered = filtered.filter(assignment => assignment.isLead === true);
    }
    
    setFilteredAssignments(filtered);
  };

  const handleViewAssignment = async (assignment) => {
    setLoadingSubmissions(true);
    setShowSubmissionModal(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Fetch exam details
      const examResponse = await axios.get(`${EXAMS_API_URL}/exams/${assignment.examId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSelectedExam(examResponse.data);
      
      // Fetch all submissions
      const submissionsResponse = await axios.get(`${SUBMISSIONS_API_URL}/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Filter submissions that match the examId
      const matchedSubmissions = submissionsResponse.data.filter(submission => 
        submission.examId === assignment.examId
      );
      
      setSelectedSubmissions(matchedSubmissions);
      
      if (matchedSubmissions.length === 0) {
        toast.info('No submissions found for this exam');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
      setSelectedSubmissions([]);
      setSelectedExam(null);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const closeModal = () => {
    setShowSubmissionModal(false);
    setSelectedSubmissions([]);
    setSelectedExam(null);
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      0: 'Pending',
      1: 'Submitted',
      2: 'Graded',
      3: 'Returned'
    };
    return statusMap[status] || 'Unknown';
  };

  const getStatusClass = (status) => {
    const classMap = {
      0: 'pending',
      1: 'submitted',
      2: 'graded',
      3: 'returned'
    };
    return classMap[status] || 'pending';
  };

  const handleDownloadArtifact = async (artifactId, submission) => {
    try {
      const token = localStorage.getItem('token');
      toast.loading('Downloading file...', { id: 'download' });
      
      const response = await axios.get(
        `${SUBMISSIONS_API_URL}/submissions/files/artifacts/${artifactId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          responseType: 'blob' // Important for file download
        }
      );
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `artifact_${artifactId}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      } else {
        // Try to get extension from content-type
        const contentType = response.headers['content-type'];
        if (contentType) {
          if (contentType.includes('pdf')) filename += '.pdf';
          else if (contentType.includes('word')) filename += '.docx';
          else if (contentType.includes('zip')) filename += '.zip';
          else if (contentType.includes('image')) filename += '.jpg';
        }
      }
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('File downloaded successfully!', { id: 'download' });
    } catch (error) {
      console.error('Error downloading artifact:', error);
      toast.error('Failed to download file', { id: 'download' });
    }
  };

  const handleDownloadAllArtifacts = async (submission) => {
    if (!submission.artifacts || submission.artifacts.length === 0) {
      toast.error('No artifacts to download');
      return;
    }
    
    toast.info(`Downloading ${submission.artifacts.length} file(s)...`);
    
    for (const artifact of submission.artifacts) {
      await handleDownloadArtifact(artifact.id, submission);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const handleViewMaterials = async (examId) => {
    setLoadingMaterials(true);
    setShowMaterialsModal(true);
    setExamMaterials([]);
    
    try {
      const token = localStorage.getItem('token');
      
      // Fetch exam materials using the API
      const response = await axios.get(
        `${SUBMISSIONS_API_URL}/submissions/exams/${examId}/materials`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setExamMaterials(response.data || []);
      
      if (!response.data || response.data.length === 0) {
        toast.info('No materials found for this exam');
      }
    } catch (error) {
      console.error('Error fetching exam materials:', error);
      toast.error('Failed to load exam materials');
      setExamMaterials([]);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleDownloadMaterial = async (materialId, materialName) => {
    try {
      const token = localStorage.getItem('token');
      toast.loading('Downloading material...', { id: 'download-material' });
      
      const response = await axios.get(
        `${SUBMISSIONS_API_URL}/submissions/files/materials/${materialId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          responseType: 'blob'
        }
      );
      
      // Get filename from Content-Disposition header or use provided name
      const contentDisposition = response.headers['content-disposition'];
      let filename = materialName || `material_${materialId}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Material downloaded successfully!', { id: 'download-material' });
    } catch (error) {
      console.error('Error downloading material:', error);
      toast.error('Failed to download material', { id: 'download-material' });
    }
  };

  const closeMaterialsModal = () => {
    setShowMaterialsModal(false);
    setExamMaterials([]);
  };

  const handleOpenGradeModal = (submission) => {
    setSelectedSubmissionForGrade(submission);
    setGradeForm({
      score: submission.score || '',
      gradedBy: userEmail || '',
      notes: ''
    });
    setShowGradeModal(true);
  };

  const closeGradeModal = () => {
    setShowGradeModal(false);
    setSelectedSubmissionForGrade(null);
    setGradeForm({
      score: '',
      gradedBy: '',
      notes: ''
    });
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    
    if (!selectedSubmissionForGrade) return;
    
    try {
      const token = localStorage.getItem('token');
      toast.loading('Submitting grade...', { id: 'submit-grade' });
      
      const payload = {
        score: parseFloat(gradeForm.score),
        gradedBy: gradeForm.gradedBy,
        notes: gradeForm.notes || null
      };
      
      await axios.post(
        `${SUBMISSIONS_API_URL}/submissions/${selectedSubmissionForGrade.id}/grade-moderation`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      toast.success('Grade submitted successfully!', { id: 'submit-grade' });
      closeGradeModal();
      
      // Refresh submissions if modal is open
      if (showSubmissionModal && selectedExam) {
        const currentAssignment = assignments.find(a => a.examId === selectedExam.id);
        if (currentAssignment) {
          handleViewAssignment(currentAssignment);
        }
      }
    } catch (error) {
      console.error('Error submitting grade:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit grade';
      toast.error(errorMessage, { id: 'submit-grade' });
    }
  };

  const getStatusBadge = (assignment) => {
    if (assignment.isLead) {
      return <span className="status-badge lead">👑 Lead Grader</span>;
    } else {
      return <span className="status-badge grader">👤 Grader</span>;
    }
  };

  if (loading) {
    return <Loading message="Loading assignments..." />;
  }

  const leadCount = assignments.filter(a => a.isLead).length;
  const graderCount = assignments.filter(a => !a.isLead).length;
  const totalCount = assignments.length;

  return (
    <div className="examiner-manage">
      <div className="dashboard-header">
        <div>
          <h1>Examiner - My Assignments</h1>
          <p className="welcome-text">Welcome back, {examinerData?.fullName || user?.fullName || user?.username}!</p>
          <p className="email-text">📧 {userEmail}</p>
          <p className="code-text">👤 {examinerData?.code || 'N/A'}</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/examiner')}>
          ← Back to Dashboard
        </Button>
      </div>

      {/* Examiner Info Card */}
      {examinerData && (
        <div className="examiner-info-card">
          <h3>📋 Examiner Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Code:</span>
              <span className="info-value">{examinerData.code}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Full Name:</span>
              <span className="info-value">{examinerData.fullName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{examinerData.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className={`info-value ${examinerData.isActive ? 'active' : 'inactive'}`}>
                {examinerData.isActive ? '✅ Active' : '❌ Inactive'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card lead">
          <div className="stat-icon">👑</div>
          <div className="stat-info">
            <h3>Lead Grader</h3>
            <p className="stat-number">{leadCount}</p>
          </div>
        </div>

        <div className="stat-card grader">
          <div className="stat-icon">👤</div>
          <div className="stat-info">
            <h3>Grader</h3>
            <p className="stat-number">{graderCount}</p>
          </div>
        </div>

        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Total Assignments</h3>
            <p className="stat-number">{totalCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <h3>Filter by Role:</h3>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({assignments.length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'lead' ? 'active' : ''}`}
            onClick={() => setFilterStatus('lead')}
          >
            Lead Grader ({leadCount})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            Grader ({graderCount})
          </button>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="dashboard-section">
        <h2>📋 My Assignments</h2>
        <div className="table-container">
          <table className="student-exams-table">
            <thead>
              <tr>
                <th>Assignment ID</th>
                <th>Exam ID</th>
                <th>Role</th>
                <th>Assigned Date</th>
                <th>Assigned By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td><strong>{assignment.id}</strong></td>
                  <td>{assignment.examId}</td>
                  <td>{getStatusBadge(assignment)}</td>
                  <td>
                    {assignment.assignedUtc 
                      ? new Date(assignment.assignedUtc).toLocaleString('vi-VN')
                      : '-'
                    }
                  </td>
                  <td>
                    {assignment.assignedBy || '-'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon btn-view" 
                        onClick={() => handleViewAssignment(assignment)}
                        title="View Submissions"
                      >
                        👁️
                      </button>
                      <button 
                        className="btn-icon btn-materials" 
                        onClick={() => handleViewMaterials(assignment.examId)}
                        title="View Exam Materials"
                      >
                        📚
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAssignments.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    {filterStatus === 'all' 
                      ? 'No assignments found.'
                      : `No ${filterStatus === 'lead' ? 'lead grader' : 'grader'} assignments found.`
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>⚡ Quick Actions</h2>
        <div className="quick-actions-grid">
          <div className="action-card">
            <div className="action-icon">👑</div>
            <h3>Lead Assignments</h3>
            <p>View assignments where you are the lead grader</p>
            <Button 
              variant="primary" 
              onClick={() => setFilterStatus('lead')}
              disabled={leadCount === 0}
            >
              View Lead ({leadCount})
            </Button>
          </div>

          <div className="action-card">
            <div className="action-icon">👤</div>
            <h3>Grader Assignments</h3>
            <p>View assignments where you are a grader</p>
            <Button 
              variant="secondary" 
              onClick={() => setFilterStatus('completed')}
              disabled={graderCount === 0}
            >
              View Grader ({graderCount})
            </Button>
          </div>

          <div className="action-card">
            <div className="action-icon">🔄</div>
            <h3>Refresh Data</h3>
            <p>Reload the latest assignment data</p>
            <Button 
              variant="secondary" 
              onClick={() => fetchExaminers(userEmail)}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Submissions Modal */}
      {showSubmissionModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📄 Submissions for Exam</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            
            {loadingSubmissions ? (
              <div className="modal-loading">
                <Loading message="Loading submissions..." />
              </div>
            ) : (
              <>
                {selectedExam && (
                  <div className="exam-info-box">
                    <h3>📋 Exam Details</h3>
                    <div className="exam-info-grid">
                      <div className="exam-info-item">
                        <span className="label">Code:</span>
                        <span className="value">{selectedExam.code}</span>
                      </div>
                      <div className="exam-info-item">
                        <span className="label">Name:</span>
                        <span className="value">{selectedExam.name}</span>
                      </div>
                      <div className="exam-info-item">
                        <span className="label">Duration:</span>
                        <span className="value">{selectedExam.durationMinutes} min</span>
                      </div>
                      <div className="exam-info-item">
                        <span className="label">Scheduled:</span>
                        <span className="value">
                          {selectedExam.scheduledUtc 
                            ? new Date(selectedExam.scheduledUtc).toLocaleString('vi-VN')
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="submissions-list">
                  <h3>📝 Submissions ({selectedSubmissions.length})</h3>
                  {selectedSubmissions.length > 0 ? (
                    <>
                      <div className="table-container">
                        <table className="submissions-table">
                          <thead>
                            <tr>
                              <th>Student Code</th>
                              <th>Status</th>
                              <th>Attempt</th>
                              <th>Score</th>
                              <th>Uploaded</th>
                              <th>Violations</th>
                              <th>Artifacts</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedSubmissions.map((submission) => (
                              <tr key={submission.id}>
                                <td><strong>{submission.studentCode}</strong></td>
                                <td>
                                  <span className={`status-badge ${getStatusClass(submission.status)}`}>
                                    {getStatusLabel(submission.status)}
                                  </span>
                                </td>
                                <td>{submission.attempt}</td>
                                <td>
                                  {submission.score !== null && submission.score !== undefined
                                    ? <span className="score">{submission.score}</span>
                                    : '-'
                                  }
                                </td>
                                <td>
                                  {submission.uploadedUtc 
                                    ? new Date(submission.uploadedUtc).toLocaleString('vi-VN')
                                    : '-'
                                  }
                                </td>
                                <td>
                                  <span className={`violations-badge ${submission.violations?.length > 0 ? 'has-violations' : ''}`}>
                                    {submission.violations?.length || 0}
                                  </span>
                                </td>
                                <td>
                                  <span className="artifacts-badge">
                                    {submission.artifacts?.length || 0}
                                  </span>
                                </td>
                                <td>
                                  <div className="action-buttons">
                                    <button 
                                      className="btn-icon btn-grade-action" 
                                      onClick={() => handleOpenGradeModal(submission)}
                                      title="Grade Submission"
                                    >
                                      ✍️
                                    </button>
                                    {submission.artifacts && submission.artifacts.length > 0 ? (
                                      <>
                                        <button 
                                          className="btn-icon btn-download" 
                                          onClick={() => handleDownloadAllArtifacts(submission)}
                                          title="Download All Files"
                                        >
                                          📥
                                        </button>
                                        <button 
                                          className="btn-icon btn-grade" 
                                          onClick={() => handleDownloadArtifact(submission.artifacts[0].id, submission)}
                                          title="Download First File"
                                        >
                                          📄
                                        </button>
                                      </>
                                    ) : (
                                      <span className="no-files-text">No files</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Artifacts Detail Section */}
                      <div className="artifacts-detail-section">
                        <h3>📎 Files Detail</h3>
                        {selectedSubmissions.map((submission) => (
                          submission.artifacts && submission.artifacts.length > 0 && (
                            <div key={submission.id} className="submission-artifacts">
                              <div className="submission-header-mini">
                                <strong>Student: {submission.studentCode}</strong>
                                <span className="artifact-count">{submission.artifacts.length} file(s)</span>
                              </div>
                              <div className="artifacts-grid">
                                {submission.artifacts.map((artifact) => (
                                  <div key={artifact.id} className="artifact-card">
                                    <div className="artifact-info">
                                      <div className="artifact-icon">
                                        {artifact.artifactType === 'Submission' ? '📄' : '📎'}
                                      </div>
                                      <div className="artifact-details">
                                        <div className="artifact-type">{artifact.artifactType}</div>
                                        <div className="artifact-size">
                                          {artifact.sizeBytes 
                                            ? `${(artifact.sizeBytes / 1024).toFixed(2)} KB`
                                            : 'Unknown size'
                                          }
                                        </div>
                                        {artifact.path && (
                                          <div className="artifact-path" title={artifact.path}>
                                            {artifact.path.split('/').pop()}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <button 
                                      className="btn-download-artifact"
                                      onClick={() => handleDownloadArtifact(artifact.id, submission)}
                                      title="Download File"
                                    >
                                      <span>📥 Download</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="no-submissions">
                      <p>No submissions found for this exam.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Materials Modal */}
      {showMaterialsModal && (
        <div className="modal-overlay" onClick={closeMaterialsModal}>
          <div className="modal-content modal-medium" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📚 Exam Materials</h2>
              <button className="modal-close" onClick={closeMaterialsModal}>✕</button>
            </div>
            
            {loadingMaterials ? (
              <div className="modal-loading">
                <Loading message="Loading materials..." />
              </div>
            ) : (
              <div className="materials-list">
                {examMaterials.length > 0 ? (
                  <div className="materials-grid">
                    {examMaterials.map((material) => (
                      <div key={material.id} className="material-card">
                        <div className="material-header">
                          <div className="material-icon">
                            {material.materialType === 'ExamPaper' ? '📄' : 
                             material.materialType === 'MarkingSheet' ? '📊' : 
                             material.materialType === 'RubricSheet' ? '📋' : '📎'}
                          </div>
                          <div className="material-info">
                            <h4 className="material-type">{material.materialType}</h4>
                            {material.originalFileName && (
                              <p className="material-filename">{material.originalFileName}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="material-details">
                          {material.sizeBytes && (
                            <div className="material-detail-item">
                              <span className="detail-label">Size:</span>
                              <span className="detail-value">
                                {(material.sizeBytes / 1024).toFixed(2)} KB
                              </span>
                            </div>
                          )}
                          {material.contentType && (
                            <div className="material-detail-item">
                              <span className="detail-label">Type:</span>
                              <span className="detail-value">{material.contentType}</span>
                            </div>
                          )}
                          {material.path && (
                            <div className="material-detail-item">
                              <span className="detail-label">Path:</span>
                              <span className="detail-value" title={material.path}>
                                {material.path.split('/').pop()}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <button 
                          className="btn-download-material"
                          onClick={() => handleDownloadMaterial(material.id, material.originalFileName)}
                          title="Download Material"
                        >
                          📥 Download
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-materials">
                    <p>No materials available for this exam.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {showGradeModal && selectedSubmissionForGrade && (
        <div className="modal-overlay" onClick={closeGradeModal}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✍️ Grade Submission</h2>
              <button className="modal-close" onClick={closeGradeModal}>✕</button>
            </div>
            
            <div className="grade-modal-body">
              <div className="submission-info-box">
                <h3>📄 Submission Details</h3>
                <div className="info-row">
                  <span className="info-label">Student:</span>
                  <span className="info-value">{selectedSubmissionForGrade.studentCode}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Attempt:</span>
                  <span className="info-value">{selectedSubmissionForGrade.attempt}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Status:</span>
                  <span className={`status-badge ${getStatusClass(selectedSubmissionForGrade.status)}`}>
                    {getStatusLabel(selectedSubmissionForGrade.status)}
                  </span>
                </div>
                {selectedSubmissionForGrade.score !== null && selectedSubmissionForGrade.score !== undefined && (
                  <div className="info-row">
                    <span className="info-label">Current Score:</span>
                    <span className="info-value score">{selectedSubmissionForGrade.score}</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmitGrade} className="grade-form">
                <div className="form-group">
                  <label htmlFor="score">Score *</label>
                  <input
                    type="number"
                    id="score"
                    value={gradeForm.score}
                    onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="Enter score (0-100)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="gradedBy">Graded By *</label>
                  <input
                    type="text"
                    id="gradedBy"
                    value={gradeForm.gradedBy}
                    onChange={(e) => setGradeForm({ ...gradeForm, gradedBy: e.target.value })}
                    required
                    placeholder="Enter grader name/email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Notes (Optional)</label>
                  <textarea
                    id="notes"
                    value={gradeForm.notes}
                    onChange={(e) => setGradeForm({ ...gradeForm, notes: e.target.value })}
                    rows="4"
                    placeholder="Enter any grading notes or comments..."
                  />
                </div>

                <div className="form-actions">
                  <Button type="button" variant="secondary" onClick={closeGradeModal}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Submit Grade
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExaminerManage;
