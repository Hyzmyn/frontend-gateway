import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminDashboardService } from '../services';
import { Button, Loading } from '../components/common';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [kpiData, setKpiData] = useState(null);
  const [auditLogData, setAuditLogData] = useState([]);
  const [examinerProgressData, setExaminerProgressData] = useState([]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    // Check if user is admin
    if (!user || user.role !== 'Admin') {
      toast.error('Access denied. Admin only.');
      navigate('/');
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all dashboard data in parallel
      const [kpis, auditLog, examinerProgress] = await Promise.all([
        adminDashboardService.getKPIs(),
        adminDashboardService.getAuditLog(0, 10),
        adminDashboardService.getExaminerProgress()
      ]);

      setKpiData(kpis);
      setAuditLogData(auditLog);
      setExaminerProgressData(examinerProgress);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await adminDashboardService.exportReport();
      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  // Transform KPI data for weekly chart
  const weeklyChartData = kpiData?.weeks?.map(week => ({
    week: week.weekStart,
    total: week.total,
    graded: week.graded,
    flagged: week.flagged,
    avgScore: week.averageScore
  })) || [];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <Button 
          variant="primary" 
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? 'Exporting...' : '📊 Export Report'}
        </Button>
      </div>

      {/* KPIs Summary Cards */}
      {kpiData?.weeks && kpiData.weeks.length > 0 && (
        <div className="kpi-cards">
          <div className="kpi-card">
            <h3>Total Submissions</h3>
            <p className="kpi-value">{kpiData.weeks[0].total}</p>
            <span className="kpi-label">This Week</span>
          </div>
          <div className="kpi-card">
            <h3>Graded</h3>
            <p className="kpi-value success">{kpiData.weeks[0].graded}</p>
            <span className="kpi-label">Completed</span>
          </div>
          <div className="kpi-card">
            <h3>Flagged</h3>
            <p className="kpi-value warning">{kpiData.weeks[0].flagged}</p>
            <span className="kpi-label">Need Attention</span>
          </div>
          <div className="kpi-card">
            <h3>Average Score</h3>
            <p className="kpi-value">{kpiData.weeks[0].averageScore}</p>
            <span className="kpi-label">Out of 100</span>
          </div>
        </div>
      )}

      {/* Chart 1: Weekly Submissions Overview */}
      <div className="dashboard-section">
        <h2>📊 Weekly Submissions Overview</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#61dafb" name="Total" />
              <Bar dataKey="graded" fill="#28a745" name="Graded" />
              <Bar dataKey="flagged" fill="#ffc107" name="Flagged" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Average Score Trend */}
      <div className="dashboard-section">
        <h2>📈 Average Score Trend</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avgScore" stroke="#61dafb" strokeWidth={2} name="Average Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Examiner Progress */}
      <div className="dashboard-section">
        <h2>👥 Examiner Progress</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={examinerProgressData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="examiner" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#61dafb" name="Assigned" />
              <Bar dataKey="graded" fill="#28a745" name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Audit Logs Table */}
      <div className="dashboard-section">
        <h2>📋 Recent Audit Logs</h2>
        <div className="table-container">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Exam</th>
                <th>Student</th>
                <th>Status</th>
                <th>Score</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {auditLogData.map((log, index) => (
                <tr key={index}>
                  <td>{log.subjectCode}</td>
                  <td>{log.examCode}</td>
                  <td>{log.studentCode}</td>
                  <td>
                    <span className={`status-badge status-${log.status.toLowerCase()}`}>
                      {log.status}
                    </span>
                  </td>
                  <td>{log.score || '-'}</td>
                  <td>{new Date(log.lastUpdatedUtc).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
