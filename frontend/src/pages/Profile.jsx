import React, { useState, useEffect } from 'react';
import { User, Save, Loader, AlertCircle, CheckCircle, MapPin, Phone, Mail, Car, Shield } from 'lucide-react';
import { usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { user, refreshUser, role } = useAuth();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await usersApi.getMe();
        setFormData(data.user || data);
      } catch {
        if (user) setFormData(user);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await usersApi.updateMe({
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        suburb: formData.suburb,
        postcode: formData.postcode,
        transmissionPreference: formData.transmissionPreference,
        pickupAddress: formData.pickupAddress,
        pickupSuburb: formData.pickupSuburb,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        specialRequirements: formData.specialRequirements,
        ...(role === 'instructor' ? {
          bio: formData.bio,
          serviceAreas: formData.serviceAreas,
          baseAddress: formData.baseAddress,
          serviceRadiusKm: formData.serviceRadiusKm ? Number(formData.serviceRadiusKm) : undefined,
        } : {}),
      });
      toast.success('Profile updated successfully!');
      await refreshUser();
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page bg-light section text-center" style={{ padding: '6rem 0' }}>
        <Loader size={32} className="spin-icon icon-blue" />
        <p className="text-muted" style={{ marginTop: '1rem' }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page bg-light section">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={40} />
          </div>
          <div>
            <h1 className="h2">{formData.fullName || 'Your Profile'}</h1>
            <p className="text-muted">
              <span className="profile-role-badge">{formData.role || role}</span>
              <span style={{ marginLeft: '0.5rem' }}>{formData.email}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="profile-section">
            <h3 className="h4 profile-section-title"><User size={20} /> Personal Information</h3>
            <div className="profile-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="fullName" value={formData.fullName || ''} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email <span className="text-sm text-muted">(cannot change)</span></label>
                <input type="email" value={formData.email || ''} disabled />
              </div>
              <div className="form-group">
                <label><Phone size={14} /> Phone</label>
                <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} placeholder="0400 000 000" />
              </div>
              <div className="form-group">
                <label><Car size={14} /> Transmission Preference</label>
                <select name="transmissionPreference" value={formData.transmissionPreference || ''} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="profile-section">
            <h3 className="h4 profile-section-title"><MapPin size={20} /> Address</h3>
            <div className="profile-grid">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Street Address</label>
                <input type="text" name="address" value={formData.address || ''} onChange={handleChange} placeholder="123 Main St" />
              </div>
              <div className="form-group">
                <label>Suburb</label>
                <input type="text" name="suburb" value={formData.suburb || ''} onChange={handleChange} placeholder="Mawson Lakes" />
              </div>
              <div className="form-group">
                <label>Postcode</label>
                <input type="text" name="postcode" value={formData.postcode || ''} onChange={handleChange} placeholder="5095" />
              </div>
            </div>
          </div>

          {/* Pickup / Emergency */}
          <div className="profile-section">
            <h3 className="h4 profile-section-title"><MapPin size={20} /> Pickup & Emergency</h3>
            <div className="profile-grid">
              <div className="form-group">
                <label>Pickup Address</label>
                <input type="text" name="pickupAddress" value={formData.pickupAddress || ''} onChange={handleChange} placeholder="Where should we pick you up?" />
              </div>
              <div className="form-group">
                <label>Pickup Suburb</label>
                <input type="text" name="pickupSuburb" value={formData.pickupSuburb || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Emergency Contact Name</label>
                <input type="text" name="emergencyContactName" value={formData.emergencyContactName || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Emergency Contact Phone</label>
                <input type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone || ''} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Special Requirements</label>
                <textarea name="specialRequirements" value={formData.specialRequirements || ''} onChange={handleChange} rows="3" placeholder="Any special needs or requirements?" />
              </div>
            </div>
          </div>

          {/* Instructor-specific fields */}
          {role === 'instructor' && (
            <div className="profile-section">
              <h3 className="h4 profile-section-title"><Shield size={20} /> Instructor Details</h3>
              <div className="profile-grid">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Bio</label>
                  <textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows="4" placeholder="Tell students about yourself..." />
                </div>
                <div className="form-group">
                  <label>Base Address</label>
                  <input type="text" name="baseAddress" value={formData.baseAddress || ''} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Service Radius (km)</label>
                  <input type="number" name="serviceRadiusKm" value={formData.serviceRadiusKm || ''} onChange={handleChange} min="1" max="100" />
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ padding: '0.875rem 2rem', marginTop: '1rem' }} disabled={saving}>
            {saving ? <><Loader size={18} className="spin-icon" /> Saving...</> : <><Save size={18} /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
