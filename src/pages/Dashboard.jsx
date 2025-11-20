import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Total Users</h3>
          <p className="metric">0</p>
        </div>
        <div className="dashboard-card">
          <h3>Active Services</h3>
          <p className="metric">0</p>
        </div>
        <div className="dashboard-card">
          <h3>API Requests</h3>
          <p className="metric">0</p>
        </div>
        <div className="dashboard-card">
          <h3>System Status</h3>
          <p className="metric status-online">Online</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
