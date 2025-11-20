import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Loading } from '../components/common';
import toast from 'react-hot-toast';
import './ManagerExams.css';

const EXAMS_API_URL = 'https://exams-service.onrender.com';
const SEMESTERS_API_URL = 'https://semesters-service.onrender.com';
const SUBJECTS_API_URL = 'https://subjects-service.onrender.com';

const ManagerExams = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [exams, setExams] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSelectorModal, setShowSelectorModal] = useState(false);
  const [selectorType, setSelectorType] = useState(''); // 'semester' or 'subject'
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    subjectId: '',
    subjectName: '',
    semesterId: '',
    semesterName: '',
    scheduledUtc: '',
    durationMinutes: 90,
    isPublished: false,
    isAnonymousGradingEnabled: false,
    gradingPolicy: {
      isDoubleMarkingEnabled: false,
      scoreVarianceThreshold: 15,
      minimumScoreForDoubleMarking: 60,
      randomSamplingPercentage: 10
    },
    metadataFields: [{ key: '', value: '' }]
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
    fetchExams();
    fetchSemesters();
    fetchSubjects();
  }, [navigate]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${EXAMS_API_URL}/exams`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setExams(response.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const fetchSemesters = async () => {
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
    }
  };

  const fetchSubjects = async () => {
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
    }
  };

  const handleCreate = () => {
    setEditingExam(null);
    setFormData({
      code: '',
      name: '',
      subjectId: '',
      subjectName: '',
      semesterId: '',
      semesterName: '',
      scheduledUtc: '',
      durationMinutes: 90,
      isPublished: false,
      isAnonymousGradingEnabled: false,
      gradingPolicy: {
        isDoubleMarkingEnabled: false,
        scoreVarianceThreshold: 15,
        minimumScoreForDoubleMarking: 60,
        randomSamplingPercentage: 10
      },
      metadataFields: [{ key: '', value: '' }]
    });
    setShowModal(true);
  };

  const handleEdit = async (examId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${EXAMS_API_URL}/exams/${examId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const exam = response.data;
      
      // Find semester and subject names
      const semester = semesters.find(s => s.id === exam.semesterId);
      const subject = subjects.find(s => s.id === exam.subjectId);
      
      setEditingExam(exam);
      setFormData({
        code: exam.code || '',
        name: exam.name || '',
        subjectId: exam.subjectId || '',
        subjectName: subject?.name || '',
        semesterId: exam.semesterId || '',
        semesterName: semester?.name || '',
        scheduledUtc: exam.scheduledUtc ? exam.scheduledUtc.substring(0, 16) : '',
        durationMinutes: exam.durationMinutes || 90,
        isPublished: exam.isPublished || false,
        isAnonymousGradingEnabled: exam.isAnonymousGradingEnabled || false,
        gradingPolicy: exam.gradingPolicy || {
          isDoubleMarkingEnabled: false,
          scoreVarianceThreshold: 15,
          minimumScoreForDoubleMarking: 60,
          randomSamplingPercentage: 10
        },
        metadataFields: exam.metadata 
          ? Object.entries(exam.metadata).map(([key, value]) => ({ key, value: String(value) }))
          : [{ key: '', value: '' }]
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching exam:', error);
      toast.error('Failed to load exam details');
    }
  };

  const openSelector = (type) => {
    setSelectorType(type);
    setShowSelectorModal(true);
  };

  const selectItem = (item) => {
    if (selectorType === 'semester') {
      setFormData({
        ...formData,
        semesterId: item.id,
        semesterName: item.name
      });
    } else if (selectorType === 'subject') {
      setFormData({
        ...formData,
        subjectId: item.id,
        subjectName: item.name
      });
    }
    setShowSelectorModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subjectId || !formData.semesterId) {
      toast.error('Please select both Subject and Semester');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Convert metadataFields array to object
      const metadataObj = formData.metadataFields
        .filter(field => field.key.trim() !== '')
        .reduce((acc, field) => {
          acc[field.key] = field.value;
          return acc;
        }, {});
      
      // Convert scheduledUtc to ISO format with timezone
      const scheduledDate = new Date(formData.scheduledUtc);
      const scheduledUtcISO = scheduledDate.toISOString();
      
      const payload = {
        code: formData.code,
        name: formData.name,
        subjectId: formData.subjectId,
        semesterId: formData.semesterId,
        scheduledUtc: scheduledUtcISO,
        durationMinutes: parseInt(formData.durationMinutes),
        metadata: metadataObj,
        isAnonymousGradingEnabled: formData.isAnonymousGradingEnabled,
        gradingPolicy: {
          isDoubleMarkingEnabled: formData.gradingPolicy.isDoubleMarkingEnabled,
          scoreVarianceThreshold: formData.gradingPolicy.scoreVarianceThreshold,
          minimumScoreForDoubleMarking: formData.gradingPolicy.minimumScoreForDoubleMarking,
          randomSamplingPercentage: formData.gradingPolicy.randomSamplingPercentage
        }
      };
      
      // Only add isPublished if editing or explicitly set
      if (editingExam || formData.isPublished) {
        payload.isPublished = formData.isPublished;
      }
      
      if (editingExam) {
        // Update existing exam
        await axios.put(
          `${EXAMS_API_URL}/exams/${editingExam.id}`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        toast.success('Exam updated successfully!');
      } else {
        // Create new exam
        await axios.post(
          `${EXAMS_API_URL}/exams`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        toast.success('Exam created successfully!');
      }
      
      setShowModal(false);
      fetchExams();
    } catch (error) {
      console.error('Error saving exam:', error);
      toast.error(error.response?.data?.message || 'Failed to save exam');
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${EXAMS_API_URL}/exams/${examId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('Exam deleted successfully!');
      fetchExams();
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast.error('Failed to delete exam');
    }
  };

  const handlePublish = async (examId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${EXAMS_API_URL}/exams/${examId}/publish`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      toast.success('Exam published successfully!');
      fetchExams();
    } catch (error) {
      console.error('Error publishing exam:', error);
      toast.error('Failed to publish exam');
    }
  };

  const handleUpdateSchedule = async (examId) => {
    const newSchedule = prompt('Enter new schedule (YYYY-MM-DDTHH:mm):');
    if (!newSchedule) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${EXAMS_API_URL}/exams/${examId}/schedule`,
        {
          scheduledUtc: newSchedule,
          durationMinutes: 90
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      toast.success('Schedule updated successfully!');
      fetchExams();
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Failed to update schedule');
    }
  };

  const handleToggleAnonymous = async (examId, currentValue) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${EXAMS_API_URL}/exams/${examId}/anonymous-grading`,
        {
          isAnonymousGradingEnabled: !currentValue
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      toast.success('Anonymous grading updated!');
      fetchExams();
    } catch (error) {
      console.error('Error toggling anonymous grading:', error);
      toast.error('Failed to update anonymous grading');
    }
  };

  const handleUpdateGradingPolicy = async (examId) => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${EXAMS_API_URL}/exams/${examId}/grading-policy`,
        exam.gradingPolicy,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      toast.success('Grading policy updated!');
    } catch (error) {
      console.error('Error updating grading policy:', error);
      toast.error('Failed to update grading policy');
    }
  };

  if (loading) {
    return <Loading message="Loading exams..." />;
  }

  return (
    <div className="manager-exams">
      <div className="dashboard-header">
        <div>
          <h1>Manager Dashboard - Exams Management</h1>
          <p className="welcome-text">Welcome back, {user?.fullName || user?.username}!</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          ➕ Create New Exam
        </Button>
      </div>

      {/* Exams Table */}
      <div className="dashboard-section">
        <h2>📝 Exams List</h2>
        <div className="table-container">
          <table className="exams-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Subject</th>
                <th>Semester</th>
                <th>Schedule</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td><strong>{exam.code}</strong></td>
                  <td>{exam.name}</td>
                  <td>{subjects.find(s => s.id === exam.subjectId)?.name || exam.subjectId}</td>
                  <td>{semesters.find(s => s.id === exam.semesterId)?.name || exam.semesterId}</td>
                  <td>{exam.scheduledUtc ? new Date(exam.scheduledUtc).toLocaleString() : 'N/A'}</td>
                  <td>{exam.durationMinutes} min</td>
                  <td>
                    <span className={`status-badge ${exam.isPublished ? 'published' : 'draft'}`}>
                      {exam.isPublished ? '✓ Published' : '📝 Draft'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon btn-edit" 
                        onClick={() => handleEdit(exam.id)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-icon btn-publish" 
                        onClick={() => handlePublish(exam.id)}
                        title="Publish"
                        disabled={exam.isPublished}
                      >
                        📢
                      </button>
                      <button 
                        className="btn-icon btn-schedule" 
                        onClick={() => handleUpdateSchedule(exam.id)}
                        title="Update Schedule"
                      >
                        📅
                      </button>
                      <button 
                        className="btn-icon btn-anonymous" 
                        onClick={() => handleToggleAnonymous(exam.id, exam.isAnonymousGradingEnabled)}
                        title="Toggle Anonymous Grading"
                      >
                        {exam.isAnonymousGradingEnabled ? '👤' : '👁️'}
                      </button>
                      <button 
                        className="btn-icon btn-policy" 
                        onClick={() => handleUpdateGradingPolicy(exam.id)}
                        title="Update Grading Policy"
                      >
                        📋
                      </button>
                      <button 
                        className="btn-icon btn-delete" 
                        onClick={() => handleDelete(exam.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {exams.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    No exams found. Click "Create New Exam" to add one.
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
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingExam ? 'Edit Exam' : 'Create New Exam'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Exam Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    placeholder="e.g., EX-MATH101-MID"
                  />
                </div>
                
                <div className="form-group">
                  <label>Exam Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., Math 101 Midterm"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Subject *</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      value={formData.subjectName}
                      readOnly
                      placeholder="Click to select subject"
                      required
                    />
                    <button 
                      type="button" 
                      className="select-btn"
                      onClick={() => openSelector('subject')}
                    >
                      Select
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Semester *</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      value={formData.semesterName}
                      readOnly
                      placeholder="Click to select semester"
                      required
                    />
                    <button 
                      type="button" 
                      className="select-btn"
                      onClick={() => openSelector('semester')}
                    >
                      Select
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Scheduled Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledUtc}
                    onChange={(e) => setFormData({ ...formData, scheduledUtc: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Duration (Minutes) *</label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>📋 Grading Policy</h3>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.gradingPolicy.isDoubleMarkingEnabled}
                      onChange={(e) => setFormData({
                        ...formData,
                        gradingPolicy: {
                          ...formData.gradingPolicy,
                          isDoubleMarkingEnabled: e.target.checked
                        }
                      })}
                    />
                    <span>Enable Double Marking</span>
                  </label>
                  <p className="checkbox-note">✅ Bài thi sẽ được chấm bởi 2 người để đảm bảo độ chính xác</p>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Score Variance Threshold</label>
                    <input
                      type="number"
                      value={formData.gradingPolicy.scoreVarianceThreshold}
                      onChange={(e) => setFormData({
                        ...formData,
                        gradingPolicy: {
                          ...formData.gradingPolicy,
                          scoreVarianceThreshold: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Min Score for Double Marking</label>
                    <input
                      type="number"
                      value={formData.gradingPolicy.minimumScoreForDoubleMarking}
                      onChange={(e) => setFormData({
                        ...formData,
                        gradingPolicy: {
                          ...formData.gradingPolicy,
                          minimumScoreForDoubleMarking: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Random Sampling %</label>
                    <input
                      type="number"
                      value={formData.gradingPolicy.randomSamplingPercentage}
                      onChange={(e) => setFormData({
                        ...formData,
                        gradingPolicy: {
                          ...formData.gradingPolicy,
                          randomSamplingPercentage: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-header">
                  <h3>📝 Note</h3>
                  <button 
                    type="button" 
                    className="add-field-btn"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        metadataFields: [...formData.metadataFields, { key: '', value: '' }]
                      });
                    }}
                  >
                    ➕ Add Field
                  </button>
                </div>
                {formData.metadataFields.map((field, index) => (
                  <div key={index} className="metadata-row">
                    <div className="form-group">
                      <input
                        type="text"
                        value={field.key}
                        onChange={(e) => {
                          const newFields = [...formData.metadataFields];
                          newFields[index].key = e.target.value;
                          setFormData({ ...formData, metadataFields: newFields });
                        }}
                        placeholder="Field name (e.g., instructions)"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => {
                          const newFields = [...formData.metadataFields];
                          newFields[index].value = e.target.value;
                          setFormData({ ...formData, metadataFields: newFields });
                        }}
                        placeholder="Value"
                      />
                    </div>
                    {formData.metadataFields.length > 1 && (
                      <button
                        type="button"
                        className="remove-field-btn"
                        onClick={() => {
                          const newFields = formData.metadataFields.filter((_, i) => i !== index);
                          setFormData({ ...formData, metadataFields: newFields });
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <p className="field-note">💡 Thêm các trường tùy chỉnh cho exam. Ví dụ: instructions, allowedMaterials, etc.</p>
              </div>

              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  />
                  <span>Publish Immediately</span>
                </label>
                <p className="checkbox-note">📢 Exam sẽ hiển thị cho sinh viên ngay lập tức</p>
              </div>

              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isAnonymousGradingEnabled}
                    onChange={(e) => setFormData({ ...formData, isAnonymousGradingEnabled: e.target.checked })}
                  />
                  <span>Enable Anonymous Grading</span>
                </label>
                <p className="checkbox-note">👤 Giấu thông tin sinh viên khi chấm điểm để đảm bảo công bằng</p>
              </div>

              <div className="modal-actions">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingExam ? 'Update Exam' : 'Create Exam'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selector Modal for Subjects/Semesters */}
      {showSelectorModal && (
        <div className="modal-overlay" onClick={() => setShowSelectorModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Select {selectorType === 'semester' ? 'Semester' : 'Subject'}</h2>
              <button className="modal-close" onClick={() => setShowSelectorModal(false)}>✕</button>
            </div>
            <div className="selector-list">
              {selectorType === 'semester' ? (
                semesters.map((semester) => (
                  <div 
                    key={semester.id} 
                    className="selector-item"
                    onClick={() => selectItem(semester)}
                  >
                    <div className="selector-code">{semester.code}</div>
                    <div className="selector-name">{semester.name}</div>
                  </div>
                ))
              ) : (
                subjects.map((subject) => (
                  <div 
                    key={subject.id} 
                    className="selector-item"
                    onClick={() => selectItem(subject)}
                  >
                    <div className="selector-code">{subject.code}</div>
                    <div className="selector-name">{subject.name}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerExams;
