import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, ChevronRight, ChevronLeft, Loader, Car, User, Lock } from 'lucide-react';
import { packagesApi, availabilityApi, bookingsApi, vehicleTypesApi, instructorsApi, paymentsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import './Booking.css';


const Booking = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [packages, setPackages] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [bookingData, setBookingData] = useState({
    vehicleType: '',
    packageId: '',
    packageName: '',
    packagePrice: 0,
    instructorId: '',
    instructorName: '',
    date: '',
    time: '',
    pickupAddress: '',
    notes: '',
    createdBookingId: null,
  });

  // Fetch packages, vehicle types & active instructors on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pkgRes, vtRes, instRes] = await Promise.all([
          packagesApi.list().catch(() => ({ packages: [] })),
          vehicleTypesApi.list().catch(() => ({ vehicleTypes: [] })),
          instructorsApi.list().catch(() => ({ instructors: [] })),
        ]);
        setPackages(pkgRes.packages || pkgRes || []);
        setVehicleTypes(vtRes.vehicleTypes || vtRes || []);
        setInstructors(instRes.instructors || []);
      } catch {
        // Fallback data if API is completely down
        setPackages([
          { id: '1', code: 'single', name: 'Single Lesson (1.5 Hour)', description: 'Standard practice session', price: 160 },
          { id: '2', code: 'bulk10', name: '10 Lesson Package', description: 'Save $300', price: 1050 },
          { id: '3', code: 'complete', name: 'Complete Learner Package', description: '25 classes + 2 tests included', price: 3500 },
        ]);
        setVehicleTypes([
          { id: '1', code: 'auto', name: 'Automatic' },
          { id: '2', code: 'manual', name: 'Manual' },
        ]);
        setInstructors([]);
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
        const res = await availabilityApi.get(`date=${bookingData.date}&vehicleType=${bookingData.vehicleType}&instructorId=${bookingData.instructorId}`);
        setTimeSlots(res.slots || res.availability || []);
      } catch {
        setTimeSlots([]);
        toast.error('Unable to load live availability right now.');
      }
    };
    fetchSlots();
  }, [bookingData.date, bookingData.vehicleType, bookingData.instructorId]);

  const handleNext = () => { setStep(step + 1); };
  const handlePrev = () => { setStep(step - 1); };

  // Detect Stripe redirect back
  useEffect(() => {
    const payment = searchParams.get('payment');
    const bookingId = searchParams.get('bookingId');
    if (payment === 'success' && bookingId) {
      window.setTimeout(() => {
        setBookingData(prev => ({ ...prev, createdBookingId: bookingId }));
        setStep(6);
      }, 0);
    } else if (payment === 'cancelled') {
      toast('Payment cancelled. Your booking is saved — try again when ready.', { icon: '⚠️' });
      window.setTimeout(() => setStep(5), 0);
      // Clean up URL params
      navigate('/book', { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in or create an account to confirm your booking.');
      navigate('/login', { state: { from: { pathname: '/book' } } });
      return;
    }

    setSubmitting(true);

    try {
      // Step 1: Create the booking (status=pending, payment_status=unpaid)
      let booking;
      if (bookingData.createdBookingId) {
        // Already created (e.g. returned from cancelled payment)
        booking = { id: bookingData.createdBookingId };
      } else {
        const res = await bookingsApi.create({
          bookingType: 'learner',
          vehicleType: bookingData.vehicleType,
          packageId: bookingData.packageId,
          instructorId: bookingData.instructorId !== 'any' ? bookingData.instructorId : undefined,
          lessonDate: bookingData.date,
          lessonTime: bookingData.time,
          pickupAddress: bookingData.pickupAddress || undefined,
          notes: bookingData.notes || undefined,
        });
        booking = res.booking;
        setBookingData(prev => ({ ...prev, createdBookingId: booking.id }));
      }

      // Step 2: Create Stripe Checkout Session → redirect
      const { url } = await paymentsApi.createCheckoutSession({ bookingId: booking.id });

      if (!url) {
        throw new Error('No payment URL returned from server');
      }

      // Redirect to Stripe-hosted checkout
      window.location.href = url;

    } catch (err) {
      toast.error(err.message || 'Failed to initiate payment. Please try again.');
      setSubmitting(false);
    }
  };

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

        {step < 6 && (
          <div className="wizard-progress">
            <div className={`step-indicator ${step >= 1 ? 'active' : ''} ${step === 1 ? 'current' : ''}`}>1. Vehicle</div>
            <div className="step-line"></div>
            <div className={`step-indicator ${step >= 2 ? 'active' : ''} ${step === 2 ? 'current' : ''}`}>2. Package</div>
            <div className="step-line"></div>
            <div className={`step-indicator ${step >= 3 ? 'active' : ''} ${step === 3 ? 'current' : ''}`}>3. Instructor</div>
            <div className="step-line"></div>
            <div className={`step-indicator ${step >= 4 ? 'active' : ''} ${step === 4 ? 'current' : ''}`}>4. Schedule</div>
            <div className="step-line"></div>
            <div className={`step-indicator ${step >= 5 ? 'active' : ''} ${step === 5 ? 'current' : ''}`}>5. Review</div>
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

          {/* Step 3: Instructor */}
          {step === 3 && (
            <div className="wizard-step fade-in">
              <h2 className="h2 text-center mb-4">Select an Instructor</h2>
              <div className="selection-grid">
                {instructors.length > 0 ? instructors.map(instructor => (
                  <div
                    key={instructor.id}
                    className={`selection-card ${bookingData.instructorId === instructor.id ? 'selected' : ''}`}
                    onClick={() => setBookingData({
                      ...bookingData,
                      instructorId: instructor.id,
                      instructorName: instructor.name || `${instructor.firstName} ${instructor.lastName}`.trim() || 'Nearest Instructor',
                    })}
                  >
                    <User size={28} style={{ marginBottom: '0.5rem' }} />
                    <h3 className="h4">{instructor.name || `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || 'Nearest Instructor'}</h3>
                    <p className="text-muted text-sm" style={{ marginBottom: 0 }}>{instructor.subtitle || 'Nearest available instructor'}</p>
                    {instructor.distance && <p className="text-muted text-sm" style={{ marginBottom: 0 }}>{instructor.distance}</p>}
                    {instructor.email && <p className="text-muted text-sm">{instructor.email}</p>}
                  </div>
                )) : (
                  <p className="text-center text-muted" style={{ gridColumn: '1 / -1' }}>No instructors available for the selected vehicle type at the moment. You can skip this step or choose any available if skipping is allowed.</p>
                )}
                {/* Option to skip instructor selection (assign any) */}
                <div
                  className={`selection-card ${bookingData.instructorId === 'any' ? 'selected' : ''}`}
                  onClick={() => setBookingData({ ...bookingData, instructorId: 'any', instructorName: 'Any Available Instructor' })}
                >
                  <User size={28} style={{ marginBottom: '0.5rem' }} />
                  <h3 className="h4">Any Instructor</h3>
                  <p className="text-muted text-sm">We will assign the best instructor for you</p>
                </div>
              </div>
              <div className="wizard-actions">
                <button className="btn btn-outline" onClick={handlePrev}><ChevronLeft size={20} /> Back</button>
                <button className="btn btn-primary" onClick={handleNext} disabled={!bookingData.instructorId}>
                  Next <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Schedule */}
          {step === 4 && (
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
                    {Array.isArray(timeSlots) && timeSlots.length > 0 ? (
                      <div className="time-slots">
                        {timeSlots.map(time => {
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
                    ) : (
                      <div className="find-state-panel" style={{ marginTop: '0.75rem', padding: '1.25rem' }}>
                        <Clock size={28} className="icon-blue" style={{ marginBottom: '0.5rem' }} />
                        <p style={{ margin: 0 }}>No time slots available for this instructor on the selected date.</p>
                      </div>
                    )}
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

          {/* Step 5: Review */}
          {step === 5 && (
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
                  <span className="text-muted">Instructor:</span>
                  <strong>{bookingData.instructorName || 'Any Instructor'}</strong>
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
                  <button type="submit" className="btn btn-primary" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {submitting ? (
                      <><Loader size={18} className="spin-icon" /> Redirecting to payment...</>
                    ) : (
                      <><Lock size={16} /> Pay & Confirm Booking</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 6: Success */}
          {step === 6 && (
            <div className="wizard-step fade-in text-center py-5">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 30px rgba(34,197,94,0.35)'
                }}>
                  <CheckCircle size={44} color="white" strokeWidth={2.5} />
                </div>
              </div>
              <h2 className="h2 mb-3" style={{ color: '#15803d' }}>Payment Successful!</h2>
              <p className="text-muted mb-4" style={{ maxWidth: '460px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
                Your booking is <strong>confirmed</strong> and payment has been received.
                A confirmation email has been sent to you — see you at your lesson!
              </p>
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
