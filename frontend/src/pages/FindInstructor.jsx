import { useState } from 'react';
import { Search, MapPin, Car, Loader, Navigation } from 'lucide-react';
import { matchingApi } from '../services/api';
import { toast } from 'react-hot-toast';
import './FindInstructor.css';

const FindInstructor = () => {
  const [location, setLocation] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchState, setSearchState] = useState('idle');

  const findCoordsFromLocation = async (value) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=au&q=${encodeURIComponent(value)}`,
      { headers: { Accept: 'application/json' } }
    );

    if (!response.ok) {
      throw new Error('Unable to resolve that location.');
    }

    const data = await response.json();
    const place = data?.[0];
    if (!place?.lat || !place?.lon) {
      throw new Error('No matching suburb found.');
    }

    return { latitude: Number(place.lat), longitude: Number(place.lon) };
  };

  const searchNearby = async ({ latitude, longitude }) => {
    const data = await matchingApi.nearby(`latitude=${latitude}&longitude=${longitude}`);
    const matches = Array.isArray(data?.matches)
      ? data.matches
      : Array.isArray(data?.instructors)
        ? data.instructors
        : Array.isArray(data)
          ? data
          : [];
    setResults(matches);
    setSearchState(matches.length > 0 ? 'success' : 'empty');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!location.trim()) return;
    setLoading(true);
    setSearchState('loading');
    try {
      try {
        const coords = await findCoordsFromLocation(location.trim());
        await searchNearby(coords);
      } catch {
        setResults([]);
        setSearchState('empty');
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
    setSearchState('loading');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await matchingApi.nearby(`latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`);
          const matches = Array.isArray(data?.matches)
            ? data.matches
            : Array.isArray(data?.instructors)
              ? data.instructors
              : Array.isArray(data)
                ? data
                : [];
          setResults(matches);
          setSearchState(matches.length > 0 ? 'success' : 'empty');
        } catch (err) {
          toast.error(err.message || 'Failed to find nearby instructors.');
          setResults([]);
          setSearchState('empty');
        } finally {
          setLoading(false);
        }
      },
      () => {
        toast.error('Unable to get your location. Please search by suburb instead.');
        setLoading(false);
        setSearchState('idle');
      }
    );
  };

  return (
    <div className="find-page bg-light section">
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <h1 className="h1">Find an Instructor</h1>
          <p className="text-lg text-muted">Search for driving instructors near your suburb or use your current location.</p>
        </div>

        <div className="find-search-card">
          <form onSubmit={handleSearch} className="find-search-form">
            <input
              type="text"
              placeholder="Enter suburb (e.g. Mawson Lakes)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="find-search-input"
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader size={18} className="spin-icon" /> : <><Search size={18} /> Search</>}
            </button>
          </form>
          <button className="find-near-me" onClick={handleFindNearMe} disabled={loading}>
            <Navigation size={16} /> Use My Location
          </button>
        </div>

        {loading && (
          <div className="find-state-panel" aria-live="polite">
            <Loader size={34} className="spin-icon icon-blue" />
            <p>Searching for nearby instructors...</p>
          </div>
        )}

        {!loading && searchState === 'empty' && (
          <div className="find-state-panel find-state-empty" aria-live="polite">
            <MapPin size={42} className="find-empty-icon" />
            <h3 className="h4">No match found</h3>
            <p>We could not find any instructors for that location. Try another suburb or use your current location.</p>
          </div>
        )}

        {!loading && results.length > 0 && searchState === 'success' && (
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
                    {Number.isFinite(Number(instructor.routeDistanceKm)) && <span className="meta-item"><Navigation size={14} /> {Number(instructor.routeDistanceKm).toFixed(1)} km away</span>}
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
