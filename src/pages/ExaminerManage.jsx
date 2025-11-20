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
                                <button 
                                  className="btn-icon btn-grade" 
                                  onClick={() => toast.info(`Grade submission ${submission.id}`)}
                                  title="Grade Submission"
                                >
                                  📝
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
    </div>
  );
};

export default ExaminerManage;
