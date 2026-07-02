import {
  Activity,
  AlertCircle,
  BarChart3,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Edit3,
  FileText,
  Gauge,
  LayoutDashboard,
  Loader,
  Mail,
  Package,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UserCheck,
  Users,
  X,
  XCircle,
  ArrowLeft,
} from 'lucide-react';
import { Children, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  auditLogsApi,
  bookingsApi,
  contactApi,
  contentApi,
  dashboardApi,
  packagesApi,
  usersApi,
  vehicleTypesApi,
} from '../services/api';
import './AdminDashboard.css';

const listFrom = (payload, keys) => {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
};

const toTitle = (value) => String(value || 'unknown').replace(/_/g, ' ');

const formatDate = (value) => {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (value) => {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-AU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatMoney = (value) => {
  const number = Number(value || 0);
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(number);
};

const buildQuery = (params) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  return query.toString();
};

const getName = (user) => user?.fullName || user?.full_name || user?.name || 'Unnamed user';
const getContentSeoTitle = (page) => page?.seoTitle ?? page?.seo_title ?? '';
const getContentSeoDescription = (page) => page?.seoDescription ?? page?.seo_description ?? '';
const getContentPublished = (page) => page?.isPublished ?? page?.is_published ?? true;

const initialPackageForm = {
  name: '',
  code: '',
  description: '',
  price: '',
  durationMinutes: '90',
  category: 'single',
  isActive: true,
  includedItems: '',
};

const initialVehicleForm = { name: '', code: '', description: '', isActive: true };
const initialContentForm = {
  slug: '',
  title: '',
  content: '',
  seoTitle: '',
  seoDescription: '',
  isPublished: true,
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [packages, setPackages] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [contentPages, setContentPages] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logTotal, setLogTotal] = useState(0);
  const [logFilters, setLogFilters] = useState({
    actorRole: '',
    targetUserRole: '',
    action: '',
    entityType: '',
    from: '',
    to: '',
  });

  const loadLogs = async (filters = logFilters) => {
    const data = await auditLogsApi.list(buildQuery({ ...filters, limit: 80 }));
    setLogs(listFrom(data, ['logs', 'auditLogs']));
    setLogTotal(data.total || listFrom(data, ['logs', 'auditLogs']).length);
  };

  const loadAdminData = async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    const requests = await Promise.allSettled([
      dashboardApi.admin(),
      usersApi.list(buildQuery({ limit: 100 })),
      bookingsApi.list(buildQuery({ limit: 100 })),
      contactApi.list(),
      packagesApi.list(),
      vehicleTypesApi.list(),
      contentApi.list(),
      auditLogsApi.list(buildQuery({ limit: 80 })),
    ]);

    const [dashboardRes, usersRes, bookingsRes, contactsRes, packagesRes, vehicleRes, contentRes, logsRes] = requests;

    if (dashboardRes.status === 'fulfilled') setSummary(dashboardRes.value);
    if (usersRes.status === 'fulfilled') setUsers(listFrom(usersRes.value, ['users']));
    if (bookingsRes.status === 'fulfilled') setBookings(listFrom(bookingsRes.value, ['bookings']));
    if (contactsRes.status === 'fulfilled') setContacts(listFrom(contactsRes.value, ['contactRequests', 'contacts']));
    if (packagesRes.status === 'fulfilled') setPackages(listFrom(packagesRes.value, ['packages']));
    if (vehicleRes.status === 'fulfilled') setVehicleTypes(listFrom(vehicleRes.value, ['vehicleTypes', 'types']));
    if (contentRes.status === 'fulfilled') setContentPages(listFrom(contentRes.value, ['contentPages', 'pages', 'content']));
    if (logsRes.status === 'fulfilled') {
      setLogs(listFrom(logsRes.value, ['logs', 'auditLogs']));
      setLogTotal(logsRes.value.total || listFrom(logsRes.value, ['logs', 'auditLogs']).length);
    }

    const failed = requests.filter((result) => result.status === 'rejected');
    if (failed.length) {
      toast.error(`${failed.length} admin section${failed.length > 1 ? 's' : ''} could not load`);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      loadAdminData();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, []);

  const counts = summary?.counts || {};
  const userCounts = counts.users || {};
  const bookingCounts = counts.bookings || {};
  const documentCounts = counts.documents || {};
  const pendingInstructors = useMemo(
    () => users.filter((user) => user.role === 'instructor' && user.status === 'pending'),
    [users]
  );

  const navItems = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'users', label: 'Users', icon: Users, badge: users.length },
    { key: 'approvals', label: 'Instructor approvals', icon: ShieldCheck, badge: pendingInstructors.length },
    { key: 'bookings', label: 'Bookings', icon: CalendarClock, badge: bookings.length },
    { key: 'logs', label: 'Activity logs', icon: Activity, badge: logTotal },
    { key: 'packages', label: 'Packages', icon: Package, badge: packages.length },
    { key: 'contacts', label: 'Messages', icon: Mail, badge: contacts.length },
    { key: 'content', label: 'Content', icon: FileText, badge: contentPages.length },
    { key: 'system', label: 'System setup', icon: SlidersHorizontal, badge: vehicleTypes.length },
  ];

  const currentLabel = navItems.find((item) => item.key === activeSection)?.label || 'Overview';

  if (loading) {
    return (
      <div className="admin-console admin-console-loading">
        <Loader size={36} className="spin-icon" />
        <p>Preparing admin control room...</p>
      </div>
    );
  }

  return (
    <div className="admin-console">
      <aside className="admin-sidebar">
        <div className="admin-brand-panel">
          <span className="admin-brand-mark"><Gauge size={22} /></span>
          <div>
            <strong>Sanos Control</strong>
            <small>Operations dashboard</small>
          </div>
        </div>

        <nav className="admin-side-nav" aria-label="Admin sections">
          {navItems.map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              className={`admin-side-link ${activeSection === key ? 'active' : ''}`}
              onClick={() => setActiveSection(key)}
              type="button"
            >
              <span><Icon size={18} /> {label}</span>
              {badge !== undefined && <em>{badge}</em>}
            </button>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <button 
              onClick={() => navigate(-1)} 
              className="btn btn-outline" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
            >
              <ArrowLeft size={14} /> Back
            </button>
            <span className="admin-eyebrow" style={{ display: 'block' }}>Admin panel</span>
            <h1>{currentLabel}</h1>
            <p>Manage learners, instructors, bookings, approvals, platform content, and audit history.</p>
          </div>
          <button className="admin-action ghost" onClick={() => loadAdminData({ silent: true })} disabled={refreshing} type="button">
            {refreshing ? <Loader size={16} className="spin-icon" /> : <RefreshCw size={16} />}
            Refresh
          </button>
        </header>

        {activeSection === 'overview' && (
          <OverviewSection
            userCounts={userCounts}
            bookingCounts={bookingCounts}
            documentCounts={documentCounts}
            pendingInstructors={pendingInstructors}
            recentLogs={logs.length ? logs.slice(0, 8) : summary?.recentLogs || []}
            onNavigate={setActiveSection}
          />
        )}
        {activeSection === 'users' && <UsersSection users={users} setUsers={setUsers} />}
        {activeSection === 'approvals' && <ApprovalsSection users={pendingInstructors} setUsers={setUsers} />}
        {activeSection === 'bookings' && <BookingsSection bookings={bookings} setBookings={setBookings} />}
        {activeSection === 'logs' && (
          <LogsSection
            logs={logs}
            total={logTotal}
            filters={logFilters}
            setFilters={setLogFilters}
            onApply={() => loadLogs(logFilters).catch((err) => toast.error(err.message || 'Failed to load logs'))}
          />
        )}
        {activeSection === 'packages' && <PackagesSection packages={packages} setPackages={setPackages} />}
        {activeSection === 'contacts' && <ContactsSection contacts={contacts} setContacts={setContacts} />}
        {activeSection === 'content' && <ContentSection pages={contentPages} setPages={setContentPages} />}
        {activeSection === 'system' && <SystemSection vehicleTypes={vehicleTypes} setVehicleTypes={setVehicleTypes} />}
      </main>
    </div>
  );
};

