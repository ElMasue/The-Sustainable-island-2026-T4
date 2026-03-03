import { useRef, useEffect } from 'react';
// Mapbox for the primary implementation
import MapboxMap, { Marker, Popup } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';

// Leaflet for fallback when the Mapbox token is missing
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import type { Fountain } from '../types/fountain';
import userPinIcon from '../assets/icons/UserPin.svg';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css';

// simple wrapper that initializes a Leaflet map into a div. used when
// there is no Mapbox token so we can use OpenStreetMap tiles instead.
interface LeafletMapProps {
  fountains: Fountain[];
  center: [number, number];
  zoom: number;
  onMapClick?: () => void;
}

function LeafletMap({ fountains, center, zoom, onMapClick }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current).setView([center[0], center[1]], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    }).addTo(map);

    const fountainIcon = new L.Icon({
      iconUrl: userPinIcon,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    fountains.forEach((f) => {
      const marker = L.marker([f.latitude, f.longitude], { icon: fountainIcon }).addTo(map);
      const popupHtml = `
        <div class="fountain-popup">
          <h3>${f.name}</h3>
          ${f.description ? `<p>${f.description}</p>` : ''}
          <span class="${f.isOperational ? 'status-active' : 'status-inactive'}">
            ${f.isOperational ? '✓ Operational' : '✗ Not operational'}
          </span>
        </div>
      `;
      marker.bindPopup(popupHtml, { closeOnClick: false, autoClose: false });
    });

    map.on('click', () => {
      onMapClick?.();
    });

    return () => {
      map.remove();
    };
  }, [fountains, center, zoom, onMapClick]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

// Set only in .env.local (never commit). Leave unset in deployed previews to avoid using quota.
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface MapProps {
  fountains: Fountain[];
  center?: [number, number];
  zoom?: number;
  selectedFountain?: Fountain | null;
  onMapClick?: () => void;
}

// [latitude, longitude] to match rest of app
const DEFAULT_CENTER: [number, number] = [28.1235, -15.4363];
const DEFAULT_ZOOM = 13;

function Map({
  fountains,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  selectedFountain,
  onMapClick,
}: MapProps) {
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if (selectedFountain && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedFountain.longitude, selectedFountain.latitude],
        zoom: 16,
        duration: 1500,
      });
    }
  }, [selectedFountain]);

  const [lat, lng] = center;

  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_token_here') {
    // No Mapbox token – render an OpenStreetMap/Leaflet map instead.
    // This keeps the app usable in previews or when the token is intentionally omitted.
    // LeafletMap component handles its own initialization; we just pass props.
    return (
      <div className="map-container">
        <LeafletMap
          fountains={fountains}
          center={[lat, lng]}
          zoom={zoom}
          onMapClick={onMapClick}
        />
        <div className="map-container--error">
          <p className="map-container--error-title">
            Mapbox token missing – using OpenStreetMap
          </p>
          <p>
            The app detected that no Mapbox access token was configured. An
            OpenStreetMap map is shown instead; you can still add a token later
            in <code>.env.local</code> to restore Mapbox.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      <MapboxMap
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: lng,
          latitude: lat,
          zoom,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/standard"
        onLoad={(e) => {
          const map = e.target;
          if (typeof map.setConfigProperty === 'function') {
            map.setConfigProperty('basemap', 'theme', 'faded');
            map.setConfigProperty('basemap', 'lightPreset', 'night');
          }
        }}
        onClick={() => onMapClick?.()}
      >
        {fountains.map((fountain) => (
          <Marker
            key={fountain.id}
            longitude={fountain.longitude}
            latitude={fountain.latitude}
            anchor="bottom"
          >
            <img src={userPinIcon} alt="" className="map-marker-icon" />
            <Popup
              longitude={fountain.longitude}
              latitude={fountain.latitude}
              anchor="bottom"
              closeButton
              closeOnClick={false}
            >
              <div className="fountain-popup">
                <h3>{fountain.name}</h3>
                {fountain.description && <p>{fountain.description}</p>}
                <span className={fountain.isOperational ? 'status-active' : 'status-inactive'}>
                  {fountain.isOperational ? '✓ Operational' : '✗ Not operational'}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapboxMap>
    </div>
  );
}

export default Map;
