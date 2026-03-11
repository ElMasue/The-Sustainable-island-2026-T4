import { useNavigate } from "react-router-dom";
import type { Fountain } from "../../types/fountain";
import { translateCategory } from "../../i18n/translations";
import { useAppSettings } from "../../context/AppSettingsContext";

interface FountainDetailHeaderProps {
  fountain: Fountain;
  user: any;
  isFavorited: boolean;
  isSaved: boolean;
  isLoadingInteractions: boolean;
  toggleInteraction: (type: "favorite" | "save") => void;
  onBack?: () => void;
}

export function FountainDetailHeader({
  fountain,
  user,
  isFavorited,
  isSaved,
  isLoadingInteractions,
  toggleInteraction,
  onBack,
}: FountainDetailHeaderProps) {
  const navigate = useNavigate();
  const { language } = useAppSettings();

  return (
    <div className="fountain-detail-title-section">
      <div className="fountain-detail-title-row">
        <h2 className="fountain-detail-title">{fountain.name}</h2>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {user && (
            <>
              <button
                className={`fountain-detail-action-button ${isFavorited ? "active" : ""}`}
                onClick={() => toggleInteraction("favorite")}
                disabled={isLoadingInteractions}
                title={isFavorited ? "Remove from favorites" : "Add to favorites"}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={isFavorited ? "#ff4081" : "none"}
                  stroke={isFavorited ? "#ff4081" : "currentColor"}
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
              <button
                className={`fountain-detail-action-button ${isSaved ? "active" : ""}`}
                onClick={() => toggleInteraction("save")}
                disabled={isLoadingInteractions}
                title={isSaved ? "Remove from saved" : "Save fountain"}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={isSaved ? "#ffd600" : "none"}
                  stroke={isSaved ? "#ffd600" : "currentColor"}
                  strokeWidth="2"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
              </button>
            </>
          )}
          {user?.id === fountain.userId && (
            <button
              className="fountain-detail-back-button"
              style={{ color: "#1976d2", backgroundColor: "#e3f2fd" }}
              onClick={() => navigate(`/edit-site/${fountain.id}`)}
              aria-label="Edit Fountain"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
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
  );
}
