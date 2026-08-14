import React, { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle, XCircle, Clock, Loader, AlertCircle, Eye } from 'lucide-react';
import { learnerDocumentsApi, uploadApi, getMediaUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import './Documents.css';

const Documents = () => {
  const { role } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadData, setUploadData] = useState({ documentType: '', file: null });
  const [actionLoading, setActionLoading] = useState(null);
  const [verifyData, setVerifyData] = useState({ status: 'verified', rejectionReason: '' });

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const data = await learnerDocumentsApi.getMine();
        setDocuments(data.documents || data || []);
      } catch (err) {
        toast.error(err.message || 'Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let fileUrl = '';
      if (uploadData.file) {
        const uploadRes = await uploadApi.uploadFile(uploadData.file);
        fileUrl = uploadRes.url;
      }
      const res = await learnerDocumentsApi.create({
        documentType: uploadData.documentType,
        fileUrl
      });
      setDocuments(prev => [...prev, res.document || res]);
      setUploadData({ documentType: '', file: null });
      setShowUpload(false);
      toast.success('Document uploaded successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async (docId) => {
    setActionLoading(docId);
    try {
      await learnerDocumentsApi.updateStatus(docId, {
        status: verifyData.status,
        rejectionReason: verifyData.status === 'rejected' ? verifyData.rejectionReason : undefined,
      });
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: verifyData.status } : d));
      toast.success('Document status updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const statusIcons = {
    pending: <Clock size={18} style={{ color: '#F59E0B' }} />,
    verified: <CheckCircle size={18} style={{ color: '#16A34A' }} />,
    rejected: <XCircle size={18} style={{ color: '#DC2626' }} />,
  };
  const statusColors = { pending: '#F59E0B', verified: '#16A34A', rejected: '#DC2626' };

  if (loading) {
    return (
      <div className="docs-page bg-light section text-center" style={{ padding: '6rem 0' }}>
        <Loader size={32} className="spin-icon icon-blue" />
        <p className="text-muted" style={{ marginTop: '1rem' }}>Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="docs-page bg-light section">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="docs-header">
          <div>
            <h1 className="h2">My Documents</h1>
            <p className="text-muted">Upload and manage your learner documents for verification.</p>
          </div>
          {(role === 'learner' || role === 'admin') && (
            <button className="btn btn-primary" onClick={() => setShowUpload(!showUpload)}>
              {showUpload ? 'Cancel' : <><Upload size={16} /> Upload Document</>}
            </button>
          )}
        </div>

        {showUpload && (
          <div className="docs-card" style={{ marginBottom: '2rem' }}>
            <h3 className="h4" style={{ marginBottom: '1.5rem' }}>Upload New Document</h3>
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label>Document Type</label>
                <select value={uploadData.documentType} onChange={(e) => setUploadData({ ...uploadData, documentType: e.target.value })} required>
                  <option value="">Select type...</option>
                  <option value="learner_permit">Learner's Permit</option>
                  <option value="identity">Identity Document</option>
                  <option value="overseas_licence">Overseas Licence</option>
                  <option value="medical_certificate">Medical Certificate</option>
                  <option value="logbook">Logbook</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Upload Document File</label>
                <input type="file" onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? <><Loader size={18} className="spin-icon" /> Uploading...</> : <><Upload size={16} /> Upload</>}
              </button>
            </form>
          </div>
        )}

        {documents.length === 0 ? (
          <div className="docs-card text-center" style={{ padding: '3rem' }}>
            <FileText size={48} className="text-muted" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p className="text-muted">No documents uploaded yet.</p>
          </div>
        ) : (
          documents.map(doc => (
            <div className="docs-card docs-item" key={doc.id}>
              <div className="docs-item-header">
                <div className="docs-item-info">
                  <FileText size={24} style={{ color: 'var(--primary-blue)' }} />
                  <div>
                    <div className="font-medium" style={{ textTransform: 'capitalize' }}>{(doc.documentType || '').replace(/_/g, ' ')}</div>
                    <div className="text-sm text-muted">{new Date(doc.createdAt).toLocaleDateString('en-AU')}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {doc.fileUrl && (
                    <a href={getMediaUrl(doc.fileUrl)} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                      <Eye size={14} /> View
                    </a>
                  )}
                  <span className="docs-status-badge" style={{ background: `${statusColors[doc.status]}15`, color: statusColors[doc.status] }}>
                    {statusIcons[doc.status]} {doc.status}
                  </span>
                </div>
              </div>

              {doc.rejectionReason && (
                <div className="docs-rejection">
                  <strong>Reason:</strong> {doc.rejectionReason}
                </div>
              )}

              {/* Admin/Instructor verify controls */}
              {(role === 'admin' || role === 'instructor') && doc.status === 'pending' && (
                <div className="docs-verify-controls">
                  <select value={verifyData.status} onChange={(e) => setVerifyData({ ...verifyData, status: e.target.value })}>
                    <option value="verified">Approve</option>
                    <option value="rejected">Reject</option>
                  </select>
                  {verifyData.status === 'rejected' && (
                    <input type="text" placeholder="Rejection reason" value={verifyData.rejectionReason} onChange={(e) => setVerifyData({ ...verifyData, rejectionReason: e.target.value })} />
                  )}
                  <button className="btn btn-primary" onClick={() => handleVerify(doc.id)} disabled={actionLoading === doc.id} style={{ padding: '0.5rem 1rem' }}>
                    {actionLoading === doc.id ? <Loader size={16} className="spin-icon" /> : 'Update Status'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Documents;
