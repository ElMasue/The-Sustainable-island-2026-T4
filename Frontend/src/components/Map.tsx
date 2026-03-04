import { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import type { Fountain } from '../types/fountain';
import userPinIcon from '../assets/icons/UserPin.svg';
import './Map.css';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Initialize map only once
  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    const map = L.map(containerRef.current).setView([center[0], center[1]], zoom);
    mapInstanceRef.current = map;
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    }).addTo(map);

    map.on('click', () => {
      onMapClick?.();
    });

    return () => {
      mapInstanceRef.current = null;
      map.remove();
    };
  }, []); // Only run once

  // Update markers when fountains change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const fountainIcon = new L.Icon({
      iconUrl: userPinIcon,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    fountains.forEach((f) => {
      const marker = L.marker([f.latitude, f.longitude], { icon: fountainIcon }).addTo(mapInstanceRef.current!);
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
      markersRef.current.push(marker);
    });
  }, [fountains]);

  // Handle selected fountain changes
  useEffect(() => {
    if (selectedFountain && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [selectedFountain.latitude, selectedFountain.longitude],
        16,
        { duration: 1.5 }
      );
    }
  }, [selectedFountain]);

  return (
    <div className="map-container">
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

export default Map;
