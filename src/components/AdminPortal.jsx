import React, { useState } from 'react';
import { 
  Building2, 
  UserPlus, 
  Bus, 
  ShieldAlert, 
  ShieldCheck,
  CheckCircle2, 
  Download, 
  Fingerprint, 
  FileText, 
  Sliders, 
  MapPin, 
  Search,
  Eye,
  AlertTriangle
} from 'lucide-react';
import InteractiveMap from './InteractiveMap';

export default function AdminPortal({ students, setStudents, buses, stops, transitEvents, busLocation }) {
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    student_id_code: `STD-${Math.floor(1000 + Math.random() * 9000)}`,
    class_grade: 'Grade 5-A',
    parent_name: '',
    parent_phone: '',
    assigned_bus_id: 'bus-01',
    assigned_stop_id: 'stop-01',
    parent_consent_given: true,
  });

  const [extractedVector, setExtractedVector] = useState(null);
  const [isProcessingVector, setIsProcessingVector] = useState(false);

  // Generate 512-d Numerical Vector Simulation
  const handleSimulateVectorExtraction = () => {
    setIsProcessingVector(true);
    setTimeout(() => {
      // Mock 512-dimensional vector sample
      const mockVector = Array.from({ length: 512 }, () => (Math.random() * 2 - 1).toFixed(4));
      setExtractedVector(mockVector);
      setIsProcessingVector(false);
    }, 800);
  };

  const handleCreateStudent = (e) => {
    e.preventDefault();
    if (!extractedVector) {
      alert('Please click "Extract 512-d Facial Embedding Vector" first!');
      return;
    }

    const selectedStop = stops.find(s => s.id === formData.assigned_stop_id);

    const newStudent = {
      id: `student-${Date.now()}`,
      ...formData,
      pickup_latitude: selectedStop ? selectedStop.latitude : 12.9720,
      pickup_longitude: selectedStop ? selectedStop.longitude : 77.5950,
      current_status: 'PENDING',
      face_embedding_registered: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };

    setStudents([newStudent, ...students]);
    setShowAddStudent(false);
    setFormData({
      first_name: '',
      last_name: '',
      student_id_code: `STD-${Math.floor(1000 + Math.random() * 9000)}`,
      class_grade: 'Grade 5-A',
      parent_name: '',
      parent_phone: '',
      assigned_bus_id: 'bus-01',
      assigned_stop_id: 'stop-01',
      parent_consent_given: true,
    });
    setExtractedVector(null);
  };

  const filteredStudents = students.filter(s => 
    s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.student_id_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const boardedCount = students.filter(s => s.current_status === 'BOARDED').length;
  const pendingCount = students.filter(s => s.current_status === 'PENDING' || s.current_status === 'GEOFENCE_NOTIFIED').length;
  const mismatchCount = students.filter(s => s.current_status === 'MISMATCHED').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card glass-card-hover p-5 rounded-2xl border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Total Enrolled Students</p>
              <p className="text-2xl font-bold text-white mt-1 font-outfit">{students.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-indigo-400 font-medium">
            <span>100% Zero Raw Photo Storage</span>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-5 rounded-2xl border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Safely Boarded Today</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1 font-outfit">{boardedCount}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-emerald-400 font-medium">
            <span>Verified by 5-Factor Rules</span>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-5 rounded-2xl border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Transit Pending</p>
              <p className="text-2xl font-bold text-amber-400 mt-1 font-outfit">{pendingCount}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Bus className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-amber-400 font-medium">
            <span>Awaiting Pickup Geofence</span>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-5 rounded-2xl border-l-4 border-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Safety Exceptions</p>
              <p className="text-2xl font-bold text-rose-400 mt-1 font-outfit">{mismatchCount}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-rose-400 font-medium">
            <span>Wrong Bus / Override Flags</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Action Toolbar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Fleet Map & Route Telematics */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white font-outfit">Live Fleet & Geofence Monitor</h2>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              PostGIS 50m Sphere Engine Active
            </span>
          </div>

          <InteractiveMap 
            busLocation={busLocation} 
            stops={stops} 
            students={students} 
            height="380px" 
          />

          {/* Active Buses Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {buses.map(bus => (
              <div key={bus.id} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
                    🚌
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{bus.bus_number} ({bus.license_plate})</h3>
                    <p className="text-[11px] text-slate-400">Driver: {bus.driver_name} • {bus.assigned_route}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                  ACTIVE
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Student Onboarding Panel & Actions */}
        <div className="glass-card p-5 rounded-2xl space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Fingerprint className="h-5 w-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white font-outfit">Student Identity Engine</h2>
              </div>
              <button
                onClick={() => setShowAddStudent(!showAddStudent)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>{showAddStudent ? 'Cancel' : 'Enroll Student'}</span>
              </button>
            </div>

            {/* Privacy Guarantee Note */}
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 font-semibold text-indigo-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Biometric Privacy Safeguard</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Raw face photos are processed locally to extract a non-reversible 512-dimensional vector. Photos are immediately deleted.
              </p>
            </div>

            {/* Student Search & List Preview */}
            <div className="mt-4 space-y-3">
              <div className="relative">
                <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search students by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                {filteredStudents.map(std => (
                  <div key={std.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-all">
                    <div className="flex items-center space-x-2.5">
                      <img src={std.avatar} alt={std.first_name} className="h-8 w-8 rounded-full object-cover border border-indigo-500/30" />
                      <div>
                        <h4 className="text-xs font-bold text-white">{std.first_name} {std.last_name}</h4>
                        <p className="text-[10px] text-slate-400">{std.student_id_code} • {std.class_grade}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      std.current_status === 'BOARDED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      std.current_status === 'MISMATCHED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {std.current_status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Report Download */}
          <button
            onClick={() => alert('Exporting full PostgreSQL SafeRide transit audit log (CSV/PDF)...')}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center space-x-2 shadow-sm"
          >
            <Download className="h-4 w-4 text-indigo-400" />
            <span>Export Institutional Audit Report (CSV)</span>
          </button>
        </div>

      </div>

      {/* Modal: Student Enrollment Form */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 rounded-2xl border border-indigo-500/30 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white font-outfit">Onboard New Student & Biometric Vector</h3>
              </div>
              <button 
                onClick={() => setShowAddStudent(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">First Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.first_name}
                    onChange={e => setFormData({...formData, first_name: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Alex"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Last Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.last_name}
                    onChange={e => setFormData({...formData, last_name: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Student ID Code</label>
                  <input 
                    type="text" 
                    readOnly
                    value={formData.student_id_code}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-indigo-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Class / Grade</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.class_grade}
                    onChange={e => setFormData({...formData, class_grade: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Parent Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.parent_name}
                    onChange={e => setFormData({...formData, parent_name: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Sarah Smith"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Parent Phone</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.parent_phone}
                    onChange={e => setFormData({...formData, parent_phone: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="+1 (555) 000-1122"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Assign to Bus Stop</label>
                <select
                  value={formData.assigned_stop_id}
                  onChange={e => setFormData({...formData, assigned_stop_id: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  {stops.map(stop => (
                    <option key={stop.id} value={stop.id}>{stop.stop_name}</option>
                  ))}
                </select>
              </div>

              {/* Vector Extraction Simulation Section */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Fingerprint className="h-4 w-4 text-indigo-400" />
                    MobileFaceNet 512-d Vector Embedder
                  </span>
                  <button
                    type="button"
                    onClick={handleSimulateVectorExtraction}
                    disabled={isProcessingVector}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] transition-all"
                  >
                    {isProcessingVector ? 'Processing...' : 'Extract Vector'}
                  </button>
                </div>

                {extractedVector ? (
                  <div className="p-2 rounded-lg bg-slate-950 border border-emerald-500/30 text-[10px] text-emerald-400 font-mono space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      512-Dimensional Vector Generated (Raw Image Purged):
                    </p>
                    <div className="truncate text-slate-400">
                      [{extractedVector.slice(0, 8).join(', ')}, ... 504 more values]
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500">
                    Click button to simulate local camera face embedding vector extraction.
                  </p>
                )}
              </div>

              {/* Parental Consent Checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input 
                  type="checkbox" 
                  id="consent"
                  checked={formData.parent_consent_given}
                  onChange={e => setFormData({...formData, parent_consent_given: e.target.checked})}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="consent" className="text-slate-300 text-[11px]">
                  Parent digital consent signed & registered for transit safety processing.
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddStudent(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Complete Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
