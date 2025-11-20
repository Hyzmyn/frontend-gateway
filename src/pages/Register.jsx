import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="register-page">
      <div className="register-container">
        <h1 className="register-title">Register</h1>
        <p className="register-subtitle">Registration page - Coming soon!</p>
        
        <Button 
          variant="secondary" 
          onClick={() => navigate('/')}
        >
          ← Back to Welcome
        </Button>
      </div>
    </div>
  );
};

export default Register;
