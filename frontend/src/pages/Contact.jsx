import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import './Contact.css';

const Contact = () => {
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
              <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input type="text" id="name" placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input type="email" id="email" placeholder="john@example.com" />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input type="tel" id="phone" placeholder="0400 000 000" />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" rows="4" placeholder="How can we help you?"></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-100">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section - Filled with aerial image of Adelaide */}
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
