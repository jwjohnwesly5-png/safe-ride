import React, { useEffect, useRef } from 'react';

export default function InteractiveMap({ 
  busLocation, 
  stops = [], 
  students = [], 
  onPickupSelect = null, 
  height = '400px',
  interactivePinMode = false 
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (typeof window.L === 'undefined') return;

    const L = window.L;

    // Initialize Map if not initialized
    if (!mapInstanceRef.current) {
      const initialLat = busLocation ? busLocation.lat : 12.9720;
      const initialLng = busLocation ? busLocation.lng : 77.5950;
      
      const map = L.map(mapRef.current, {
        center: [initialLat, initialLng],
        zoom: 15,
        zoomControl: true,
      });

      // Dark Mode Tile Layer (CartoDB Dark Matter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;

      if (interactivePinMode && onPickupSelect) {
        map.on('click', (e) => {
          onPickupSelect(e.latlng.lat, e.latlng.lng);
        });
      }
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    markersRef.current.forEach(layer => map.removeLayer(layer));
    markersRef.current = [];

    // 1. Draw Route Line connecting stops
    if (stops.length > 0) {
      const polylinePoints = stops.map(s => [s.latitude, s.longitude]);
      const polyline = L.polyline(polylinePoints, {
        color: '#6366f1',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.8
      }).addTo(map);
      markersRef.current.push(polyline);
    }

    // 2. Draw Stops with 50-meter Geofence Radiuses
    stops.forEach((stop, idx) => {
      // 50m Geofence Circle
      const circle = L.circle([stop.latitude, stop.longitude], {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.15,
        radius: stop.geofence_radius_meters || 50,
        weight: 1.5,
        dashArray: '4, 4'
      }).addTo(map);
      markersRef.current.push(circle);

      // Custom Stop Marker Icon
      const stopIcon = L.divIcon({
        className: 'custom-stop-icon',
        html: `
          <div style="background-color: #0f172a; border: 2px solid #10b981; border-radius: 50%; width: 26px; height: 26px; display: flex; items-center; justify-content: center; color: #10b981; font-weight: bold; font-size: 11px; box-shadow: 0 4px 12px rgba(16,185,129,0.3);">
            ${idx + 1}
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([stop.latitude, stop.longitude], { icon: stopIcon })
        .addTo(map)
        .bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; font-weight: 600;">
            📍 ${stop.stop_name}<br/>
            <span style="color: #10b981; font-size: 10px;">Geofence: 50 Meters</span>
          </div>
        `);
      markersRef.current.push(marker);
    });

    // 3. Draw Student Registered Pickup Pins
    students.forEach((std) => {
      if (std.pickup_latitude && std.pickup_longitude) {
        const isBoarded = std.current_status === 'BOARDED';
        const isNotified = std.current_status === 'GEOFENCE_NOTIFIED';
        
        const pinColor = isBoarded ? '#10b981' : isNotified ? '#f59e0b' : '#6366f1';

        const studentIcon = L.divIcon({
          className: 'custom-student-icon',
          html: `
            <div style="background-color: ${pinColor}; border: 2px solid #ffffff; border-radius: 9999px; padding: 2px 8px; color: #ffffff; font-weight: 700; font-size: 10px; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
              👤 ${std.first_name} (${std.current_status})
            </div>
          `,
          iconSize: [100, 24],
          iconAnchor: [50, 12]
        });

        const marker = L.marker([std.pickup_latitude, std.pickup_longitude], { icon: studentIcon })
          .addTo(map)
          .bindPopup(`
            <div style="color: #0f172a; font-size: 12px;">
              <b>Student:</b> ${std.first_name} ${std.last_name}<br/>
              <b>Parent:</b> ${std.parent_name}<br/>
              <b>Status:</b> ${std.current_status}
            </div>
          `);
        markersRef.current.push(marker);
      }
    });

    // 4. Draw Moving Bus Position Marker
    if (busLocation) {
      const busIcon = L.divIcon({
        className: 'custom-bus-icon',
        html: `
          <div style="background-color: #6366f1; border: 3px solid #ffffff; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; box-shadow: 0 0 20px rgba(99,102,241,0.8); animation: pulse 1.5s infinite;">
            🚌
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const busMarker = L.marker([busLocation.lat, busLocation.lng], { icon: busIcon })
        .addTo(map)
        .bindPopup(`
          <div style="color: #0f172a; font-size: 12px; font-weight: 700;">
            🚌 Bus 01 Telematics Stream<br/>
            <span style="color: #6366f1; font-weight: 500;">GPS Telematics Active (5s Interval)</span>
          </div>
        `);
      markersRef.current.push(busMarker);

      // Pan map to bus location smoothly
      map.panTo([busLocation.lat, busLocation.lng], { animate: true });
    }

  }, [busLocation, stops, students, interactivePinMode, onPickupSelect]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <div ref={mapRef} style={{ height, width: '100%' }} />
      {interactivePinMode && (
        <div className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-lg bg-slate-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-semibold backdrop-blur-md flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Click anywhere on the map to place/update pickup pin</span>
        </div>
      )}
    </div>
  );
}
