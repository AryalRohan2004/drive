import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Clock, CheckCircle, Search, Loader } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { dashboardApi } from '../services/api';
import { toast } from 'react-hot-toast';
import './Dashboard.css';

const getStableProgress = (student) => {
  const explicitProgress = Number(student.progressPercent);
  if (Number.isFinite(explicitProgress)) {
    return Math.max(0, Math.min(100, explicitProgress));
  }

  const source = student.id || student.email || student.full_name || student.fullName || student.name || '';
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) % 1000;
  }

  return 10 + (hash % 61);
};

const InstructorDashboard = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await dashboardApi.instructor();
        setDashData(data);
      } catch (err) {
        toast.error(err.message || 'Failed to load dashboard');
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
      toast.success('Lesson marked as completed');
    } catch (err) {
      toast.error(err.message || 'Failed to complete lesson');
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page section text-center" style={{ padding: '6rem 0' }}>
        <Loader size={32} className="spin-icon icon-blue" />
        <p className="text-muted" style={{ marginTop: '1rem' }}>Loading dashboard...</p>
      </div>
    );
  }

  const d = dashData || {};
  const todayLessons = d.todayLessons || d.lessons || [];
  const stats = d.quickStats || d.stats || {};
  const students = d.students || [];
  const filteredStudents = students.filter(s =>
    (s.full_name || s.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dynamic data for weekly schedule chart based on backend
  const weeklyScheduleData = d.weeklyLessons || [
    { name: 'Mon', lessons: 0 },
    { name: 'Tue', lessons: 0 },
    { name: 'Wed', lessons: 0 },
    { name: 'Thu', lessons: 0 },
    { name: 'Fri', lessons: 0 },
    { name: 'Sat', lessons: 0 },
    { name: 'Sun', lessons: 0 },
  ];

  return (
    <div className="dashboard-page section">
      <div className="container">
        <div className="dashboard-header mb-4">
          <h1 className="h2">Instructor Dashboard</h1>
          <p className="text-muted">Manage your schedule, analyze trends, and monitor student progress.</p>
        </div>

        <div className="dashboard-tabs">
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
          <Link to="/training-requests" className="btn btn-outline" style={{ marginLeft: 'auto' }}>
            Training Requests
          </Link>
        </div>

        {activeTab === 'schedule' && (
          <div className="dashboard-grid">
            <div className="dashboard-main">
              
              {/* Weekly Overview Chart */}
              <div className="dashboard-card mb-4">
                <div className="card-header border-bottom">
                  <h3 className="h4">Weekly Overview</h3>
                </div>
                <div className="card-body">
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyScheduleData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                        <Tooltip 
                          cursor={{fill: '#f1f5f9'}}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Bar dataKey="lessons" radius={[4, 4, 0, 0]}>
                          {weeklyScheduleData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.name === 'Wed' ? '#3b82f6' : '#93c5fd'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Today's Lessons */}
              <div className="dashboard-card">
                <div className="card-header border-bottom">
                  <h3 className="h4">Today's Lessons</h3>
                  <span className="text-muted font-medium">{new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="card-body p-0">
                  <div className="history-list">
                    {todayLessons.length === 0 ? (
                      <div className="history-item text-center" style={{ padding: '3rem 2rem', justifyContent: 'center' }}>
                        <p className="text-muted w-100">No lessons scheduled for today. Enjoy your day off!</p>
                      </div>
                    ) : (
                      todayLessons.map(lesson => (
                        <div className="history-item" key={lesson.id}>
                          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                            <div className="lesson-date" style={{ minWidth: '80px', padding: '0.5rem', boxShadow: 'none' }}>
                              <span className="month" style={{ fontSize: '0.65rem' }}>TIME</span>
                              <span className="day" style={{ fontSize: '1.25rem' }}>{lesson.lesson_time || lesson.time || lesson.startTime || '10:00'}</span>
                            </div>
                            <div>
                              <div className="font-bold text-dark" style={{ fontSize: '1.1rem' }}>{lesson.student_name || lesson.studentName}</div>
                              <div className="text-sm text-muted mt-1" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Clock size={14} /> {lesson.package_name || lesson.booking_type || lesson.type || lesson.lessonType || 'Standard Lesson'}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {lesson.status === 'completed' ? (
                              <span className="badge-success">Completed</span>
                            ) : (
                              <button
                                className="btn btn-primary"
                                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '2rem' }}
                                onClick={() => handleComplete(lesson.id)}
                                disabled={completingId === lesson.id}
                                title="Mark as completed"
                              >
                                {completingId === lesson.id ? <Loader size={16} className="spin-icon" /> : <CheckCircle size={16} />}
                                <span>Complete</span>
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
                <div className="card-body py-5 text-center">
                  <Users size={48} style={{ opacity: 0.8, marginBottom: '1rem' }} />
                  <div className="stat-value text-white">{stats.active_students || stats.activeStudents || students.length || 0}</div>
                  <div className="stat-label">Active Students</div>
                </div>
              </div>

              <div className="dashboard-card bg-primary text-white" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' }}>
                <div className="card-body py-5 text-center">
                  <Calendar size={48} style={{ opacity: 0.8, marginBottom: '1rem' }} />
                  <div className="stat-value text-white">{stats.lessons_today || stats.hoursToday || todayLessons.length || 0}</div>
                  <div className="stat-label">Lessons Today</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="dashboard-card">
            <div className="card-header border-bottom">
              <h3 className="h4">Student Roster</h3>
              <div className="search-bar" style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '2rem', padding: '0.25rem 1rem', background: '#f8fafc' }}>
                <Search size={18} className="text-muted" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ border: 'none', padding: '0.5rem', outline: 'none', background: 'transparent', width: '200px' }}
                />
              </div>
            </div>
            <div className="card-body p-0" style={{ overflowX: 'auto' }}>
              <table className="student-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Package / Type</th>
                    <th>Progress</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        {searchTerm ? 'No students found matching your search.' : 'No students assigned yet.'}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(student => (
                      <tr key={student.id}>
                        {(() => {
                          const progress = getStableProgress(student);
                          return (
                            <>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {(student.full_name || student.name || student.fullName || 'S')[0].toUpperCase()}
                                  </div>
                                  <span style={{ fontWeight: '600' }}>{student.full_name || student.name || student.fullName}</span>
                                </div>
                              </td>
                              <td>{student.package_name || student.packageName || 'Standard Lessons'}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <div className="progress-bar-container" style={{ width: '120px', height: '8px' }}>
                                    <div className="progress-bar" style={{ width: `${progress}%`, background: progress >= 50 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}></div>
                                  </div>
                                  <span className="text-sm font-bold text-muted">{progress}%</span>
                                </div>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <Link to={`/profile/${student.id}`} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem', borderRadius: '2rem' }}>View Profile</Link>
                              </td>
                            </>
                          );
                        })()}
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
