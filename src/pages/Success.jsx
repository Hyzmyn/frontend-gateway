import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';
import { Button, Loading } from '../components/common';
import toast from 'react-hot-toast';
import './Success.css';

const Success = () => {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, [navigate]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authService.logout();
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
      // Still navigate even if API fails
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }
  };

  if (loggingOut) {
    return (
      <div className="success-page">
        <Loading message="Logging out..." />
      </div>
    );
  }

  return (
    <div className="success-page">
      <div className="success-container">
        <div className="success-icon">✓</div>
        <h1 className="success-title">Login Successful!</h1>
        <p className="success-message">You have been successfully logged in.</p>
        
        {user && (
          <div className="user-info">
            <p><strong>Email:</strong> {user.email}</p>
            {user.fullName && <p><strong>Name:</strong> {user.fullName}</p>}
            {user.studentCode && <p><strong>Student Code:</strong> {user.studentCode}</p>}
            {user.role && <p><strong>Role:</strong> {user.role}</p>}
          </div>
        )}
        
        <div className="success-actions">
          {user?.role?.toLowerCase() === 'manager' ? (
            <>
              <Button 
                variant="primary" 
                onClick={() => navigate('/manager/subjects')}
              >
                Subjects
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => navigate('/manager/semesters')}
              >
                Semesters
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => navigate('/manager/exams')}
              >
                Exams
              </Button>
            </>
          ) : (
            <Button 
              variant="primary" 
              onClick={() => {
                const role = user?.role?.toLowerCase();
                const studentCode = user?.studentCode;
                
                if (role === 'admin') navigate('/admin');
                else if (role === 'manager') navigate('/manager/subjects');
                else if (role === 'moderator') navigate('/moderator');
                else if (role === 'examiner') navigate('/examiner');
                else if (studentCode) navigate('/student');
                else navigate('/dashboard');
              }}
            >
              Go to Dashboard
            </Button>
          )}
          <Button 
            variant="danger" 
            onClick={handleLogout}
            disabled={loggingOut}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Success;
