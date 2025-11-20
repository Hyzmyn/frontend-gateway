import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Loading } from '../components/common';
import toast from 'react-hot-toast';
import './ExaminerDashboard.css';

const ExaminerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([
    { id: 1, student: 'STU001', exam: 'CS-101', status: 'pending', dueDate: '2025-11-25' },
    { id: 2, student: 'STU002', exam: 'CS-101', status: 'pending', dueDate: '2025-11-25' },
    { id: 3, student: 'STU003', exam: 'CS-102', status: 'graded', score: 88, dueDate: '2025-11-23' }
  ]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    
    if (!currentUser || currentUser.role !== 'Examiner') {
      toast.error('Access denied. Examiner only.');
      navigate('/');
      return;
    }

    setUser(currentUser);
    setLoading(false);
  }, [navigate]);

  const handleStartGrading = (id) => {
    toast.info('Opening grading interface...');
  };

  if (loading) {
    return <Loading message="Loading examiner dashboard..." />;
  }

  const pendingCount = assignments.filter(a => a.status === 'pending').length;
  const gradedCount = assignments.filter(a => a.status === 'graded').length;

  return (
    <div className="examiner-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Examiner Dashboard</h1>
          <p className="welcome-text">Welcome back, {user?.fullName || user?.username}!</p>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="progress-cards">
        <div className="progress-card">
          <div className="progress-header">
            <h3>📝 Pending Grading</h3>
            <span className="progress-count">{pendingCount}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill pending"
              style={{ width: `${(pendingCount / assignments.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="progress-card">
          <div className="progress-header">
            <h3>✅ Completed</h3>
            <span className="progress-count">{gradedCount}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill completed"
              style={{ width: `${(gradedCount / assignments.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="progress-card">
          <div className="progress-header">
            <h3>📊 Total Assigned</h3>
            <span className="progress-count">{assignments.length}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill total"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>
      </div>

      {/* Pending Assignments */}
      <div className="dashboard-section">
        <h2>⏳ Pending Assignments</h2>
        <div className="assignments-grid">
          {assignments.filter(a => a.status === 'pending').map(assignment => (
            <div key={assignment.id} className="assignment-card pending">
              <div className="assignment-header">
                <h3>{assignment.exam}</h3>
                <span className="status-badge pending">Pending</span>
              </div>
              <div className="assignment-details">
                <p><strong>Student:</strong> {assignment.student}</p>
                <p><strong>Due Date:</strong> {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}</p>
              </div>
              <Button 
                variant="primary" 
                fullWidth
                onClick={() => handleStartGrading(assignment.id)}
              >
                Start Grading
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Assignments */}
      <div className="dashboard-section">
        <h2>✅ Completed Grading</h2>
        <div className="completed-list">
          {assignments.filter(a => a.status === 'graded').map(assignment => (
            <div key={assignment.id} className="completed-item">
              <div className="completed-info">
                <h4>{assignment.student} - {assignment.exam}</h4>
                <p>Score: <strong>{assignment.score}/100</strong></p>
              </div>
              <div className="completed-actions">
                <Button 
                  variant="secondary" 
                  onClick={() => toast.info('Viewing submission...')}
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
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
