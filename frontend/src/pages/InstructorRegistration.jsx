import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Upload, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { uploadApi } from '../services/api';
import './InstructorRegistration.css';

const STEPS = [
  'Personal Info',
  'Qualifications & Services',
  'Location & Vehicle',
  'Pricing & Payment',
  'Portfolio & Agreement'
];

const NAME_REGEX = /^[A-Za-z][A-Za-z\s.'-]{1,59}$/;
const MOBILE_REGEX = /^[0-9+\-\s()]{8,15}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,32}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i;
const ABN_REGEX = /^(\d{2}\s?\d{3}\s?\d{3}\s?\d{3}|\d{11})$/;
const BSB_REGEX = /^\d{3}-?\d{3}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const initialErrors = {};

const getFieldMessage = (name, value) => {
  const v = typeof value === 'string' ? value.trim() : value;

  switch (name) {
    case 'fullName':
      if (!v) return 'Full name is required.';
      if (v.length < 2) return 'Full name must be at least 2 characters.';
      if (v.length > 60) return 'Full name must be 60 characters or fewer.';
      if (!NAME_REGEX.test(v)) return 'Use letters only, with spaces or basic punctuation.';
      return '';
    case 'mobile':
      if (!v) return 'Mobile number is required.';
      if (!MOBILE_REGEX.test(v)) return 'Enter a valid phone number with 8 to 15 digits.';
      return '';
    case 'email':
      if (!v) return 'Email address is required.';
      if (!EMAIL_REGEX.test(v)) return 'Enter a valid email address.';
      return '';
    case 'password':
      if (!v) return 'Password is required.';
      if (v.length < 8) return 'Password must be at least 8 characters.';
      if (v.length > 32) return 'Password must be 32 characters or fewer.';
      if (!PASSWORD_REGEX.test(v)) return 'Password must include at least one letter and one number.';
      return '';
    case 'languages':
      if (v && v.length < 2) return 'Languages must be at least 2 characters.';
      if (v && v.length > 80) return 'Languages must be 80 characters or fewer.';
      return '';
    case 'bio':
      if (v && v.length < 20) return 'Bio should be at least 20 characters.';
      if (v && v.length > 500) return 'Bio must be 500 characters or fewer.';
      return '';
    case 'accreditationNo':
      if (!v) return 'Instructor accreditation number is required.';
      if (v.length < 4) return 'Accreditation number must be at least 4 characters.';
      if (v.length > 30) return 'Accreditation number must be 30 characters or fewer.';
      return '';
    case 'licenseNo':
      if (!v) return "Driver's licence number is required.";
      if (v.length < 5) return 'Licence number must be at least 5 characters.';
      if (v.length > 30) return 'Licence number must be 30 characters or fewer.';
      return '';
    case 'licenseExpiry':
      if (!v) return 'Licence expiry date is required.';
      if (!DATE_REGEX.test(v)) return 'Enter a valid date.';
      return '';
    case 'suburbsCovered':
      if (v && v.length < 3) return 'Suburbs must be at least 3 characters.';
      if (v && v.length > 120) return 'Suburbs must be 120 characters or fewer.';
      return '';
    case 'daysAvailable':
      if (v && v.length < 3) return 'Available days must be at least 3 characters.';
      if (v && v.length > 60) return 'Available days must be 60 characters or fewer.';
      return '';
    case 'timesAvailable':
      if (v && v.length < 3) return 'Available times must be at least 3 characters.';
      if (v && v.length > 60) return 'Available times must be 60 characters or fewer.';
      return '';
    case 'pickupLocations':
      if (v && v.length < 3) return 'Pickup locations must be at least 3 characters.';
      if (v && v.length > 120) return 'Pickup locations must be 120 characters or fewer.';
      return '';
    case 'vehicleMakeModel':
      if (v && v.length < 2) return 'Vehicle make and model must be at least 2 characters.';
      if (v && v.length > 60) return 'Vehicle make and model must be 60 characters or fewer.';
      return '';
    case 'price1Hr':
    case 'price2Hr':
    case 'priceTestPackage':
      if (!v) return 'Price is required.';
      if (Number(v) <= 0) return 'Price must be greater than 0.';
      if (Number(v) > 1000) return 'Price must be 1000 or less.';
      return '';
    case 'specialPackages':
      if (v && v.length > 120) return 'Special package details must be 120 characters or fewer.';
      return '';
    case 'bankDetails':
      if (v && v.length < 6) return 'Bank details must be at least 6 characters.';
      if (v && v.length > 120) return 'Bank details must be 120 characters or fewer.';
      if (v && !BSB_REGEX.test(v) && !v.toLowerCase().includes('bsb')) return 'Include BSB and account number.';
      return '';
    case 'abn':
      if (v && !ABN_REGEX.test(v.replace(/\s+/g, ''))) return 'Enter a valid 11-digit ABN.';
      return '';
    case 'yearsExperience':
      if (v === '') return 'Years of experience is required.';
      if (Number(v) < 0) return 'Years of experience cannot be negative.';
      if (Number(v) > 80) return 'Years of experience must be 80 or less.';
      return '';
    case 'studentsTaught':
      if (v === '') return 'Approx. students taught is required.';
      if (Number(v) < 0) return 'Students taught cannot be negative.';
      if (Number(v) > 100000) return 'Students taught must be 100000 or less.';
      return '';
    case 'testimonials':
      if (v && v.length > 1000) return 'Testimonials must be 1000 characters or fewer.';
      return '';
    case 'socialLinks':
      if (v && !URL_REGEX.test(v)) return 'Enter a valid social profile link.';
      return '';
    case 'agreeCommission':
      if (!v) return 'Please accept the platform commission fee.';
      return '';
    case 'agreeTerms':
      if (!v) return 'Please accept the instructor terms and conditions.';
      return '';
    case 'agreeCancellation':
      if (!v) return 'Please accept the cancellation policy.';
      return '';
    default:
      return '';
  }
};