const OverviewSection = ({ userCounts, bookingCounts, documentCounts, pendingInstructors, recentLogs, onNavigate }) => {
  const metrics = [
    { label: 'Learners', value: userCounts.learners || 0, helper: `${userCounts.active_learners || 0} active`, icon: BookOpen, tone: 'blue' },
    { label: 'Instructors', value: userCounts.instructors || 0, helper: `${userCounts.active_instructors || 0} active`, icon: UserCheck, tone: 'green' },
    { label: 'Pending approvals', value: userCounts.pending_instructors || pendingInstructors.length, helper: 'Needs admin review', icon: ShieldCheck, tone: 'amber' },
    { label: 'Bookings', value: bookingCounts.total_bookings || 0, helper: `${bookingCounts.confirmed_bookings || 0} confirmed`, icon: CalendarClock, tone: 'slate' },
    { label: 'Paid revenue', value: formatMoney(bookingCounts.paid_revenue), helper: 'Paid booking total', icon: BarChart3, tone: 'green' },
    { label: 'Learner documents', value: documentCounts.total_documents || 0, helper: `${documentCounts.pending_documents || 0} pending`, icon: ClipboardList, tone: 'blue' },
  ];

  return (
    <section className="admin-section-stack">
      <div className="admin-metrics-grid">
        {metrics.map(({ label, value, helper, icon: Icon, tone }) => (
          <article className={`admin-metric-card ${tone}`} key={label}>
            <div className="admin-metric-icon"><Icon size={22} /></div>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{helper}</small>
          </article>
        ))}
      </div>

      <div className="admin-overview-grid">
        <div className="admin-panel">
          <PanelHeader
            title="Instructor approval desk"
            subtitle="New instructors must be approved before teaching learners."
            actionLabel="Open approvals"
            onAction={() => onNavigate('approvals')}
          />
          <ApprovalsList users={pendingInstructors.slice(0, 5)} compact />
        </div>

        <div className="admin-panel">
          <PanelHeader
            title="Recent activity"
            subtitle="Audit trail from learner, instructor, and admin actions."
            actionLabel="View logs"
            onAction={() => onNavigate('logs')}
          />
          <LogTimeline logs={recentLogs} />
        </div>
      </div>
    </section>
  );
};

