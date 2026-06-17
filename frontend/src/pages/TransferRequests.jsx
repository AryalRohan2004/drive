import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, CheckCircle, XCircle, Loader, AlertCircle, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { transferRequestsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import './TrainingRequests.css';

const TransferRequests = () => {
  const { role } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [responseMsg, setResponseMsg] = useState('');

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const data = await transferRequestsApi.list();
        setTransfers(data.transferRequests || data || []);
      } catch (err) {
        toast.error(err.message || 'Failed to load transfer requests');
      } finally {
        setLoading(false);
      }
    };
    fetchTransfers();
  }, []);

  const handleAction = async (id, action) => {
    setActionLoading(`${id}-${action}`);
    try {
      const body = responseMsg ? { responseMessage: responseMsg } : {};
      if (action === 'approve') await transferRequestsApi.approve(id, body);
      else if (action === 'reject') await transferRequestsApi.reject(id, body);
      else if (action === 'complete') await transferRequestsApi.complete(id, body);

      setTransfers(prev => prev.map(t =>
        t.id === id ? { ...t, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'completed' } : t
      ));
      setResponseMsg('');
      toast.success(`Transfer request ${action}ed`);
    } catch (err) {
      toast.error(err.message || `Failed to ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  const statusColors = { requested: '#F59E0B', approved: '#3B82F6', rejected: '#DC2626', completed: '#16A34A' };

  if (loading) {
    return (
      <div className="tr-page bg-light section text-center" style={{ padding: '6rem 0' }}>
        <Loader size={32} className="spin-icon icon-blue" />
        <p className="text-muted" style={{ marginTop: '1rem' }}>Loading transfer requests...</p>
      </div>
    );
  }

  return (
    <div className="tr-page bg-light section">
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="tr-header">
          <div>
            <h1 className="h2">Transfer Requests</h1>
            <p className="text-muted">Manage student instructor transfer requests.</p>
          </div>
        </div>

        {transfers.length === 0 ? (
          <div className="tr-card text-center" style={{ padding: '3rem' }}>
            <ArrowRightLeft size={48} className="text-muted" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p className="text-muted">No transfer requests.</p>
          </div>
        ) : (
          transfers.map(t => (
            <div className="tr-card tr-request-card" key={t.id}>
              <div className="tr-request-header" onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}>
                <div className="tr-request-info">
                  <div className="tr-status-dot" style={{ background: statusColors[t.status] || '#9CA3AF' }}></div>
                  <div>
                    <div className="font-medium">{t.studentName || 'Student'}: {t.fromInstructorName || 'From'} → {t.toInstructorName || 'To'}</div>
                    <div className="text-sm text-muted">
                      {t.requestedAt && new Date(t.requestedAt).toLocaleDateString('en-AU')}
                      {t.hoursTransferred > 0 && ` • ${t.hoursTransferred} hours transferred`}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className="tr-status-badge" style={{ background: `${statusColors[t.status]}20`, color: statusColors[t.status] }}>{t.status}</span>
                  {expandedId === t.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {expandedId === t.id && (
                <div className="tr-request-details">
                  {t.reason && <div className="tr-detail-row"><strong>Reason:</strong> <span>{t.reason}</span></div>}
                  {t.responseMessage && <div className="tr-detail-row"><strong>Response:</strong> <span>{t.responseMessage}</span></div>}
                  {t.packageBalanceTransferred > 0 && <div className="tr-detail-row"><strong>Balance Transferred:</strong> <span>${t.packageBalanceTransferred}</span></div>}

                  {(role === 'instructor' || role === 'admin') && t.status === 'requested' && (
                    <div className="tr-actions">
                      <input type="text" placeholder="Response message (optional)" value={responseMsg} onChange={(e) => setResponseMsg(e.target.value)} className="tr-response-input" />
                      <div className="tr-action-buttons">
                        <button className="btn btn-primary" onClick={() => handleAction(t.id, 'approve')} disabled={!!actionLoading} style={{ padding: '0.5rem 1rem' }}>
                          {actionLoading === `${t.id}-approve` ? <Loader size={16} className="spin-icon" /> : <><CheckCircle size={16} /> Approve</>}
                        </button>
                        <button className="btn btn-outline" onClick={() => handleAction(t.id, 'reject')} disabled={!!actionLoading} style={{ padding: '0.5rem 1rem', color: '#DC2626', borderColor: '#DC2626' }}>
                          {actionLoading === `${t.id}-reject` ? <Loader size={16} className="spin-icon" /> : <><XCircle size={16} /> Reject</>}
                        </button>
                      </div>
                    </div>
                  )}

                  {t.status === 'approved' && (role === 'admin' || role === 'instructor') && (
                    <div className="tr-actions">
                      <button className="btn btn-primary" onClick={() => handleAction(t.id, 'complete')} disabled={!!actionLoading}>
                        {actionLoading === `${t.id}-complete` ? <><Loader size={16} className="spin-icon" /> Completing...</> : <><CheckCircle size={16} /> Complete Transfer</>}
                      </button>
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

export default TransferRequests;
