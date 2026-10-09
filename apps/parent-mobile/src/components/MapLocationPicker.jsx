import React, { useEffect, useRef } from 'react';

export default function MapLocationPicker({ latitude, longitude, onLocationChange, busLocation }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || typeof window.L === 'undefined') return;

    const L = window.L;

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [latitude, longitude],
        zoom: 16,
        zoomControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;

      // Click to set pin
      map.on('click', (e) => {
        onLocationChange(e.latlng.lat, e.latlng.lng);
      });
    }

    const map = mapInstanceRef.current;

    // Draw 50m Geofence Circle around Parent Pin
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    const group = L.layerGroup().addTo(map);
    markerRef.current = group;

    // Geofence Circle
    L.circle([latitude, longitude], {
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: 0.15,
      radius: 50,
      weight: 2,
      dashArray: '4, 4'
    }).addTo(group);

    // Pin Marker
    const pinIcon = L.divIcon({
      className: 'custom-pin',
      html: `
        <div style="background: #6366f1; border: 2px solid white; border-radius: 999px; padding: 4px 10px; color: white; font-weight: bold; font-size: 11px; box-shadow: 0 4px 12px rgba(99,102,241,0.5); white-space: nowrap;">
          📍 Alex's Pickup Pin
        </div>
      `,
      iconSize: [110, 26],
      iconAnchor: [55, 13]
    });

    L.marker([latitude, longitude], { icon: pinIcon }).addTo(group);

    // Draw Moving Bus Marker
    if (busLocation) {
      const busIcon = L.divIcon({
        className: 'bus-pin',
        html: `
          <div style="background: #10b981; border: 2px solid white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 0 16px rgba(16,185,129,0.8);">
            🚌
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      L.marker([busLocation.lat, busLocation.lng], { icon: busIcon }).addTo(group);
    }

  }, [latitude, longitude, busLocation, onLocationChange]);

  return (
    <div className="relative w-full h-72 rounded-3xl overflow-hidden border border-indigo-500/30 shadow-xl">
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-semibold backdrop-blur-md flex items-center space-x-2">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span>Tap map to set 50m Geofence Pin</span>
      </div>
    </div>
  );
}
