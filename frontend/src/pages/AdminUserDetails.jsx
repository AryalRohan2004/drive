import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader, Shield, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { usersApi } from '../services/api';

const formatDate = (value) => {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatMoney = (value) => {
  const number = Number(value || 0);
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(number);
};

const isPresent = (value) => value !== null && value !== undefined && value !== '';

const field = (label, value, formatter = (input) => input) =>
  isPresent(value) ? [label, formatter(value)] : null;

const AdminUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await usersApi.getById(id);
        setUser(data.user || data);
      } catch (err) {
        toast.error(err.message || 'Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  const instructorProfile = user?.instructorProfile || null;
  const detailSections = useMemo(() => {
    const learnerFields = [
      field('Date of birth', user?.dateOfBirth, formatDate),
      field('Address', user?.address),
      field('Suburb', user?.suburb),
      field('Postcode', user?.postcode),
      field('Learning status', user?.learningStatus),
      field('Logbook hours', user?.logbookHours ?? 0),
      field('Progress percent', user?.progressPercent != null ? `${user.progressPercent}%` : null),
      field('Vehicle types supported', user?.vehicleTypesSupported, (values) => values.join(', ')),
      field('Preferred vehicle type', user?.preferredVehicleType),
      field('Pickup address', user?.pickupAddress),
      field('Pickup suburb', user?.pickupSuburb),
      field('Emergency contact', user?.emergencyContactName),
      field('Emergency phone', user?.emergencyContactPhone),
      field('Service radius', user?.serviceRadiusKm != null ? `${user.serviceRadiusKm} km` : null),
    ].filter(Boolean);

    const instructorFields = instructorProfile
      ? [
          field('Languages spoken', instructorProfile.languagesSpoken),
          field('Accreditation number', instructorProfile.accreditationNumber),
          field('License expiry', instructorProfile.licenseExpiry, formatDate),
          field('WWCC', instructorProfile.hasWwcc ? 'Yes' : null),
          field('Police clearance', instructorProfile.hasPoliceClearance ? 'Yes' : null),
          field('Days available', instructorProfile.daysAvailable),
          field('Times available', instructorProfile.timesAvailable),
          field('Pickup locations', instructorProfile.pickupLocations),
          field('Vehicle make/model', instructorProfile.vehicleMakeModel),
          field('Vehicle transmission', instructorProfile.vehicleTransmission),
          field('Dual control', instructorProfile.hasDualControl ? 'Yes' : null),
          field('ABN', instructorProfile.abn),
          field('Years experience', instructorProfile.yearsExperience),
          field('Students taught', instructorProfile.studentsTaught),
          field('Commission accepted', instructorProfile.agreedCommission ? 'Yes' : null),
          field('Terms accepted', instructorProfile.agreedTerms ? 'Yes' : null),
          field('Cancellation policy', instructorProfile.agreedCancellation ? 'Yes' : null),
          field('Price 1 hr', instructorProfile.price1Hr != null ? formatMoney(instructorProfile.price1Hr) : null),
          field('Price 2 hr', instructorProfile.price2Hr != null ? formatMoney(instructorProfile.price2Hr) : null),
          field('Test package', instructorProfile.priceTestPackage != null ? formatMoney(instructorProfile.priceTestPackage) : null),
          field('Social links', instructorProfile.socialLinks),
          field('Testimonials', instructorProfile.testimonialsText),
        ].filter(Boolean)
      : [];

    return { learnerFields, instructorFields };
  }, [instructorProfile, user]);

  const handleDecision = async (decision) => {
    if (!user) return;
    setSaving(true);
    try {
      const data = decision === 'approve'
        ? await usersApi.approveInstructor(user.id)
        : await usersApi.rejectInstructor(user.id);
      if (decision === 'approve') {
        const nextUser = data.user || { ...user, status: 'active' };
        setUser(nextUser);
        toast.success('Instructor approved');
      } else {
        toast.success('Instructor removed');
        navigate('/admin');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update instructor status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-console-loading" style={{ minHeight: '100vh' }}>
        <Loader size={36} className="spin-icon" />
        <p>Loading user details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-console-loading" style={{ minHeight: '100vh' }}>
        <AlertCircle size={36} />
        <p>User not found.</p>
        <button className="admin-action primary" type="button" onClick={() => navigate('/admin')}>
          <ArrowLeft size={16} /> Back to admin
        </button>
      </div>
    );
  }

  return (
    <div className="admin-console">
      <main className="admin-main" style={{ gridColumn: '1 / -1' }}>
        <div className="admin-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <Link to="/admin" className="text-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <ArrowLeft size={16} /> Back to admin
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="admin-brand-mark" style={{ width: 52, height: 52 }}>
                  <User size={22} />
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: '2rem' }}>{user.fullName}</h1>
                  <p style={{ margin: '0.35rem 0 0', color: '#64748b' }}>
                    <strong style={{ textTransform: 'capitalize' }}>{user.role}</strong> • {user.email}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {user.role === 'instructor' && (
                <>
                  <button className="admin-action success" type="button" disabled={saving || user.status === 'active'} onClick={() => handleDecision('approve')}>
                    <CheckCircle2 size={16} /> Approve
                  </button>
                  <button className="admin-action danger" type="button" disabled={saving || user.status === 'rejected'} onClick={() => handleDecision('reject')}>
                    <Shield size={16} /> Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <section className="admin-section-stack" style={{ marginTop: '1rem' }}>
          <div className="admin-panel" style={{ padding: '1.25rem' }}>
            <h2 style={{ marginTop: 0 }}>Core details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.9rem' }}>
              <Detail label="Name" value={user.fullName} />
              <Detail label="Phone" value={user.phone || 'Not set'} />
              <Detail label="Role" value={user.role} />
              <Detail label="Status" value={user.status} />
              <Detail label="Joined" value={formatDate(user.createdAt)} />
              <Detail label="Learning status" value={user.learningStatus || 'Not set'} />
            </div>
          </div>

          {user.role === 'instructor' && (
            <div className="admin-panel" style={{ padding: '1.25rem' }}>
              <h2 style={{ marginTop: 0 }}>Instructor application</h2>
              {user.bio ? <p style={{ color: '#334155', lineHeight: 1.7 }}>{user.bio}</p> : null}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
                {detailSections.instructorFields.map(([label, value]) => (
                  <Detail key={label} label={label} value={Array.isArray(value) ? value.join(', ') : value} />
                ))}
              </div>
              {instructorProfile?.servicesOffered ? (
                <div style={{ marginTop: '1rem' }}>
                  <h3 style={{ marginBottom: '0.75rem' }}>Services offered</h3>
                  <pre style={{ whiteSpace: 'pre-wrap', margin: 0, background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                    {JSON.stringify(instructorProfile.servicesOffered, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>
          )}

          <div className="admin-panel" style={{ padding: '1.25rem' }}>
            <h2 style={{ marginTop: 0 }}>{user.role === 'instructor' ? 'Learner profile fields' : 'Profile fields'}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {detailSections.learnerFields.map(([label, value]) => (
                <Detail key={label} label={label} value={Array.isArray(value) ? value.join(', ') : value} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div style={{ padding: '0.9rem', border: '1px solid #e2e8f0', borderRadius: '0.9rem', background: '#fff' }}>
    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '0.35rem' }}>
      {label}
    </div>
    <div style={{ color: '#0f172a', fontWeight: 600, lineHeight: 1.5, wordBreak: 'break-word' }}>
      {String(value)}
    </div>
  </div>
);

export default AdminUserDetails;
