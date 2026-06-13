import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, CreditCard, CheckCircle, ChevronRight, ChevronLeft, AlertCircle, Loader, Car } from 'lucide-react';
import { packagesApi, availabilityApi, bookingsApi, vehicleTypesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Booking.css';

const Booking = () => {
  const [step, setStep] = useState(1);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [packages, setPackages] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [bookingData, setBookingData] = useState({
    vehicleType: '',
    packageId: '',
    packageName: '',
    packagePrice: 0,
    date: '',
    time: '',
    pickupAddress: '',
    notes: '',
  });

  // Fetch packages & vehicle types on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pkgRes, vtRes] = await Promise.all([
          packagesApi.list().catch(() => ({ packages: [] })),
          vehicleTypesApi.list().catch(() => ({ vehicleTypes: [] })),
        ]);
        setPackages(pkgRes.packages || pkgRes || []);
        setVehicleTypes(vtRes.vehicleTypes || vtRes || []);
      } catch {
        // Use fallback data if API is not running
        setPackages([
          { id: '1', code: 'single', name: 'Single Lesson (1.5 Hour)', description: 'Standard practice session', price: 160 },
          { id: '2', code: 'bulk10', name: '10 Lesson Package', description: 'Save $300', price: 1050 },
          { id: '3', code: 'complete', name: 'Complete Learner Package', description: '25 classes + 2 tests included', price: 3500 },
        ]);
        setVehicleTypes([
          { id: '1', code: 'auto', name: 'Automatic' },
          { id: '2', code: 'manual', name: 'Manual' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch availability when date changes
  useEffect(() => {
    if (!bookingData.date) return;
    const fetchSlots = async () => {
      try {
        const res = await availabilityApi.get(`date=${bookingData.date}&vehicleType=${bookingData.vehicleType}`);
        setTimeSlots(res.slots || res.availability || []);
      } catch {
        setTimeSlots(['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']);
      }
    };
    fetchSlots();
  }, [bookingData.date, bookingData.vehicleType]);

  const handleNext = () => { setError(''); setStep(step + 1); };
  const handlePrev = () => { setError(''); setStep(step - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await bookingsApi.create({
        packageId: bookingData.packageId || undefined,
        vehicleType: bookingData.vehicleType,
        preferredDate: bookingData.date,
        preferredTime: bookingData.time,
        pickupAddress: bookingData.pickupAddress || undefined,
        notes: bookingData.notes || undefined,
      });
      setStep(5);
    } catch (err) {
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPackage = packages.find(p => p.id === bookingData.packageId || p.code === bookingData.packageId);

  if (loading) {
    return (
      <div className="booking-page bg-light section text-center" style={{ padding: '6rem 0' }}>
        <Loader size={32} className="spin-icon icon-blue" />
        <p className="text-muted" style={{ marginTop: '1rem' }}>Loading booking options...</p>
      </div>
    );
  }

  return (
    <div className="booking-page bg-light section">
      <div className="container" style={{ maxWidth: '800px' }}>

        {step < 5 && (
          <div className="wizard-progress">
            <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>1. Vehicle</div>
            <div className="step-line"></div>
            <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>2. Package</div>
            <div className="step-line"></div>
            <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>3. Schedule</div>
            <div className="step-line"></div>
            <div className={`step-indicator ${step >= 4 ? 'active' : ''}`}>4. Review</div>
          </div>
        )}

        {error && (
          <div className="booking-error" style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '0.75rem', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#DC2626' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="wizard-card">
          {/* Step 1: Vehicle Type */}
          {step === 1 && (
            <div className="wizard-step fade-in">
              <h2 className="h2 text-center mb-4">Select your vehicle type</h2>
              <div className="selection-grid">
                {vehicleTypes.map(vt => (
                  <div
                    key={vt.id || vt.code}
                    className={`selection-card ${bookingData.vehicleType === (vt.code || vt.id) ? 'selected' : ''}`}
                    onClick={() => setBookingData({ ...bookingData, vehicleType: vt.code || vt.id })}
                  >
                    <Car size={28} style={{ marginBottom: '0.5rem' }} />
                    <h3 className="h4">{vt.name}</h3>
                    {vt.description && <p className="text-muted text-sm">{vt.description}</p>}
                  </div>
                ))}
              </div>
              <div className="wizard-actions">
                <div></div>
                <button className="btn btn-primary" onClick={handleNext} disabled={!bookingData.vehicleType}>
                  Next <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Package */}
          {step === 2 && (
            <div className="wizard-step fade-in">
              <h2 className="h2 text-center mb-4">Select a Package</h2>
              <div className="selection-grid-col">
                {packages.map(pkg => (
                  <div
                    key={pkg.id || pkg.code}
                    className={`selection-card-row ${bookingData.packageId === (pkg.id || pkg.code) ? 'selected' : ''}`}
                    onClick={() => setBookingData({
                      ...bookingData,
                      packageId: pkg.id || pkg.code,
                      packageName: pkg.name,
                      packagePrice: pkg.price || pkg.priceAud || 0,
                    })}
                  >
                    <div>
                      <h3 className="h4">{pkg.name}</h3>
                      <p className="text-muted text-sm">{pkg.description}</p>
                    </div>
                    <div className="price-tag">${pkg.price || pkg.priceAud || 0}</div>
                  </div>
                ))}
              </div>
              <div className="wizard-actions">
                <button className="btn btn-outline" onClick={handlePrev}><ChevronLeft size={20} /> Back</button>
                <button className="btn btn-primary" onClick={handleNext} disabled={!bookingData.packageId}>
                  Next <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Schedule */}
          {step === 3 && (
            <div className="wizard-step fade-in">
              <h2 className="h2 text-center mb-4">Choose Date & Time</h2>
              <div className="schedule-layout">
                <div className="form-group">
                  <label><Calendar size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />Select Date</label>
                  <input
                    type="date"
                    value={bookingData.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value, time: '' })}
                  />
                </div>
                {bookingData.date && (
                  <div className="form-group">
                    <label><Clock size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />Available Times</label>
                    <div className="time-slots">
                      {(Array.isArray(timeSlots) && timeSlots.length > 0 ? timeSlots : ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']).map(time => {
                        const label = typeof time === 'string' ? time : time.time || time.label;
                        return (
                          <div
                            key={label}
                            className={`time-slot ${bookingData.time === label ? 'selected' : ''}`}
                            onClick={() => setBookingData({ ...bookingData, time: label })}
                          >
                            {label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="form-group">
                  <label>Pickup Address <span className="text-muted text-sm">(optional)</span></label>
                  <input
                    type="text"
                    placeholder="e.g. 123 Main St, Mawson Lakes"
                    value={bookingData.pickupAddress}
                    onChange={(e) => setBookingData({ ...bookingData, pickupAddress: e.target.value })}
                  />
                </div>
              </div>
              <div className="wizard-actions">
                <button className="btn btn-outline" onClick={handlePrev}><ChevronLeft size={20} /> Back</button>
                <button className="btn btn-primary" onClick={handleNext} disabled={!bookingData.date || !bookingData.time}>
                  Review <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="wizard-step fade-in">
              <h2 className="h2 text-center mb-4">Review Your Booking</h2>

              <div className="summary-box">
                <div className="summary-row">
                  <span className="text-muted">Vehicle Type:</span>
                  <strong style={{ textTransform: 'capitalize' }}>{bookingData.vehicleType}</strong>
                </div>
                <div className="summary-row">
                  <span className="text-muted">Package:</span>
                  <strong>{bookingData.packageName}</strong>
                </div>
                <div className="summary-row">
                  <span className="text-muted">Date:</span>
                  <strong>{bookingData.date}</strong>
                </div>
                <div className="summary-row">
                  <span className="text-muted">Time:</span>
                  <strong>{bookingData.time}</strong>
                </div>
                {bookingData.pickupAddress && (
                  <div className="summary-row">
                    <span className="text-muted">Pickup:</span>
                    <strong>{bookingData.pickupAddress}</strong>
                  </div>
                )}
                <div className="summary-total">
                  <span>Total Due Today:</span>
                  <span className="amount">${bookingData.packagePrice}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginTop: '2rem' }}>
                  <label>Additional Notes <span className="text-muted text-sm">(optional)</span></label>
                  <textarea
                    rows="3"
                    placeholder="Any special requirements or notes for your instructor?"
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  />
                </div>

                <div className="wizard-actions">
                  <button type="button" className="btn btn-outline" onClick={handlePrev}><ChevronLeft size={20} /> Back</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? <><Loader size={18} className="spin-icon" /> Booking...</> : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <div className="wizard-step fade-in text-center py-5">
              <CheckCircle size={64} className="icon-success mx-auto mb-4" style={{ margin: '0 auto' }} />
              <h2 className="h2 mb-3">Booking Confirmed!</h2>
              <p className="text-muted mb-4">Your lesson has been successfully booked. We've sent a confirmation email to you.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link to="/" className="btn btn-outline">Back to Home</Link>
                <Link to="/learner-dashboard" className="btn btn-primary">Go to Dashboard</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;
