import type { Fountain } from '../types/fountain';
import './FountainCard.css';

interface FountainCardProps {
  fountain: Fountain;
  onClick?: () => void;
  showImage?: boolean;
}

function FountainCard({ fountain, onClick, showImage = true }: FountainCardProps) {
  return (
    <button className="fountain-card" onClick={onClick}>
      {showImage && (
        <div className="fountain-card-image">
          {fountain.imageUrl ? (
            <img src={fountain.imageUrl} alt={fountain.name} />
          ) : (
            <div className="fountain-placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
            </div>
          )}
        </div>
      )}
      <div className="fountain-card-content">
        <div className="fountain-card-header">
          <h3 className="fountain-card-title">{fountain.name}</h3>
          {fountain.category && (
            <span className="fountain-category">{fountain.category}</span>
          )}
        </div>
        <div className="fountain-card-details">
          {fountain.distance && (
            <span className="fountain-distance">{fountain.distance}</span>
          )}
          {fountain.isFree !== undefined && (
            <span className="fountain-price">{fountain.isFree ? 'Free' : 'Paid'}</span>
          )}
        </div>
        {fountain.rating !== undefined && (
          <div className="fountain-rating">
            <span className="rating-value">{fountain.rating}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFD700" stroke="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        )}
      </div>
      <svg className="chevron-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>
  );
}

export default FountainCard;
