import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-page">
      <div className="welcome-container">
        <h1 className="welcome-title">Welcome to Frontend Gateway</h1>
        <p className="welcome-subtitle">Choose an option to continue</p>
        <div className="welcome-buttons">
          <Button 
            variant="primary" 
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => navigate('/register')}
          >
            Register
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
