import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Clock, Edit, CheckCircle, Search, Loader, AlertCircle } from 'lucide-react';
import { dashboardApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const InstructorDashboard = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const { user } = useAuth();
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await dashboardApi.instructor();
        setDashData(data);
      } catch {
        // Fallback mock data
        setDashData({
          todayLessons: [
            { id: 'l1', time: '09:00 AM', studentName: 'Sarah Jenkins', type: '1.5 Hour Session • Learner Package', status: 'scheduled' },
            { id: 'l2', time: '11:30 AM', studentName: 'Rajiv M.', type: '2 Hour Session • Overseas Conversion', status: 'scheduled' },
            { id: 'l3', time: '02:00 PM', studentName: 'Emily T.', type: '1 Hour Session • Single Lesson', status: 'scheduled' },
          ],
          stats: { hoursToday: 4.5, activeStudents: 12 },
          students: [
            { id: 's1', name: 'Sarah Jenkins', packageName: 'Complete Learner', progressPercent: 60 },
            { id: 's2', name: 'Rajiv M.', packageName: 'Overseas Conversion', progressPercent: 30 },
          ],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleComplete = async (lessonId) => {
    setCompletingId(lessonId);
    try {
      await dashboardApi.completeLesson(lessonId);
      setDashData(prev => ({
        ...prev,
        todayLessons: (prev.todayLessons || []).map(l =>
          l.id === lessonId ? { ...l, status: 'completed' } : l
        ),
      }));
    } catch (err) {
      alert(err.message || 'Failed to complete lesson');
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page bg-light section text-center" style={{ padding: '6rem 0' }}>
        <Loader size={32} className="spin-icon icon-blue" />
        <p className="text-muted" style={{ marginTop: '1rem' }}>Loading dashboard...</p>
      </div>
    );
  }

  const d = dashData || {};
  const todayLessons = d.todayLessons || d.lessons || [];
  const stats = d.stats || {};
  const students = d.students || [];
  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-page bg-light section">
      <div className="container">
        <div className="dashboard-header mb-4">
          <h1 className="h2">Instructor Dashboard</h1>
          <p className="text-muted">Manage your schedule and student progress.</p>
        </div>

        <div className="dashboard-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            className={`btn ${activeTab === 'schedule' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('schedule')}
          >
            My Schedule
          </button>
          <button
            className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('students')}
          >
            My Students
          </button>
          <Link to="/training-requests" className="btn btn-outline">
            Training Requests
          </Link>
        </div>

        {activeTab === 'schedule' && (
          <div className="dashboard-grid">
            <div className="dashboard-main">
              <div className="dashboard-card">
                <div className="card-header border-bottom">
                  <h3 className="h4">Today's Lessons</h3>
                  <span className="text-muted">{new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="card-body p-0">
                  <div className="history-list">
                    {todayLessons.length === 0 ? (
                      <div className="history-item text-center" style={{ padding: '2rem' }}>
                        <p className="text-muted w-100">No lessons scheduled for today.</p>
                      </div>
                    ) : (
                      todayLessons.map(lesson => (
                        <div className="history-item" key={lesson.id}>
                          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <div className="lesson-time font-medium text-primary">{lesson.time || lesson.startTime}</div>
                            <div>
                              <div className="font-medium text-dark">{lesson.studentName}</div>
                              <div className="text-sm text-muted">{lesson.type || lesson.lessonType}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {lesson.status === 'completed' ? (
                              <span className="badge-success" style={{ padding: '0.5rem 1rem' }}>Completed</span>
                            ) : (
                              <button
                                className="btn btn-primary"
                                style={{ padding: '0.5rem 0.75rem' }}
                                onClick={() => handleComplete(lesson.id)}
                                disabled={completingId === lesson.id}
                                title="Mark as completed"
                              >
                                {completingId === lesson.id ? <Loader size={16} className="spin-icon" /> : <CheckCircle size={16} />}
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-sidebar">
              <div className="dashboard-card mb-4 bg-primary text-white">
                <div className="card-body py-4">
                  <h4 className="text-white mb-2">Quick Stats</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                    <span>Hours Today</span>
                    <strong>{stats.hoursToday || 0} hrs</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Active Students</span>
                    <strong>{stats.activeStudents || students.length}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="dashboard-card">
            <div className="card-header border-bottom">
              <h3 className="h4">Student Roster</h3>
              <div className="search-bar" style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '0.25rem 0.75rem' }}>
                <Search size={18} className="text-muted" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ border: 'none', padding: '0.5rem', outline: 'none', background: 'transparent' }}
                />
              </div>
            </div>
            <div className="card-body p-0">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--light-gray)' }}>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Student Name</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Package</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Progress</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {searchTerm ? 'No students found.' : 'No students assigned yet.'}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(student => (
                      <tr key={student.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem 1.5rem' }}>{student.name || student.fullName}</td>
                        <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{student.packageName || '—'}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '100px', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px' }}>
                              <div style={{ width: `${student.progressPercent || 0}%`, height: '100%', backgroundColor: (student.progressPercent || 0) >= 50 ? 'var(--success-green)' : 'var(--primary-blue)', borderRadius: '3px' }}></div>
                            </div>
                            <span className="text-sm">{student.progressPercent || 0}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <Link to={`/profile/${student.id}`} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>View Profile</Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;
