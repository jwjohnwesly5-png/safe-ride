import React, { useState, useEffect, useRef } from 'react';
import { 
  Bus, 
  Play, 
  Square, 
  Camera, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  RotateCcw, 
  Key, 
  UserCheck, 
  Sliders,
  ScanLine
} from 'lucide-react';

export default function DriverPortal({ 
  students, 
  setStudents, 
  buses, 
  stops, 
  busLocation, 
  setBusLocation, 
  onTriggerGeofence, 
  onTriggerBoarding, 
  onTriggerMismatch 
}) {
  const [routeActive, setRouteActive] = useState(false);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [selectedStudentForScan, setSelectedStudentForScan] = useState(students[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null); // null | { status: 'VERIFIED'|'MISMATCH', confidence: 0.89, student: obj }
  const [showManualOverride, setShowManualOverride] = useState(false);
  const [driverPin, setDriverPin] = useState('');
  const [overrideReason, setOverrideReason] = useState('Lighting condition');

  // WebRTC Camera Video Ref
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Initialize WebRTC camera if available
  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraActive(true);
          }
        }
      } catch (err) {
        console.log('Camera access fallback to simulation view');
        setCameraActive(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Telematics GPS Stream Simulation (moves bus closer to stops)
  useEffect(() => {
    let interval = null;
    if (routeActive) {
      interval = setInterval(() => {
        setBusLocation(prev => {
          const targetStop = stops[currentStopIndex] || stops[0];
          const latDiff = (targetStop.latitude - prev.lat) * 0.25;
          const lngDiff = (targetStop.longitude - prev.lng) * 0.25;
          
          const newLat = prev.lat + latDiff;
          const newLng = prev.lng + lngDiff;

          // Check distance to stop
          const distMeters = calculateDistanceMeters(newLat, newLng, targetStop.latitude, targetStop.longitude);

          if (distMeters <= 50) {
            onTriggerGeofence(targetStop.id);
          }

          return { lat: newLat, lng: newLng };
        });
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [routeActive, currentStopIndex, stops, setBusLocation, onTriggerGeofence]);

  // Haversine distance calculator
  function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // 5-Factor Face Verification Engine Handler
  const handlePerformFaceScan = () => {
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(false);
      
      const targetStudent = selectedStudentForScan;
      const isCorrectBus = targetStudent.assigned_bus_id === 'bus-01';
      
      // Calculate distance from current bus location to student's stop
      const currentStop = stops.find(s => s.id === targetStudent.assigned_stop_id);
      const dist = currentStop 
        ? calculateDistanceMeters(busLocation.lat, busLocation.lng, currentStop.latitude, currentStop.longitude)
        : 100;

      const isGeofencePass = dist <= 60; // 50m geofence tolerance

      if (isCorrectBus && isGeofencePass) {
        // 5-FACTOR PASS
        const confidenceScore = (0.84 + Math.random() * 0.12).toFixed(2);
        setScanResult({
          status: 'VERIFIED',
          confidence: confidenceScore,
          student: targetStudent,
          factors: {
            faceVector: `Cosine ${confidenceScore} (>= 0.82)`,
            busId: 'Bus 01 Matched',
            geofence: `${dist.toFixed(0)}m (<= 50m)`,
            roster: 'Expected Stop #1 Roster',
            timestamp: 'Active Schedule Window'
          }
        });

        onTriggerBoarding(targetStudent.id, confidenceScore);
      } else {
        // FACTOR FAIL (MISMATCH / WRONG BUS)
        setScanResult({
          status: 'MISMATCH',
          confidence: 0.42,
          student: targetStudent,
          errorReason: !isCorrectBus ? 'Wrong Bus Assignment! Student assigned to Bus 02.' : 'Bus outside 50m Stop Geofence radius!'
        });

        onTriggerMismatch(targetStudent.id, !isCorrectBus ? 'Wrong Bus' : 'Geofence Failed');
      }
    }, 1200);
  };

  // Driver Manual Override Submission
  const handleExecuteOverride = (e) => {
    e.preventDefault();
    if (driverPin !== '1234') {
      alert('Invalid Driver PIN! (Use 1234 for demo)');
      return;
    }

    onTriggerBoarding(selectedStudentForScan.id, 1.0, overrideReason);
    setShowManualOverride(false);
    setDriverPin('');
    setScanResult({
      status: 'VERIFIED',
      confidence: 1.0,
      student: selectedStudentForScan,
      isOverride: true,
      overrideReason
    });
  };

  const currentStop = stops[currentStopIndex] || stops[0];
  const activeBus = buses[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Route Execution Control Bar */}
      <div className="glass-card p-5 rounded-3xl border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
            🚌
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white font-outfit">{activeBus.bus_number} Driver Telematics App</h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                Driver: {activeBus.driver_name}
              </span>
            </div>
            <p className="text-xs text-slate-400">Route A • Target: <span className="text-indigo-300 font-semibold">{currentStop.stop_name}</span></p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {!routeActive ? (
            <button
              onClick={() => setRouteActive(true)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Start Morning Route Execution</span>
            </button>
          ) : (
            <button
              onClick={() => setRouteActive(false)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2 transition-all"
            >
              <Square className="h-4 w-4 fill-white" />
              <span>Pause GPS Telematics</span>
            </button>
          )}

          <button
            onClick={() => setCurrentStopIndex((prev) => (prev + 1) % stops.length)}
            className="px-3 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
          >
            Next Stop
          </button>
        </div>
      </div>

      {/* Main Grid: Camera Vision Verification HUD + Roster Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: MobileFaceNet TFLite Live Camera Scanner & HUD */}
        <div className="glass-card p-6 rounded-3xl border border-indigo-500/30 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white font-outfit">Agent 4: Biometric Scanner HUD</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
              MobileFaceNet 512-d (&le;300ms)
            </span>
          </div>

          {/* Camera Viewfinder Box */}
          <div className="relative w-full h-72 rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 flex items-center justify-center">
            
            {/* Real WebRTC Video or Simulated Photo Feed */}
            {cameraActive ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover transform -scale-x-100" 
              />
            ) : (
              <div className="relative w-full h-full">
                <img 
                  src={selectedStudentForScan.avatar} 
                  alt="Student Target" 
                  className="w-full h-full object-cover opacity-80 filter contrast-125"
                />
              </div>
            )}

            {/* Bounding Box HUD Overlay */}
            <div className={`absolute inset-8 rounded-2xl border-2 transition-all flex flex-col justify-between p-4 ${
              scanResult?.status === 'VERIFIED' 
                ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.5)]' 
                : scanResult?.status === 'MISMATCH' 
                ? 'border-rose-500 bg-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.6)] animate-pulse'
                : isScanning
                ? 'border-indigo-400 bg-indigo-500/10'
                : 'border-indigo-500/50'
            }`}>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white bg-slate-950/80 px-2 py-1 rounded-lg backdrop-blur-md">
                <span>TARGET: {selectedStudentForScan.first_name} {selectedStudentForScan.last_name}</span>
                <span>{isScanning ? 'EXTRACTING 512-D VECTOR...' : 'READY'}</span>
              </div>

              {/* Scanning Animation Line */}
              {isScanning && (
                <div className="w-full h-1 bg-gradient-to-r from-indigo-500 via-emerald-400 to-indigo-500 animate-scan-line shadow-lg"></div>
              )}

              {/* Verified Result HUD Banner */}
              {scanResult?.status === 'VERIFIED' && (
                <div className="bg-emerald-600/90 text-white p-2.5 rounded-xl font-bold text-xs text-center shadow-lg animate-fade-in">
                  ✓ VERIFIED BOARDING ({scanResult.confidence * 100}%)
                </div>
              )}

              {/* Mismatch Result HUD Banner */}
              {scanResult?.status === 'MISMATCH' && (
                <div className="bg-rose-600/90 text-white p-2.5 rounded-xl font-bold text-xs text-center shadow-lg animate-bounce">
                  ⚠️ {scanResult.errorReason}
                </div>
              )}

              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                <span>FPS: 30</span>
                <span>BUS: {activeBus.bus_number}</span>
              </div>
            </div>

          </div>

          {/* Action Trigger Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handlePerformFaceScan}
              disabled={isScanning}
              className="py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all"
            >
              <ScanLine className="h-4 w-4" />
              <span>Scan Face & Verify MFV</span>
            </button>

            <button
              onClick={() => setShowManualOverride(true)}
              className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center justify-center space-x-2 transition-all"
            >
              <Key className="h-4 w-4 text-amber-400" />
              <span>Manual Driver Override</span>
            </button>
          </div>

        </div>

        {/* Right: Stop Roster & 5-Factor Verification Status Matrix */}
        <div className="space-y-6">
          
          {/* Student Roster Selector */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white font-outfit flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-indigo-400" />
              <span>Stop #1 Expected Roster ({students.length})</span>
            </h3>

            <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
              {students.map(std => {
                const isSelected = selectedStudentForScan.id === std.id;
                return (
                  <button
                    key={std.id}
                    onClick={() => {
                      setSelectedStudentForScan(std);
                      setScanResult(null);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img src={std.avatar} alt={std.first_name} className="h-9 w-9 rounded-full object-cover border border-indigo-400/30" />
                      <div>
                        <h4 className="text-xs font-bold">{std.first_name} {std.last_name}</h4>
                        <p className="text-[10px] text-slate-400">Assigned: {std.assigned_bus_id === 'bus-01' ? 'Bus 01' : 'Bus 02 (Wrong Bus Test)'}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      std.current_status === 'BOARDED' ? 'bg-emerald-500/20 text-emerald-300' :
                      std.current_status === 'MISMATCHED' ? 'bg-rose-500/20 text-rose-300' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {std.current_status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5-Factor Safety Verification Rules Matrix Display */}
          <div className="glass-card p-5 rounded-3xl border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-indigo-300 font-outfit uppercase tracking-wider">
                5-Factor Safety Logic Engine
              </h3>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400">Factor 1: Face Vector Cosine</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {scanResult?.factors?.faceVector || 'Requires S >= 0.82'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400">Factor 2: Assigned Bus ID</span>
                <span className={`font-mono font-bold ${
                  selectedStudentForScan.assigned_bus_id === 'bus-01' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {selectedStudentForScan.assigned_bus_id === 'bus-01' ? 'Bus 01 Matched' : 'Bus 02 (MISMATCH)'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400">Factor 3: PostGIS Geofence</span>
                <span className="font-mono text-emerald-400 font-bold">&le; 50 Meters</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400">Factor 4: Stop Roster</span>
                <span className="font-mono text-emerald-400 font-bold">Matched</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400">Factor 5: Active Schedule</span>
                <span className="font-mono text-emerald-400 font-bold">Valid Window</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Driver Manual Override Modal */}
      {showManualOverride && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-amber-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-outfit">Human-in-the-Loop Override</h3>
              </div>
              <button onClick={() => setShowManualOverride(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Log an audited manual check-in for <strong className="text-white">{selectedStudentForScan.first_name} {selectedStudentForScan.last_name}</strong>. This event is saved with driver credentials to the school admin audit log.
            </p>

            <form onSubmit={handleExecuteOverride} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Override Reason</label>
                <select
                  value={overrideReason}
                  onChange={e => setOverrideReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Lighting condition">Extreme Sun Glare / Poor Interior Lighting</option>
                  <option value="Face covered">Winter Hat / Medical Mask Occlusion</option>
                  <option value="Driver recognized">Driver Personally Verified Student</option>
                  <option value="Emergency Swap">Authorized Emergency Bus Swap</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Driver Verification PIN (Demo: 1234)</label>
                <input
                  type="password"
                  required
                  placeholder="Enter 4-digit PIN..."
                  value={driverPin}
                  onChange={e => setDriverPin(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-mono text-center tracking-widest focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualOverride(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-lg shadow-amber-600/30"
                >
                  Authorize Manual Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
