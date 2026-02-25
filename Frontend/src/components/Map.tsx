import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import type { Fountain } from '../types/fountain';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// Custom icon for water fountains
const fountainIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapProps {
  fountains: Fountain[];
  center?: [number, number];
  zoom?: number;
  selectedFountain?: Fountain | null;
  onMapClick?: () => void;
}

// Component to handle map movements
function MapController({ selectedFountain }: { selectedFountain?: Fountain | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedFountain) {
      map.flyTo([selectedFountain.latitude, selectedFountain.longitude], 16, {
        duration: 1.5
      });
    }
  }, [selectedFountain, map]);

  return null;
}

// Component to handle map events
function MapEventHandler({ onMapClick }: { onMapClick?: () => void }) {
  useMapEvents({
    click: () => {
      onMapClick?.();
    }
  });

  return null;
}

const Map = ({ fountains, center = [28.1235, -15.4363], zoom = 13, selectedFountain, onMapClick }: MapProps) => {
  return (
    <div className="map-container">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController selectedFountain={selectedFountain} />
        <MapEventHandler onMapClick={onMapClick} />
        {fountains.map((fountain) => (
          <Marker 
            key={fountain.id} 
            position={[fountain.latitude, fountain.longitude]}
            icon={fountainIcon}
          >
            <Popup>
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
      </MapContainer>
    </div>
  );
};

export default Map;