const UsersSection = ({ users, setUsers }) => {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return users.filter((user) => {
      const matchesSearch = !term || getName(user).toLowerCase().includes(term) || (user.email || '').toLowerCase().includes(term);
      const matchesRole = !role || user.role === role;
      const matchesStatus = !status || user.status === status;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, role, status]);

  const saveUser = async (id) => {
    try {
      const data = await usersApi.updateById(id, editData);
      const nextUser = data.user || { ...users.find((user) => user.id === id), ...editData };
      setUsers((prev) => prev.map((user) => (user.id === id ? nextUser : user)));
      setEditingId(null);
      toast.success('User updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update user');
    }
  };

  return (
    <div className="admin-panel">
      <PanelHeader title="User management" subtitle="Search, filter, and update learner/instructor/admin records." />
      <div className="admin-toolbar">
        <SearchBox value={search} onChange={setSearch} placeholder="Search by name or email..." />
        <select value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="">All roles</option>
          <option value="learner">Learners</option>
          <option value="instructor">Instructors</option>
          <option value="admin">Admins</option>
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <ResponsiveTable emptyText="No users found." colSpan={7}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((user) => (
            <tr key={user.id}>
              <td>
                <Link to={`/admin/users/${user.id}`} className="text-link" style={{ fontWeight: 700 }}>
                  {getName(user)}
                </Link>
              </td>
              <td className="muted-cell">{user.email}</td>
              <td>{user.phone || 'Not set'}</td>
              <td>
                <RolePill role={user.role} />
              </td>
              <td>
                {editingId === user.id ? (
                  <select value={editData.status || user.status} onChange={(event) => setEditData({ ...editData, status: event.target.value })}>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="rejected">Rejected</option>
                  </select>
                ) : (
                  <StatusPill status={user.status} />
                )}
              </td>
              <td>{formatDate(user.createdAt || user.created_at)}</td>
              <td>
                {editingId === user.id ? (
                  <ActionGroup>
                    <IconButton label="Save" tone="success" onClick={() => saveUser(user.id)}><Save size={15} /></IconButton>
                    <IconButton label="Cancel" onClick={() => setEditingId(null)}><X size={15} /></IconButton>
                  </ActionGroup>
                ) : (
                  <ActionGroup>
                    <Link to={`/admin/users/${user.id}`} className="admin-action primary" style={{ textDecoration: 'none' }}>
                      View
                    </Link>
                    <IconButton
                      label="Edit"
                      tone="primary"
                      onClick={() => {
                        setEditingId(user.id);
                        setEditData({ status: user.status });
                      }}
                    >
                      <Edit3 size={15} />
                    </IconButton>
                  </ActionGroup>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </ResponsiveTable>
    </div>
  );
};

const ApprovalsSection = ({ users, setUsers }) => (
  <div className="admin-panel">
    <PanelHeader title="Instructor approvals" subtitle="Accept or reject instructors before they become bookable on the platform." />
    <ApprovalsList users={users} setUsers={setUsers} />
  </div>
);

const ApprovalsList = ({ users, setUsers, compact = false }) => {
  const approve = async (id) => {
    try {
      const data = await usersApi.approveInstructor(id);
      setUsers?.((prev) => prev.map((user) => (user.id === id ? data.user || { ...user, status: 'active' } : user)));
      toast.success('Instructor approved');
    } catch (err) {
      toast.error(err.message || 'Failed to approve instructor');
    }
  };

  const reject = async (id) => {
    try {
      setUsers?.((prev) => prev.filter((user) => user.id !== id));
      toast.success('Instructor removed');
    } catch (err) {
      toast.error(err.message || 'Failed to reject instructor');
    }
  };

  if (!users.length) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="No instructors waiting"
        message="New instructor registrations will appear here for review."
      />
    );
  }

  return (
    <div className={compact ? 'admin-approval-list compact' : 'admin-approval-list'}>
      {users.map((user) => (
        <article className="admin-approval-card" key={user.id}>
          <div>
            <strong>
              <Link to={`/admin/users/${user.id}`} className="text-link">
                {getName(user)}
              </Link>
            </strong>
            <span>{user.email}</span>
            <small>{user.phone || 'No phone'} • Registered {formatDate(user.createdAt || user.created_at)}</small>
          </div>
          {!compact && (
            <ActionGroup>
              <Link to={`/admin/users/${user.id}`} className="admin-action primary" style={{ textDecoration: 'none' }}>
                Details
              </Link>
              <button className="admin-action success" onClick={() => approve(user.id)} type="button"><CheckCircle2 size={16} /> Approve</button>
              <button className="admin-action danger" onClick={() => reject(user.id)} type="button"><XCircle size={16} /> Reject</button>
            </ActionGroup>
          )}
        </article>
      ))}
    </div>
  );
};

const BookingsSection = ({ bookings, setBookings }) => {
  const [status, setStatus] = useState('');

  const filtered = useMemo(
    () => bookings.filter((booking) => !status || booking.status === status),
    [bookings, status]
  );

  const updateBookingStatus = async (booking, action) => {
    try {
      const data = action === 'confirm' ? await bookingsApi.confirm(booking.id) : await bookingsApi.cancel(booking.id);
      const nextBooking = data.booking || { ...booking, status: action === 'confirm' ? 'confirmed' : 'cancelled' };
      setBookings((prev) => prev.map((item) => (item.id === booking.id ? nextBooking : item)));
      toast.success(`Booking ${action === 'confirm' ? 'confirmed' : 'cancelled'}`);
    } catch (err) {
      toast.error(err.message || `Failed to ${action} booking`);
    }
  };

  return (
    <div className="admin-panel">
      <PanelHeader title="Booking operations" subtitle="See learner schedules, payment status, instructors, and booking states." />
      <div className="admin-toolbar right">
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All booking statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <ResponsiveTable emptyText="No bookings found." colSpan={9}>
        <thead>
          <tr>
            <th>Booking</th>
            <th>Learner</th>
            <th>Instructor</th>
            <th>Date & time</th>
            <th>Package</th>
            <th>Pickup</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((booking) => (
            <tr key={booking.id}>
              <td><strong>{booking.bookingNumber || booking.id?.slice(0, 8)}</strong></td>
              <td>{booking.guestName || booking.userId || 'Learner'}</td>
              <td>{booking.instructorId || 'Unassigned'}</td>
              <td>{formatDate(booking.lessonDate)}<br /><span className="muted-cell">{booking.lessonTime}</span></td>
              <td>{booking.packageName || booking.packageCode || 'Custom'}<br /><span className="muted-cell">{formatMoney(booking.price)}</span></td>
              <td>{booking.pickupSuburb || booking.pickupAddress || 'Not set'}</td>
              <td><StatusPill status={booking.paymentStatus || 'unpaid'} /></td>
              <td><StatusPill status={booking.status} /></td>
              <td>
                <ActionGroup>
                  {booking.status === 'pending' && (
                    <IconButton label="Confirm" tone="success" onClick={() => updateBookingStatus(booking, 'confirm')}><CheckCircle2 size={15} /></IconButton>
                  )}
                  {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                    <IconButton label="Cancel" tone="danger" onClick={() => updateBookingStatus(booking, 'cancel')}><XCircle size={15} /></IconButton>
                  )}
                </ActionGroup>
              </td>
            </tr>
          ))}
        </tbody>
      </ResponsiveTable>
    </div>
  );
};

