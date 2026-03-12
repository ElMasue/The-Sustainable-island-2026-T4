import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BottomSheet,
  FountainDetail,
  FountainsList,
  Map,
  ProfileMenu,
  RefillSearchBar,
  SidePanel,
  UserButton,
} from '../components';
import { RefillOvalIcon } from '../assets/icons/RefillOval';
import type { Fountain } from '../types/fountain';
import { useAuth } from '../context/AuthContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { calculateDistance, formatDistance } from '../utils/distance';
import './Home.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

type SheetContent = 'list' | 'detail' | 'profile';

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, avatarUrl } = useAuth();
  const [fountains, setFountains] = useState<Fountain[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedFountain, setSelectedFountain] = useState<Fountain | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined);
  const [mapZoom, setMapZoom] = useState<number>(13);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 200);
    return () => clearTimeout(handler);
  }, [searchQuery]);
  const { userPos, accuracy, geoStatus, startWatching } = useGeolocation();

  // Memoized fountains with search filtering and sorting by proximity
  const displayFountains = useMemo(() => {
    let result = [...fountains];

    // 1. Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(f => 
        f.name.toLowerCase().includes(query) || 
        (f.category && f.category.toLowerCase().includes(query)) ||
        (f.description && f.description.toLowerCase().includes(query))
      );
    }

    // 2. Map distances and sort
    const withDistance = result.map((f) => {
      const d = userPos 
        ? calculateDistance(userPos[0], userPos[1], f.latitude, f.longitude)
        : null;
      return {
        ...f,
        distanceMeters: d,
        distance: d !== null ? formatDistance(d) : undefined,
      };
    });

    if (userPos) {
      withDistance.sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
    }

    return withDistance;
  }, [fountains, userPos, searchQuery]);

  // Suggestions for the floating dropdown
  const searchSuggestions = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return [];
    
    // Use the already filtered/sorted displayFountains but limit to 5
    return displayFountains.slice(0, 5);
  }, [displayFountains, debouncedSearchQuery]);

  const handleFountainClick = useCallback((fountain: Fountain) => {
    setSelectedFountain(fountain);
    setSheetContent('detail');
    setCurrentSnap(1);
  }, []);

  const handleSuggestionClick = useCallback((fountain: Fountain) => {
    setSearchQuery('');
    setIsSearchFocused(false);
    setMapCenter([fountain.latitude, fountain.longitude]);
    setMapZoom(16);
    handleFountainClick(fountain);
  }, [handleFountainClick]);

  // fetch list from backend
  const fetchFountains = useCallback((lat?: number, lon?: number) => {
    const queryParams = new URLSearchParams();
    if (lat !== undefined && lon !== undefined) {
      queryParams.append('lat', lat.toString());
      queryParams.append('lon', lon.toString());
    }
    
    const queryString = queryParams.toString();
    const url = `${API_BASE}/api/fountains${queryString ? `?${queryString}` : ''}`;
    console.log('Fetching fountains from:', url);
    
    fetch(url)
      .then((res) => {
        console.log('Home.tsx: fetch response status:', res.status);
        return res.json();
      })
      .then((data: Fountain[]) => {
        console.log('Home.tsx: fetched fountains count:', data.length);
        // MERGE logic: Keep existing fountains and add new ones, avoiding duplicates by ID
        setFountains(prev => {
          const merged: Record<string, Fountain> = {};
          // First add existing ones
          prev.forEach(f => {
            merged[f.id] = f;
          });
          // Then add/overwrite with new ones
          data.forEach(f => {
            merged[f.id] = f;
          });
          return Object.values(merged);
        });
      })
      .catch((err) => {
        console.error('Home.tsx: failed to load fountains', err);
      });
  }, [API_BASE]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchFountains(latitude, longitude);
          if (!mapCenter) setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.warn('Geolocation error in Home, falling back to default:', error.message);
          fetchFountains(); // fallback without coordinates
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    } else {
      fetchFountains(); // fallback if geolocation not supported
    }
  }, [fetchFountains]); // Run once on mount

  const handleCountrySelect = useCallback((country: any) => {
    setMapCenter(country.coords);
    setMapZoom(country.zoom);
    fetchFountains(country.coords[0], country.coords[1]);
  }, [fetchFountains]);
  const [sheetContent, setSheetContent] = useState<SheetContent>('list');
  const [currentSnap, setCurrentSnap] = useState(0);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  // Open profile menu if navigating back from My Fountains
  useEffect(() => {
    if (location.state?.openProfile) {
      setSheetContent('profile');
      setCurrentSnap(1);
      // Clear the state to avoid reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const [refillState, setRefillState] = useState<{
    canRefill: boolean;
    isLogging: boolean;
    logRefill: (fountainIdOverride?: string) => void;
    nearbyFountainId?: string;
  } | null>(null);

  const SNAP_POINTS = [35, 60, 90];

  const handleLogRefill = async (fountainId: string) => {
    if (!user || refillState?.isLogging) return;
    setRefillState(prev => prev ? { ...prev, isLogging: true } : null);
    try {
      const response = await fetch(`${API_BASE}/api/refills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: user?.id,
          waterSourceId: fountainId
        }),
      });
      
      if (response.ok) {
        alert('Refill logged successfully!');
      } else {
        alert('Error logging refill.');
      }
    } catch (err) {
      console.error('Error logging refill:', err);
      alert('Error logging refill.');
    } finally {
      setRefillState(prev => prev ? { ...prev, isLogging: false } : null);
    }
  };

  // Proactive proximity check
  useEffect(() => {
    if (!userPos || fountains.length === 0) return;

    const R = 6371e3; // metres
    const lat1 = (userPos[0] * Math.PI) / 180;

    let nearestFountain: Fountain | null = null;
    let minDistance = 501; // Only care if <= 500m

    fountains.forEach(f => {
      const lat2 = (f.latitude * Math.PI) / 180;
      const deltaLat = ((f.latitude - userPos[0]) * Math.PI) / 180;
      const deltaLon = ((f.longitude - userPos[1]) * Math.PI) / 180;

      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c;

      if (d < minDistance) {
        minDistance = d;
        nearestFountain = f;
      }
    });

    if (nearestFountain) {
      const fountainId = (nearestFountain as Fountain).id.toString();
      setRefillState({
        canRefill: true,
        isLogging: refillState?.isLogging || false,
        logRefill: (id) => handleLogRefill(id || fountainId),
        nearbyFountainId: fountainId
      });
    } else if (!selectedFountain) {
      // Clear proactive refill state if no fountain is nearby and none selected
      setRefillState(null);
    }
  }, [userPos, fountains, user?.id]);

  const handleSheetSnapChange = (snapIndex: number) => {
    setCurrentSnap(snapIndex);
  };

  const handleMapClick = () => {
    setCurrentSnap(0);
    if (sheetContent === 'detail') {
      setSheetContent('list');
      setSelectedFountain(null);
    } else if (sheetContent === 'profile') {
      setSheetContent('list');
    }
  };

  const handleUserClick = () => {
    setSheetContent('profile');
    setCurrentSnap(1);
  };

  const handleBackToList = () => {
    setSheetContent('list');
    setSelectedFountain(null);
    setCurrentSnap(0);
    setRefillState(null);
  };

  const panelContent = (
    <>
      {sheetContent === 'list' ? (
        <FountainsList fountains={displayFountains} onFountainClick={handleFountainClick} />
      ) : sheetContent === 'detail' ? (
        selectedFountain && <FountainDetail
          fountain={selectedFountain}
          onBack={handleBackToList}
          onRefillReady={(data) => setRefillState(prev => prev ? { ...prev, ...data } : (data as any))}
          canRefill={refillState?.canRefill}
          isLogging={refillState?.isLogging}
          nearbyFountainId={refillState?.nearbyFountainId}
          userPos={userPos}
        />
      ) : (
        <ProfileMenu 
          onClose={() => setSheetContent('list')} 
          onSelectFountain={handleFountainClick}
        />
      )}
    </>
  );

  return (
    <div className={`home ${isPanelCollapsed ? 'home--panel-collapsed' : ''}`}>
      {/* Mobile: Search bar and user button floating on map */}
      <div className="home__mobile-header">
        <RefillSearchBar 
          value={searchQuery} 
          onChange={setSearchQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          suggestions={isSearchFocused ? searchSuggestions : []}
          onSuggestionClick={handleSuggestionClick}
          onCountrySelect={handleCountrySelect}
        />
        <UserButton onClick={handleUserClick} avatarUrl={avatarUrl} />
      </div>

      {/* Desktop: Side panel with search, user button, and content */}
      <SidePanel isCollapsed={isPanelCollapsed}>
        <div className="home__desktop-header">
          <div className="home__desktop-header-top">
            <h1 className="home__desktop-title">Nuevo nombre</h1>
            <UserButton onClick={handleUserClick} avatarUrl={avatarUrl} />
          </div>
          <RefillSearchBar 
            value={searchQuery} 
            onChange={setSearchQuery} 
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            suggestions={isSearchFocused ? searchSuggestions : []}
            onSuggestionClick={handleSuggestionClick}
            onCountrySelect={handleCountrySelect}
          />
        </div>
        {sheetContent === 'profile' && (
          <button className="home__back-button" onClick={handleBackToList}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to list
          </button>
        )}
        <div className="home__desktop-content">
          {panelContent}
        </div>
      </SidePanel>

      {/* Desktop: Toggle panel button (always visible, outside panel) */}
      <button
        className="panel-toggle-btn"
        onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
        aria-label={isPanelCollapsed ? 'Expand side panel' : 'Collapse side panel'}
        title={isPanelCollapsed ? 'Expand side panel' : 'Collapse side panel'}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {isPanelCollapsed ? (
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          ) : (
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          )}
        </svg>
      </button>

      {/* Map */}
      <Map
        fountains={fountains}
        selectedFountain={selectedFountain}
        center={mapCenter}
        zoom={mapZoom}
        onMapClick={handleMapClick}
        onFountainClick={handleFountainClick}
        userPos={userPos}
        accuracy={accuracy}
        geoStatus={geoStatus}
        onLocateMe={startWatching}
      />

      {/* Mobile only: Refill button floats whenever canRefill is true */}
      {refillState?.canRefill && (
        <div
          className="home__refill-above-sheet"
          style={{ bottom: `${SNAP_POINTS[currentSnap]}vh` }}
        >
          <button
            className={`fountain-detail-log-refill${refillState.isLogging ? ' logging' : ''}`}
            onClick={() => refillState.logRefill()}
            disabled={refillState.isLogging}
            aria-label="Log refill here"
          >
            <RefillOvalIcon />
          </button>
        </div>
      )}

      {/* Mobile: Bottom sheet */}
      <BottomSheet
        snapPoints={SNAP_POINTS}
        defaultSnap={currentSnap}
        onSnapChange={handleSheetSnapChange}
      >
        {panelContent}
      </BottomSheet>

      {/* Floating Action Button for adding new site */}
      <button
        className="add-site-fab"
        onClick={() => navigate('/add-site')}
        aria-label="Add new site"
        title="Add new site"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
  );
}

export default Home;
