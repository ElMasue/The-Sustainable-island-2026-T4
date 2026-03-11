import { useRef, useEffect, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import type { Fountain } from '../types/fountain';
import { useTranslation } from '../i18n';
import userPinIcon from '../assets/icons/UserPin.svg';
import userPinBlueIcon from '../assets/icons/UserPinBlue.svg';
import './Map.css';

interface MapProps {
  fountains: Fountain[];
  center?: [number, number];
  zoom?: number;
  selectedFountain?: Fountain | null;
  onMapClick?: () => void;
  onFountainClick?: (fountain: Fountain) => void;
}

// [latitude, longitude] to match rest of app
const DEFAULT_CENTER: [number, number] = [28.1235, -15.4363];
const DEFAULT_ZOOM = 13;

// ── User location dot icon ──────────────────────────────────────
const USER_LOCATION_HTML = `
  <div class="user-marker-container">
    <div class="user-direction-indicator">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0 L32 20 L20 16 L8 20 Z" fill="url(#cone-grad)" />
        <defs>
          <linearGradient id="cone-grad" x1="20" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
            <stop stop-color="#4A90E2" stop-opacity="0.8"/>
            <stop offset="1" stop-color="#4A90E2" stop-opacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
    <div class="user-location-outer">
      <div class="user-location-inner"></div>
    </div>
  </div>`;

const userLocationIcon = L.divIcon({
  className: '',
  html: USER_LOCATION_HTML,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// ── Geolocation options (max precision) ─────────────────────────
const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 5_000,   // use cached fix if <5 s old
  timeout: 15_000,
};

function Map({
  fountains,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  selectedFountain,
  onMapClick,
  onFountainClick,
}: MapProps) {
  const t = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  // Refs for user-location layer so we can update without rebuilding the map
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);

  const [geoStatus, setGeoStatus] = useState<'idle' | 'watching' | 'denied'>('idle');
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const fountainsLayerRef = useRef<L.LayerGroup | null>(null);

  // ── Build / tear-down the map (runs ONCE) ─────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    const map = L.map(containerRef.current, {
      preferCanvas: false // Force SVG so our classNames work on circles
    }).setView(center, zoom);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    fountainsLayerRef.current = L.layerGroup().addTo(map);

    map.on('click', () => {
      onMapClick?.();
    });

    return () => {
      mapInstanceRef.current = null;
      fountainsLayerRef.current = null;
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render Fountains (runs when fountains change) ─────────────
  useEffect(() => {
    const layer = fountainsLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    const osmFountainIcon = new L.Icon({
      iconUrl: userPinIcon, // Orange
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    const dbFountainIcon = new L.Icon({
      iconUrl: userPinBlueIcon, // Blue
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    fountains.forEach((f) => {
      const isOSM = typeof f.id === 'string' ? (f.id as string).startsWith('-') : f.id < 0;
      const markerIcon = isOSM ? osmFountainIcon : dbFountainIcon;

      const marker = L.marker([f.latitude, f.longitude], { icon: markerIcon });
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onFountainClick?.(f);
      });
      layer.addLayer(marker);
    });
  }, [fountains, onFountainClick, t]);

  // ── Update user-location layer when position changes ──────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userPos) return;

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker(userPos, {
        icon: userLocationIcon,
        zIndexOffset: 1000,
      }).addTo(map);
    } else {
      userMarkerRef.current.setLatLng(userPos);
    }
  }, [userPos]);

  // ── Fly to selected fountain ───────────────────────────────────
  useEffect(() => {
    if (selectedFountain && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [selectedFountain.latitude, selectedFountain.longitude],
        16,
        { duration: 1.5 }
      );
    }
  }, [selectedFountain]);

  // ── Start / stop watchPosition ─────────────────────────────────
  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus('denied');
      return;
    }
    setGeoStatus('watching');

    const onSuccess = (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const accuracy = pos.coords.accuracy; // metres

      setUserPos([lat, lon]);

      const map = mapInstanceRef.current;
      if (!map) return;

      // Update / create accuracy circle
      if (!accuracyCircleRef.current) {
        accuracyCircleRef.current = L.circle([lat, lon], {
          radius: accuracy,
          color: '#4A90E2',
          fillColor: '#4A90E2',
          fillOpacity: 0.12,
          weight: 1,
          className: 'accuracy-circle',
        }).addTo(map);
      } else {
        accuracyCircleRef.current.setLatLng([lat, lon]);
        accuracyCircleRef.current.setRadius(accuracy);
      }
    };

    const onError = (err: GeolocationPositionError) => {
      console.warn('[Geo] error', err.code, err.message);
      if (err.code === err.PERMISSION_DENIED) setGeoStatus('denied');
    };

    // First get a fast fix, then watch for updates
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onSuccess(pos);
        // Fly to user once on first fix
        mapInstanceRef.current?.flyTo(
          [pos.coords.latitude, pos.coords.longitude],
          15,
          { duration: 1.2 }
        );
      },
      onError,
      GEO_OPTIONS
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      GEO_OPTIONS
    );
  }, []);

  // Auto-start on mount so the user sees their position immediately
  useEffect(() => {
    startWatching();
    return () => {
      if (watchIdRef.current !== null) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [startWatching]);

  // ── Device Orientation for Compass ──────────────────────────────
  useEffect(() => {
    if (geoStatus !== 'watching') return;

    const handleOrientation = (event: any) => {
      let heading: number | null = null;
      if (typeof event.webkitCompassHeading === 'number') {
        // iOS
        heading = event.webkitCompassHeading;
      } else if (event.absolute && event.alpha !== null) {
        // Android (alpha is 0 at north and increases counterclockwise in some configs, or clockwise in others. Usually 360 - alpha is correct for absolute CSS rotation)
        heading = 360 - event.alpha;
      } else if (!event.absolute && event.alpha !== null) {
        // Android fallback (relative orientation, might not point north)
        heading = 360 - event.alpha;
      }

      if (heading !== null && userMarkerRef.current) {
        const el = userMarkerRef.current.getElement();
        if (el) {
          const indicator = el.querySelector('.user-direction-indicator') as HTMLElement;
          if (indicator) {
            indicator.style.transform = `rotate(${heading}deg)`;
            indicator.style.opacity = '1';
          }
        }
      }
    };

    // Note: deviceorientation requires HTTPS on most modern mobile browsers
    if (window.isSecureContext === false) {
      console.warn('Compass direction requires HTTPS (secure context). It will not work on HTTP local network.');
    }

    window.addEventListener('deviceorientationabsolute', handleOrientation);
    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [geoStatus]);

  // ── Fly to current user position when user presses the button ──
  const handleLocateClick = async () => {
    // Request permission for iOS 13+ devices
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState !== 'granted') {
          console.warn('Device orientation permission denied');
        }
      } catch (e) {
        console.error('Error requesting orientation permission', e);
      }
    }

    if (geoStatus === 'denied') return;

    if (geoStatus === 'idle') {
      startWatching();
      return;
    }

    // Already watching — just fly to current position
    if (userPos && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(userPos, 16, { duration: 1.0 });
    }
  };

  return (
    <div className="map-container">
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Locate-me button */}
      <button
        className={`map-locate-btn${geoStatus === 'watching' && userPos ? ' map-locate-btn--active' : ''}${geoStatus === 'denied' ? ' map-locate-btn--denied' : ''}`}
        onClick={handleLocateClick}
        title={
          geoStatus === 'denied'
            ? t.locationDenied
            : geoStatus === 'watching'
            ? t.goToMyLocation
            : t.enableLocation
        }
        aria-label={t.goToMyLocation}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          <path d="M12 1v2M12 21v2M1 12h2M21 12h2" opacity="0.4" />
        </svg>
      </button>
    </div>
  );
}

export default Map;
