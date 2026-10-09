import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Bus, 
  Navigation, 
  CheckCircle2, 
  Bell, 
  RotateCcw,
  Smartphone,
  Sparkles,
  Download
} from 'lucide-react';
import MapLocationPicker from './components/MapLocationPicker';
import NotificationFeed from './components/NotificationFeed';
import ChildTimeline from './components/ChildTimeline';
import { updateParentPickupLocation } from './services/api';

export default function App() {
  const [student, setStudent] = useState({
    id: 'student-01',
    name: 'Alex Smith',
    class_grade: 'Grade 5-B',
    parent_name: 'Sarah Smith',
    parent_phone: '+1 (555) 998-1122',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    pickup_latitude: 12.9720,
    pickup_longitude: 77.5950,
    current_status: 'PENDING'
  });

  const [busLocation, setBusLocation] = useState({ lat: 12.9680, lng: 77.5900 });
  const [notifications, setNotifications] = useState([]);
  const [savedToast, setSavedToast] = useState(false);
  const [isSimulatingBus, setIsSimulatingBus] = useState(false);

  // Update pickup pin
  const handleLocationChange = async (lat, lng) => {
    setStudent(prev => ({ ...prev, pickup_latitude: lat, pickup_longitude: lng }));
    await updateParentPickupLocation(student.id, lat, lng);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3500);
  };

  // Acquire Real Phone GPS location using HTML5 Geolocation API
  const handleUseCurrentPhoneLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleLocationChange(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          alert('GPS permission required or unavailable. Set pin on map manually!');
        }
      );
    }
  };

  // Telematics Simulation for Testing App
  useEffect(() => {
    let interval = null;
    if (isSimulatingBus) {
      interval = setInterval(() => {
        setBusLocation(prev => {
          const latDiff = (student.pickup_latitude - prev.lat) * 0.2;
          const lngDiff = (student.pickup_longitude - prev.lng) * 0.2;
          const newLat = prev.lat + latDiff;
          const newLng = prev.lng + lngDiff;

          // Distance check
          const dist = Math.hypot(newLat - student.pickup_latitude, newLng - student.pickup_longitude) * 111000;
          
          if (dist <= 50 && student.current_status === 'PENDING') {
            setStudent(s => ({ ...s, current_status: 'GEOFENCE_NOTIFIED' }));
            setNotifications(n => [
              {
                stage: 'STAGE_1',
                title: 'Bus Arrived at Pickup Location',
                body: `Bus 01 entered 50-meter PostGIS geofence around Alex's pickup pin.`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              },
              ...n
            ]);
          }

          return { lat: newLat, lng: newLng };
        });
      }, 2500);
    }

    return () => clearInterval(interval);
  }, [isSimulatingBus, student.pickup_latitude, student.pickup_longitude, student.current_status]);

  // Simulate Boarding Confirmation (Alert #2)
  const handleSimulateBoarding = () => {
    setStudent(s => ({ ...s, current_status: 'BOARDED' }));
    setNotifications(n => [
      {
        stage: 'STAGE_2',
        title: 'Boarding Confirmed',
        body: `Boarding Confirmed: Alex Smith safely boarded Bus 01. Verified by 5-Factor Engine (Cosine: 0.89).`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...n
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans max-w-md mx-auto border-x border-slate-800 shadow-2xl relative">
      
      {/* Mobile Top Bar */}
      <header className="p-4 glass-card sticky top-0 z-40 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 p-0.5 flex items-center justify-center">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white font-outfit">SafeRide Parent</h1>
            <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Agent 2 Mobile App Active
            </p>
          </div>
        </div>

        <button
          onClick={() => alert(`Calling Bus 01 Driver David Miller (+1 555 234-5678)...`)}
          className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center space-x-1 shadow-sm"
        >
          <Phone className="h-3.5 w-3.5" />
          <span>SOS Driver</span>
        </button>
      </header>

      {/* Child Profile Bar */}
      <div className="p-4 space-y-4">
        
        <div className="glass-card p-4 rounded-3xl border border-indigo-500/30 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <img src={student.avatar} alt={student.name} className="h-12 w-12 rounded-full object-cover border-2 border-indigo-500" />
            <div>
              <div className="flex items-center space-x-1.5">
                <h2 className="text-base font-bold text-white font-outfit">{student.name}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                  {student.class_grade}
                </span>
              </div>
              <p className="text-xs text-slate-400">Parent: {student.parent_name}</p>
            </div>
          </div>

          <div className="text-right">
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
              student.current_status === 'BOARDED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
              student.current_status === 'GEOFENCE_NOTIFIED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
              'bg-slate-800 text-indigo-300'
            }`}>
              {student.current_status}
            </span>
          </div>
        </div>

        {/* GPS Pickup Pin Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center space-x-1">
              <Navigation className="h-4 w-4 text-emerald-400" />
              <span>GPS Home Pickup Pin Setter</span>
            </span>

            <button
              onClick={handleUseCurrentPhoneLocation}
              className="text-[10px] text-indigo-400 underline font-semibold"
            >
              Use My Current GPS
            </button>
          </div>

          <MapLocationPicker
            latitude={student.pickup_latitude}
            longitude={student.pickup_longitude}
            onLocationChange={handleLocationChange}
            busLocation={busLocation}
          />

          {savedToast && (
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>GPS Pin registered with Supabase PostGIS (50m Sphere Active)!</span>
            </div>
          )}
        </div>

        {/* Live Simulation Controls for Testing Real App */}
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <span className="flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Live Bus Telematics Testing
            </span>
            <button
              onClick={() => setIsSimulatingBus(!isSimulatingBus)}
              className={`px-3 py-1 rounded-xl text-xs font-bold ${
                isSimulatingBus ? 'bg-rose-600 text-white' : 'bg-indigo-600 text-white'
              }`}
            >
              {isSimulatingBus ? 'Stop Bus' : 'Simulate Bus Telematics'}
            </button>
          </div>

          {student.current_status === 'GEOFENCE_NOTIFIED' && (
            <button
              onClick={handleSimulateBoarding}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md"
            >
              Simulate 5-Factor Boarding (Alert #2)
            </button>
          )}
        </div>

        {/* FCM Push Notification Feed */}
        <NotificationFeed notifications={notifications} />

        {/* Child Timeline */}
        <ChildTimeline status={student.current_status} />

      </div>

      {/* Mobile Footer */}
      <footer className="p-4 text-center text-[11px] text-slate-500 border-t border-slate-900 bg-slate-950">
        SafeRide AI Agent 2 Parent Mobile Application • PWA & APK Compliant
      </footer>

    </div>
  );
}