const LogsSection = ({ logs, total, filters, setFilters, onApply }) => (
  <div className="admin-panel">
    <PanelHeader title="Audit logs" subtitle="Filter what learners, instructors, and admins have done in the system." />
    <div className="admin-filter-grid">
      <select value={filters.actorRole} onChange={(event) => setFilters({ ...filters, actorRole: event.target.value })}>
        <option value="">Actor: all</option>
        <option value="learner">Learner actions</option>
        <option value="instructor">Instructor actions</option>
        <option value="admin">Admin actions</option>
      </select>
      <select value={filters.targetUserRole} onChange={(event) => setFilters({ ...filters, targetUserRole: event.target.value })}>
        <option value="">Target: all</option>
        <option value="learner">Learner records</option>
        <option value="instructor">Instructor records</option>
        <option value="admin">Admin records</option>
      </select>
      <input value={filters.action} onChange={(event) => setFilters({ ...filters, action: event.target.value })} placeholder="Exact action e.g. user.updated" />
      <input value={filters.entityType} onChange={(event) => setFilters({ ...filters, entityType: event.target.value })} placeholder="Entity e.g. booking" />
      <input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} />
      <input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} />
      <button className="admin-action primary" onClick={onApply} type="button"><Search size={16} /> Apply filters</button>
    </div>
    <div className="admin-log-count">{total} log entries</div>
    <LogTimeline logs={logs} expanded />
  </div>
);

