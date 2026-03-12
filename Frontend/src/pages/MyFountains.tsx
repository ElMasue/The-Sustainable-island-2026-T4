import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BackHeader } from '../components';
import type { Fountain } from '../types/fountain';
import './MyFountains.css';

function MyFountains() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fountains, setFountains] = useState<Fountain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyFountains = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
        const response = await fetch(`${API_BASE}/api/fountains?userId=${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch your fountains');
        
        const data: Fountain[] = await response.json();
        const myFountains = data.filter(f => f.userId === user.id);
        
        setFountains(myFountains);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching user fountains:', err);
        setError('Could not load your fountains.');
        setIsLoading(false);
      }
    };
    
    fetchMyFountains();
  }, [user]);

  const handleDelete = async (fountainId: string, fountainName: string) => {
    if (!user) return;

    setDeletingId(fountainId);
    
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
      const response = await fetch(`${API_BASE}/api/fountains/${fountainId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete fountain');
      }

      // Remove from local state
      setFountains(prev => prev.filter(f => f.id !== fountainId));
      
    } catch (err) {
      console.error('Error deleting fountain:', err);
      alert('Failed to delete fountain. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return (
      <div className="my-fountains" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <BackHeader title="My Fountains" backTo="/" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#666' }}>You must be signed in to view your fountains.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-fountains" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <BackHeader title="My Fountains" backTo="/" />
      
      <div className="my-fountains__content" style={{ padding: '1.5rem', flex: 1 }}>
        <button className="back-button" onClick={() => navigate('/', { state: { openProfile: true } })} style={{ marginBottom: '1rem' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Back</span>
        </button>

        {isLoading ? (
          <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>Loading...</p>
        ) : error ? (
          <p style={{ textAlign: 'center', color: '#f44336', marginTop: '2rem' }}>{error}</p>
        ) : fountains.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <p style={{ color: '#666', marginBottom: '1rem' }}>You haven't created any fountains yet.</p>
            <button 
              onClick={() => navigate('/add-site')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Add a New Fountain
            </button>
          </div>
        ) : (
          <div className="fountains-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 className="my-fountains-list-title" style={{ margin: '0 0 1rem 0' }}>Your Contributions ({fountains.length})</h3>
            
            {fountains.map(fountain => (
              <div key={fountain.id} className="my-fountain-card" style={{
                borderRadius: '12px',
                padding: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 className="my-fountain-title" style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{fountain.name}</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem' }}>
                    {fountain.isOperational ? (
                      <span style={{ color: '#4caf50', background: '#e8f5e9', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>Operational</span>
                    ) : (
                      <span style={{ color: '#f44336', background: '#ffebee', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>Closed</span>
                    )}
                    {fountain.isFree && (
                      <span style={{ color: '#1976d2', background: '#e3f2fd', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>Free</span>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    className="my-fountain-edit-btn"
                    onClick={() => navigate(`/edit-site/${fountain.id}`)}
                    disabled={deletingId === String(fountain.id)}
                    style={{
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: deletingId === String(fountain.id) ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      opacity: deletingId === String(fountain.id) ? 0.5 : 1
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit
                  </button>
                  
                  <button
                    className="my-fountain-delete-btn"
                    onClick={() => handleDelete(String(fountain.id), fountain.name)}
                    disabled={deletingId === String(fountain.id)}
                    style={{
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: deletingId === String(fountain.id) ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s, color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: deletingId === String(fountain.id) ? '#ccc' : '#ffebee',
                      color: deletingId === String(fountain.id) ? '#666' : '#d32f2f'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    {deletingId === String(fountain.id) ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyFountains;
