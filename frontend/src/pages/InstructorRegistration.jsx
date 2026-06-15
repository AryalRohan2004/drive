import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Upload, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './InstructorRegistration.css';

const STEPS = [
  'Personal Info',
  'Qualifications & Services',
  'Location & Vehicle',
  'Pricing & Payment',
  'Portfolio & Agreement'
];

const InstructorRegistration = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

  const nextStep = () => {
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
    setLoading(true);
    try {
      // In the real app, we pass the massive object to the backend endpoint
      // We will spread the formData into the register function
      await register({
        ...formData,
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
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Mobile Number *</label>
                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Password (for your account) *</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6}/>
                  </div>
                  <div className="form-group full-width">
                    <label>Languages Spoken (e.g. English, Nepali, Hindi)</label>
                    <input type="text" name="languages" value={formData.languages} onChange={handleChange} placeholder="English, Nepali" />
                  </div>
                  <div className="form-group full-width">
                    <label>Instructor Bio / About Me</label>
                    <textarea name="bio" rows="4" value={formData.bio} onChange={handleChange} placeholder="Tell students a bit about your teaching style and background..."></textarea>
                  </div>
                  <div className="form-group full-width">
                    <label>Profile Photo</label>
                    <div className="file-upload-box">
                      <label htmlFor="profilePhoto" style={{ cursor: 'pointer', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Upload size={32} className="text-muted mb-2" />
                        <span>Click to upload your profile photo</span>
                        <input type="file" id="profilePhoto" name="profilePhoto" accept="image/*" />
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
                    <input type="text" name="accreditationNo" value={formData.accreditationNo} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Driver's Licence Number *</label>
                    <input type="text" name="licenseNo" value={formData.licenseNo} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Licence Expiry Date *</label>
                    <input type="date" name="licenseExpiry" value={formData.licenseExpiry} onChange={handleChange} required />
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
                    <input type="text" name="suburbsCovered" value={formData.suburbsCovered} onChange={handleChange} placeholder="e.g. Mawson Lakes, Salisbury, Prospect..." />
                  </div>
                  <div className="form-group">
                    <label>Available Days</label>
                    <input type="text" name="daysAvailable" value={formData.daysAvailable} onChange={handleChange} placeholder="e.g. Mon-Fri, Weekends" />
                  </div>
                  <div className="form-group">
                    <label>Available Times</label>
                    <input type="text" name="timesAvailable" value={formData.timesAvailable} onChange={handleChange} placeholder="e.g. 8AM - 6PM" />
                  </div>
                  <div className="form-group full-width">
                    <label>Pickup Locations Accepted</label>
                    <input type="text" name="pickupLocations" value={formData.pickupLocations} onChange={handleChange} placeholder="Home, School, Work, Uni, etc." />
                  </div>
                </div>

                <h3 className="reg-section-title">Vehicle Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Vehicle Make & Model</label>
                    <input type="text" name="vehicleMakeModel" value={formData.vehicleMakeModel} onChange={handleChange} placeholder="e.g. 2022 Toyota Yaris" />
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
                        <Upload size={32} className="text-muted mb-2" />
                        <span>Click to upload a photo of your vehicle</span>
                        <input type="file" id="vehiclePhoto" name="vehiclePhoto" accept="image/*" />
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
                    <input type="number" name="price1Hr" value={formData.price1Hr} onChange={handleChange} placeholder="e.g. 75" />
                  </div>
                  <div className="form-group">
                    <label>2-Hour Lesson Price ($)</label>
                    <input type="number" name="price2Hr" value={formData.price2Hr} onChange={handleChange} placeholder="e.g. 140" />
                  </div>
                  <div className="form-group">
                    <label>Test Day Package Price ($)</label>
                    <input type="number" name="priceTestPackage" value={formData.priceTestPackage} onChange={handleChange} placeholder="e.g. 180" />
                  </div>
                  <div className="form-group">
                    <label>Any Special Packages Details</label>
                    <input type="text" name="specialPackages" value={formData.specialPackages} onChange={handleChange} placeholder="e.g. 5 lessons for $350" />
                  </div>
                </div>

                <h3 className="reg-section-title">Payment Information</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Bank Account Details (For Payouts)</label>
                    <input type="text" name="bankDetails" value={formData.bankDetails} onChange={handleChange} placeholder="BSB: 000-000, ACC: 12345678" />
                  </div>
                  <div className="form-group full-width">
                    <label>ABN (If applicable)</label>
                    <input type="text" name="abn" value={formData.abn} onChange={handleChange} placeholder="e.g. 12 345 678 901" />
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
                    <input type="number" name="yearsExperience" value={formData.yearsExperience} onChange={handleChange} placeholder="e.g. 5" />
                  </div>
                  <div className="form-group">
                    <label>Approx. Students Taught</label>
                    <input type="number" name="studentsTaught" value={formData.studentsTaught} onChange={handleChange} placeholder="e.g. 150" />
                  </div>
                  <div className="form-group full-width">
                    <label>Social Media Links (Facebook, Instagram)</label>
                    <input type="text" name="socialLinks" value={formData.socialLinks} onChange={handleChange} placeholder="https://instagram.com/yourprofile" />
                  </div>
                  <div className="form-group full-width">
                    <label>Past Testimonials / Reviews (Paste text or links)</label>
                    <textarea name="testimonials" rows="3" value={formData.testimonials} onChange={handleChange}></textarea>
                  </div>
                </div>

                <h3 className="reg-section-title">Platform Agreement</h3>
                <div className="form-group full-width" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <div className="checkbox-item mb-3">
                    <input type="checkbox" id="agreeCommission" name="agreeCommission" checked={formData.agreeCommission} onChange={handleChange} required />
                    <label htmlFor="agreeCommission"><strong>I agree to the 20% Platform Commission fee on all bookings generated through SANOS.</strong></label>
                  </div>
                  <div className="checkbox-item mb-3">
                    <input type="checkbox" id="agreeTerms" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} required />
                    <label htmlFor="agreeTerms">I agree to the Instructor Terms & Conditions.</label>
                  </div>
                  <div className="checkbox-item">
                    <input type="checkbox" id="agreeCancellation" name="agreeCancellation" checked={formData.agreeCancellation} onChange={handleChange} required />
                    <label htmlFor="agreeCancellation">I accept the standard Cancellation Policy (24-hour notice).</label>
                  </div>
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
