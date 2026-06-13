import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, TrendingUp, Award, ChevronRight } from 'lucide-react';
import './Dashboard.css';

const LearnerDashboard = () => {
  return (
    <div className="dashboard-page bg-light section">
      <div className="container">
        <div className="dashboard-header mb-4">
          <h1 className="h2">Welcome back, John!</h1>
          <p className="text-muted">Here is your learning progress and upcoming schedule.</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-main">
            {/* Upcoming Lesson */}
            <div className="dashboard-card mb-4">
              <div className="card-header border-bottom">
                <h3 className="h4">Upcoming Lesson</h3>
              </div>
              <div className="card-body">
                <div className="upcoming-lesson">
                  <div className="lesson-date">
                    <span className="month">JUN</span>
                    <span className="day">12</span>
                  </div>
                  <div className="lesson-details">
                    <h4 className="text-dark">1.5 Hour Practice Session</h4>
                    <div className="lesson-meta text-muted text-sm">
                      <span className="meta-item"><Clock size={16} /> 02:00 PM - 03:30 PM</span>
                      <span className="meta-item"><Award size={16} /> Instructor: Santosh D.</span>
                    </div>
                  </div>
                  <button className="btn btn-outline ml-auto">Reschedule</button>
                </div>
              </div>
            </div>

            {/* Progress Tracker */}
            <div className="dashboard-card mb-4">
              <div className="card-header border-bottom">
                <h3 className="h4">Your Progress</h3>
                <span className="text-muted text-sm">45% Complete</span>
              </div>
              <div className="card-body">
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: '45%' }}></div>
                </div>
                
                <div className="skills-grid mt-4">
                  <div className="skill-item completed">
                    <CheckCircle size={20} className="icon-success" />
                    <span>Basic Car Control</span>
                  </div>
                  <div className="skill-item completed">
                    <CheckCircle size={20} className="icon-success" />
                    <span>Steering & Turning</span>
                  </div>
                  <div className="skill-item in-progress">
                    <TrendingUp size={20} className="icon-blue" />
                    <span>Parallel Parking</span>
                  </div>
                  <div className="skill-item pending">
                    <div className="circle-empty"></div>
                    <span>Highway Driving</span>
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
                <div className="note-item">
                  <div className="note-date text-sm text-muted">Jun 5, 2026</div>
                  <p>"Great improvement on intersection observations today. Remember to check your blind spot consistently before merging."</p>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-sidebar">
            <div className="dashboard-card mb-4 bg-primary text-white">
              <div className="card-body text-center py-4">
                <div className="stat-value text-white">14</div>
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
                  <div className="history-item">
                    <div>
                      <div className="font-medium text-dark">1 Hour Session</div>
                      <div className="text-sm text-muted">Jun 5, 2026</div>
                    </div>
                    <span className="badge-success">Completed</span>
                  </div>
                  <div className="history-item">
                    <div>
                      <div className="font-medium text-dark">1.5 Hour Session</div>
                      <div className="text-sm text-muted">May 28, 2026</div>
                    </div>
                    <span className="badge-success">Completed</span>
                  </div>
                  <div className="history-item text-center">
                    <a href="#" className="text-link text-sm w-100">View All History <ChevronRight size={16} style={{verticalAlign:'middle'}}/></a>
                  </div>
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
