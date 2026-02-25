import type { Fountain } from '../types/fountain';
import './FountainDetail.css';

interface FountainDetailProps {
  fountain: Fountain;
}

function FountainDetail({ fountain }: FountainDetailProps) {
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
          <h2 className="fountain-detail-title">{fountain.name}</h2>
          {fountain.category && (
            <span className="fountain-detail-category">{fountain.category}</span>
          )}
        </div>

        <div className="fountain-detail-meta">
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
          <h3 className="section-title">How would you rate the water?</h3>
          <p className="section-subtitle">We'd love to know!</p>
          
          <div className="rating-emojis">
            <button className="emoji-button" aria-label="Very bad">
              😖
            </button>
            <button className="emoji-button" aria-label="Bad">
              😕
            </button>
            <button className="emoji-button" aria-label="Neutral">
              😐
            </button>
            <button className="emoji-button" aria-label="Good">
              🙂
            </button>
            <button className="emoji-button" aria-label="Excellent">
              😍
            </button>
          </div>
        </div>

        {fountain.description && (
          <div className="fountain-detail-section">
            <h3 className="section-title">Description</h3>
            <p className="section-text">{fountain.description}</p>
          </div>
        )}

        {fountain.distance && (
          <div className="fountain-detail-section">
            <h3 className="section-title">Distance</h3>
            <p className="section-text">{fountain.distance}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FountainDetail;
