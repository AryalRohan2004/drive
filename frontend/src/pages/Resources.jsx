import React from 'react';
import { Download, FileText, ExternalLink, Video } from 'lucide-react';

const Resources = () => {
  return (
    <div className="resources-page section bg-light">
      <div className="container">
        <div className="text-center mb-4">
          <h1 className="h1">Online Resources</h1>
          <p className="text-lg text-muted">Everything you need to prepare for your tests.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
          
          <div style={{ backgroundColor: 'var(--white)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
            <FileText size={40} className="icon-blue" style={{ marginBottom: '1rem' }} />
            <h3 className="h4" style={{ marginBottom: '1rem' }}>The Driver's Handbook</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>The official South Australian guide to road rules, driving safety, and licensing.</p>
            <a href="#" className="btn btn-outline" style={{ display: 'flex', width: '100%' }}>
              Read Online <ExternalLink size={18} style={{ marginLeft: 'auto' }} />
            </a>
          </div>

          <div style={{ backgroundColor: 'var(--white)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
            <Video size={40} className="icon-blue" style={{ marginBottom: '1rem' }} />
            <h3 className="h4" style={{ marginBottom: '1rem' }}>Hazard Perception Practice</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Practice the HPT online with official clips to ensure you pass on your first attempt.</p>
            <a href="#" className="btn btn-outline" style={{ display: 'flex', width: '100%' }}>
              Take Practice Test <ExternalLink size={18} style={{ marginLeft: 'auto' }} />
            </a>
          </div>

          <div style={{ backgroundColor: 'var(--white)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
            <Download size={40} className="icon-blue" style={{ marginBottom: '1rem' }} />
            <h3 className="h4" style={{ marginBottom: '1rem' }}>Logbook Companion App</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Download the official app to electronically record your 75 hours of supervised driving.</p>
            <a href="#" className="btn btn-primary" style={{ display: 'flex', width: '100%' }}>
              Download App <ExternalLink size={18} style={{ marginLeft: 'auto' }} />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Resources;
