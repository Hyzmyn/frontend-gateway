import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Button, Loading } from '../components/common';
import toast from 'react-hot-toast';
import './ExaminerDashboard.css';

const EXAMS_API_URL = 'https://exams-service.onrender.com';

const ExaminerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [exams, setExams] = useState([]);
  const [userEmail, setUserEmail] = useState('');

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
        fetchExams(email);
      } catch (error) {
        console.error('Error decoding token:', error);
        toast.error('Invalid token');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const fetchExams = async (email) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${EXAMS_API_URL}/exams`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Filter exams where the examiner's email matches
      const filteredExams = response.data.filter(exam => {
        // Check if exam has examiners array and email matches
        if (exam.examiners && Array.isArray(exam.examiners)) {
          return exam.examiners.some(examiner => 
            examiner.email && examiner.email.toLowerCase() === email.toLowerCase()
          );
        }
        // Check if exam has examinerEmail field
        if (exam.examinerEmail) {
          return exam.examinerEmail.toLowerCase() === email.toLowerCase();
        }
        return false;
      });
      
      setExams(filteredExams);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleViewExam = (examId) => {
    toast.info(`Opening exam ${examId}...`);
    // Navigate to exam details or grading interface
  };

  if (loading) {
    return <Loading message="Loading examiner dashboard..." />;
  }

  const publishedExams = exams.filter(e => e.isPublished).length;
  const draftExams = exams.filter(e => !e.isPublished).length;

  return (
    <div className="examiner-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Examiner Dashboard</h1>
          <p className="welcome-text">Welcome back, {user?.fullName || user?.username}!</p>
          <p className="email-text">📧 {userEmail}</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/examiner/manage')}>
          📋 Manage Student Exams
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="progress-cards">
        <div className="progress-card">
          <div className="progress-header">
            <h3>📝 Published Exams</h3>
            <span className="progress-count">{publishedExams}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill completed"
              style={{ width: exams.length > 0 ? `${(publishedExams / exams.length) * 100}%` : '0%' }}
            ></div>
          </div>
        </div>

        <div className="progress-card">
          <div className="progress-header">
            <h3>📄 Draft Exams</h3>
            <span className="progress-count">{draftExams}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill pending"
              style={{ width: exams.length > 0 ? `${(draftExams / exams.length) * 100}%` : '0%' }}
            ></div>
          </div>
        </div>

        <div className="progress-card">
          <div className="progress-header">
            <h3>📊 Total Exams</h3>
            <span className="progress-count">{exams.length}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill total"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>
      </div>

      {/* My Exams List */}
      <div className="dashboard-section">
        <h2>📋 My Assigned Exams</h2>
        <div className="table-container">
          <table className="exams-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Schedule</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Anonymous</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td><strong>{exam.code}</strong></td>
                  <td>{exam.name}</td>
                  <td>{exam.scheduledUtc ? new Date(exam.scheduledUtc).toLocaleString('vi-VN') : 'N/A'}</td>
                  <td>{exam.durationMinutes} min</td>
                  <td>
                    <span className={`status-badge ${exam.isPublished ? 'published' : 'draft'}`}>
                      {exam.isPublished ? '✓ Published' : '📝 Draft'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${exam.isAnonymousGradingEnabled ? 'anonymous' : 'identified'}`}>
                      {exam.isAnonymousGradingEnabled ? '👤 Anonymous' : '👁️ Identified'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon btn-view" 
                        onClick={() => handleViewExam(exam.id)}
                        title="View Exam"
                      >
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {exams.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    No exams assigned to you yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grading Guidelines */}
      <div className="dashboard-section">
        <h2>📋 Grading Guidelines</h2>
        <div className="guidelines-list">
          <div className="guideline-item">
            <div className="guideline-icon">1</div>
            <div className="guideline-content">
              <h4>Review Rubrics</h4>
              <p>Check the grading rubric before starting evaluation</p>
            </div>
          </div>
          <div className="guideline-item">
            <div className="guideline-icon">2</div>
            <div className="guideline-content">
              <h4>Consistency</h4>
              <p>Maintain consistent scoring across all submissions</p>
            </div>
          </div>
          <div className="guideline-item">
            <div className="guideline-icon">3</div>
            <div className="guideline-content">
              <h4>Feedback</h4>
              <p>Provide constructive feedback for each student</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExaminerDashboard;
