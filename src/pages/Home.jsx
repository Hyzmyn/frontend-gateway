import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <div className="hero">
        <h1>Welcome to Frontend Gateway</h1>
        <p>A React.js base project for microservice architecture</p>
        <div className="features">
          <div className="feature-card">
            <h3>🚀 Modern Stack</h3>
            <p>Built with React, Vite, and React Router</p>
          </div>
          <div className="feature-card">
            <h3>🔌 API Gateway</h3>
            <p>Centralized service for microservice communication</p>
          </div>
          <div className="feature-card">
            <h3>🔒 Authentication</h3>
            <p>Ready-to-use auth service with JWT support</p>
          </div>
          <div className="feature-card">
            <h3>📦 Well Organized</h3>
            <p>Clean architecture with services, hooks, and utils</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
