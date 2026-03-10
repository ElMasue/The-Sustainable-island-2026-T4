import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { BackHeader, PrimaryButton } from '../components';
import './AddSite.css';

function AddSite() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [category, setCategory] = useState('fountain');
  const [isFree, setIsFree] = useState(true);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));

    setImageFiles(prev => [...prev, ...newFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Could not get your location. Please enter manually.');
          setIsLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    if (!user || imageFiles.length === 0) return [];

    const imageUrls: string[] = [];

    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('fountain-images')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload images');
      }

      if (data) {
        const { data: publicData } = supabase.storage
          .from('fountain-images')
          .getPublicUrl(data.path);
        
        imageUrls.push(publicData.publicUrl);
      }
    }

    return imageUrls;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must be signed in to add a site');
      return;
    }

    if (!name || !latitude || !longitude) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // Upload images first
      const imageUrls = await uploadImages();

      // Create the fountain entry
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
      const response = await fetch(`${API_BASE}/api/fountains`, {
        method: 'POST',
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
          images: imageUrls,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create site');
      }

      const result = await response.json();
      console.log('Site created:', result);

      // Navigate back to home
      navigate('/');
    } catch (err) {
      console.error('Error creating site:', err);
      setError(err instanceof Error ? err.message : 'Failed to create site');
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="add-site">
        <BackHeader title="Add New Site" backTo="/" />
        <div className="add-site__content">
          <p className="add-site__error">You must be signed in to add a site.</p>
          <PrimaryButton onClick={() => navigate('/signin')}>Sign In</PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="add-site">
      <BackHeader title="Add New Site" backTo="/" />
      
      <div className="add-site__content">
        <form className="add-site__form" onSubmit={handleSubmit}>
          {error && <div className="add-site__error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Main Street Fountain"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Describe the water source..."
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
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
              />
              {' '}Free to use
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Location *</label>
            <div className="location-inputs">
              <input
                type="number"
                step="any"
                className="form-input"
                placeholder="Latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
              />
              <input
                type="number"
                step="any"
                className="form-input"
                placeholder="Longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                required
              />
            </div>
            <button
              type="button"
              className="location-button"
              onClick={getCurrentLocation}
              disabled={isLoading}
            >
              📍 Use Current Location
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="form-file-input"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="file-upload-label">
              📷 Choose Images
            </label>
            
            {imagePreviews.length > 0 && (
              <div className="image-previews">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-preview">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => removeImage(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <PrimaryButton
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Add Site'}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}

export default AddSite;
