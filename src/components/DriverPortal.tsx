import React, { useState } from 'react';
import { Bus, Student, RouteStop, MFVFactorCheck } from '../types';
import { 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Scan, 
  MapPin, 
  RotateCcw, 
  ShieldAlert, 
  UserCheck, 
  Radio 
} from 'lucide-react';

interface DriverPortalProps {
  bus: Bus;
  students: Student[];
  stops: RouteStop[];
  onVerifyBoarding: (studentId: string, mfvResult: MFVFactorCheck) => void;
  onManualOverride: (studentId: string, reason: string) => void;
  onWrongBusMismatch?: (student: Student) => void;
}

export const DriverPortal: React.FC<DriverPortalProps> = ({
  bus,
  students,
  stops,
  onVerifyBoarding,
  onManualOverride,
  onWrongBusMismatch,
}) => {
  const [scanning, setScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<{ student: Student; mfv: MFVFactorCheck } | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideStudentId, setOverrideStudentId] = useState(students[0]?.id || '');
  const [overrideReason, setOverrideReason] = useState('Lighting Condition');

  const assignedStudents = students.filter(s => s.assignedBusId === bus.id);
  const currentStop = stops[0];

  // Execute Multi-Factor Camera Scan Verification
  const handleSimulateCameraScan = (targetStudent: Student, forceWrongBus = false) => {
    setScanning(true);

    setTimeout(() => {
      // Build 5-Factor Verification evaluation result
      const isBusCorrect = !forceWrongBus && targetStudent.assignedBusId === bus.id;
      const isGeofenceCorrect = true;
      const isFaceMatch = true;
      const confidenceScore = 0.88 + Math.random() * 0.08;

      const mfvCheck: MFVFactorCheck = {
        faceMatch: isFaceMatch,
        faceConfidence: confidenceScore,
        busMatch: isBusCorrect,
        geofenceMatch: isGeofenceCorrect,
        geofenceDistanceMeters: 18.4,
        stopRosterMatch: targetStudent.assignedStopId === currentStop.id,
        routeTimeMatch: true,
        overallPassed: isFaceMatch && isBusCorrect && isGeofenceCorrect,
      };

      setLastScanResult({ student: targetStudent, mfv: mfvCheck });
      setScanning(false);

      if (mfvCheck.overallPassed) {
        onVerifyBoarding(targetStudent.id, mfvCheck);
      } else if (forceWrongBus && onWrongBusMismatch) {
        onWrongBusMismatch(targetStudent);
      }
    }, 600);
  };

  const handleConfirmManualOverride = () => {
    onManualOverride(overrideStudentId, overrideReason);
    setShowOverrideModal(false);
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Mobile Phone Mockup */}
      <div className="glass-panel p-5 rounded-3xl border border-emerald-500/30 shadow-2xl bg-slate-950 relative">
        {/* Top Header Status Bar */}
        <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 pb-3 border-b border-slate-800 mb-3">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> GPS ACTIVE
          </span>
          <span className="text-white font-extrabold">{bus.busNumber} Driver App</span>
          <span className="text-slate-400">Driver: Robert</span>
        </div>

        {/* Current Route & Stop Card */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 mb-4 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Active Stop #1
              </span>
              <h3 className="font-bold text-white text-base mt-1">{currentStop.stopName}</h3>
            </div>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded">
              Geofence: 50m
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>Bus Location: 12.9716° N, 77.5946° E</span>
          </div>
        </div>

        {/* Camera Scanner Viewfinder Box */}
        <div className="relative bg-slate-900 rounded-2xl border-2 border-slate-700 overflow-hidden mb-4 p-6 text-center space-y-3">
          <div className="absolute top-2 left-2 text-[10px] font-mono bg-slate-950/80 text-emerald-400 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
            <Camera className="w-3 h-3" /> Live Vision Stream (30 FPS)
          </div>

          {scanning ? (
            <div className="py-12 space-y-3">
              <Scan className="w-12 h-12 text-indigo-400 mx-auto animate-spin" />
              <p className="text-xs font-mono text-indigo-300">Extracting 512-d Facial Embedding Vector...</p>
            </div>
          ) : (
            <div className="py-4 space-y-3">
              <div className="w-24 h-24 mx-auto rounded-2xl border-2 border-dashed border-indigo-400/60 flex items-center justify-center bg-indigo-500/5 relative group">
                <Camera className="w-8 h-8 text-indigo-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
              </div>

              <div>
                <p className="text-xs font-bold text-white">Point phone camera at student</p>
                <p className="text-[11px] text-slate-400">Multi-Factor Engine evaluates face + bus + stop</p>
              </div>

              {/* Scan Trigger Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                {assignedStudents.map((stu) => (
                  <button
                    key={stu.id}
                    onClick={() => handleSimulateCameraScan(stu, false)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-between shadow-lg transition"
                  >
                    <span>Scan Face: {stu.firstName} {stu.lastName}</span>
                    <span className="font-mono text-[10px] bg-indigo-700 px-2 py-0.5 rounded">Scan</span>
                  </button>
                ))}

                <button
                  onClick={() => handleSimulateCameraScan(students[0], true)}
                  className="w-full bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-between transition"
                >
                  <span>Test Wrong Bus Mismatch Scenario</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Multi-Factor Evaluation Results Display HUD */}
        {lastScanResult && (
          <div className={`p-4 rounded-2xl border mb-4 space-y-2 transition-all ${
            lastScanResult.mfv.overallPassed
              ? 'bg-emerald-950/40 border-emerald-500/40 glow-emerald'
              : 'bg-rose-950/40 border-rose-500/40 glow-rose'
          }`}>
            <div className="flex justify-between items-center">
              <span className={`text-xs font-extrabold uppercase tracking-wider ${
                lastScanResult.mfv.overallPassed ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {lastScanResult.mfv.overallPassed ? '✅ VERIFIED BOARDING' : '❌ WRONG BUS MISMATCH'}
              </span>
              <span className="font-mono text-[11px] text-slate-300">
                Score: {(lastScanResult.mfv.faceConfidence * 100).toFixed(0)}%
              </span>
            </div>

            <p className="text-xs text-slate-200 font-semibold">
              Student: {lastScanResult.student.firstName} {lastScanResult.student.lastName}
            </p>

            {/* 5-Factor Evaluation Matrix Checklist */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] font-mono">
              <div className={`p-1.5 rounded flex items-center gap-1 ${
                lastScanResult.mfv.faceMatch ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'
              }`}>
                {lastScanResult.mfv.faceMatch ? '✓' : '✗'} Face Template
              </div>
              <div className={`p-1.5 rounded flex items-center gap-1 ${
                lastScanResult.mfv.busMatch ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'
              }`}>
                {lastScanResult.mfv.busMatch ? '✓' : '✗'} Bus ID Match
              </div>
              <div className={`p-1.5 rounded flex items-center gap-1 ${
                lastScanResult.mfv.geofenceMatch ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'
              }`}>
                {lastScanResult.mfv.geofenceMatch ? '✓' : '✗'} Geofence (18m)
              </div>
              <div className={`p-1.5 rounded flex items-center gap-1 ${
                lastScanResult.mfv.stopRosterMatch ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'
              }`}>
                {lastScanResult.mfv.stopRosterMatch ? '✓' : '✗'} Stop Roster
              </div>
            </div>
          </div>
        )}

        {/* Manual Override Option */}
        <div className="pt-2">
          <button
            onClick={() => setShowOverrideModal(true)}
            className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs py-2 rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            Execute Manual Driver Override (Fallback)
          </button>
        </div>
      </div>

      {/* Manual Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-sm w-full p-5 rounded-2xl border border-amber-500/30 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Manual Boarding Fallback Override
            </h3>
            <p className="text-xs text-slate-400">
              Use only if camera scan fails due to lighting or occlusion. Event will be logged for school admin audit.
            </p>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Select Student</label>
                <select
                  value={overrideStudentId}
                  onChange={(e) => setOverrideStudentId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.classGrade})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Mandatory Override Reason</label>
                <select
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="Lighting Condition">Lighting / Direct Sunlight</option>
                  <option value="Face Covered / Glasses">Face Mask / Glasses / Hat</option>
                  <option value="Driver Visually Confirmed">Driver Visually Confirmed Student</option>
                  <option value="Emergency Bus Swap">Emergency Bus Route Swap</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowOverrideModal(false)}
                className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmManualOverride}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3 py-1.5 rounded-lg"
              >
                Confirm & Log Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
