import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Loading } from '../components/common';
import toast from 'react-hot-toast';
import './ManagerDashboard.css';

const SUBJECTS_API_URL = 'https://subjects-service.onrender.com';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    isActive: true
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
    fetchSubjects();
  }, [navigate]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${SUBJECTS_API_URL}/subjects`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSubject(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      isActive: true
    });
    setShowModal(true);
  };

  const handleEdit = async (subjectId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${SUBJECTS_API_URL}/subjects/${subjectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setEditingSubject(response.data);
      setFormData({
        code: response.data.code,
        name: response.data.name,
        description: response.data.description || '',
        isActive: response.data.isActive
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching subject:', error);
      toast.error('Failed to load subject details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      if (editingSubject) {
        // Update existing subject
        await axios.put(
          `${SUBJECTS_API_URL}/subjects/${editingSubject.id}`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        toast.success('Subject updated successfully!');
      } else {
        // Create new subject
        await axios.post(
          `${SUBJECTS_API_URL}/subjects`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        toast.success('Subject created successfully!');
      }
      
      setShowModal(false);
      fetchSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
      toast.error(error.response?.data?.message || 'Failed to save subject');
    }
  };

  const handleDelete = async (subjectId) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${SUBJECTS_API_URL}/subjects/${subjectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('Subject deleted successfully!');
      fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error('Failed to delete subject');
    }
  };

  const handleArchive = async (subjectId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${SUBJECTS_API_URL}/subjects/${subjectId}/archive`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      toast.success('Subject archived successfully!');
      fetchSubjects();
    } catch (error) {
      console.error('Error archiving subject:', error);
      toast.error('Failed to archive subject');
    }
  };

  const viewAuditLog = async (subjectId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${SUBJECTS_API_URL}/subjects/${subjectId}/auditlog`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      console.log('Audit log:', response.data);
      toast.success('Audit log loaded (check console)');
    } catch (error) {
      console.error('Error fetching audit log:', error);
      toast.error('Failed to load audit log');
    }
  };

  if (loading) {
    return <Loading message="Loading manager dashboard..." />;
  }

  return (
    <div className="manager-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Manager Dashboard - Subjects Management</h1>
          <p className="welcome-text">Welcome back, {user?.fullName || user?.username}!</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          ➕ Create New Subject
        </Button>
      </div>

      {/* Subjects Table */}
      <div className="dashboard-section">
        <h2>📚 Subjects List</h2>
        <div className="table-container">
          <table className="subjects-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.id}>
                  <td><strong>{subject.code}</strong></td>
                  <td>{subject.name}</td>
                  <td className="description-cell">{subject.description}</td>
                  <td>
                    <span className={`status-badge ${subject.isActive ? 'active' : 'inactive'}`}>
                      {subject.isActive ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </td>
                  <td>{subject.createdBy || 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon btn-view" 
                        onClick={() => handleEdit(subject.id)}
                        title="View/Edit"
                      >
                        👁️
                      </button>
                      <button 
                        className="btn-icon btn-edit" 
                        onClick={() => handleEdit(subject.id)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-icon btn-audit" 
                        onClick={() => viewAuditLog(subject.id)}
                        title="Audit Log"
                      >
                        📋
                      </button>
                      <button 
                        className="btn-icon btn-archive" 
                        onClick={() => handleArchive(subject.id)}
                        title="Archive"
                      >
                        📦
                      </button>
                      <button 
                        className="btn-icon btn-delete" 
                        onClick={() => handleDelete(subject.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    No subjects found. Click "Create New Subject" to add one.
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
              <h2>{editingSubject ? 'Edit Subject' : 'Create New Subject'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Subject Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  disabled={!!editingSubject}
                  placeholder="e.g., CS101"
                />
              </div>
              
              <div className="form-group">
                <label>Subject Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Introduction to Computer Science"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  placeholder="Enter subject description..."
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Active</span>
                </label>
              </div>

              <div className="modal-actions">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingSubject ? 'Update Subject' : 'Create Subject'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
