import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BackHeader, PrimaryButton } from '../components';
import type { Fountain } from '../types/fountain';
import './AddSite.css'; // Reuse the styling from AddSite

function EditSite() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [category, setCategory] = useState('fountain');
  const [isFree, setIsFree] = useState(true);
  const [isOperational, setIsOperational] = useState(true);
  const [originalImages, setOriginalImages] = useState<string[]>([]);
  // We're omitting image modifications for this iteration to keep it safe and functional

  useEffect(() => {
    const fetchFountain = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
        const response = await fetch(`${API_BASE}/api/fountains`);
        if (!response.ok) throw new Error('Failed to fetch fountains');
        
        const data: Fountain[] = await response.json();
        const fountain = data.find(f => f.id.toString() === id);
        
        if (!fountain) {
          setError('Fountain not found');
          setIsFetching(false);
          return;
        }

        if (fountain.userId !== user?.id) {
          setError('You do not have permission to edit this fountain');
          setIsFetching(false);
          return;
        }

        setName(fountain.name);
        setDescription(fountain.description || '');
        setLatitude(fountain.latitude.toString());
        setLongitude(fountain.longitude.toString());
        setCategory(fountain.category || 'fountain');
        setIsFree(fountain.isFree ?? true);
        setIsOperational(fountain.isOperational ?? true);
        setOriginalImages(fountain.images || []);
        
        setIsFetching(false);
      } catch (err) {
        console.error('Error fetching fountain:', err);
        setError('Failed to load fountain data');
        setIsFetching(false);
      }
    };

    if (user && id) {
      fetchFountain();
    } else if (!user) {
      setIsFetching(false);
    }
  }, [id, user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must be signed in to edit a site');
      return;
    }

    if (!name || !latitude || !longitude) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
      const response = await fetch(`${API_BASE}/api/fountains/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          category,
          isFree,
          isOperational,
          images: originalImages,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update site');
      }

      // Navigate back to home or wherever the user came from
      navigate('/');
    } catch (err) {
      console.error('Error updating site:', err);
      setError(err instanceof Error ? err.message : 'Failed to update site');
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="add-site">
        <BackHeader title="Edit Site" backTo="/" />
        <div className="add-site__content">
          <p className="add-site__error">You must be signed in to edit a site.</p>
          <PrimaryButton onClick={() => navigate('/signin')}>Sign In</PrimaryButton>
        </div>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="add-site">
        <BackHeader title="Edit Site" backTo="/" />
        <div className="add-site__content">
          <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading fountain data...</p>
        </div>
      </div>
    );
  }

  if (error && !isFetching && !name) { // Hard error state on load
      return (
        <div className="add-site">
            <BackHeader title="Edit Site" backTo="/" />
            <div className="add-site__content">
                <p className="add-site__error">{error}</p>
                <PrimaryButton onClick={() => navigate('/')}>Return to Map</PrimaryButton>
            </div>
        </div>
      );
  }

  return (
    <div className="add-site">
      <BackHeader title="Edit Site" backTo="/" />
      
      <div className="add-site__content">
        <form className="add-site__form" onSubmit={handleSubmit}>
          {error && <div className="add-site__error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="fountain">Fountain</option>
              <option value="bottle-refill">Bottle Refill Station</option>
              <option value="tap">Public Tap</option>
              <option value="establishment">Establishment</option>
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              Free to use
            </label>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <input
                type="checkbox"
                checked={isOperational}
                onChange={(e) => setIsOperational(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              Currently Operational
            </label>
          </div>

          {/* Read-only location since safely modifying coordinates requires map picking UX */}
          <div className="form-group" style={{ opacity: 0.7, marginTop: '20px' }}>
            <label className="form-label">Location (Lat / Lng)</label>
            <div className="location-inputs">
              <input type="number" step="any" className="form-input" value={latitude} disabled title="Location is locked for existing fountains" />
              <input type="number" step="any" className="form-input" value={longitude} disabled title="Location is locked for existing fountains" />
            </div>
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '6px', textAlign: 'center' }}>Location cannot be modified after creation.</p>
          </div>

          <PrimaryButton type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}

export default EditSite;
