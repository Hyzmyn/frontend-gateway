import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Loading } from '../components/common';
import toast from 'react-hot-toast';
import './ManagerSemesters.css';

const SEMESTERS_API_URL = 'https://semesters-service.onrender.com';

const ManagerSemesters = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    
    if (!currentUser || currentUser.role !== 'Manager') {
      toast.error('Access denied. Manager only.');
      navigate('/');
      return;
    }

    setUser(currentUser);
    fetchSemesters();
  }, [navigate]);

  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${SEMESTERS_API_URL}/semesters`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSemesters(response.data);
    } catch (error) {
      console.error('Error fetching semesters:', error);
      toast.error('Failed to load semesters');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSemester(null);
    setFormData({
      code: '',
      name: '',
      startDate: '',
      endDate: ''
    });
    setShowModal(true);
  };

  const handleEdit = async (semesterId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${SEMESTERS_API_URL}/semesters/${semesterId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setEditingSemester(response.data);
      setFormData({
        code: response.data.code,
        name: response.data.name,
        startDate: response.data.startDate || '',
        endDate: response.data.endDate || ''
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching semester:', error);
      toast.error('Failed to load semester details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      if (editingSemester) {
        // Update existing semester
        await axios.put(
          `${SEMESTERS_API_URL}/semesters/${editingSemester.id}`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        toast.success('Semester updated successfully!');
      } else {
        // Create new semester
        await axios.post(
          `${SEMESTERS_API_URL}/semesters`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        toast.success('Semester created successfully!');
      }
      
      setShowModal(false);
      fetchSemesters();
    } catch (error) {
      console.error('Error saving semester:', error);
      toast.error(error.response?.data?.message || 'Failed to save semester');
    }
  };

  const handleDelete = async (semesterId) => {
    if (!window.confirm('Are you sure you want to delete this semester?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${SEMESTERS_API_URL}/semesters/${semesterId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('Semester deleted successfully!');
      fetchSemesters();
    } catch (error) {
      console.error('Error deleting semester:', error);
      toast.error('Failed to delete semester');
    }
  };

  const handleLock = async (semesterId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${SEMESTERS_API_URL}/semesters/${semesterId}/lock`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      toast.success('Semester locked successfully!');
      fetchSemesters();
      console.log('Lock response:', response.data);
    } catch (error) {
      console.error('Error locking semester:', error);
      toast.error('Failed to lock semester');
    }
  };

  const viewTimeline = async (semesterId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${SEMESTERS_API_URL}/semesters/${semesterId}/timeline`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setTimeline(response.data);
      setShowTimeline(true);
    } catch (error) {
      console.error('Error fetching timeline:', error);
      toast.error('Failed to load timeline');
    }
  };

  if (loading) {
    return <Loading message="Loading semesters..." />;
  }

  return (
    <div className="manager-semesters">
      <div className="dashboard-header">
        <div>
          <h1>Manager Dashboard - Semesters Management</h1>
          <p className="welcome-text">Welcome back, {user?.fullName || user?.username}!</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          ➕ Create New Semester
        </Button>
      </div>

      {/* Semesters Table */}
      <div className="dashboard-section">
        <h2>📅 Semesters List</h2>
        <div className="table-container">
          <table className="semesters-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {semesters.map((semester) => (
                <tr key={semester.id}>
                  <td><strong>{semester.code}</strong></td>
                  <td>{semester.name}</td>
                  <td>{semester.startDate ? new Date(semester.startDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{semester.endDate ? new Date(semester.endDate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${semester.isLocked ? 'locked' : 'unlocked'}`}>
                      {semester.isLocked ? '🔒 Locked' : '🔓 Unlocked'}
                    </span>
                  </td>
                  <td>{semester.createdBy || 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon btn-view" 
                        onClick={() => handleEdit(semester.id)}
                        title="View/Edit"
                      >
                        👁️
                      </button>
                      <button 
                        className="btn-icon btn-edit" 
                        onClick={() => handleEdit(semester.id)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-icon btn-timeline" 
                        onClick={() => viewTimeline(semester.id)}
                        title="Timeline"
                      >
                        📋
                      </button>
                      <button 
                        className="btn-icon btn-lock" 
                        onClick={() => handleLock(semester.id)}
                        title="Lock/Unlock"
                        disabled={semester.isLocked}
                      >
                        🔒
                      </button>
                      <button 
                        className="btn-icon btn-delete" 
                        onClick={() => handleDelete(semester.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {semesters.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    No semesters found. Click "Create New Semester" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSemester ? 'Edit Semester' : 'Create New Semester'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Semester Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  disabled={!!editingSemester}
                  placeholder="e.g., 2025NB"
                />
              </div>
              
              <div className="form-group">
                <label>Semester Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Nebula Block 2025"
                />
              </div>

              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>

              <div className="modal-actions">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingSemester ? 'Update Semester' : 'Create Semester'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      {showTimeline && (
        <div className="modal-overlay" onClick={() => setShowTimeline(false)}>
          <div className="modal-content timeline-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Semester Timeline</h2>
              <button className="modal-close" onClick={() => setShowTimeline(false)}>✕</button>
            </div>
            <div className="timeline-content">
              {timeline.length > 0 ? (
                <div className="timeline-list">
                  {timeline.map((event, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-icon">📌</div>
                      <div className="timeline-details">
                        <p className="timeline-event"><strong>Event:</strong> {event.event}</p>
                        <p className="timeline-timestamp">{new Date(event.timestamp).toLocaleString()}</p>
                        <p className="timeline-actor"><strong>Actor:</strong> {event.actor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No timeline events found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerSemesters;
