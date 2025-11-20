import { useNavigate } from 'react-router-dom';
import { authService } from '../../services';
import toast from 'react-hot-toast';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    
    const role = user.role?.toLowerCase();
    if (role === 'admin') return '/admin';
    if (role === 'manager') return '/manager/subjects';
    if (role === 'moderator') return '/moderator';
    if (role === 'examiner') return '/examiner';
    if (user.studentCode) return '/student';
    return '/dashboard';
  };

  return (
    <header className="header">
      <div className="header-container">
        <h1 className="header-title" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          Frontend Gateway
        </h1>
        <nav className="header-nav">
          {isAuthenticated ? (
            <>
              {user?.role?.toLowerCase() === 'manager' ? (
                <>
                  <a href="/manager/subjects" className="nav-link">Subjects</a>
                  <a href="/manager/semesters" className="nav-link">Semesters</a>
                  <a href="/manager/exams" className="nav-link">Exams</a>
                </>
              ) : (
                <a href={getDashboardLink()} className="nav-link">
                  {user?.role || 'Student'} Dashboard
                </a>
              )}
              <a href="/home" className="nav-link">Home</a>
              <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
            </>
          ) : (
            <>
              <a href="/" className="nav-link">Welcome</a>
              <a href="/login" className="nav-link">Login</a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
