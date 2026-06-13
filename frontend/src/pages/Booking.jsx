import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, CreditCard, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import './Booking.css';

const Booking = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // Mock State
  const [bookingData, setBookingData] = useState({
    type: '',
    package: '',
    date: '',
    time: '',
  });

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep(5); // Success step
  };

  return (
    <div className="booking-page bg-light section">
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {step < 5 && (
          <div className="wizard-progress">
            <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>1. Type</div>
            <div className="step-line"></div>
            <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>2. Package</div>
            <div className="step-line"></div>
            <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>3. Schedule</div>
            <div className="step-line"></div>
            <div className={`step-indicator ${step >= 4 ? 'active' : ''}`}>4. Review</div>
          </div>
        )}

        <div className="wizard-card">
          {step === 1 && (
            <div className="wizard-step fade-in">
              <h2 className="h2 text-center mb-4">What type of lesson do you need?</h2>
              <div className="selection-grid">
                <div 
                  className={`selection-card ${bookingData.type === 'learner' ? 'selected' : ''}`}
                  onClick={() => setBookingData({...bookingData, type: 'learner'})}
                >
                  <h3 className="h4">Learner Driver</h3>
                  <p className="text-muted text-sm">First-time drivers getting their P's</p>
                </div>
                <div 
                  className={`selection-card ${bookingData.type === 'overseas' ? 'selected' : ''}`}
                  onClick={() => setBookingData({...bookingData, type: 'overseas'})}
                >
                  <h3 className="h4">Overseas Transfer</h3>
                  <p className="text-muted text-sm">Converting an international licence</p>
                </div>
                <div 
                  className={`selection-card ${bookingData.type === 'test' ? 'selected' : ''}`}
                  onClick={() => setBookingData({...bookingData, type: 'test'})}
                >
                  <h3 className="h4">Test Preparation</h3>
                  <p className="text-muted text-sm">VORT or CBT&A test day focus</p>
                </div>
              </div>
              <div className="wizard-actions">
                <div></div>
                <button 
                  className="btn btn-primary" 
                  onClick={handleNext} 
                  disabled={!bookingData.type}
                >
                  Next <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="wizard-step fade-in">
              <h2 className="h2 text-center mb-4">Select a Package</h2>
              <div className="selection-grid-col">
                <div 
                  className={`selection-card-row ${bookingData.package === 'single' ? 'selected' : ''}`}
                  onClick={() => setBookingData({...bookingData, package: 'single'})}
                >
                  <div>
                    <h3 className="h4">Single Lesson (1.5 Hour)</h3>
                    <p className="text-muted text-sm">Standard practice session</p>
                  </div>
                  <div className="price-tag">$160</div>
                </div>
                <div 
                  className={`selection-card-row ${bookingData.package === 'bulk10' ? 'selected' : ''}`}
                  onClick={() => setBookingData({...bookingData, package: 'bulk10'})}
                >
                  <div>
                    <h3 className="h4">10 Lesson Package</h3>
                    <p className="text-muted text-sm">Save $300</p>
                  </div>
                  <div className="price-tag">$1050</div>
                </div>
                {bookingData.type === 'learner' && (
                  <div 
                    className={`selection-card-row ${bookingData.package === 'complete' ? 'selected' : ''}`}
                    onClick={() => setBookingData({...bookingData, package: 'complete'})}
                  >
                    <div>
                      <h3 className="h4">Complete Learner Package</h3>
                      <p className="text-muted text-sm">25 classes + 2 tests included</p>
                    </div>
                    <div className="price-tag">$3500</div>
                  </div>
                )}
              </div>
              <div className="wizard-actions">
                <button className="btn btn-outline" onClick={handlePrev}><ChevronLeft size={20} /> Back</button>
                <button className="btn btn-primary" onClick={handleNext} disabled={!bookingData.package}>
                  Next <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="wizard-step fade-in">
              <h2 className="h2 text-center mb-4">Choose Date & Time</h2>
              <div className="schedule-layout">
                <div className="form-group">
                  <label><Calendar size={18} style={{marginRight: '8px', verticalAlign: 'text-bottom'}}/>Select Date</label>
                  <input 
                    type="date" 
                    value={bookingData.date}
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                  />
                </div>
                {bookingData.date && (
                  <div className="form-group">
                    <label><Clock size={18} style={{marginRight: '8px', verticalAlign: 'text-bottom'}}/>Available Times</label>
                    <div className="time-slots">
                      {['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'].map(time => (
                        <div 
                          key={time}
                          className={`time-slot ${bookingData.time === time ? 'selected' : ''}`}
                          onClick={() => setBookingData({...bookingData, time})}
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="wizard-actions">
                <button className="btn btn-outline" onClick={handlePrev}><ChevronLeft size={20} /> Back</button>
                <button className="btn btn-primary" onClick={handleNext} disabled={!bookingData.date || !bookingData.time}>
                  Review <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="wizard-step fade-in">
              <h2 className="h2 text-center mb-4">Review Your Booking</h2>
              
              <div className="summary-box">
                <div className="summary-row">
                  <span className="text-muted">Type:</span>
                  <strong style={{textTransform: 'capitalize'}}>{bookingData.type}</strong>
                </div>
                <div className="summary-row">
                  <span className="text-muted">Package:</span>
                  <strong style={{textTransform: 'capitalize'}}>{bookingData.package}</strong>
                </div>
                <div className="summary-row">
                  <span className="text-muted">Date:</span>
                  <strong>{bookingData.date}</strong>
                </div>
                <div className="summary-row">
                  <span className="text-muted">Time:</span>
                  <strong>{bookingData.time}</strong>
                </div>
                <div className="summary-total">
                  <span>Total Due Today:</span>
                  <span className="amount">
                    {bookingData.package === 'single' ? '$160' : bookingData.package === 'bulk10' ? '$1050' : '$3500'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{marginTop: '2rem'}}>
                  <label><CreditCard size={18} style={{marginRight: '8px', verticalAlign: 'text-bottom'}}/> Payment Details (Mock)</label>
                  <input type="text" placeholder="Card Number" className="mb-2" />
                  <div style={{display: 'flex', gap: '1rem'}}>
                    <input type="text" placeholder="MM/YY" />
                    <input type="text" placeholder="CVC" />
                  </div>
                </div>

                <div className="wizard-actions">
                  <button type="button" className="btn btn-outline" onClick={handlePrev}><ChevronLeft size={20} /> Back</button>
                  <button type="submit" className="btn btn-primary">Confirm & Pay</button>
                </div>
              </form>
            </div>
          )}

          {step === 5 && (
            <div className="wizard-step fade-in text-center py-5">
              <CheckCircle size={64} className="icon-success mx-auto mb-4" style={{margin: '0 auto'}} />
              <h2 className="h2 mb-3">Booking Confirmed!</h2>
              <p className="text-muted mb-4">Your lesson has been successfully booked. We've sent a confirmation email to you.</p>
              <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
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
