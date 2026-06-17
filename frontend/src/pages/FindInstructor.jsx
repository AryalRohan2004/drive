import React, { useState } from 'react';
import { Search, MapPin, Star, Clock, Car, Loader, Navigation } from 'lucide-react';
import { matchingApi, instructorsApi } from '../services/api';
import { toast } from 'react-hot-toast';
import './FindInstructor.css';

const FindInstructor = () => {
  const [suburb, setSuburb] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!suburb.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await matchingApi.nearby(`suburb=${encodeURIComponent(suburb)}`);
      setResults(data.instructors || data || []);
    } catch (err) {
      try {
        const data = await instructorsApi.nearby(`suburb=${encodeURIComponent(suburb)}`);
        setResults(data.instructors || data || []);
      } catch {
        toast.error(err.message || 'Failed to search. The backend may not be running.');
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    setSearched(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await matchingApi.nearby(`lat=${position.coords.latitude}&lng=${position.coords.longitude}`);
          setResults(data.instructors || data || []);
        } catch (err) {
          toast.error(err.message || 'Failed to find nearby instructors.');
          setResults([]);
        } finally {
          setLoading(false);
        }
      },
      () => {
        toast.error('Unable to get your location. Please search by suburb instead.');
        setLoading(false);
      }
    );
  };

  return (
    <div className="find-page bg-light section">
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <h1 className="h1">Find an Instructor</h1>
          <p className="text-lg text-muted">Search for driving instructors near you.</p>
        </div>

        <div className="find-search-card">
          <form onSubmit={handleSearch} className="find-search-form">
            <div className="find-input-wrapper">
              <Search size={20} className="find-input-icon" />
              <input
                type="text"
                placeholder="Enter suburb or postcode (e.g. Mawson Lakes, 5095)"
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
                className="find-search-input"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader size={18} className="spin-icon" /> : <><Search size={18} /> Search</>}
            </button>
          </form>
          <button className="find-near-me" onClick={handleFindNearMe} disabled={loading}>
            <Navigation size={16} /> Use My Location
          </button>
        </div>

        {loading && (
          <div className="text-center" style={{ padding: '3rem' }}>
            <Loader size={32} className="spin-icon icon-blue" />
            <p className="text-muted" style={{ marginTop: '1rem' }}>Searching for instructors...</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="find-empty text-center" style={{ padding: '3rem' }}>
            <MapPin size={48} className="text-muted" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p className="text-muted">No instructors found in this area. Try a different suburb.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="find-results">
            <h3 className="h4" style={{ marginBottom: '1.5rem' }}>{results.length} Instructor{results.length !== 1 ? 's' : ''} Found</h3>
            {results.map((instructor, idx) => (
              <div className="find-instructor-card" key={instructor.id || idx}>
                <div className="find-instructor-avatar">
                  <span>{(instructor.fullName || instructor.name || 'I')[0].toUpperCase()}</span>
                </div>
                <div className="find-instructor-info">
                  <h4 className="font-medium">{instructor.fullName || instructor.name}</h4>
                  <div className="find-instructor-meta">
                    {instructor.serviceAreas && <span className="meta-item"><MapPin size={14} /> {Array.isArray(instructor.serviceAreas) ? instructor.serviceAreas.join(', ') : instructor.serviceAreas}</span>}
                    {instructor.vehicleTypesSupported && <span className="meta-item"><Car size={14} /> {Array.isArray(instructor.vehicleTypesSupported) ? instructor.vehicleTypesSupported.join(', ') : instructor.vehicleTypesSupported}</span>}
                    {instructor.distance && <span className="meta-item"><Navigation size={14} /> {instructor.distance} km away</span>}
                  </div>
                  {instructor.bio && <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>{instructor.bio}</p>}
                </div>
                <a href={`/book?instructorId=${instructor.id}`} className="btn btn-primary" style={{ flexShrink: 0 }}>
                  Book Lesson
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindInstructor;
