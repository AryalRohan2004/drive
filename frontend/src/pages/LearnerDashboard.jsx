import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, TrendingUp, Award, ChevronRight, XCircle, Loader, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { dashboardApi, bookingsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import './Dashboard.css';

const LearnerDashboard = () => {
  const { user } = useAuth();
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await dashboardApi.learner();
        setDashData(data);
      } catch (err) {
        toast.error(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(bookingId);
    try {
      await bookingsApi.cancel(bookingId);
      setDashData(prev => ({
        ...prev,
        upcomingLessons: prev.upcomingLessons?.filter(l => l.id !== bookingId) || [],
      }));
      toast.success('Booking cancelled');
    } catch (err) {
      toast.error(err.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page bg-light section text-center" style={{ padding: '6rem 0' }}>
        <Loader size={32} className="spin-icon icon-blue" />
        <p className="text-muted" style={{ marginTop: '1rem' }}>Loading your dashboard...</p>
      </div>
    );
  }

  const d = dashData || {};
  const upcomingLessons = d.upcomingLessons || d.upcoming || (d.upcomingLesson ? [d.upcomingLesson] : []);
  const progressPercent = d.progressPercent ?? d.progress?.percent ?? 0;
  const skills = d.skills || d.progress?.skills || [];
  const notes = d.instructorNotes || d.notes || [];
  const hoursLogged = d.hoursLogged ?? d.stats?.hoursLogged ?? user?.logbookHours ?? 0;
  const recentBookings = d.lessonHistory || d.recentBookings || d.bookings || [];

  // Dynamic Activity Data based on lessonHistory
  const completedLessons = [...recentBookings]
    .filter(b => b.status === 'completed')
    .sort((a, b) => new Date(a.date || a.sessionDate || a.lesson_date || a.createdAt) - new Date(b.date || b.sessionDate || b.lesson_date || b.createdAt));

  let activityData = [];
  if (completedLessons.length > 0) {
    let cumulative = 0;
    activityData = completedLessons.map((lesson) => {
      cumulative += (lesson.durationHours || 1);
      const dateObj = new Date(lesson.date || lesson.sessionDate || lesson.lesson_date || lesson.createdAt);
      return {
        name: dateObj.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }),
        hours: cumulative,
      };
    });
    
    // If backend reports more hours than history has, append a 'Current' point
    if (hoursLogged > cumulative) {
      activityData.push({
        name: 'Current',
        hours: hoursLogged
      });
    }
  } else {
    // Fallback if no completed lessons are found yet
    activityData = [
      { name: 'Start', hours: 0 },
      { name: 'Current', hours: hoursLogged || 0 }
    ];
  }

  const radarData = skills.length > 0 
    ? skills.slice(0, 5).map(s => ({
        subject: (s.skill_name || s.name || s.skillName || '').split(' ')[0] || 'Skill',
        A: s.percent_complete !== undefined && s.percent_complete !== null 
            ? s.percent_complete 
            : (s.status === 'completed' ? 100 : (s.status === 'in_progress' ? 50 : 20)),
        fullMark: 100
      }))
    : [
        { subject: 'Steering', A: 80, fullMark: 100 },
        { subject: 'Parking', A: 40, fullMark: 100 },
        { subject: 'Signaling', A: 90, fullMark: 100 },
        { subject: 'Reversing', A: 30, fullMark: 100 },
        { subject: 'Traffic', A: 60, fullMark: 100 },
      ];

  return (
    <div className="dashboard-page section">
      <div className="container">
        <div className="dashboard-header mb-4">
          <h1 className="h2">Welcome back, {user?.fullName?.split(' ')[0] || 'Learner'}!</h1>
          <p className="text-muted">Here is your interactive learning progress and upcoming schedule.</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-main">
            {/* Upcoming Lessons */}
            <div className="dashboard-card mb-4">
              <div className="card-header border-bottom">
                <h3 className="h4">Upcoming Lessons</h3>
              </div>
              <div className="card-body">
                {upcomingLessons.length === 0 ? (
                  <div className="text-center" style={{ padding: '2rem' }}>
                    <p className="text-muted">No upcoming lessons scheduled.</p>
                    <Link to="/book" className="btn btn-primary" style={{ marginTop: '1rem' }}>Book a Lesson</Link>
                  </div>
                ) : (
                  upcomingLessons.map(lesson => (
                    <div className="upcoming-lesson" key={lesson.id} style={{ marginBottom: '1rem' }}>
                      <div className="lesson-date">
                        <span className="month">{new Date(lesson.sessionDate || lesson.date).toLocaleDateString('en-AU', { month: 'short' }).toUpperCase()}</span>
                        <span className="day">{new Date(lesson.sessionDate || lesson.date).getDate()}</span>
                      </div>
                      <div className="lesson-details">
                        <h4 className="text-dark">{lesson.lessonType || lesson.type || 'Driving Lesson'}</h4>
                        <div className="lesson-meta text-sm">
                          <span className="meta-item"><Clock size={16} /> {lesson.startTime} - {lesson.endTime}</span>
                          {lesson.instructorName && <span className="meta-item"><Award size={16} /> Instructor: {lesson.instructorName}</span>}
                        </div>
                      </div>
                      <button
                        className="btn btn-outline"
                        style={{ marginLeft: 'auto', color: '#ef4444', borderColor: '#fca5a5' }}
                        onClick={() => handleCancel(lesson.id || lesson.bookingId)}
                        disabled={cancellingId === (lesson.id || lesson.bookingId)}
                      >
                        {cancellingId === (lesson.id || lesson.bookingId) ? <Loader size={16} className="spin-icon" /> : <><XCircle size={16} /> Cancel</>}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Learning Activity Chart */}
            <div className="dashboard-card mb-4">
              <div className="card-header border-bottom">
                <h3 className="h4">Learning Activity</h3>
              </div>
              <div className="card-body">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} />
                      <YAxis stroke="#64748b" tick={{fill: '#64748b'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Progress & Skills Tracker */}
            <div className="dashboard-card mb-4">
              <div className="card-header border-bottom">
                <h3 className="h4">Your Progress</h3>
                <span className="text-muted text-sm font-bold" style={{color: '#3b82f6'}}>{progressPercent}% Complete</span>
              </div>
              <div className="card-body">
                <div className="progress-bar-container mb-5">
                  <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
                  <div className="chart-container" style={{ height: '250px', marginTop: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                        <Radar name="Skills" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="skills-grid" style={{ gridTemplateColumns: '1fr' }}>
                    {skills.length > 0 ? skills.slice(0, 5).map((skill, idx) => (
                      <div className={`skill-item ${skill.status}`} key={idx}>
                        {skill.status === 'completed' ? (
                          <CheckCircle size={20} className="icon-success" />
                        ) : skill.status === 'in_progress' ? (
                          <TrendingUp size={20} className="icon-blue" />
                        ) : (
                          <div className="circle-empty"></div>
                        )}
                        <span>{skill.skill_name || skill.name || skill.skillName}</span>
                      </div>
                    )) : (
                      <div className="text-muted">No skills recorded yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Notes */}
            <div className="dashboard-card">
              <div className="card-header border-bottom">
                <h3 className="h4">Instructor Notes</h3>
              </div>
              <div className="card-body">
                {notes.length === 0 ? (
                  <p className="text-muted">No instructor notes yet.</p>
                ) : (
                  notes.map((note, idx) => (
                    <div className="note-item" key={idx}>
                      <div className="note-date">{new Date(note.created_at || note.date || note.createdAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      <p>"{note.note || note.text}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="dashboard-sidebar">
            <div className="dashboard-card mb-4 bg-primary">
              <div className="card-body text-center py-5">
                <div className="stat-value">{hoursLogged}</div>
                <div className="stat-label mb-4">Hours Logged</div>
                <Link to="/book" className="btn btn-white w-100" style={{ backgroundColor: 'white', color: '#1e3a8a', fontWeight: 'bold' }}>Book Next Lesson</Link>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-header border-bottom">
                <h3 className="h4">Lesson History</h3>
              </div>
              <div className="card-body p-0">
                <div className="history-list">
                  {recentBookings.length === 0 ? (
                    <div className="history-item text-center">
                      <p className="text-muted w-100">No lessons yet</p>
                    </div>
                  ) : (
                    recentBookings.slice(0, 5).map((booking, idx) => (
                      <div className="history-item" key={idx}>
                        <div>
                          <div className="font-medium text-dark">{booking.type || booking.lessonType || 'Driving Lesson'}</div>
                          <div className="text-sm text-muted mt-1">{new Date(booking.date || booking.sessionDate || booking.createdAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                        </div>
                        <span className={`badge-${booking.status === 'completed' ? 'success' : 'warning'}`}>{booking.status}</span>
                      </div>
                    ))
                  )}
                  {recentBookings.length > 5 && (
                    <div className="history-item text-center" style={{ justifyContent: 'center' }}>
                      <a href="#" className="text-link text-sm font-bold" style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        View All History <ChevronRight size={16} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerDashboard;