const InstructorRegistration = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(initialErrors);
  const navigate = useNavigate();
  const { register } = useAuth(); // We might use a different register function if backend supports it

  // State to hold all form data
  const [formData, setFormData] = useState({
    // Step 1
    fullName: '',
    email: '',
    password: '',
    mobile: '',
    bio: '',
    languages: '',
    profilePhoto: null,

    // Step 2
    accreditationNo: '',
    licenseNo: '',
    licenseExpiry: '',
    wwcc: false,
    policeClearance: false,
    services: {
      autoManual: 'Automatic',
      overseasConversion: false,
      vortPrep: false,
      cbtaPrep: false,
      refresher: false,
      seniorAssessments: false
    },

    // Step 3
    suburbsCovered: '',
    daysAvailable: '',
    timesAvailable: '',
    pickupLocations: '',
    vehicleMakeModel: '',
    vehicleTransmission: 'Automatic',
    dualControl: false,
    vehiclePhoto: null,

    // Step 4
    price1Hr: '',
    price2Hr: '',
    priceTestPackage: '',
    specialPackages: '',
    bankDetails: '',
    abn: '',

    // Step 5
    yearsExperience: '',
    studentsTaught: '',
    testimonials: '',
    socialLinks: '',
    passPhotos: null,
    agreeCommission: false,
    agreeTerms: false,
    agreeCancellation: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: nextValue
    }));
    setErrors(prev => ({
      ...prev,
      [name]: getFieldMessage(name, nextValue)
    }));
  };

  const handleServiceChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [name]: checked
      }
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0] || null;

    if (!file) {
      setFormData(prev => ({ ...prev, [name]: null }));
      return;
    }
    
    // Store the actual file object for uploading later
    setFormData(prev => ({
      ...prev,
      [name]: file
    }));
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    setErrors(prev => ({
      ...prev,
      [name]: getFieldMessage(name, type === 'checkbox' ? checked : value)
    }));
  };

  const validateCurrentStep = () => {
    const stepFields = [
      ['fullName', 'mobile', 'email', 'password', 'languages', 'bio'],
      ['accreditationNo', 'licenseNo', 'licenseExpiry'],
      ['suburbsCovered', 'daysAvailable', 'timesAvailable', 'pickupLocations', 'vehicleMakeModel'],
      ['price1Hr', 'price2Hr', 'priceTestPackage', 'specialPackages', 'bankDetails', 'abn'],
      ['yearsExperience', 'studentsTaught', 'testimonials', 'socialLinks', 'agreeCommission', 'agreeTerms', 'agreeCancellation']
    ];

    const nextErrors = {};
    stepFields[currentStep].forEach((field) => {
      nextErrors[field] = getFieldMessage(field, formData[field]);
    });

    const hasErrors = Object.values(nextErrors).some(Boolean);
    setErrors(prev => ({ ...prev, ...nextErrors }));
    return !hasErrors;
  };

  const showFieldError = (name) => Boolean(errors[name]);

  const nextStep = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(curr => curr + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;
    setLoading(true);
    try {
      let profilePhotoUrl = formData.profilePhoto;
      let vehiclePhotoUrl = formData.vehiclePhoto;
      
      if (formData.profilePhoto instanceof File) {
        const res = await uploadApi.uploadPublicFile(formData.profilePhoto);
        profilePhotoUrl = res.url;
      }
      if (formData.vehiclePhoto instanceof File) {
        const res = await uploadApi.uploadPublicFile(formData.vehiclePhoto);
        vehiclePhotoUrl = res.url;
      }

      const payload = {
        ...formData,
        phone: formData.mobile,
        languagesSpoken: formData.languages,
        accreditationNumber: formData.accreditationNo,
        servicesOffered: formData.services,
        agreedCommission: formData.agreeCommission,
        agreedTerms: formData.agreeTerms,
        agreedCancellation: formData.agreeCancellation,
        testimonialsText: formData.testimonials,
        profilePhotoUrl,
        vehiclePhotoUrl,
      };

      await register({
        ...payload,
        role: 'instructor'
      });
      
      navigate('/instructor-dashboard');
    } catch (error) {
      console.error(error);
      alert('Registration failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderFieldError = (name) => {
    if (!errors[name]) return null;
    return <p className="field-error" role="alert">{errors[name]}</p>;
  };

  return (
    <div className="instructor-reg-page bg-light">
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="h2">Become a SANOS Instructor</h1>
          <p className="text-muted">Fill out the form below to register your profile.</p>
        </div>

        <div className="instructor-reg-card">
          {/* Stepper Header */}
          <div className="stepper">
            {STEPS.map((step, idx) => (
              <div 
                key={idx} 
                className={`step-item ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
              >
                <div className="step-circle">
                  {idx < currentStep ? <Check size={20} /> : idx + 1}
                </div>
                <span className="step-label">{step}</span>
              </div>
            ))}
          </div>

          {/* Form Content */}
          <form onSubmit={currentStep === STEPS.length - 1 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
            
            {/* STEP 1: Personal Info */}
            {currentStep === 0 && (
              <div className="step-content fade-in">
                <h3 className="reg-section-title">Personal Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} onBlur={handleBlur} required minLength={2} maxLength={60} pattern={NAME_REGEX.source} className={showFieldError('fullName') ? 'input-error' : ''} />
                    {renderFieldError('fullName')}
                  </div>
                  <div className="form-group">
                    <label>Mobile Number *</label>
                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} onBlur={handleBlur} required minLength={8} maxLength={15} pattern={MOBILE_REGEX.source} className={showFieldError('mobile') ? 'input-error' : ''} />
                    {renderFieldError('mobile')}
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} required className={showFieldError('email') ? 'input-error' : ''} />
                    {renderFieldError('email')}
                  </div>
                  <div className="form-group">
                    <label>Password (for your account) *</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} required minLength={8} maxLength={32} pattern={PASSWORD_REGEX.source} className={showFieldError('password') ? 'input-error' : ''}/>
                    {renderFieldError('password')}
                  </div>
                  <div className="form-group full-width">
                    <label>Languages Spoken (e.g. English, Nepali, Hindi)</label>
                    <input type="text" name="languages" value={formData.languages} onChange={handleChange} onBlur={handleBlur} placeholder="English, Nepali" minLength={2} maxLength={80} className={showFieldError('languages') ? 'input-error' : ''} />
                    {renderFieldError('languages')}
                  </div>
                  <div className="form-group full-width">
                    <label>Instructor Bio / About Me</label>
                    <textarea name="bio" rows="4" value={formData.bio} onChange={handleChange} onBlur={handleBlur} placeholder="Tell students a bit about your teaching style and background..." minLength={20} maxLength={500} className={showFieldError('bio') ? 'input-error' : ''}></textarea>
                    {renderFieldError('bio')}
                  </div>
                  <div className="form-group full-width">
                    <label>Profile Photo</label>
                    <div className="file-upload-box">
                      <label htmlFor="profilePhoto" style={{ cursor: 'pointer', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {formData.profilePhoto ? (
                          <img src={URL.createObjectURL(formData.profilePhoto)} alt="Profile Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%', marginBottom: '10px' }} />
                        ) : (
                          <Upload size={32} className="text-muted mb-2" />
                        )}
                        <span>{formData.profilePhoto ? 'Click to change profile photo' : 'Click to upload your profile photo'}</span>
                        <input type="file" id="profilePhoto" name="profilePhoto" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Qualifications & Services */}
            {currentStep === 1 && (
              <div className="step-content fade-in">
                <h3 className="reg-section-title">Qualifications & Licensing</h3>
                <div className="form-grid mb-4">
                  <div className="form-group">
                    <label>Instructor Accreditation Number *</label>
                    <input type="text" name="accreditationNo" value={formData.accreditationNo} onChange={handleChange} onBlur={handleBlur} required minLength={4} maxLength={30} className={showFieldError('accreditationNo') ? 'input-error' : ''} />
                    {renderFieldError('accreditationNo')}
                  </div>
                  <div className="form-group">
                    <label>Driver's Licence Number *</label>
                    <input type="text" name="licenseNo" value={formData.licenseNo} onChange={handleChange} onBlur={handleBlur} required minLength={5} maxLength={30} className={showFieldError('licenseNo') ? 'input-error' : ''} />
                    {renderFieldError('licenseNo')}
                  </div>
                  <div className="form-group">
                    <label>Licence Expiry Date *</label>
                    <input type="date" name="licenseExpiry" value={formData.licenseExpiry} onChange={handleChange} onBlur={handleBlur} required className={showFieldError('licenseExpiry') ? 'input-error' : ''} />
                    {renderFieldError('licenseExpiry')}
                  </div>
                </div>

                <div className="checkbox-grid mb-4 border-bottom pb-4">
                  <div className="checkbox-item">
                    <input type="checkbox" id="wwcc" name="wwcc" checked={formData.wwcc} onChange={handleChange} />
                    <label htmlFor="wwcc">Working With Children Check (Verified)</label>
                  </div>
                  <div className="checkbox-item">
                    <input type="checkbox" id="policeClearance" name="policeClearance" checked={formData.policeClearance} onChange={handleChange} />
                    <label htmlFor="policeClearance">National Police Clearance</label>
                  </div>
                </div>

                <h3 className="reg-section-title mt-4">Services Offered</h3>
                <div className="form-group mb-3">
                  <label>Transmission Type</label>
                  <select name="services.autoManual" value={formData.services.autoManual} onChange={(e) => setFormData({...formData, services: {...formData.services, autoManual: e.target.value}})}>
                    <option value="Automatic">Automatic Only</option>
                    <option value="Manual">Manual Only</option>
                    <option value="Both">Both Automatic & Manual</option>
                  </select>
                </div>
                <div className="checkbox-grid">
                  <div className="checkbox-item">
                    <input type="checkbox" id="overseas" name="overseasConversion" checked={formData.services.overseasConversion} onChange={handleServiceChange} />
                    <label htmlFor="overseas">Overseas Licence Conversion</label>
                  </div>
                  <div className="checkbox-item">
                    <input type="checkbox" id="vort" name="vortPrep" checked={formData.services.vortPrep} onChange={handleServiceChange} />
                    <label htmlFor="vort">VORT Preparation</label>
                  </div>
                  <div className="checkbox-item">
                    <input type="checkbox" id="cbta" name="cbtaPrep" checked={formData.services.cbtaPrep} onChange={handleServiceChange} />
                    <label htmlFor="cbta">CBT&A Preparation</label>
                  </div>
                  <div className="checkbox-item">
                    <input type="checkbox" id="refresher" name="refresher" checked={formData.services.refresher} onChange={handleServiceChange} />
                    <label htmlFor="refresher">Refresher Lessons</label>
                  </div>
                  <div className="checkbox-item">
                    <input type="checkbox" id="senior" name="seniorAssessments" checked={formData.services.seniorAssessments} onChange={handleServiceChange} />
                    <label htmlFor="senior">Senior Driver Assessments</label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Location & Vehicle */}
            {currentStep === 2 && (
              <div className="step-content fade-in">
                <h3 className="reg-section-title">Location & Availability</h3>
                <div className="form-grid mb-5">
                  <div className="form-group full-width">
                    <label>Areas/Suburbs Covered</label>
                    <input type="text" name="suburbsCovered" value={formData.suburbsCovered} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. Mawson Lakes, Salisbury, Prospect..." minLength={3} maxLength={120} className={showFieldError('suburbsCovered') ? 'input-error' : ''} />
                    {renderFieldError('suburbsCovered')}
                  </div>
                  <div className="form-group">
                    <label>Available Days</label>
                    <input type="text" name="daysAvailable" value={formData.daysAvailable} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. Mon-Fri, Weekends" minLength={3} maxLength={60} className={showFieldError('daysAvailable') ? 'input-error' : ''} />
                    {renderFieldError('daysAvailable')}
                  </div>
                  <div className="form-group">
                    <label>Available Times</label>
                    <input type="text" name="timesAvailable" value={formData.timesAvailable} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. 8AM - 6PM" minLength={3} maxLength={60} className={showFieldError('timesAvailable') ? 'input-error' : ''} />
                    {renderFieldError('timesAvailable')}
                  </div>
                  <div className="form-group full-width">
                    <label>Pickup Locations Accepted</label>
                    <input type="text" name="pickupLocations" value={formData.pickupLocations} onChange={handleChange} onBlur={handleBlur} placeholder="Home, School, Work, Uni, etc." minLength={3} maxLength={120} className={showFieldError('pickupLocations') ? 'input-error' : ''} />
                    {renderFieldError('pickupLocations')}
                  </div>
                </div>

                <h3 className="reg-section-title">Vehicle Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Vehicle Make & Model</label>
                    <input type="text" name="vehicleMakeModel" value={formData.vehicleMakeModel} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. 2022 Toyota Yaris" minLength={2} maxLength={60} className={showFieldError('vehicleMakeModel') ? 'input-error' : ''} />
                    {renderFieldError('vehicleMakeModel')}
                  </div>
                  <div className="form-group">
                    <label>Transmission</label>
                    <select name="vehicleTransmission" value={formData.vehicleTransmission} onChange={handleChange}>
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <div className="checkbox-item mt-2">
                      <input type="checkbox" id="dualControl" name="dualControl" checked={formData.dualControl} onChange={handleChange} />
                      <label htmlFor="dualControl" style={{ fontWeight: '500' }}>Vehicle is fitted with Dual Controls</label>
                    </div>
                  </div>
                  <div className="form-group full-width mt-3">
                    <label>Vehicle Photo</label>
                    <div className="file-upload-box">
                      <label htmlFor="vehiclePhoto" style={{ cursor: 'pointer', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {formData.vehiclePhoto ? (
                          <img src={URL.createObjectURL(formData.vehiclePhoto)} alt="Vehicle Preview" style={{ width: '160px', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
                        ) : (
                          <Upload size={32} className="text-muted mb-2" />
                        )}
                        <span>{formData.vehiclePhoto ? 'Click to change vehicle photo' : 'Click to upload a photo of your vehicle'}</span>
                        <input type="file" id="vehiclePhoto" name="vehiclePhoto" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Pricing & Payment */}
            {currentStep === 3 && (
              <div className="step-content fade-in">
                <h3 className="reg-section-title">Pricing Settings</h3>
                <div className="form-grid mb-5">
                  <div className="form-group">
                    <label>1-Hour Lesson Price ($)</label>
                    <input type="number" name="price1Hr" value={formData.price1Hr} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. 75" min="1" max="1000" className={showFieldError('price1Hr') ? 'input-error' : ''} />
                    {renderFieldError('price1Hr')}
                  </div>
                  <div className="form-group">
                    <label>2-Hour Lesson Price ($)</label>
                    <input type="number" name="price2Hr" value={formData.price2Hr} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. 140" min="1" max="1000" className={showFieldError('price2Hr') ? 'input-error' : ''} />
                    {renderFieldError('price2Hr')}
                  </div>
                  <div className="form-group">
                    <label>Test Day Package Price ($)</label>
                    <input type="number" name="priceTestPackage" value={formData.priceTestPackage} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. 180" min="1" max="1000" className={showFieldError('priceTestPackage') ? 'input-error' : ''} />
                    {renderFieldError('priceTestPackage')}
                  </div>
                  <div className="form-group">
                    <label>Any Special Packages Details</label>
                    <input type="text" name="specialPackages" value={formData.specialPackages} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. 5 lessons for $350" maxLength={120} className={showFieldError('specialPackages') ? 'input-error' : ''} />
                    {renderFieldError('specialPackages')}
                  </div>
                </div>

                <h3 className="reg-section-title">Payment Information</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Bank Account Details (For Payouts)</label>
                    <input type="text" name="bankDetails" value={formData.bankDetails} onChange={handleChange} onBlur={handleBlur} placeholder="BSB: 000-000, ACC: 12345678" maxLength={120} className={showFieldError('bankDetails') ? 'input-error' : ''} />
                    {renderFieldError('bankDetails')}
                  </div>
                  <div className="form-group full-width">
                    <label>ABN (If applicable)</label>
                    <input type="text" name="abn" value={formData.abn} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. 12 345 678 901" pattern={ABN_REGEX.source} className={showFieldError('abn') ? 'input-error' : ''} />
                    {renderFieldError('abn')}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Portfolio & Agreement */}
            {currentStep === 4 && (
              <div className="step-content fade-in">
                <h3 className="reg-section-title">Reviews & Portfolio</h3>
                <div className="form-grid mb-5">
                  <div className="form-group">
                    <label>Years of Experience</label>
                    <input type="number" name="yearsExperience" value={formData.yearsExperience} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. 5" min="0" max="80" className={showFieldError('yearsExperience') ? 'input-error' : ''} />
                    {renderFieldError('yearsExperience')}
                  </div>
                  <div className="form-group">
                    <label>Approx. Students Taught</label>
                    <input type="number" name="studentsTaught" value={formData.studentsTaught} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. 150" min="0" max="100000" className={showFieldError('studentsTaught') ? 'input-error' : ''} />
                    {renderFieldError('studentsTaught')}
                  </div>
                  <div className="form-group full-width">
                    <label>Social Media Links (Facebook, Instagram)</label>
                    <input type="text" name="socialLinks" value={formData.socialLinks} onChange={handleChange} onBlur={handleBlur} placeholder="https://instagram.com/yourprofile" className={showFieldError('socialLinks') ? 'input-error' : ''} />
                    {renderFieldError('socialLinks')}
                  </div>
                  <div className="form-group full-width">
                    <label>Past Testimonials / Reviews (Paste text or links)</label>
                    <textarea name="testimonials" rows="3" value={formData.testimonials} onChange={handleChange} onBlur={handleBlur} maxLength={1000} className={showFieldError('testimonials') ? 'input-error' : ''}></textarea>
                    {renderFieldError('testimonials')}
                  </div>
                </div>

                <h3 className="reg-section-title">Platform Agreement</h3>
                <div className="form-group full-width" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <div className="checkbox-item mb-3">
                    <input type="checkbox" id="agreeCommission" name="agreeCommission" checked={formData.agreeCommission} onChange={handleChange} onBlur={handleBlur} required className={showFieldError('agreeCommission') ? 'input-error' : ''} />
                    <label htmlFor="agreeCommission"><strong>I agree to the 20% Platform Commission fee on all bookings generated through SANOS (waived for the first 3 months).</strong></label>
                  </div>
                  {renderFieldError('agreeCommission')}
                  <div className="checkbox-item mb-3">
                    <input type="checkbox" id="agreeTerms" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} onBlur={handleBlur} required className={showFieldError('agreeTerms') ? 'input-error' : ''} />
                    <label htmlFor="agreeTerms">I agree to the Instructor Terms & Conditions.</label>
                  </div>
                  {renderFieldError('agreeTerms')}
                  <div className="checkbox-item">
                    <input type="checkbox" id="agreeCancellation" name="agreeCancellation" checked={formData.agreeCancellation} onChange={handleChange} onBlur={handleBlur} required className={showFieldError('agreeCancellation') ? 'input-error' : ''} />
                    <label htmlFor="agreeCancellation">I accept the standard Cancellation Policy (24-hour notice).</label>
                  </div>
                  {renderFieldError('agreeCancellation')}
                </div>
              </div>
            )}

            {/* Navigation Actions */}
            <div className="form-actions">
              {currentStep > 0 ? (
                <button type="button" className="btn-secondary flex items-center gap-2" onClick={prevStep}>
                  <ArrowLeft size={18} /> Back
                </button>
              ) : (
                <div></div> // Spacer
              )}

              {currentStep < STEPS.length - 1 ? (
                <button type="submit" className="btn btn-primary flex items-center gap-2">
                  Next Step <ArrowRight size={18} />
                </button>
              ) : (
                <button type="submit" className="btn btn-primary flex items-center gap-2" disabled={loading}>
                  {loading ? 'Submitting...' : 'Complete Registration'} <Check size={18} />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InstructorRegistration;
