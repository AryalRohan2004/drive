import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import './Hub.css';

const AccordionItem = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`accordion-item ${isOpen ? 'open' : ''}`}>
      <button className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <span className="h4">{title}</span>
        {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </button>
      {isOpen && <div className="accordion-content">{children}</div>}
    </div>
  );
};

const Hub = () => {
  return (
    <div className="hub-page">
      <section className="section bg-primary text-white text-center" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
        <div className="container">
          <BookOpen size={48} className="mb-3 mx-auto" style={{ margin: '0 auto', opacity: 0.8 }} />
          <h1 className="h1 text-white">Licensing Information Hub</h1>
          <p className="text-lg" style={{ maxWidth: '700px', margin: '0 auto', marginTop: '1.5rem', opacity: 0.9 }}>
            Everything you need to know about getting your driver's licence in South Australia. From the L's to your full licence.
          </p>
        </div>
      </section>

      <section className="section bg-light">
        <div className="container" style={{ maxWidth: '800px' }}>
          <AccordionItem title="Step 1: Getting your Learner's Permit (L's)" defaultOpen={true}>
            <p>To get your learner's permit in South Australia, you must be at least 16 years old.</p>
            <ul className="info-list">
              <li><strong>Pass the Theory Test:</strong> Study the Driver's Handbook and pass the theory test at a Service SA center.</li>
              <li><strong>Provide ID:</strong> Bring full evidence of your identity and proof of address.</li>
              <li><strong>Medical Fitness:</strong> Declare any medical conditions that may affect your driving.</li>
              <li><strong>Pay the Fee:</strong> Pay the permit fee at Service SA.</li>
            </ul>
            <div className="alert-box">
              <AlertTriangle size={20} />
              <span>You must hold your L's for at least 12 months (or 6 months if aged 25 or over) before taking a driving test.</span>
            </div>
          </AccordionItem>

          <AccordionItem title="Step 2: Hazard Perception Test (HPT)">
            <p>The HPT is a computer-based test that measures your ability to recognize and respond to dangerous driving situations.</p>
            <ul className="info-list">
              <li>You can take the HPT at any time while holding your learner's permit.</li>
              <li>You must pass the HPT before you can take a practical driving test.</li>
              <li>Practice tests are available on the MyLicence website.</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="Step 3: Getting your Provisional Licence (P1 & P2)">
            <p>To move from L's to a P1 licence, you must:</p>
            <ul className="info-list">
              <li>Complete 75 hours of supervised driving, including 15 hours at night (recorded in your logbook).</li>
              <li>Pass the Hazard Perception Test.</li>
              <li>Pass a practical driving test (VORT) or CBT&A course.</li>
            </ul>
            <p style={{ marginTop: '1rem' }}><strong>P1 vs P2:</strong></p>
            <p>You hold your P1 for 12 months, then automatically progress to P2 for 2 years (if under 25) or 1 year (if 25+), provided you have a clean record.</p>
          </AccordionItem>

          <AccordionItem title="Key South Australian Road Rules to Remember">
            <ul className="info-list">
              <li><strong>Speed limits:</strong> The default speed limit in built-up areas is 50km/h unless signed otherwise.</li>
              <li><strong>Mobile phones:</strong> Learner and P1 drivers are completely banned from using any mobile phone function while driving.</li>
              <li><strong>Give Way:</strong> Always give way to your right at uncontrolled intersections, and follow all give way signs and lines.</li>
              <li><strong>U-turns:</strong> You cannot make a U-turn at traffic lights unless there is a "U-turn permitted" sign.</li>
            </ul>
          </AccordionItem>
        </div>
      </section>

      <section className="section bg-white text-center">
        <div className="container">
          <h2 className="h2 mb-3">Need help with the practical test?</h2>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>Our experienced instructors can guide you through the CBT&A course or prepare you for the VORT test.</p>
          <Link to="/pricing" className="btn btn-primary">View Lesson Pricing</Link>
        </div>
      </section>
    </div>
  );
};

export default Hub;