const PackagesSection = ({ packages, setPackages }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialPackageForm);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setFormData(initialPackageForm);
    setEditingId(null);
    setShowForm(false);
  };

  const savePackage = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      ...formData,
      price: Number(formData.price),
      durationMinutes: Number(formData.durationMinutes) || 90,
      includedItems: formData.includedItems.split('\n').map((item) => item.trim()).filter(Boolean),
    };

    try {
      if (editingId) {
        const data = await packagesApi.update(editingId, payload);
        setPackages((prev) => prev.map((item) => (item.id === editingId ? data.package || { ...item, ...payload } : item)));
        toast.success('Package updated');
      } else {
        const data = await packagesApi.create(payload);
        setPackages((prev) => [...prev, data.package || data]);
        toast.success('Package created');
      }
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Failed to save package');
    } finally {
      setSaving(false);
    }
  };

  const deletePackage = async (id) => {
    if (!window.confirm('Delete this package?')) return;
    try {
      await packagesApi.delete(id);
      setPackages((prev) => prev.filter((item) => item.id !== id));
      toast.success('Package deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete package');
    }
  };

  return (
    <div className="admin-panel">
      <PanelHeader
        title="Lesson packages"
        subtitle="Manage lesson pricing, durations, categories, and included items."
        actionLabel={showForm ? 'Close form' : 'Add package'}
        onAction={() => {
          setShowForm(!showForm);
          if (!showForm) {
            setEditingId(null);
            setFormData(initialPackageForm);
          }
        }}
      />

      {showForm && (
        <form className="admin-form-card" onSubmit={savePackage}>
          <FormGrid>
            <Field label="Name"><input value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} required /></Field>
            <Field label="Code"><input value={formData.code} onChange={(event) => setFormData({ ...formData, code: event.target.value })} required /></Field>
            <Field label="Price"><input type="number" value={formData.price} onChange={(event) => setFormData({ ...formData, price: event.target.value })} required /></Field>
            <Field label="Duration minutes"><input type="number" value={formData.durationMinutes} onChange={(event) => setFormData({ ...formData, durationMinutes: event.target.value })} /></Field>
            <Field label="Category">
              <select value={formData.category} onChange={(event) => setFormData({ ...formData, category: event.target.value })}>
                <option value="single">Single</option>
                <option value="package">Package</option>
                <option value="overseas">Overseas</option>
                <option value="test">Test</option>
                <option value="refresher">Refresher</option>
              </select>
            </Field>
            <Field label="Active">
              <select value={String(formData.isActive)} onChange={(event) => setFormData({ ...formData, isActive: event.target.value === 'true' })}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </Field>
            <Field label="Description" wide><input value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} /></Field>
            <Field label="Included items, one per line" wide>
              <textarea rows="4" value={formData.includedItems} onChange={(event) => setFormData({ ...formData, includedItems: event.target.value })} />
            </Field>
          </FormGrid>
          <FormActions saving={saving} editing={Boolean(editingId)} onCancel={resetForm} />
        </form>
      )}

      <ResponsiveTable emptyText="No packages configured." colSpan={7}>
        <thead>
          <tr><th>Name</th><th>Code</th><th>Category</th><th>Price</th><th>Duration</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {packages.map((item) => (
            <tr key={item.id}>
              <td><strong>{item.name}</strong></td>
              <td className="muted-cell">{item.code}</td>
              <td>{toTitle(item.category)}</td>
              <td>{formatMoney(item.price)}</td>
              <td>{item.durationMinutes || item.duration_minutes || 90} mins</td>
              <td><StatusPill status={item.isActive === false ? 'inactive' : 'active'} /></td>
              <td>
                <ActionGroup>
                  <IconButton
                    label="Edit"
                    tone="primary"
                    onClick={() => {
                      setEditingId(item.id);
                      setFormData({
                        name: item.name || '',
                        code: item.code || '',
                        description: item.description || '',
                        price: item.price || '',
                        durationMinutes: item.durationMinutes || item.duration_minutes || 90,
                        category: item.category || 'single',
                        isActive: item.isActive !== false,
                        includedItems: (item.includedItems || item.included_items || []).join('\n'),
                      });
                      setShowForm(true);
                    }}
                  >
                    <Edit3 size={15} />
                  </IconButton>
                  <IconButton label="Delete" tone="danger" onClick={() => deletePackage(item.id)}><Trash2 size={15} /></IconButton>
                </ActionGroup>
              </td>
            </tr>
          ))}
        </tbody>
      </ResponsiveTable>
    </div>
  );
};

