import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts';
import { Layout } from './components/layout';
import { 
  Home, 
  Dashboard, 
  Welcome, 
  Login, 
  Register, 
  Success, 
  AdminDashboard,
  ManagerDashboard,
  ManagerSemesters,
  ManagerExams,
  ModeratorDashboard,
  ExaminerDashboard,
  ExaminerManage,
  StudentDashboard
} from './pages';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#28a745',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#dc3545',
                secondary: '#fff',
              },
            },
          }}
        />
        <Layout>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/success" element={<Success />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/manager/subjects" element={<ManagerDashboard />} />
            <Route path="/manager/semesters" element={<ManagerSemesters />} />
            <Route path="/manager/exams" element={<ManagerExams />} />
            <Route path="/moderator" element={<ModeratorDashboard />} />
            <Route path="/examiner" element={<ExaminerDashboard />} />
            <Route path="/examiner/manage" element={<ExaminerManage />} />
            <Route path="/student" element={<StudentDashboard />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
