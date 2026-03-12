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
import { RefillOvalIcon } from "../assets/icons/RefillOval";
import "./FountainDetail.css";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

interface FountainDetailProps {
  fountain: Fountain;
  onBack?: () => void;
  canRefill?: boolean;
  isLogging?: boolean;
  nearbyFountainId?: string;
  userPos?: [number, number] | null;
  /** Called whenever proximity/state changes so the parent can render the button above the sheet */
  onRefillReady?: (state: { canRefill: boolean; isLogging: boolean; logRefill: () => void }) => void;
}

function FountainDetail({ fountain, onBack, canRefill, isLogging, nearbyFountainId, userPos, onRefillReady }: FountainDetailProps) {
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

  // Track local fountain state to update ID after OSM sync
  const [localFountain, setLocalFountain] = useState(fountain);

  useEffect(() => {
    setLocalFountain(fountain);
  }, [fountain]);

  // Helper to sync OSM fountain to DB if needed
  const syncOSMIfRequired = async (): Promise<string> => {
    const idStr = localFountain.id.toString();
    // If ID is a UUID (contains -) and doesn't start with - (negative OSM ID)
    if (idStr.includes("-") && !idStr.startsWith("-")) {
      return idStr;
    }

    const osmNodeId = Math.abs(parseInt(idStr, 10));
    if (isNaN(osmNodeId)) return idStr;

    try {
      console.log("🔄 Syncing OSM node to DB:", osmNodeId);
      const res = await fetch(`${API_BASE}/api/fountains/by-osm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          osmNodeId,
          name: localFountain.name,
          latitude: localFountain.latitude,
          longitude: localFountain.longitude,
        }),
      });

      if (res.ok) {
        const syncedFountain = await res.json();
        console.log("✅ OSM node synced. New ID:", syncedFountain.id);
        setLocalFountain((prev) => ({ ...prev, id: syncedFountain.id }));
        return syncedFountain.id;
      }
    } catch (error) {
      console.error("❌ Error syncing OSM fountain:", error);
    }
    return idStr;
  };

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

  // In-Place Refill Logging state
  const [isLoggingRefill, setIsLoggingRefill] = useState(false);

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

  // Fetch water quality stats with real-time updates
  useEffect(() => {
    const fetchWaterQualityStats = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/water-quality-ratings/${localFountain.id}`,
        );
        if (res.ok) {
          const stats = await res.json();
          setWaterQualityStats(stats);
        }
      } catch (error) {
        console.error("Error fetching water quality stats:", error);
      }
    };

    // Initial fetch
    fetchWaterQualityStats();

    // Auto-refresh every 5 seconds for near real-time updates
    const intervalId = setInterval(fetchWaterQualityStats, 5000);

    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchWaterQualityStats();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // BroadcastChannel for instant updates across tabs
    const channel = new BroadcastChannel("water-quality-updates");
    channel.onmessage = (event) => {
      if (event.data.fountainId === localFountain.id.toString()) {
        fetchWaterQualityStats();
      }
    };

    // Cleanup
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      channel.close();
    };
  }, [localFountain.id]);

  // Fetch user's rating if authenticated with real-time updates
  useEffect(() => {
    const fetchUserRating = async () => {
      if (!user) return;

      try {
        const res = await fetch(
          `${API_BASE}/api/water-quality-ratings/${localFountain.id}/user/${user.id}`,
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

    // Initial fetch
    fetchUserRating();

    // Auto-refresh every 5 seconds for near real-time updates
    const intervalId = setInterval(fetchUserRating, 5000);

    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchUserRating();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // BroadcastChannel for instant updates across tabs
    const channel = new BroadcastChannel("water-quality-updates");
    channel.onmessage = (event) => {
      if (event.data.fountainId === localFountain.id.toString() && event.data.userId === user?.id) {
        fetchUserRating();
      }
    };

    // Cleanup
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      channel.close();
    };
  }, [localFountain.id, user]);

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
            favorites.some((f: any) => f.fountainId === localFountain.id.toString()),
          );
          setIsSaved(
            saved.some((f: any) => f.fountainId === localFountain.id.toString()),
          );
        }
      } catch (error) {
        console.error("Error fetching interactions:", error);
      }
    };

    fetchInteractions();
  }, [localFountain.id, user]);

  const toggleInteraction = async (type: "favorite" | "save") => {
    if (!user) return; // Should be handled by UI visibility, but safeguard

    const isCurrentlyActive = type === "favorite" ? isFavorited : isSaved;
    const setIsActive = type === "favorite" ? setIsFavorited : setIsSaved;

    try {
      setIsLoadingInteractions(true);
      
      // Ensure it's in our DB first
      const activeId = await syncOSMIfRequired();

      if (isCurrentlyActive) {
        // Remove
        const res = await fetch(`${API_BASE}/api/interactions`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            fountainId: activeId,
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
            fountainId: activeId,
            interactionType: type,
            fountainName: localFountain.name,
            fountainLat: localFountain.latitude,
            fountainLon: localFountain.longitude,
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
      
      // Ensure it's in our DB first
      const activeId = await syncOSMIfRequired();

      const res = await fetch(`${API_BASE}/api/water-quality-ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          fountainId: activeId,
          qualityRating: rating,
          fountainName: localFountain.name,
          fountainLat: localFountain.latitude,
          fountainLon: localFountain.longitude,
        }),
      });

      if (res.ok) {
        setUserRating(rating);

        // Immediate refresh of stats
        const statsRes = await fetch(
          `${API_BASE}/api/water-quality-ratings/${fountain.id}`,
        );
        if (statsRes.ok) {
          const stats = await statsRes.json();
          setWaterQualityStats(stats);
        }

        // Broadcast to other tabs for instant update
        try {
          const channel = new BroadcastChannel("water-quality-updates");
          channel.postMessage({
            fountainId: fountain.id.toString(),
            userId: user.id,
            action: "rating-updated",
          });
          channel.close();
        } catch (e) {
          console.error("BroadcastChannel not supported:", e);
        }
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleLogRefill = async () => {
    if (!user || isLoggingRefill) return;
    setIsLoggingRefill(true);
    try {
      const response = await fetch(`${API_BASE}/api/refills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: user.id,
          waterSourceId: localFountain.id.toString()
        }),
      });
      
      if (response.ok) {
        console.log("Refill logged in-place:", localFountain.name);
        alert(t.refillLoggedSuccess);
      } else {
        alert(t.refillLoggedError);
      }
    } catch (err) {
      console.error('Error logging refill in-place:', err);
      alert(t.refillLoggedError);
    } finally {
      setIsLoggingRefill(false);
    }
  };

  // Compute distance to this fountain if userPos is available
  const [distMeters, setDistMeters] = useState<number | null>(null);

  useEffect(() => {
    if (userPos) {
      const R = 6371e3; // metres
      const lat1 = (userPos[0] * Math.PI) / 180;
      const lat2 = (fountain.latitude * Math.PI) / 180;
      const deltaLat = ((fountain.latitude - userPos[0]) * Math.PI) / 180;
      const deltaLon = ((fountain.longitude - userPos[1]) * Math.PI) / 180;

      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c;
      setDistMeters(d);
    } else {
      setDistMeters(null);
    }
  }, [userPos, fountain.latitude, fountain.longitude]);

  // Proximity logic:
  // Show if either the parent says we are near (proactive) OR if we compute we are near.
  const isCloseEnoughToLog = (canRefill && fountain.id.toString() === nearbyFountainId) || (distMeters !== null && distMeters <= 500);
  const isLoggingRefillLocal = isLogging ?? isLoggingRefill;

  useEffect(() => {
    onRefillReady?.({
      canRefill: Boolean(isCloseEnoughToLog),
      isLogging: isLoggingRefillLocal,
      logRefill: handleLogRefill,
    });
  }, [isCloseEnoughToLog, isLoggingRefillLocal, fountain.id]);

  return (
    <div className="fountain-detail">
      <div className="fountain-detail-container">
        <div className="fountain-detail-map-container">
          <FountainDetailMap fountain={localFountain} />

          {/* Desktop only: refill button floats in the map overlay */}
          {isCloseEnoughToLog && (
            <div className="fountain-detail-map-overlay">
              <button
                className={`fountain-detail-log-refill fountain-detail-log-refill--desktop${isLoggingRefillLocal ? ' logging' : ''}`}
                onClick={handleLogRefill}
                disabled={isLoggingRefillLocal}
                aria-label={t.logRefillHere}
                title={t.logRefillHere}
              >
                <RefillOvalIcon />
              </button>
            </div>
          )}
        </div>
        
        <div className="fountain-detail-content">
          <FountainDetailHeader
            fountain={localFountain}
            user={user}
            isFavorited={isFavorited}
            isSaved={isSaved}
            isLoadingInteractions={isLoadingInteractions}
            toggleInteraction={toggleInteraction}
            onBack={onBack}
          />

          <FountainDetailMeta fountain={localFountain} />

        {localFountain.images && localFountain.images.length > 0 && (
          <div className="fountain-detail-images">
            {localFountain.images.map((image, index) => (
              <div
                key={index}
                className="detail-image"
                onClick={() => openLightbox(index)}
                style={{ cursor: "pointer" }}
              >
                <img src={image} alt={`${localFountain.name} ${index + 1}`} />
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

        {localFountain.description && (
          <div className="fountain-detail-section">
            <h3 className="section-title">{t.description}</h3>
            <p className="section-text">
              {isTranslating
                ? `${t.loading}`
                : translatedDescription || localFountain.description}
            </p>
          </div>
        )}

        {localFountain.distance && (
          <div className="fountain-detail-section">
            <h3 className="section-title">{t.distance}</h3>
            <p className="section-text">{localFountain.distance}</p>
          </div>
        )}
      </div></div>

      {expandedImageIndex !== null && localFountain.images && (
        <FountainDetailLightbox
          images={localFountain.images}
          expandedImageIndex={expandedImageIndex}
          fountainName={localFountain.name}
          closeLightbox={closeLightbox}
          nextImage={nextImage}
          prevImage={prevImage}
        />
      )}
    </div>
  );
}

export default FountainDetail;