const ContactsSection = ({ contacts, setContacts }) => {
  const updateStatus = async (id, status) => {
    try {
      const data = await contactApi.update(id, { status });
      setContacts((prev) => prev.map((item) => (item.id === id ? data.contactRequest || { ...item, status } : item)));
      toast.success('Message status updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update message');
    }
  };

  return (
    <div className="admin-panel">
      <PanelHeader title="Contact messages" subtitle="Track enquiries from learners, parents, and instructors." />
      <ResponsiveTable emptyText="No contact messages yet." colSpan={6}>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Phone</th><th>Message</th><th>Status</th><th>Received</th></tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td><strong>{contact.name}</strong></td>
              <td className="muted-cell">{contact.email}</td>
              <td>{contact.phone || 'Not set'}</td>
              <td className="message-cell">{contact.message}</td>
              <td>
                <select value={contact.status || 'new'} onChange={(event) => updateStatus(contact.id, event.target.value)}>
                  <option value="new">New</option>
                  <option value="in_progress">In progress</option>
                  <option value="replied">Replied</option>
                  <option value="closed">Closed</option>
                </select>
              </td>
              <td>{formatDate(contact.createdAt || contact.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </ResponsiveTable>
    </div>
  );
};

const ContentSection = ({ pages, setPages }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialContentForm);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialContentForm);
  };

  const saveContent = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const data = await contentApi.update(editingId, formData);
        setPages((prev) => prev.map((item) => (item.id === editingId ? data.contentPage || { ...item, ...formData } : item)));
        toast.success('Content updated');
      } else {
        const data = await contentApi.create(formData);
        setPages((prev) => [...prev, data.contentPage || data]);
        toast.success('Content created');
      }
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-panel">
      <PanelHeader
        title="Website content"
        subtitle="Manage dynamic pages and SEO fields used across the public site."
        actionLabel={showForm ? 'Close form' : 'Add page'}
        onAction={() => {
          setShowForm(!showForm);
          if (!showForm) {
            setEditingId(null);
            setFormData(initialContentForm);
          }
        }}
      />

      {showForm && (
        <form className="admin-form-card" onSubmit={saveContent}>
          <FormGrid>
            <Field label="Title"><input value={formData.title} onChange={(event) => setFormData({ ...formData, title: event.target.value })} required /></Field>
            <Field label="Slug"><input value={formData.slug} onChange={(event) => setFormData({ ...formData, slug: event.target.value })} required /></Field>
            <Field label="SEO title"><input value={formData.seoTitle} onChange={(event) => setFormData({ ...formData, seoTitle: event.target.value })} /></Field>
            <Field label="Published">
              <select value={String(formData.isPublished)} onChange={(event) => setFormData({ ...formData, isPublished: event.target.value === 'true' })}>
                <option value="true">Published</option>
                <option value="false">Draft</option>
              </select>
            </Field>
            <Field label="SEO description" wide><input value={formData.seoDescription} onChange={(event) => setFormData({ ...formData, seoDescription: event.target.value })} /></Field>
            <Field label="Content" wide><textarea rows="8" value={formData.content} onChange={(event) => setFormData({ ...formData, content: event.target.value })} /></Field>
          </FormGrid>
          <FormActions saving={saving} editing={Boolean(editingId)} onCancel={resetForm} />
        </form>
      )}

      <ResponsiveTable emptyText="No content pages found." colSpan={5}>
        <thead>
          <tr><th>Title</th><th>Slug</th><th>SEO title</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.id}>
              <td><strong>{page.title}</strong></td>
              <td className="muted-cell">/{page.slug}</td>
              <td>{getContentSeoTitle(page) || 'Not set'}</td>
              <td><StatusPill status={getContentPublished(page) ? 'published' : 'draft'} /></td>
              <td>
                <IconButton
                  label="Edit"
                  tone="primary"
                  onClick={() => {
                    setEditingId(page.id);
                    setFormData({
                      slug: page.slug || '',
                      title: page.title || '',
                      content: page.content || '',
                      seoTitle: getContentSeoTitle(page),
                      seoDescription: getContentSeoDescription(page),
                      isPublished: getContentPublished(page),
                    });
                    setShowForm(true);
                  }}
                >
                  <Edit3 size={15} />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </ResponsiveTable>
    </div>
  );
};

