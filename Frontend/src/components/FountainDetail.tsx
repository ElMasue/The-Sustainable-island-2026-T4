import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Fountain } from '../types/fountain';
import { useTranslation } from '../i18n';
import { translateCategory } from '../i18n/translations';
import { useAppSettings } from '../context/AppSettingsContext';
import { useAuth } from '../context/AuthContext';
import { translateText } from '../services/translationService';
import './FountainDetail.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

interface FountainDetailProps {
  fountain: Fountain;
  onBack?: () => void;
}

function FountainDetail({ fountain, onBack }: FountainDetailProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const t = useTranslation();
  const { language } = useAppSettings();
  const [translatedDescription, setTranslatedDescription] = useState(fountain.description || '');
  const [isTranslating, setIsTranslating] = useState(false);
  const [expandedImageIndex, setExpandedImageIndex] = useState<number | null>(null);
  
  const [isFavorited, setIsFavorited] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoadingInteractions, setIsLoadingInteractions] = useState(false);
  
  // Water quality rating states
  const [userRating, setUserRating] = useState<number | null>(null);
  const [waterQualityStats, setWaterQualityStats] = useState<{
    averageRating: number;
    totalRatings: number;
    distribution: {
      bad: number;
      poor: number;
      ok: number;
      good: number;
      excellent: number;
    };
  } | null>(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const openLightbox = (index: number) => {
    setExpandedImageIndex(index);
    document.body.style.overflow = 'hidden';
    document.body.classList.add('lightbox-open');
  };

  const closeLightbox = () => {
    setExpandedImageIndex(null);
    document.body.style.overflow = '';
    document.body.classList.remove('lightbox-open');
  };

  const nextImage = () => {
    if (fountain.images && expandedImageIndex !== null) {
      setExpandedImageIndex((expandedImageIndex + 1) % fountain.images.length);
    }
  };

  const prevImage = () => {
    if (fountain.images && expandedImageIndex !== null) {
      setExpandedImageIndex(
        expandedImageIndex === 0 ? fountain.images.length - 1 : expandedImageIndex - 1
      );
    }
  };

  // Clean up body overflow on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('lightbox-open');
    };
  }, []);
  
  useEffect(() => {
    const translateDescription = async () => {
      if (!fountain.description) {
        setTranslatedDescription('');
        return;
      }
      
      console.log('🌍 Current language:', language);
      console.log('📝 Original description:', fountain.description);
      
      // Si el idioma es español, usar la descripción original (las descripciones están en español)
      if (language === 'es') {
        setTranslatedDescription(fountain.description);
        console.log('✅ Using original Spanish description');
        return;
      }
      
      // Iniciar traducción desde español al idioma seleccionado
      setIsTranslating(true);
      console.log(`🔄 Translating from Spanish to ${language}...`);
      
      try {
        const translated = await translateText(fountain.description, language, 'es');
        console.log('✅ Translation result:', translated);
        setTranslatedDescription(translated);
      } catch (error) {
        console.error('❌ Translation failed:', error);
        setTranslatedDescription(fountain.description); // Fallback al original
      } finally {
        setIsTranslating(false);
      }
    };
    
    translateDescription();
  }, [fountain.description, language, fountain.id]);

  // Fetch water quality stats
  useEffect(() => {
    const fetchWaterQualityStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/water-quality-ratings/${fountain.id}`);
        if (res.ok) {
          const stats = await res.json();
          setWaterQualityStats(stats);
        }
      } catch (error) {
        console.error('Error fetching water quality stats:', error);
      }
    };
    
    fetchWaterQualityStats();
  }, [fountain.id]);

  // Fetch user's rating if authenticated
  useEffect(() => {
    const fetchUserRating = async () => {
      if (!user) return;
      
      try {
        const res = await fetch(`${API_BASE}/api/water-quality-ratings/${fountain.id}/user/${user.id}`);
        if (res.ok) {
          const rating = await res.json();
          setUserRating(rating.qualityRating);
        } else if (res.status === 404) {
          // User hasn't rated yet
          setUserRating(null);
        }
      } catch (error) {
        console.error('Error fetching user rating:', error);
      }
    };
    
    fetchUserRating();
  }, [fountain.id, user]);

  // Fetch interaction status
  useEffect(() => {
    const fetchInteractions = async () => {
      if (!user) return;
      
      try {
        const [favRes, saveRes] = await Promise.all([
          fetch(`${API_BASE}/api/interactions/favorite?userId=${user.id}`),
          fetch(`${API_BASE}/api/interactions/save?userId=${user.id}`)
        ]);
        
        if (favRes.ok && saveRes.ok) {
          const favorites = await favRes.json();
          const saved = await saveRes.json();
          
          setIsFavorited(favorites.some((f: any) => f.fountainId === fountain.id.toString()));
          setIsSaved(saved.some((f: any) => f.fountainId === fountain.id.toString()));
        }
      } catch (error) {
        console.error('Error fetching interactions:', error);
      }
    };
    
    fetchInteractions();
  }, [fountain.id, user]);

  const toggleInteraction = async (type: 'favorite' | 'save') => {
    if (!user) return; // Should be handled by UI visibility, but safeguard
    
    const isCurrentlyActive = type === 'favorite' ? isFavorited : isSaved;
    const setIsActive = type === 'favorite' ? setIsFavorited : setIsSaved;
    
    try {
      setIsLoadingInteractions(true);
      if (isCurrentlyActive) {
        // Remove
        const res = await fetch(`${API_BASE}/api/interactions`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            fountainId: fountain.id,
            interactionType: type
          })
        });
        if (res.ok) setIsActive(false);
      } else {
        // Add
        const res = await fetch(`${API_BASE}/api/interactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            fountainId: fountain.id,
            interactionType: type,
            fountainName: fountain.name,
            fountainLat: fountain.latitude,
            fountainLon: fountain.longitude
          })
        });
        if (res.ok) setIsActive(true);
      }
    } catch (error) {
      console.error(`Error toggling ${type}:`, error);
    } finally {
      setIsLoadingInteractions(false);
    }
  };

  const handleRating = async (rating: 1 | 2 | 3 | 4 | 5) => {
    if (!user) {
      console.warn('User must be logged in to rate');
      return;
    }
    
    try {
      setIsSubmittingRating(true);
      const res = await fetch(`${API_BASE}/api/water-quality-ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          fountainId: fountain.id,
          qualityRating: rating,
          fountainName: fountain.name,
          fountainLat: fountain.latitude,
          fountainLon: fountain.longitude
        })
      });
      
      if (res.ok) {
        setUserRating(rating);
        
        // Refresh stats
        const statsRes = await fetch(`${API_BASE}/api/water-quality-ratings/${fountain.id}`);
        if (statsRes.ok) {
          const stats = await statsRes.json();
          setWaterQualityStats(stats);
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmittingRating(false);
    }
  };
  
  return (
    <div className="fountain-detail">
      <div className="fountain-detail-header">
        <div className="fountain-detail-map">
          <iframe 
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${fountain.longitude-0.005},${fountain.latitude-0.005},${fountain.longitude+0.005},${fountain.latitude+0.005}&layer=mapnik&marker=${fountain.latitude},${fountain.longitude}`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={`${fountain.name} location`}
          />
        </div>
      </div>

      <div className="fountain-detail-content">
        <div className="fountain-detail-title-section">
          <div className="fountain-detail-title-row">
            <h2 className="fountain-detail-title">{fountain.name}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {user && (
                <>
                  <button 
                    className={`fountain-detail-action-button ${isFavorited ? 'active' : ''}`}
                    onClick={() => toggleInteraction('favorite')}
                    disabled={isLoadingInteractions}
                    title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorited ? "#ff4081" : "none"} stroke={isFavorited ? "#ff4081" : "currentColor"} strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                  <button 
                    className={`fountain-detail-action-button ${isSaved ? 'active' : ''}`}
                    onClick={() => toggleInteraction('save')}
                    disabled={isLoadingInteractions}
                    title={isSaved ? 'Remove from saved' : 'Save fountain'}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? "#ffd600" : "none"} stroke={isSaved ? "#ffd600" : "currentColor"} strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </button>
                </>
              )}
              {user?.id === fountain.userId && (
                <button
                  className="fountain-detail-back-button"
                  style={{ color: '#1976d2', backgroundColor: '#e3f2fd' }}
                  onClick={() => navigate(`/edit-site/${fountain.id}`)}
                  aria-label="Edit Fountain"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  <span>Edit</span>
                </button>
              )}
              {onBack && (
                <button 
                  className="fountain-detail-back-button" 
                  onClick={onBack}
                  aria-label="Back to list"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  <span>Back</span>
                </button>
              )}
            </div>
          </div>
          {fountain.category && (
            <span className="fountain-detail-category">
              {translateCategory(fountain.category, language)}
            </span>
          )}
        </div>

        <div className="fountain-detail-meta">
          {fountain.isFree && (
            <span className="meta-badge">{t.free}</span>
          )}
          <span className={`meta-badge status-badge ${fountain.isOperational ? 'status-active' : 'status-inactive'}`}>
            {fountain.isOperational ? `✓ ${t.operational}` : `✗ ${t.notOperational}`}
          </span>
          {fountain.rating !== undefined && (
            <div className="meta-rating">
              <span className="rating-value">{fountain.rating}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFD700" stroke="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          )}
        </div>

        {fountain.images && fountain.images.length > 0 && (
          <div className="fountain-detail-images">
            {fountain.images.map((image, index) => (
              <div 
                key={index} 
                className="detail-image"
                onClick={() => openLightbox(index)}
                style={{ cursor: 'pointer' }}
              >
                <img src={image} alt={`${fountain.name} ${index + 1}`} />
              </div>
            ))}
          </div>
        )}

        <div className="fountain-detail-section">
          <h3 className="section-title">{t.rateWaterQuality}</h3>
          
          {waterQualityStats && waterQualityStats.totalRatings > 0 && (
            <div className="water-quality-summary" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1976d2' }}>
                  {waterQualityStats.averageRating.toFixed(1)}
                </span>
                <span style={{ fontSize: '0.875rem', color: '#666' }}>/5</span>
              </div>
              <span style={{ fontSize: '0.875rem', color: '#666' }}>
                ({waterQualityStats.totalRatings} {t.basedOnRatings})
              </span>
            </div>
          )}
          
          {user ? (
            <>
              <p className="section-subtitle">
                {userRating ? `${t.yourRating}: ${['', t.ratingBad, t.ratingPoor, t.ratingOk, t.ratingGood, t.ratingExcellent][userRating]}` : t.rateWaterQualitySubtitle}
              </p>
              
              <div className="rating-emojis">
                <button 
                  className={`emoji-button ${userRating === 1 ? 'active' : ''}`}
                  aria-label={t.ratingBad}
                  onClick={() => handleRating(1)}
                  disabled={isSubmittingRating}
                >
                  <span className="emoji">😡</span>
                  <span className="emoji-label">{t.ratingBad}</span>
                </button>
                <button 
                  className={`emoji-button ${userRating === 2 ? 'active' : ''}`}
                  aria-label={t.ratingPoor}
                  onClick={() => handleRating(2)}
                  disabled={isSubmittingRating}
                >
                  <span className="emoji">😕</span>
                  <span className="emoji-label">{t.ratingPoor}</span>
                </button>
                <button 
                  className={`emoji-button ${userRating === 3 ? 'active' : ''}`}
                  aria-label={t.ratingOk}
                  onClick={() => handleRating(3)}
                  disabled={isSubmittingRating}
                >
                  <span className="emoji">😐</span>
                  <span className="emoji-label">{t.ratingOk}</span>
                </button>
                <button 
                  className={`emoji-button ${userRating === 4 ? 'active' : ''}`}
                  aria-label={t.ratingGood}
                  onClick={() => handleRating(4)}
                  disabled={isSubmittingRating}
                >
                  <span className="emoji">🙂</span>
                  <span className="emoji-label">{t.ratingGood}</span>
                </button>
                <button 
                  className={`emoji-button ${userRating === 5 ? 'active' : ''}`}
                  aria-label={t.ratingExcellent}
                  onClick={() => handleRating(5)}
                  disabled={isSubmittingRating}
                >
                  <span className="emoji">😍</span>
                  <span className="emoji-label">{t.ratingExcellent}</span>
                </button>
              </div>
            </>
          ) : (
            <p className="section-subtitle" style={{ fontStyle: 'italic', color: '#666' }}>
              {t.signInToRate}
            </p>
          )}
        </div>

        {fountain.description && (
          <div className="fountain-detail-section">
            <h3 className="section-title">{t.description}</h3>
            <p className="section-text">
              {isTranslating ? `${t.loading}` : translatedDescription || fountain.description}
            </p>
          </div>
        )}

        {fountain.distance && (
          <div className="fountain-detail-section">
            <h3 className="section-title">{t.distance}</h3>
            <p className="section-text">{fountain.distance}</p>
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {expandedImageIndex !== null && fountain.images && (
        <div 
          className="image-lightbox"
          onClick={closeLightbox}
        >
          <button 
            className="lightbox-close"
            onClick={closeLightbox}
            aria-label="Close"
          >
            ✕
          </button>

          {fountain.images.length > 1 && (
            <>
              <button 
                className="lightbox-nav lightbox-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                aria-label="Previous image"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <button 
                className="lightbox-nav lightbox-next"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                aria-label="Next image"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </>
          )}

          <img 
            src={fountain.images[expandedImageIndex]} 
            alt={`${fountain.name} ${expandedImageIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
          />

          {fountain.images.length > 1 && (
            <div className="lightbox-counter">
              {expandedImageIndex + 1} / {fountain.images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FountainDetail;
