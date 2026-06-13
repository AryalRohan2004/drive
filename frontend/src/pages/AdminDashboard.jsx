import React, { useState, useEffect } from 'react';
import { Users, Package, Mail, Car, FileText, Loader, AlertCircle, CheckCircle, Trash2, Edit, Plus, X, Save, Search } from 'lucide-react';
import { usersApi, contactApi, packagesApi, vehicleTypesApi, contentApi } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="admin-page bg-light section">
      <div className="container">
        <h1 className="h2" style={{ marginBottom: '0.5rem' }}>Admin Dashboard</h1>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>Manage users, packages, contact submissions, and more.</p>

        <div className="admin-tabs">
          {[
            { key: 'users', label: 'Users', icon: <Users size={16} /> },
            { key: 'contacts', label: 'Contacts', icon: <Mail size={16} /> },
            { key: 'packages', label: 'Packages', icon: <Package size={16} /> },
            { key: 'vehicles', label: 'Vehicle Types', icon: <Car size={16} /> },
            { key: 'content', label: 'Content', icon: <FileText size={16} /> },
          ].map(tab => (
            <button
              key={tab.key}
              className={`admin-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'contacts' && <ContactsTab />}
        {activeTab === 'packages' && <PackagesTab />}
        {activeTab === 'vehicles' && <VehicleTypesTab />}
        {activeTab === 'content' && <ContentTab />}
      </div>
    </div>
  );
};

// ─── Users Tab ──────────────────────────────────────────
const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    usersApi.list().then(d => setUsers(d.users || d || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async (id) => {
    try {
      await usersApi.updateById(id, editData);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...editData } : u));
      setEditingId(null);
    } catch (err) { alert(err.message); }
  };

  const filtered = users.filter(u =>
    (u.fullName || u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <AdminLoader />;

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3 className="h4">All Users ({users.length})</h3>
        <div className="admin-search">
          <Search size={16} />
          <input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-muted" style={{ padding: '2rem' }}>No users found.</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id}>
                <td>{u.fullName || u.full_name}</td>
                <td className="text-muted">{u.email}</td>
                <td>
                  {editingId === u.id ? (
                    <select value={editData.role || u.role} onChange={(e) => setEditData({ ...editData, role: e.target.value })}>
                      <option value="learner">Learner</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className="admin-role-badge">{u.role}</span>
                  )}
                </td>
                <td>
                  {editingId === u.id ? (
                    <select value={editData.status || u.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })}>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  ) : (
                    <span className={`admin-status ${u.status}`}>{u.status}</span>
                  )}
                </td>
                <td>
                  {editingId === u.id ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="admin-btn save" onClick={() => handleSave(u.id)}><Save size={14} /></button>
                      <button className="admin-btn cancel" onClick={() => setEditingId(null)}><X size={14} /></button>
                    </div>
                  ) : (
                    <button className="admin-btn edit" onClick={() => { setEditingId(u.id); setEditData({ role: u.role, status: u.status }); }}><Edit size={14} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Contacts Tab ───────────────────────────────────────
const ContactsTab = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contactApi.list().then(d => setContacts(d.contacts || d || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await contactApi.update(id, { status });
      setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    } catch (err) { alert(err.message); }
  };

  if (loading) return <AdminLoader />;

  return (
    <div className="admin-card">
      <div className="admin-card-header"><h3 className="h4">Contact Submissions ({contacts.length})</h3></div>
      {contacts.length === 0 ? (
        <div className="text-center text-muted" style={{ padding: '3rem' }}>No contact submissions yet.</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Message</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {contacts.map(c => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td className="text-muted">{c.email}</td>
                  <td className="text-sm" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.message}</td>
                  <td><span className={`admin-status ${c.status || 'pending'}`}>{c.status || 'pending'}</span></td>
                  <td>
                    <select value={c.status || 'pending'} onChange={(e) => handleStatusChange(c.id, e.target.value)} style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', borderRadius: '0.4rem', border: '1px solid var(--border-color)' }}>
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── Packages Tab ───────────────────────────────────────
const PackagesTab = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', description: '', price: '', durationMinutes: '', totalLessons: '' });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    packagesApi.list().then(d => setPackages(d.packages || d || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...formData, price: Number(formData.price), durationMinutes: Number(formData.durationMinutes) || undefined, totalLessons: Number(formData.totalLessons) || undefined };
    try {
      if (editingId) {
        await packagesApi.update(editingId, payload);
        setPackages(prev => prev.map(p => p.id === editingId ? { ...p, ...payload } : p));
      } else {
        const res = await packagesApi.create(payload);
        setPackages(prev => [...prev, res.package || res]);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', code: '', description: '', price: '', durationMinutes: '', totalLessons: '' });
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this package?')) return;
    try {
      await packagesApi.delete(id);
      setPackages(prev => prev.filter(p => p.id !== id));
    } catch (err) { alert(err.message); }
  };

  if (loading) return <AdminLoader />;

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3 className="h4">Packages ({packages.length})</h3>
        <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', code: '', description: '', price: '', durationMinutes: '', totalLessons: '' }); }}>
          {showForm ? 'Cancel' : <><Plus size={16} /> Add Package</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-grid">
            <div className="form-group"><label>Name</label><input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
            <div className="form-group"><label>Code</label><input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required placeholder="e.g. single-lesson" /></div>
            <div className="form-group"><label>Price ($)</label><input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required /></div>
            <div className="form-group"><label>Total Lessons</label><input type="number" value={formData.totalLessons} onChange={(e) => setFormData({ ...formData, totalLessons: e.target.value })} /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Description</label><input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: '1rem' }}>
            {saving ? <Loader size={16} className="spin-icon" /> : editingId ? 'Update Package' : 'Create Package'}
          </button>
        </form>
      )}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Code</th><th>Price</th><th>Lessons</th><th>Actions</th></tr></thead>
          <tbody>
            {packages.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td className="text-muted">{p.code}</td>
                <td>${p.price || p.priceAud}</td>
                <td>{p.totalLessons || '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="admin-btn edit" onClick={() => { setEditingId(p.id); setFormData({ name: p.name, code: p.code, description: p.description || '', price: p.price || p.priceAud || '', durationMinutes: p.durationMinutes || '', totalLessons: p.totalLessons || '' }); setShowForm(true); }}><Edit size={14} /></button>
                    <button className="admin-btn delete" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Vehicle Types Tab ──────────────────────────────────
const VehicleTypesTab = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    vehicleTypesApi.list().then(d => setTypes(d.vehicleTypes || d || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await vehicleTypesApi.update(editingId, formData);
        setTypes(prev => prev.map(t => t.id === editingId ? { ...t, ...formData } : t));
      } else {
        const res = await vehicleTypesApi.create(formData);
        setTypes(prev => [...prev, res.vehicleType || res]);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', code: '', description: '' });
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return <AdminLoader />;

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3 className="h4">Vehicle Types ({types.length})</h3>
        <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => { setShowForm(!showForm); setEditingId(null); }}>
          {showForm ? 'Cancel' : <><Plus size={16} /> Add Type</>}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-grid">
            <div className="form-group"><label>Name</label><input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
            <div className="form-group"><label>Code</label><input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required placeholder="e.g. auto" /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Description</label><input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: '1rem' }}>
            {saving ? <Loader size={16} className="spin-icon" /> : editingId ? 'Update' : 'Create'}
          </button>
        </form>
      )}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Code</th><th>Description</th><th>Action</th></tr></thead>
          <tbody>
            {types.map(t => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td className="text-muted">{t.code}</td>
                <td className="text-muted text-sm">{t.description || '—'}</td>
                <td><button className="admin-btn edit" onClick={() => { setEditingId(t.id); setFormData({ name: t.name, code: t.code, description: t.description || '' }); setShowForm(true); }}><Edit size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Content Tab ────────────────────────────────────────
const ContentTab = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ slug: '', title: '', content: '', seoTitle: '', seoDescription: '' });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    contentApi.list().then(d => setPages(d.pages || d.content || d || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await contentApi.update(editingId, formData);
        setPages(prev => prev.map(p => p.id === editingId ? { ...p, ...formData } : p));
      } else {
        const res = await contentApi.create(formData);
        setPages(prev => [...prev, res.page || res]);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ slug: '', title: '', content: '', seoTitle: '', seoDescription: '' });
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return <AdminLoader />;

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3 className="h4">Content Pages ({pages.length})</h3>
        <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ slug: '', title: '', content: '', seoTitle: '', seoDescription: '' }); }}>
          {showForm ? 'Cancel' : <><Plus size={16} /> Add Page</>}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-grid">
            <div className="form-group"><label>Title</label><input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
            <div className="form-group"><label>Slug</label><input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required placeholder="e.g. about-us" /></div>
            <div className="form-group"><label>SEO Title</label><input value={formData.seoTitle} onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })} /></div>
            <div className="form-group"><label>SEO Description</label><input value={formData.seoDescription} onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })} /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Content</label><textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows="6" required /></div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: '1rem' }}>
            {saving ? <Loader size={16} className="spin-icon" /> : editingId ? 'Update Page' : 'Create Page'}
          </button>
        </form>
      )}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead><tr><th>Title</th><th>Slug</th><th>Published</th><th>Action</th></tr></thead>
          <tbody>
            {pages.length === 0 ? (
              <tr><td colSpan={4} className="text-center text-muted" style={{ padding: '2rem' }}>No content pages yet.</td></tr>
            ) : pages.map(p => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td className="text-muted">/{p.slug}</td>
                <td><span className={`admin-status ${p.isPublished !== false ? 'active' : 'inactive'}`}>{p.isPublished !== false ? 'Yes' : 'No'}</span></td>
                <td><button className="admin-btn edit" onClick={() => { setEditingId(p.id); setFormData({ slug: p.slug, title: p.title, content: p.content || '', seoTitle: p.seoTitle || '', seoDescription: p.seoDescription || '' }); setShowForm(true); }}><Edit size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminLoader = () => (
  <div className="text-center" style={{ padding: '3rem' }}>
    <Loader size={32} className="spin-icon icon-blue" />
    <p className="text-muted" style={{ marginTop: '1rem' }}>Loading...</p>
  </div>
);

export default AdminDashboard;
