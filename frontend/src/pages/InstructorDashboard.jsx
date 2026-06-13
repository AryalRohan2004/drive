import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Clock, Edit, CheckCircle, Search } from 'lucide-react';
import './Dashboard.css';

const InstructorDashboard = () => {
  const [activeTab, setActiveTab] = useState('schedule');

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
        </div>

        {activeTab === 'schedule' && (
          <div className="dashboard-grid">
            <div className="dashboard-main">
              <div className="dashboard-card">
                <div className="card-header border-bottom">
                  <h3 className="h4">Today's Lessons</h3>
                  <span className="text-muted">June 6, 2026</span>
                </div>
                <div className="card-body p-0">
                  <div className="history-list">
                    {/* Lesson 1 */}
                    <div className="history-item">
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div className="lesson-time font-medium text-primary">09:00 AM</div>
                        <div>
                          <div className="font-medium text-dark">Sarah Jenkins</div>
                          <div className="text-sm text-muted">1.5 Hour Session • Learner Package</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline" style={{ padding: '0.5rem' }}><Edit size={16} /></button>
                        <button className="btn btn-primary" style={{ padding: '0.5rem' }}><CheckCircle size={16} /></button>
                      </div>
                    </div>
                    {/* Lesson 2 */}
                    <div className="history-item">
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div className="lesson-time font-medium text-primary">11:30 AM</div>
                        <div>
                          <div className="font-medium text-dark">Rajiv M.</div>
                          <div className="text-sm text-muted">2 Hour Session • Overseas Conversion</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline" style={{ padding: '0.5rem' }}><Edit size={16} /></button>
                        <button className="btn btn-primary" style={{ padding: '0.5rem' }}><CheckCircle size={16} /></button>
                      </div>
                    </div>
                    {/* Lesson 3 */}
                    <div className="history-item">
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div className="lesson-time font-medium text-primary">02:00 PM</div>
                        <div>
                          <div className="font-medium text-dark">Emily T.</div>
                          <div className="text-sm text-muted">1 Hour Session • Single Lesson</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline" style={{ padding: '0.5rem' }}><Edit size={16} /></button>
                        <button className="btn btn-primary" style={{ padding: '0.5rem' }}><CheckCircle size={16} /></button>
                      </div>
                    </div>
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
                    <strong>4.5 hrs</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Active Students</span>
                    <strong>12</strong>
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
                <input type="text" placeholder="Search students..." style={{ border: 'none', padding: '0.5rem', outline: 'none', background: 'transparent' }} />
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
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>Sarah Jenkins</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>Complete Learner</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '100px', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px' }}>
                          <div style={{ width: '60%', height: '100%', backgroundColor: 'var(--success-green)', borderRadius: '3px' }}></div>
                        </div>
                        <span className="text-sm">60%</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>View Profile</button>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>Rajiv M.</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>Overseas Conversion</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '100px', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px' }}>
                          <div style={{ width: '30%', height: '100%', backgroundColor: 'var(--primary-blue)', borderRadius: '3px' }}></div>
                        </div>
                        <span className="text-sm">30%</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>View Profile</button>
                    </td>
                  </tr>
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
