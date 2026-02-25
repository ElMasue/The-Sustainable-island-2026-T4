import { useRef, useEffect } from 'react';
import MapboxMap, { Marker, Popup } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import type { Fountain } from '../types/fountain';
import userPinIcon from '../assets/icons/UserPin.svg';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css';

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

  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_token_here') {
    return (
      <div className="map-container map-container--error">
        <p className="map-container--error-title">Mapbox token needed</p>
        <ol className="map-container--error-steps">
          <li>Create <code>.env.local</code> in the <strong>Frontend</strong> folder (same folder as <code>package.json</code>).</li>
          <li>Add one line: <code>VITE_MAPBOX_ACCESS_TOKEN=pk.your_real_token</code></li>
          <li>Get a token at <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noreferrer">account.mapbox.com</a></li>
          <li><strong>Restart the dev server</strong> (stop with Ctrl+C, then run <code>npm run dev</code> again).</li>
        </ol>
      </div>
    );
  }

  const [lat, lng] = center;

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
