import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Loading } from "../components/common";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [exams, setExams] = useState([
    {
      id: 1,
      name: "CS-101 Midterm",
      date: "2025-11-15",
      status: "graded",
      score: 85,
    },
    {
      id: 2,
      name: "CS-102 Final",
      date: "2025-11-20",
      status: "graded",
      score: 92,
    },
    {
      id: 3,
      name: "CS-103 Quiz",
      date: "2025-11-22",
      status: "pending",
      score: null,
    },
    {
      id: 4,
      name: "CS-104 Assignment",
      date: "2025-11-25",
      status: "upcoming",
      score: null,
    },
  ]);

  const scoreHistory = [
    { exam: "Exam 1", score: 78 },
    { exam: "Exam 2", score: 82 },
    { exam: "Exam 3", score: 85 },
    { exam: "Exam 4", score: 92 },
  ];

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const currentUser = userStr ? JSON.parse(userStr) : null;

    if (!currentUser || !currentUser.studentCode) {
      toast.error("Access denied. Student only.");
      navigate("/");
      return;
    }

    setUser(currentUser);
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return <Loading message="Loading student dashboard..." />;
  }

  const gradedExams = exams.filter((e) => e.status === "graded");
  const averageScore =
    gradedExams.length > 0
      ? Math.round(
          gradedExams.reduce((sum, e) => sum + e.score, 0) / gradedExams.length,
        )
      : 0;

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Student Dashboard</h1>
          <p className="welcome-text">
            Welcome, {user?.fullName || user?.studentCode}!
          </p>
        </div>
      </div>

      {/* Student Info Card */}
      <div className="info-card">
        <div className="info-section">
          <h3>👤 Student Information</h3>
          <p>
            <strong>Student Code:</strong> {user?.studentCode}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className="badge active">Active</span>
          </p>
        </div>
        <div className="info-section">
          <h3>📊 Academic Performance</h3>
          <p>
            <strong>Average Score:</strong>{" "}
            <span className="score-highlight">{averageScore}/100</span>
          </p>
          <p>
            <strong>Completed Exams:</strong> {gradedExams.length}
          </p>
          <p>
            <strong>Pending Reviews:</strong>{" "}
            {exams.filter((e) => e.status === "pending").length}
          </p>
        </div>
      </div>

      {/* Score Trend Chart */}
      <div className="dashboard-section">
        <h2>📈 Score Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={scoreHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="exam" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--md-primary)"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Exams List */}
      <div className="dashboard-section">
        <h2>📝 My Exams</h2>
        <div className="exams-list">
          {exams.map((exam) => (
            <div key={exam.id} className={`exam-card status-${exam.status}`}>
              <div className="exam-header">
                <h3>{exam.name}</h3>
                <span className={`exam-status ${exam.status}`}>
                  {exam.status === "graded" && "✅ Graded"}
                  {exam.status === "pending" && "⏳ Pending"}
                  {exam.status === "upcoming" && "📅 Upcoming"}
                </span>
              </div>
              <div className="exam-details">
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(exam.date).toLocaleDateString("vi-VN")}
                </p>
                {exam.score !== null && (
                  <p>
                    <strong>Score:</strong>{" "}
                    <span className="score">{exam.score}/100</span>
                  </p>
                )}
              </div>
              <div className="exam-actions">
                {exam.status === "graded" && (
                  <>
                    <Button
                      variant="primary"
                      onClick={() => toast.info("Viewing results...")}
                    >
                      View Results
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => toast.info("Appeal feature coming soon")}
                    >
                      Submit Appeal
                    </Button>
                  </>
                )}
                {exam.status === "pending" && (
                  <Button
                    variant="secondary"
                    onClick={() => toast.info("Submission is being reviewed")}
                  >
                    Check Status
                  </Button>
                )}
                {exam.status === "upcoming" && (
                  <Button
                    variant="primary"
                    onClick={() => toast.info("Submission portal opening soon")}
                  >
                    Prepare Submission
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="dashboard-section">
        <h2>🔗 Quick Links</h2>
        <div className="quick-links">
          <button
            className="quick-link-btn"
            onClick={() => toast.info("Feature coming soon")}
          >
            📚 Course Materials
          </button>
          <button
            className="quick-link-btn"
            onClick={() => toast.info("Feature coming soon")}
          >
            📅 Exam Schedule
          </button>
          <button
            className="quick-link-btn"
            onClick={() => toast.info("Feature coming soon")}
          >
            💬 Contact Support
          </button>
          <button
            className="quick-link-btn"
            onClick={() => toast.info("Feature coming soon")}
          >
            📊 Full Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
