import React, { useState } from 'react';
import { Student, Bus, TransitEvent, RouteStop } from '../types';
import { 
  Bus as BusIcon, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  UserPlus, 
  Activity, 
  FileText 
} from 'lucide-react';

interface AdminPortalProps {
  students: Student[];
  buses: Bus[];
  events: TransitEvent[];
  stops: RouteStop[];
  onAddStudent: (newStudent: Student) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  students,
  buses,
  events,
  stops,
  onAddStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'roster' | 'events' | 'onboard'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Student Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentCode, setStudentCode] = useState(`STU-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [classGrade, setClassGrade] = useState('Grade 5-A');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [assignedBus, setAssignedBus] = useState(buses[0]?.id || '');

  const totalStudents = students.length;
  const boardedCount = students.filter(s => s.currentStatus === 'BOARDED').length;
  const pendingCount = students.filter(s => s.currentStatus === 'PENDING' || s.currentStatus === 'GEOFENCE_ARRIVED').length;
  const alertCount = events.filter(e => e.eventType === 'MISMATCH_FLAGGED' || e.eventType === 'BOARDING_MANUAL_OVERRIDE').length;

  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) return;

    const selectedBusObj = buses.find(b => b.id === assignedBus) || buses[0];
    const defaultStop = stops[0];

    const newStudentObj: Student = {
      id: `stu-${Date.now()}`,
      studentIdCode: studentCode,
      firstName,
      lastName,
      classGrade,
      parentId: `usr-parent-${Date.now()}`,
      parentName: parentName || 'Authorized Parent',
      parentPhone: parentPhone || '+1 (555) 019-0000',
      assignedBusId: selectedBusObj.id,
      assignedBusNumber: selectedBusObj.busNumber,
      assignedStopId: defaultStop.id,
      assignedStopName: defaultStop.stopName,
      faceEmbeddingVector: Array.from({ length: 512 }, () => Math.random() * 2 - 1),
      parentConsentGiven: true,
      currentStatus: 'PENDING',
    };

    onAddStudent(newStudentObj);
    setShowAddModal(false);
    // Reset form
    setFirstName('');
    setLastName('');
    setParentName('');
    setParentPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Central Transportation Control Portal
          </div>
          <h1 className="text-2xl font-extrabold text-white">St. Jude Academy Safety Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time telematics, zero-hardware biometric verification, and safety audit logs.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition duration-150"
        >
          <UserPlus className="w-4 h-4" />
          Enroll New Student
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-indigo-500 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Enrolled</p>
            <h3 className="text-2xl font-bold text-white mt-1">{totalStudents}</h3>
            <p className="text-xs text-indigo-400 mt-1">Active transit roster</p>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Verified Onboard</p>
            <h3 className="text-2xl font-bold text-white mt-1">{boardedCount}</h3>
            <p className="text-xs text-emerald-400 mt-1">Multi-Factor Verified</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-amber-500 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Pending Boarding</p>
            <h3 className="text-2xl font-bold text-white mt-1">{pendingCount}</h3>
            <p className="text-xs text-amber-400 mt-1">Expected at stops</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-rose-500 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Safety Exception Flags</p>
            <h3 className="text-2xl font-bold text-white mt-1">{alertCount}</h3>
            <p className="text-xs text-rose-400 mt-1">Requires audit review</p>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'overview'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Fleet Overview
        </button>
        <button
          onClick={() => setActiveTab('roster')}
          className={`pb-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'roster'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Student Roster ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'events'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Transit Audit Log ({events.length})
        </button>
      </div>

      {/* TAB CONTENT: Fleet Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <BusIcon className="w-5 h-5 text-indigo-400" />
                Active School Buses Telematics
              </h3>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-mono">
                ● Live GPS Streaming
              </span>
            </div>

            <div className="space-y-3">
              {buses.map((bus) => {
                const busStudents = students.filter(s => s.assignedBusId === bus.id);
                const boardedBus = busStudents.filter(s => s.currentStatus === 'BOARDED').length;

                return (
                  <div key={bus.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-white text-base">{bus.busNumber}</span>
                        <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">
                          {bus.licensePlate}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Driver: <strong className="text-slate-200">{bus.driverName}</strong> | Capacity: {bus.capacity} seats
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Onboard Roster</p>
                        <p className="text-sm font-bold text-emerald-400 font-mono">{boardedBus} / {busStudents.length} Boarded</p>
                      </div>
                      <div className="w-24 bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${busStudents.length ? (boardedBus / busStudents.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-400" />
              Registered Stop Geofences
            </h3>
            <div className="space-y-3">
              {stops.map((stop) => (
                <div key={stop.id} className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-slate-200">{stop.stopName}</span>
                    <span className="font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                      R={stop.geofenceRadiusMeters}m
                    </span>
                  </div>
                  <p className="text-slate-400 font-mono">
                    GPS: {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                  </p>
                  <p className="text-slate-500">Est. Arrival: {stop.estimatedArrival}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Student Roster */}
      {activeTab === 'roster' && (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-white text-sm">All Student Transportation Records</h3>
            <span className="text-xs text-slate-400">Privacy-preserving 512-d embeddings enabled</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/40 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Student Code</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Grade</th>
                  <th className="p-3.5">Assigned Bus</th>
                  <th className="p-3.5">Pickup Stop</th>
                  <th className="p-3.5">Parent Contact</th>
                  <th className="p-3.5">Biometric Consent</th>
                  <th className="p-3.5">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-3.5 font-mono text-indigo-300 font-semibold">{student.studentIdCode}</td>
                    <td className="p-3.5 font-medium text-white">{student.firstName} {student.lastName}</td>
                    <td className="p-3.5 text-slate-400">{student.classGrade}</td>
                    <td className="p-3.5 font-semibold text-slate-200">{student.assignedBusNumber}</td>
                    <td className="p-3.5 text-slate-300">{student.assignedStopName}</td>
                    <td className="p-3.5 text-slate-400">{student.parentName} ({student.parentPhone})</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" /> Consent Signed
                      </span>
                    </td>
                    <td className="p-3.5">
                      {student.currentStatus === 'BOARDED' && (
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-semibold text-[10px] uppercase tracking-wider">
                          ● Boarded
                        </span>
                      )}
                      {student.currentStatus === 'PENDING' && (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full font-semibold text-[10px] uppercase tracking-wider">
                          ● Pending
                        </span>
                      )}
                      {student.currentStatus === 'GEOFENCE_ARRIVED' && (
                        <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-full font-semibold text-[10px] uppercase tracking-wider">
                          ● Bus Arrived
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Audit Log */}
      {activeTab === 'events' && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-base">Real-Time Transit Audit Stream</h3>
          {events.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              No transit events logged yet. Use the simulator bar at the bottom to trigger events!
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 flex items-start justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        event.eventType === 'BOARDING_VERIFIED' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : event.eventType === 'GEOFENCE_ARRIVAL'
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {event.eventType.replace('_', ' ')}
                      </span>
                      <span className="text-slate-400 font-mono">{event.timestamp}</span>
                    </div>
                    <p className="text-slate-200 font-semibold mt-2">
                      {event.studentName ? `Student: ${event.studentName}` : `Stop Event: ${event.stopName}`}
                    </p>
                    <p className="text-slate-400 mt-0.5">
                      Bus: <strong className="text-slate-300">{event.busNumber}</strong> | Stop: {event.stopName}
                    </p>
                    {event.overrideReason && (
                      <p className="text-amber-400 text-[11px] mt-1 font-mono">
                        Override Note: "{event.overrideReason}"
                      </p>
                    )}
                  </div>
                  {event.confidence && (
                    <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                      Match Score: {(event.confidence * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ENROLLMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-indigo-500/30 shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-lg">Enroll New Student</h3>
            <form onSubmit={handleEnrollStudent} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Student First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Student Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Smith"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Parent Full Name</label>
                <input
                  type="text"
                  required
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="e.g. David Smith"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Parent Phone Number</label>
                <input
                  type="text"
                  required
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 019-2836"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Assign Bus Fleet</label>
                <select
                  value={assignedBus}
                  onChange={(e) => setAssignedBus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  {buses.map(b => (
                    <option key={b.id} value={b.id}>{b.busNumber} ({b.licensePlate})</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-800 text-slate-300 px-4 py-2 rounded-lg font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Save & Generate Embedding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
