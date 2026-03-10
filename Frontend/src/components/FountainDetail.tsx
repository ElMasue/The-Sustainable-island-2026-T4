import { useState, useEffect } from 'react';
import type { Fountain } from '../types/fountain';
import { useTranslation } from '../i18n';
import { useAppSettings } from '../context/AppSettingsContext';
import { translateText } from '../services/translationService';
import './FountainDetail.css';

interface FountainDetailProps {
  fountain: Fountain;
  onBack?: () => void;
}

function FountainDetail({ fountain, onBack }: FountainDetailProps) {
  const t = useTranslation();
  const { language } = useAppSettings();
  const [translatedDescription, setTranslatedDescription] = useState(fountain.description || '');
  
  useEffect(() => {
    const translateDescription = async () => {
      if (!fountain.description) return;
      
      // Si el idioma es inglés, usar la descripción original
      if (language === 'en') {
        setTranslatedDescription(fountain.description);
        return;
      }
      
      try {
        const translated = await translateText(fountain.description, language, 'en');
        setTranslatedDescription(translated);
      } catch (error) {
        console.error('Translation failed:', error);
        setTranslatedDescription(fountain.description); // Fallback al original
      }
    };
    
    translateDescription();
  }, [fountain.description, language]);
  
  return (
    <div className="fountain-detail">
      <div className="fountain-detail-header">
        <div className="fountain-detail-map">
          <img 
            src={fountain.imageUrl || 'https://via.placeholder.com/400x200?text=Map'} 
            alt={`${fountain.name} location`}
          />
          <div className="fountain-detail-marker">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#FF5722" stroke="white" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="fountain-detail-content">
        <div className="fountain-detail-title-section">
          <div className="fountain-detail-title-row">
            <h2 className="fountain-detail-title">{fountain.name}</h2>
            {onBack && (
              <button 
                className="fountain-detail-back-button" 
                onClick={onBack}
                aria-label="Back to list"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>Back to list</span>
              </button>
            )}
          </div>
          {fountain.category && (
            <span className="fountain-detail-category">{fountain.category}</span>
          )}
        </div>

        <div className="fountain-detail-meta">t.free : t.paid
          {fountain.isFree !== undefined && (
            <span className="meta-badge">{fountain.isFree ? 'Free' : 'Paid'}</span>
          )}
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
              <div key={index} className="detail-image">
                <img src={image} alt={`${fountain.name} ${index + 1}`} />
              </div>
            ))}
          </div>
        )}

        <div className="fountain-detail-section">
          <h3 className="section-title">{t.rateWaterQuality}</h3>
          <p className="section-subtitle">{t.rateWaterQualitySubtitle}</p>
          
          <div className="rating-emojis">
            <button className="emoji-button" aria-label={t.ratingBad}>
              <span className="emoji">😡</span>
              <span className="emoji-label">{t.ratingBad}</span>
            </button>
            <button className="emoji-button" aria-label={t.ratingPoor}>
              <span className="emoji">😕</span>
              <span className="emoji-label">{t.ratingPoor}</span>
            </button>
            <button className="emoji-button" aria-label={t.ratingOk}>
              <span className="emoji">😐</span>
              <span className="emoji-label">{t.ratingOk}</span>
            </button>
            <button className="emoji-button" aria-label={t.ratingGood}>
              <span className="emoji">🙂</span>
              <span className="emoji-label">{t.ratingGood}</span>
            </button>
            <button className="emoji-button" aria-label={t.ratingExcellent}>
              <span className="emoji">😍</span>
              <span className="emoji-label">{t.ratingExcellent}</span>
            </button>
          </div>
        </div>

        {fountain.description && (
          <div className="fountain-detail-section">
            <h3 className="section-title">{t.description}</h3>
            <p className="section-text">{translatedDescription}</p>
          </div>
        )}

        {fountain.distance && (
          <div className="fountain-detail-section">
            <h3 className="section-title">{t.distance}</h3>
            <p className="section-text">{fountain.distance}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FountainDetail;
