import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Loading } from '../components/common';
import toast from 'react-hot-toast';
import './ModeratorDashboard.css';

const ModeratorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [reviewItems, setReviewItems] = useState([
    { id: 1, student: 'STU001', exam: 'CS-101', score: 85, status: 'pending', conflict: true },
    { id: 2, student: 'STU002', exam: 'CS-102', score: 78, status: 'pending', conflict: false },
    { id: 3, student: 'STU003', exam: 'CS-101', score: 92, status: 'pending', conflict: true }
  ]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    
    if (!currentUser || currentUser.role !== 'Moderator') {
      toast.error('Access denied. Moderator only.');
      navigate('/');
      return;
    }

    setUser(currentUser);
    setLoading(false);
  }, [navigate]);

  const handleApprove = (id) => {
    setReviewItems(items => items.map(item => 
      item.id === id ? { ...item, status: 'approved' } : item
    ));
    toast.success('Submission approved');
  };

  const handleReject = (id) => {
    setReviewItems(items => items.map(item => 
      item.id === id ? { ...item, status: 'rejected' } : item
    ));
    toast.success('Submission rejected');
  };

  if (loading) {
    return <Loading message="Loading moderator dashboard..." />;
  }

  const pendingCount = reviewItems.filter(i => i.status === 'pending').length;
  const conflictCount = reviewItems.filter(i => i.conflict && i.status === 'pending').length;

  return (
    <div className="moderator-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Moderator Dashboard</h1>
          <p className="welcome-text">Welcome back, {user?.fullName || user?.username}!</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card yellow">
          <div className="summary-icon">⏳</div>
          <div className="summary-content">
            <h3>Pending Reviews</h3>
            <p className="summary-value">{pendingCount}</p>
          </div>
        </div>

        <div className="summary-card red">
          <div className="summary-icon">⚠️</div>
          <div className="summary-content">
            <h3>Conflicts</h3>
            <p className="summary-value">{conflictCount}</p>
          </div>
        </div>

        <div className="summary-card green">
          <div className="summary-icon">✓</div>
          <div className="summary-content">
            <h3>Resolved Today</h3>
            <p className="summary-value">12</p>
          </div>
        </div>
      </div>

      {/* Review Queue */}
      <div className="dashboard-section">
        <h2>🔍 Review Queue</h2>
        <div className="review-list">
          {reviewItems.filter(item => item.status === 'pending').map(item => (
            <div key={item.id} className={`review-item ${item.conflict ? 'conflict' : ''}`}>
              <div className="review-header">
                <div>
                  <h3>Student: {item.student}</h3>
                  <p>Exam: {item.exam} | Score: {item.score}</p>
                </div>
                {item.conflict && <span className="conflict-badge">⚠️ Conflict</span>}
              </div>
              <div className="review-actions">
                <Button 
                  variant="primary" 
                  onClick={() => toast.info('Opening review modal...')}
                >
                  View Details
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => handleApprove(item.id)}
                >
                  ✓ Approve
                </Button>
                <Button 
                  variant="danger" 
                  onClick={() => handleReject(item.id)}
                >
                  ✗ Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Appeals */}
      <div className="dashboard-section">
        <h2>📮 Recent Appeals</h2>
        <div className="appeals-list">
          <div className="appeal-item">
            <div className="appeal-info">
              <h4>STU004 - CS-103</h4>
              <p>Appeal reason: Scoring discrepancy</p>
              <span className="appeal-time">Submitted 1 hour ago</span>
            </div>
            <Button variant="secondary" onClick={() => toast.info('Feature coming soon')}>
              Review Appeal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeratorDashboard;
