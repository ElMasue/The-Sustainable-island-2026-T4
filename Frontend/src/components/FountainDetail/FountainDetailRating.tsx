import { useTranslation } from "../../i18n";

interface FountainDetailRatingProps {
  user: any;
  userRating: number | null;
  waterQualityStats: any;
  isSubmittingRating: boolean;
  handleRating: (rating: 1 | 2 | 3 | 4 | 5) => void;
}

export function FountainDetailRating({
  user,
  userRating,
  waterQualityStats,
  isSubmittingRating,
  handleRating,
}: FountainDetailRatingProps) {
  const t = useTranslation();

  return (
    <div className="fountain-detail-section">
      <h3 className="section-title">{t.rateWaterQuality}</h3>

      {waterQualityStats && waterQualityStats.totalRatings > 0 && (
        <div
          className="water-quality-summary"
          style={{
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          <span
            style={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              color: "inherit",
            }}
          >
            {waterQualityStats.averageRating.toFixed(1)}
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="#FFD700"
            stroke="none"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      )}

      {user ? (
        <>
          <p className="section-subtitle">
            {userRating
              ? `${t.yourRating}: ${["", t.ratingBad, t.ratingPoor, t.ratingOk, t.ratingGood, t.ratingExcellent][userRating]}`
              : t.rateWaterQualitySubtitle}
          </p>

          <div className="rating-emojis">
            <button
              className={`emoji-button ${userRating === 1 ? "active" : ""}`}
              aria-label={t.ratingBad}
              onClick={() => handleRating(1)}
              disabled={isSubmittingRating}
            >
              <span className="emoji">😡</span>
              <span className="emoji-label">{t.ratingBad}</span>
            </button>
            <button
              className={`emoji-button ${userRating === 2 ? "active" : ""}`}
              aria-label={t.ratingPoor}
              onClick={() => handleRating(2)}
              disabled={isSubmittingRating}
            >
              <span className="emoji">😕</span>
              <span className="emoji-label">{t.ratingPoor}</span>
            </button>
            <button
              className={`emoji-button ${userRating === 3 ? "active" : ""}`}
              aria-label={t.ratingOk}
              onClick={() => handleRating(3)}
              disabled={isSubmittingRating}
            >
              <span className="emoji">😐</span>
              <span className="emoji-label">{t.ratingOk}</span>
            </button>
            <button
              className={`emoji-button ${userRating === 4 ? "active" : ""}`}
              aria-label={t.ratingGood}
              onClick={() => handleRating(4)}
              disabled={isSubmittingRating}
            >
              <span className="emoji">🙂</span>
              <span className="emoji-label">{t.ratingGood}</span>
            </button>
            <button
              className={`emoji-button ${userRating === 5 ? "active" : ""}`}
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
        <p
          className="section-subtitle"
          style={{ fontStyle: "italic", color: "#666" }}
        >
          {t.signInToRate}
        </p>
      )}
    </div>
  );
}
