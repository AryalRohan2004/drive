import React, { useState, useEffect } from 'react';
import { Users, ArrowRightLeft, Loader, AlertCircle, CheckCircle, User, Car } from 'lucide-react';
import { assignmentsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Assignments.css';

const Assignments = () => {
  const { role } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transferForm, setTransferForm] = useState(null);
  const [transferData, setTransferData] = useState({ reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await assignmentsApi.getMine();
        setAssignments(data.assignments || data || []);
      } catch (err) {
        setError(err.message || 'Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const handleTransferRequest = async (assignmentId) => {
    setSubmitting(true);
    try {
      await assignmentsApi.createTransferRequest(assignmentId, { reason: transferData.reason });
      setSuccess('Transfer request submitted successfully!');
      setTransferForm(null);
      setTransferData({ reason: '' });
    } catch (err) {
      alert(err.message || 'Failed to submit transfer request');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors = { active: '#16A34A', ended: '#9CA3AF', pending: '#F59E0B' };

  if (loading) {
    return (
      <div className="assign-page bg-light section text-center" style={{ padding: '6rem 0' }}>
        <Loader size={32} className="spin-icon icon-blue" />
        <p className="text-muted" style={{ marginTop: '1rem' }}>Loading assignments...</p>
      </div>
    );
  }

  return (
    <div className="assign-page bg-light section">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="assign-header">
          <div>
            <h1 className="h2">My Assignments</h1>
            <p className="text-muted">Your student-instructor assignments and transfer options.</p>
          </div>
        </div>

        {success && <div className="assign-alert success"><CheckCircle size={18} /><span>{success}</span></div>}
        {error && <div className="assign-alert error"><AlertCircle size={18} /><span>{error}</span></div>}

        {assignments.length === 0 ? (
          <div className="assign-card text-center" style={{ padding: '3rem' }}>
            <Users size={48} className="text-muted" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p className="text-muted">No assignments yet. Assignments are created when your training request is accepted.</p>
          </div>
        ) : (
          assignments.map(a => (
            <div className="assign-card" key={a.id}>
              <div className="assign-card-header">
                <div className="assign-card-info">
                  <div className="assign-avatar"><User size={24} /></div>
                  <div>
                    <div className="font-medium">{role === 'learner' ? (a.instructorName || 'Instructor') : (a.studentName || 'Student')}</div>
                    <div className="text-sm text-muted">
                      <Car size={14} style={{ verticalAlign: 'text-bottom' }} /> {a.vehicleType}
                      {a.startedAt && <> • Started {new Date(a.startedAt).toLocaleDateString('en-AU')}</>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="assign-status" style={{ background: `${statusColors[a.status]}20`, color: statusColors[a.status] }}>{a.status}</span>
                  {role === 'learner' && a.status === 'active' && (
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => setTransferForm(transferForm === a.id ? null : a.id)}
                    >
                      <ArrowRightLeft size={14} /> Transfer
                    </button>
                  )}
                </div>
              </div>

              {transferForm === a.id && (
                <div className="assign-transfer-form">
                  <h4 className="text-sm font-medium" style={{ marginBottom: '0.75rem' }}>Request Instructor Transfer</h4>
                  <div className="form-group">
                    <label className="text-sm">Reason for transfer</label>
                    <textarea
                      value={transferData.reason}
                      onChange={(e) => setTransferData({ reason: e.target.value })}
                      rows="3"
                      placeholder="Please explain why you'd like to transfer to a different instructor..."
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-primary" onClick={() => handleTransferRequest(a.id)} disabled={submitting || !transferData.reason} style={{ padding: '0.5rem 1rem' }}>
                      {submitting ? <><Loader size={16} className="spin-icon" /> Submitting...</> : 'Submit Transfer Request'}
                    </button>
                    <button className="btn btn-outline" onClick={() => { setTransferForm(null); setTransferData({ reason: '' }); }} style={{ padding: '0.5rem 1rem' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Assignments;
