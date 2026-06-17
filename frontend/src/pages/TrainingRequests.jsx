import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, XCircle, MessageCircle, Loader, AlertCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { trainingRequestsApi, instructorsApi, vehicleTypesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import './TrainingRequests.css';

const TrainingRequests = () => {
  const { role } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const [formData, setFormData] = useState({
    instructorId: '',
    vehicleType: '',
    preferredDate: '',
    preferredTime: '',
    pickupAddress: '',
    pickupSuburb: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [responseMsg, setResponseMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, vtRes] = await Promise.all([
          trainingRequestsApi.list(),
          vehicleTypesApi.list().catch(() => ({ vehicleTypes: [] })),
        ]);
        setRequests(reqRes.trainingRequests || reqRes || []);
        setVehicleTypes(vtRes.vehicleTypes || vtRes || []);
      } catch (err) {
        toast.error(err.message || 'Failed to load training requests');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await trainingRequestsApi.create(formData);
      toast.success('Training request sent successfully!');
      setRequests(prev => [res.trainingRequest || res, ...prev]);
      setFormData({ instructorId: '', vehicleType: '', preferredDate: '', preferredTime: '', pickupAddress: '', pickupSuburb: '', message: '' });
      setShowForm(false);
    } catch (err) {
      toast.error(err.message || 'Failed to create request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (id, action) => {
    setActionLoading(`${id}-${action}`);
    try {
      const body = responseMsg ? { responseMessage: responseMsg } : {};
      if (action === 'accept') await trainingRequestsApi.accept(id, body);
      else if (action === 'reject') await trainingRequestsApi.reject(id, body);
      else if (action === 'more-info') await trainingRequestsApi.moreInfo(id, { message: responseMsg });

      setRequests(prev => prev.map(r =>
        r.id === id ? { ...r, status: action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'more_info' } : r
      ));
      setResponseMsg('');
      toast.success(`Request ${action}ed`);
    } catch (err) {
      toast.error(err.message || `Failed to ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  const statusColors = { pending: '#F59E0B', accepted: '#16A34A', rejected: '#DC2626', more_info: '#3B82F6' };

  if (loading) {
    return (
      <div className="tr-page bg-light section text-center" style={{ padding: '6rem 0' }}>
        <Loader size={32} className="spin-icon icon-blue" />
        <p className="text-muted" style={{ marginTop: '1rem' }}>Loading training requests...</p>
      </div>
    );
  }

  return (
    <div className="tr-page bg-light section">
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="tr-header">
          <div>
            <h1 className="h2">Training Requests</h1>
            <p className="text-muted">{role === 'learner' ? 'Request training from an instructor' : 'Manage incoming training requests'}</p>
          </div>
          {role === 'learner' && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : <><Send size={16} /> New Request</>}
            </button>
          )}
        </div>

        {/* Learner: Create Request Form */}
        {showForm && role === 'learner' && (
          <div className="tr-card" style={{ marginBottom: '2rem' }}>
            <h3 className="h4" style={{ marginBottom: '1.5rem' }}>Send Training Request</h3>
            <form onSubmit={handleCreateRequest}>
              <div className="tr-form-grid">
                <div className="form-group">
                  <label>Vehicle Type</label>
                  <select name="vehicleType" value={formData.vehicleType} onChange={handleFormChange} required>
                    <option value="">Select type...</option>
                    {vehicleTypes.map(vt => <option key={vt.id || vt.code} value={vt.code || vt.name}>{vt.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Preferred Date</label>
                  <input type="date" name="preferredDate" value={formData.preferredDate} onChange={handleFormChange} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group">
                  <label>Preferred Time</label>
                  <input type="text" name="preferredTime" value={formData.preferredTime} onChange={handleFormChange} placeholder="e.g. Morning, 2:00 PM" />
                </div>
                <div className="form-group">
                  <label>Pickup Suburb</label>
                  <input type="text" name="pickupSuburb" value={formData.pickupSuburb} onChange={handleFormChange} placeholder="Mawson Lakes" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Pickup Address</label>
                  <input type="text" name="pickupAddress" value={formData.pickupAddress} onChange={handleFormChange} placeholder="123 Main Street" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Message to Instructor</label>
                  <textarea name="message" value={formData.message} onChange={handleFormChange} rows="3" placeholder="Tell the instructor about your experience level, goals, etc." />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: '1rem' }}>
                {submitting ? <><Loader size={18} className="spin-icon" /> Sending...</> : <><Send size={16} /> Send Request</>}
              </button>
            </form>
          </div>
        )}

        {/* Request List */}
        {requests.length === 0 ? (
          <div className="tr-card text-center" style={{ padding: '3rem' }}>
            <Clock size={48} className="text-muted" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p className="text-muted">No training requests yet.</p>
          </div>
        ) : (
          requests.map(req => (
            <div className="tr-card tr-request-card" key={req.id}>
              <div className="tr-request-header" onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}>
                <div className="tr-request-info">
                  <div className="tr-status-dot" style={{ background: statusColors[req.status] || '#9CA3AF' }}></div>
                  <div>
                    <div className="font-medium">{req.studentName || req.instructorName || 'Training Request'}</div>
                    <div className="text-sm text-muted">{req.vehicleType} • {req.preferredDate ? new Date(req.preferredDate).toLocaleDateString('en-AU') : 'No date'} {req.preferredTime && `• ${req.preferredTime}`}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className="tr-status-badge" style={{ background: `${statusColors[req.status]}20`, color: statusColors[req.status] }}>{req.status}</span>
                  {expandedId === req.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {expandedId === req.id && (
                <div className="tr-request-details">
                  {req.message && <div className="tr-detail-row"><strong>Message:</strong> <span>{req.message}</span></div>}
                  {req.pickupSuburb && <div className="tr-detail-row"><strong>Pickup:</strong> <span>{req.pickupAddress}, {req.pickupSuburb}</span></div>}
                  {req.responseMessage && <div className="tr-detail-row"><strong>Response:</strong> <span>{req.responseMessage}</span></div>}

                  {/* Instructor actions */}
                  {(role === 'instructor' || role === 'admin') && req.status === 'pending' && (
                    <div className="tr-actions">
                      <input
                        type="text"
                        placeholder="Response message (optional)"
                        value={responseMsg}
                        onChange={(e) => setResponseMsg(e.target.value)}
                        className="tr-response-input"
                      />
                      <div className="tr-action-buttons">
                        <button className="btn btn-primary" onClick={() => handleAction(req.id, 'accept')} disabled={!!actionLoading} style={{ padding: '0.5rem 1rem' }}>
                          {actionLoading === `${req.id}-accept` ? <Loader size={16} className="spin-icon" /> : <><CheckCircle size={16} /> Accept</>}
                        </button>
                        <button className="btn btn-outline" onClick={() => handleAction(req.id, 'more-info')} disabled={!!actionLoading} style={{ padding: '0.5rem 1rem' }}>
                          {actionLoading === `${req.id}-more-info` ? <Loader size={16} className="spin-icon" /> : <><MessageCircle size={16} /> More Info</>}
                        </button>
                        <button className="btn btn-outline" onClick={() => handleAction(req.id, 'reject')} disabled={!!actionLoading} style={{ padding: '0.5rem 1rem', color: '#DC2626', borderColor: '#DC2626' }}>
                          {actionLoading === `${req.id}-reject` ? <Loader size={16} className="spin-icon" /> : <><XCircle size={16} /> Reject</>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TrainingRequests;
