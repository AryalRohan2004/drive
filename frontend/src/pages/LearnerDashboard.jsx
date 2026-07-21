import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, TrendingUp, Award, ChevronRight, XCircle, Loader, BookOpen, ArrowLeft, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { dashboardApi, bookingsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import './Dashboard.css';

const formatDateSafe = (value, options = { year: 'numeric', month: 'short', day: 'numeric' }) => {
  if (!value) return 'Invalid Date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-AU', options);
};

const LearnerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

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
    setCancelTarget(bookingId);
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    const bookingId = cancelTarget;
    setCancelTarget(null);
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
  const latestPackages = d.latestPackages || [];

  // Use backend activityData if provided
  let activityData = d.activityData || [];
  
  // For the frontend line chart, map dates to 'name' (e.g. 'Oct 15')
  if (activityData.length > 0) {
    activityData = activityData.map(point => {
      if (point.date) {
        const dateObj = new Date(point.date);
        return {
          ...point,
          name: dateObj.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }),
        };
      }
      return point;
    });
  } else {
    // Fallback if no backend data
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
        { subject: 'Steering', A: 0, fullMark: 100 },
        { subject: 'Parking', A: 0, fullMark: 100 },
        { subject: 'Signaling', A: 0, fullMark: 100 },
        { subject: 'Reversing', A: 0, fullMark: 100 },
        { subject: 'Traffic', A: 0, fullMark: 100 },
      ];

  return (
    <div className="dashboard-page section">
      <div className="container">
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-outline" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
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
                        <span className="month">{formatDateSafe(lesson.sessionDate || lesson.date || lesson.lessonDate, { month: 'short' }).toUpperCase()}</span>
                        <span className="day">{(() => {
                          const value = lesson.sessionDate || lesson.date || lesson.lessonDate;
                          const date = new Date(value);
                          return Number.isNaN(date.getTime()) ? '--' : date.getDate();
                        })()}</span>
                      </div>
                      <div className="lesson-details">
                        <h4 className="text-dark">{lesson.lessonType || lesson.type || lesson.packageName || 'Driving Lesson'}</h4>
                        <div className="lesson-meta text-sm">
                          <span className="meta-item"><Clock size={16} /> {lesson.startTime || lesson.lessonTime} {lesson.endTime ? `- ${lesson.endTime}` : ''}</span>
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
                      <div className="note-date">{formatDateSafe(note.created_at || note.date || note.createdAt, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      <p>"{note.note || note.text}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Latest Packages */}
            <div className="dashboard-card mb-4">
              <div className="card-header border-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="h4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <Package size={20} className="text-primary" />
                  Latest Packages
                </h3>
                <Link to="/packages" className="text-sm font-bold text-link" style={{ color: '#3b82f6', textDecoration: 'none' }}>View All</Link>
              </div>
              <div className="card-body">
                {latestPackages.length === 0 ? (
                  <p className="text-muted">No packages available at the moment.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    {latestPackages.map((pkg) => (
                      <div key={pkg.id} className="package-card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 className="font-bold text-dark" style={{ margin: 0, fontSize: '1.1rem' }}>{pkg.name}</h4>
                          <span className="badge-primary text-xs" style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>{pkg.category}</span>
                        </div>
                        <div className="text-2xl font-bold" style={{ color: '#0f172a' }}>
                          ${pkg.price}
                        </div>
                        <p className="text-sm text-muted" style={{ margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {pkg.description || 'Learn to drive with our comprehensive package.'}
                        </p>
                        <ul className="text-sm text-muted" style={{ margin: 0, paddingLeft: '1.25rem', listStyleType: 'disc' }}>
                          <li>{pkg.durationMinutes} minutes / lesson</li>
                          {pkg.includedItems?.slice(0, 2).map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                        <Link to={`/book?package=${pkg.code}`} className="btn btn-primary" style={{ width: '100%', textAlign: 'center', marginTop: 'auto', display: 'inline-block' }}>
                          Book Now
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="dashboard-sidebar">
            <div className="dashboard-card mb-4 bg-primary hours-cta-card">
              <div className="card-body text-center py-5 hours-cta-body">
                <div className="hours-cta-icon">
                  <BookOpen size={20} />
                </div>
                <div className="stat-value">{hoursLogged}</div>
                <div className="stat-label mb-4">Hours Logged</div>
                <Link to="/book" className="btn btn-white w-100 hours-cta-button">
                  Book Next Lesson
                </Link>
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
                          <div className="font-medium text-dark">{booking.type || booking.lessonType || booking.packageName || 'Driving Lesson'}</div>
                          <div className="text-sm text-muted mt-1">{formatDateSafe(booking.date || booking.sessionDate || booking.lessonDate || booking.createdAt, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
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

      {cancelTarget && (
        <div className="modal-backdrop" role="presentation" onClick={() => setCancelTarget(null)}>
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-booking-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="cancel-booking-title" className="h4" style={{ marginTop: 0 }}>Cancel booking?</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              This will remove the booking from your upcoming lessons.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-outline" onClick={() => setCancelTarget(null)}>
                Keep Booking
              </button>
              <button className="btn btn-primary" onClick={confirmCancel} disabled={cancellingId === cancelTarget}>
                {cancellingId === cancelTarget ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnerDashboard;
