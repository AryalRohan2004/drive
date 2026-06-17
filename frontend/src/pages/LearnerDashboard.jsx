import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, TrendingUp, Award, ChevronRight, XCircle, Loader, AlertCircle } from 'lucide-react';
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
  // Backend returns upcomingLesson (singular); wrap into array for the list UI
  const upcomingLessons = d.upcomingLessons || d.upcoming || (d.upcomingLesson ? [d.upcomingLesson] : []);
  const progressPercent = d.progressPercent ?? d.progress?.percent ?? 0;
  const skills = d.skills || d.progress?.skills || [];
  const notes = d.instructorNotes || d.notes || [];
  const hoursLogged = d.hoursLogged ?? d.stats?.hoursLogged ?? user?.logbookHours ?? 0;
  const recentBookings = d.lessonHistory || d.recentBookings || d.bookings || [];

  return (
    <div className="dashboard-page bg-light section">
      <div className="container">
        <div className="dashboard-header mb-4">
          <h1 className="h2">Welcome back, {user?.fullName?.split(' ')[0] || 'Learner'}!</h1>
          <p className="text-muted">Here is your learning progress and upcoming schedule.</p>
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
                        <div className="lesson-meta text-muted text-sm">
                          <span className="meta-item"><Clock size={16} /> {lesson.startTime} - {lesson.endTime}</span>
                          {lesson.instructorName && <span className="meta-item"><Award size={16} /> Instructor: {lesson.instructorName}</span>}
                        </div>
                      </div>
                      <button
                        className="btn btn-outline"
                        style={{ marginLeft: 'auto', color: '#DC2626', borderColor: '#DC2626' }}
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

            {/* Progress Tracker */}
            <div className="dashboard-card mb-4">
              <div className="card-header border-bottom">
                <h3 className="h4">Your Progress</h3>
                <span className="text-muted text-sm">{progressPercent}% Complete</span>
              </div>
              <div className="card-body">
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <div className="skills-grid mt-4">
                  {skills.map((skill, idx) => (
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
                  ))}
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
                      <div className="note-date text-sm text-muted">{new Date(note.created_at || note.date || note.createdAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                      <p>"{note.note || note.text}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="dashboard-sidebar">
            <div className="dashboard-card mb-4 bg-primary text-white">
              <div className="card-body text-center py-4">
                <div className="stat-value text-white">{hoursLogged}</div>
                <div className="stat-label">Hours Logged</div>
                <Link to="/book" className="btn btn-white w-100 mt-3" style={{ backgroundColor: 'white', color: 'var(--primary-blue)' }}>Book Next Lesson</Link>
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
                          <div className="text-sm text-muted">{new Date(booking.date || booking.sessionDate || booking.createdAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                        </div>
                        <span className={`badge-${booking.status === 'completed' ? 'success' : 'warning'}`}>{booking.status}</span>
                      </div>
                    ))
                  )}
                  {recentBookings.length > 5 && (
                    <div className="history-item text-center">
                      <a href="#" className="text-link text-sm w-100">View All History <ChevronRight size={16} style={{ verticalAlign: 'middle' }} /></a>
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
