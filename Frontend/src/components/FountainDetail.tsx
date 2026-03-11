import { useState, useEffect } from "react";
import type { Fountain } from "../types/fountain";
import { useTranslation } from "../i18n";
import { useAppSettings } from "../context/AppSettingsContext";
import { useAuth } from "../context/AuthContext";
import { translateText } from "../services/translationService";
import { FountainDetailMap } from "./FountainDetail/FountainDetailMap";
import { FountainDetailHeader } from "./FountainDetail/FountainDetailHeader";
import { FountainDetailMeta } from "./FountainDetail/FountainDetailMeta";
import { FountainDetailRating } from "./FountainDetail/FountainDetailRating";
import { FountainDetailLightbox } from "./FountainDetail/FountainDetailLightbox";
import "./FountainDetail.css";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

interface FountainDetailProps {
  fountain: Fountain;
  onBack?: () => void;
}

function FountainDetail({ fountain, onBack }: FountainDetailProps) {
  const { user } = useAuth();

  const t = useTranslation();
  const { language } = useAppSettings();
  const [translatedDescription, setTranslatedDescription] = useState(
    fountain.description || "",
  );
  const [isTranslating, setIsTranslating] = useState(false);
  const [expandedImageIndex, setExpandedImageIndex] = useState<number | null>(
    null,
  );

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
    document.body.style.overflow = "hidden";
    document.body.classList.add("lightbox-open");
  };

  const closeLightbox = () => {
    setExpandedImageIndex(null);
    document.body.style.overflow = "";
    document.body.classList.remove("lightbox-open");
  };

  const nextImage = () => {
    if (fountain.images && expandedImageIndex !== null) {
      setExpandedImageIndex((expandedImageIndex + 1) % fountain.images.length);
    }
  };

  const prevImage = () => {
    if (fountain.images && expandedImageIndex !== null) {
      setExpandedImageIndex(
        expandedImageIndex === 0
          ? fountain.images.length - 1
          : expandedImageIndex - 1,
      );
    }
  };

  // Clean up body overflow on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("lightbox-open");
    };
  }, []);

  useEffect(() => {
    const translateDescription = async () => {
      if (!fountain.description) {
        setTranslatedDescription("");
        return;
      }

      console.log("🌍 Current language:", language);
      console.log("📝 Original description:", fountain.description);

      // Si el idioma es español, usar la descripción original (las descripciones están en español)
      if (language === "es") {
        setTranslatedDescription(fountain.description);
        console.log("✅ Using original Spanish description");
        return;
      }

      // Iniciar traducción desde español al idioma seleccionado
      setIsTranslating(true);
      console.log(`🔄 Translating from Spanish to ${language}...`);

      try {
        const translated = await translateText(
          fountain.description,
          language,
          "es",
        );
        console.log("✅ Translation result:", translated);
        setTranslatedDescription(translated);
      } catch (error) {
        console.error("❌ Translation failed:", error);
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
        const res = await fetch(
          `${API_BASE}/api/water-quality-ratings/${fountain.id}`,
        );
        if (res.ok) {
          const stats = await res.json();
          setWaterQualityStats(stats);
        }
      } catch (error) {
        console.error("Error fetching water quality stats:", error);
      }
    };

    fetchWaterQualityStats();
  }, [fountain.id]);

  // Fetch user's rating if authenticated
  useEffect(() => {
    const fetchUserRating = async () => {
      if (!user) return;

      try {
        const res = await fetch(
          `${API_BASE}/api/water-quality-ratings/${fountain.id}/user/${user.id}`,
        );
        if (res.ok) {
          const rating = await res.json();
          setUserRating(rating.qualityRating);
        } else if (res.status === 404) {
          // User hasn't rated yet
          setUserRating(null);
        }
      } catch (error) {
        console.error("Error fetching user rating:", error);
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
          fetch(`${API_BASE}/api/interactions/save?userId=${user.id}`),
        ]);

        if (favRes.ok && saveRes.ok) {
          const favorites = await favRes.json();
          const saved = await saveRes.json();

          setIsFavorited(
            favorites.some((f: any) => f.fountainId === fountain.id.toString()),
          );
          setIsSaved(
            saved.some((f: any) => f.fountainId === fountain.id.toString()),
          );
        }
      } catch (error) {
        console.error("Error fetching interactions:", error);
      }
    };

    fetchInteractions();
  }, [fountain.id, user]);

  const toggleInteraction = async (type: "favorite" | "save") => {
    if (!user) return; // Should be handled by UI visibility, but safeguard

    const isCurrentlyActive = type === "favorite" ? isFavorited : isSaved;
    const setIsActive = type === "favorite" ? setIsFavorited : setIsSaved;

    try {
      setIsLoadingInteractions(true);
      if (isCurrentlyActive) {
        // Remove
        const res = await fetch(`${API_BASE}/api/interactions`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            fountainId: fountain.id,
            interactionType: type,
          }),
        });
        if (res.ok) setIsActive(false);
      } else {
        // Add
        const res = await fetch(`${API_BASE}/api/interactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            fountainId: fountain.id,
            interactionType: type,
            fountainName: fountain.name,
            fountainLat: fountain.latitude,
            fountainLon: fountain.longitude,
          }),
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
      console.warn("User must be logged in to rate");
      return;
    }

    try {
      setIsSubmittingRating(true);
      const res = await fetch(`${API_BASE}/api/water-quality-ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          fountainId: fountain.id,
          qualityRating: rating,
          fountainName: fountain.name,
          fountainLat: fountain.latitude,
          fountainLon: fountain.longitude,
        }),
      });

      if (res.ok) {
        setUserRating(rating);

        // Refresh stats
        const statsRes = await fetch(
          `${API_BASE}/api/water-quality-ratings/${fountain.id}`,
        );
        if (statsRes.ok) {
          const stats = await statsRes.json();
          setWaterQualityStats(stats);
        }
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div className="fountain-detail">
      <FountainDetailMap fountain={fountain} />

      <div className="fountain-detail-content">
        <FountainDetailHeader
          fountain={fountain}
          user={user}
          isFavorited={isFavorited}
          isSaved={isSaved}
          isLoadingInteractions={isLoadingInteractions}
          toggleInteraction={toggleInteraction}
          onBack={onBack}
        />

        <FountainDetailMeta fountain={fountain} />

        {fountain.images && fountain.images.length > 0 && (
          <div className="fountain-detail-images">
            {fountain.images.map((image, index) => (
              <div
                key={index}
                className="detail-image"
                onClick={() => openLightbox(index)}
                style={{ cursor: "pointer" }}
              >
                <img src={image} alt={`${fountain.name} ${index + 1}`} />
              </div>
            ))}
          </div>
        )}

        <FountainDetailRating
          user={user}
          userRating={userRating}
          waterQualityStats={waterQualityStats}
          isSubmittingRating={isSubmittingRating}
          handleRating={handleRating}
        />

        {fountain.description && (
          <div className="fountain-detail-section">
            <h3 className="section-title">{t.description}</h3>
            <p className="section-text">
              {isTranslating
                ? `${t.loading}`
                : translatedDescription || fountain.description}
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

      {expandedImageIndex !== null && fountain.images && (
        <FountainDetailLightbox
          images={fountain.images}
          expandedImageIndex={expandedImageIndex}
          fountainName={fountain.name}
          closeLightbox={closeLightbox}
          nextImage={nextImage}
          prevImage={prevImage}
        />
      )}
    </div>
  );
}

export default FountainDetail;