const SystemSection = ({ vehicleTypes, setVehicleTypes }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialVehicleForm);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialVehicleForm);
  };

  const saveVehicleType = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const data = await vehicleTypesApi.update(editingId, formData);
        setVehicleTypes((prev) => prev.map((item) => (item.id === editingId ? data.vehicleType || { ...item, ...formData } : item)));
        toast.success('Vehicle type updated');
      } else {
        const data = await vehicleTypesApi.create(formData);
        setVehicleTypes((prev) => [...prev, data.vehicleType || data]);
        toast.success('Vehicle type created');
      }
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Failed to save vehicle type');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-panel">
      <PanelHeader
        title="System setup"
        subtitle="Configure vehicle types and platform options used by bookings and instructor profiles."
        actionLabel={showForm ? 'Close form' : 'Add vehicle type'}
        onAction={() => {
          setShowForm(!showForm);
          if (!showForm) {
            setEditingId(null);
            setFormData(initialVehicleForm);
          }
        }}
      />

      {showForm && (
        <form className="admin-form-card" onSubmit={saveVehicleType}>
          <FormGrid>
            <Field label="Name"><input value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} required /></Field>
            <Field label="Code"><input value={formData.code} onChange={(event) => setFormData({ ...formData, code: event.target.value })} required /></Field>
            <Field label="Description" wide><input value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} /></Field>
          </FormGrid>
          <FormActions saving={saving} editing={Boolean(editingId)} onCancel={resetForm} />
        </form>
      )}

      <ResponsiveTable emptyText="No vehicle types configured." colSpan={4}>
        <thead>
          <tr><th>Name</th><th>Code</th><th>Description</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {vehicleTypes.map((type) => (
            <tr key={type.id}>
              <td><strong>{type.name}</strong></td>
              <td className="muted-cell">{type.code}</td>
              <td>{type.description || 'Not set'}</td>
              <td>
                <IconButton
                  label="Edit"
                  tone="primary"
                  onClick={() => {
                    setEditingId(type.id);
                    setFormData({ name: type.name || '', code: type.code || '', description: type.description || '', isActive: type.isActive !== false });
                    setShowForm(true);
                  }}
                >
                  <Edit3 size={15} />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </ResponsiveTable>
    </div>
  );
};

const PanelHeader = ({ title, subtitle, actionLabel, onAction }) => (
  <div className="admin-panel-header">
    <div>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {actionLabel && (
      <button className="admin-action primary" onClick={onAction} type="button">
        <Plus size={16} /> {actionLabel}
      </button>
    )}
  </div>
);

const SearchBox = ({ value, onChange, placeholder }) => (
  <label className="admin-search-box">
    <Search size={17} />
    <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
  </label>
);

const ResponsiveTable = ({ children, emptyText, colSpan }) => {
  const body = children?.find?.((child) => child?.type === 'tbody');
  const rowCount = Children.count(body?.props?.children);

  return (
    <div className="admin-table-wrap">
      <table className="admin-data-table">
        {children}
        {!rowCount && (
          <tbody>
            <tr>
              <td colSpan={colSpan}>
                <EmptyState icon={AlertCircle} title={emptyText} message="Try changing filters or refresh the dashboard." compact />
              </td>
            </tr>
          </tbody>
        )}
      </table>
    </div>
  );
};

const LogTimeline = ({ logs, expanded = false }) => {
  if (!logs?.length) {
    return <EmptyState icon={Activity} title="No activity yet" message="System events will appear here once users start taking actions." compact />;
  }

  return (
    <div className={`admin-log-timeline ${expanded ? 'expanded' : ''}`}>
      {logs.map((log) => (
        <article className="admin-log-row" key={log.id}>
          <span className="admin-log-dot" />
          <div>
            <strong>{log.summary || toTitle(log.action)}</strong>
            <small>
              {log.actorName || log.actor_name || 'System'} • {toTitle(log.actorRole || log.actor_role)}
              {' '}• {formatDateTime(log.createdAt || log.created_at)}
            </small>
          </div>
          <StatusPill status={log.entityType || log.entity_type || 'event'} />
        </article>
      ))}
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, message, compact = false }) => (
  <div className={`admin-empty-state ${compact ? 'compact' : ''}`}>
    <Icon size={compact ? 22 : 32} />
    <strong>{title}</strong>
    <span>{message}</span>
  </div>
);

const StatusPill = ({ status }) => <span className={`admin-pill status-${String(status || 'unknown').toLowerCase()}`}>{toTitle(status)}</span>;
const RolePill = ({ role }) => <span className={`admin-pill role-${String(role || 'unknown').toLowerCase()}`}>{toTitle(role)}</span>;

const IconButton = ({ children, label, tone = 'neutral', onClick }) => (
  <button className={`admin-icon-btn ${tone}`} type="button" onClick={onClick} title={label} aria-label={label}>
    {children}
  </button>
);

const ActionGroup = ({ children }) => <div className="admin-action-group">{children}</div>;
const FormGrid = ({ children }) => <div className="admin-form-grid">{children}</div>;
const Field = ({ label, children, wide }) => <label className={wide ? 'admin-field wide' : 'admin-field'}><span>{label}</span>{children}</label>;

const FormActions = ({ saving, editing, onCancel }) => (
  <div className="admin-form-actions">
    <button className="admin-action primary" type="submit" disabled={saving}>
      {saving ? <Loader size={16} className="spin-icon" /> : <Save size={16} />}
      {editing ? 'Update' : 'Create'}
    </button>
    <button className="admin-action ghost" type="button" onClick={onCancel}>Cancel</button>
  </div>
);

export default AdminDashboard;
