import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { contactApi } from '../services/api';
import { toast } from 'react-hot-toast';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await contactApi.submit({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        message: formData.message,
      });
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <section className="section bg-light">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '4rem' }}>
            <h1 className="h1">Contact Us</h1>
            <p className="text-lg text-muted">We're here to help you get on the road safely.</p>
          </div>

          <div className="contact-grid">
            <div className="contact-info">
              <div className="info-card">
                <div className="icon-wrapper"><Phone size={24} /></div>
                <div>
                  <h3 className="h4">Phone</h3>
                  <p className="text-muted">1300 000 000</p>
                  <p className="text-sm text-muted">Mon-Fri from 8am to 6pm.</p>
                </div>
              </div>
              <div className="info-card">
                <div className="icon-wrapper"><Mail size={24} /></div>
                <div>
                  <h3 className="h4">Email</h3>
                  <p className="text-muted">info@sanosdriving.com.au</p>
                  <p className="text-sm text-muted">We aim to reply within 24 hours.</p>
                </div>
              </div>
              <div className="info-card">
                <div className="icon-wrapper"><MapPin size={24} /></div>
                <div>
                  <h3 className="h4">Service Area</h3>
                  <p className="text-muted">Adelaide & Surrounding Suburbs</p>
                  <p className="text-sm text-muted">South Australia</p>
                </div>
              </div>
              <div className="info-card">
                <div className="icon-wrapper"><Clock size={24} /></div>
                <div>
                  <h3 className="h4">Operating Hours</h3>
                  <p className="text-muted">7 Days a Week</p>
                  <p className="text-sm text-muted">Flexible lesson times available.</p>
                </div>
              </div>
            </div>

            <div className="contact-form-wrapper">
              <h2 className="h3" style={{ marginBottom: '1.5rem' }}>Send us a message</h2>

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input type="text" id="name" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input type="email" id="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input type="tel" id="phone" name="phone" placeholder="0400 000 000" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" name="message" rows="4" placeholder="How can we help you?" value={formData.message} onChange={handleChange} required></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? <><Loader size={18} className="spin-icon" /> Sending...</> : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="map-section">
        <div className="map-image-wrapper">
          <img src="/adelaide_map.png" alt="Aerial view of Adelaide service area" className="map-image" />
          <div className="map-overlay">
            <div className="map-pin-marker">
              <MapPin size={32} />
            </div>
            <h3 className="h4">Adelaide, South Australia</h3>
            <p className="text-sm">Serving Adelaide & surrounding suburbs</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
