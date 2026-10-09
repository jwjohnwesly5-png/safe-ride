import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Database, 
  Radio, 
  Cpu, 
  CheckCircle2, 
  Code2, 
  Zap, 
  X,
  FileCode
} from 'lucide-react';

export default function SystemArchitectureModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('agents');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card max-w-4xl w-full max-h-[90vh] p-6 rounded-3xl border border-indigo-500/40 shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-outfit">SafeRide AI Architecture & 5-Agent Division</h3>
              <p className="text-xs text-slate-400">Master Specification & Multi-Factor Verification Engine</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('agents')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  activeTab === 'agents' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                5 Agents Matrix
              </button>
              <button
                onClick={() => setActiveTab('mfv')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  activeTab === 'mfv' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                5-Factor Logic
              </button>
              <button
                onClick={() => setActiveTab('ddl')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  activeTab === 'ddl' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                PostgreSQL DDL
              </button>
            </div>

            <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="py-4 overflow-y-auto custom-scrollbar flex-1 space-y-4 text-xs">
          
          {activeTab === 'agents' && (
            <div className="space-y-4">
              <p className="text-slate-300 leading-relaxed">
                SafeRide AI is partitioned into <strong>5 specialized domain worker agents</strong> supervised by <strong>1 orchestrator agent (Agent 0)</strong> to guarantee zero context pollution and modular separation.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-indigo-300">
                    <span>Agent 0: Supervisor & Orchestrator</span>
                    <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-400">Overseer</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Enforces database DDL schemas, API request/response contracts, and verifies multi-factor safety logic across subagents.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-emerald-300">
                    <span>Agent 1: School Admin & Identity</span>
                    <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-400">Next.js Web</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Next.js 14 Admin Portal for student onboarding, 512-d vector generation, fleet setup, and RLS privacy consent.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-amber-300">
                    <span>Agent 2: Parent Portal & Location</span>
                    <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-400">Flutter Mobile</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Flutter Parent App for drag-and-drop Mapbox GPS pickup point registration, live bus tracker, and timeline feed.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-cyan-300">
                    <span>Agent 3: Driver Telematics & Geofence</span>
                    <span className="text-[10px] bg-cyan-500/20 px-2 py-0.5 rounded text-cyan-400">PostGIS Telematics</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Flutter Driver App route navigator, continuous 5s background GPS streaming, and PostGIS ST_DWithin &le;50m sphere triggers.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-rose-300">
                    <span>Agent 4: AI Vision & Multi-Factor</span>
                    <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded text-rose-400">MobileFaceNet</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">On-device MobileFaceNet TFLite camera scanner (&le;300ms), 5-factor safety check evaluator, and driver manual override mode.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-purple-300">
                    <span>Agent 5: Event Dispatcher & FCM</span>
                    <span className="text-[10px] bg-purple-500/20 px-2 py-0.5 rounded text-purple-400">Node.js / FCM</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Firebase Cloud Messaging 2-stage push dispatcher (Alert #1 Arrival vs Alert #2 Boarding) and Supabase Realtime broadcaster.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mfv' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 font-mono text-center text-indigo-300 text-xs">
                [Face Match S &ge; 0.82] + [Assigned Bus ID] + [PostGIS Geofence &le; 50m] + [Stop Roster] + [Time Window] = VERIFIED BOARDING
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white">Why Multi-Factor Verification (MFV)?</h4>
                <p className="text-slate-400 leading-relaxed">
                  Existing tracking tools treat computer vision as a single point of failure. SafeRide AI enforces a strict multi-vector check: even if a facial scan matches a student, if the scan occurs on the WRONG bus or outside the assigned stop geofence, the system flags a <strong className="text-rose-400">MISMATCH_FLAGGED</strong> safety alert immediately.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'ddl' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
              <pre>{`-- PostGIS & Vector Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

-- Students Table with 512-d Face Embedding Vector
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    class_grade VARCHAR(20) NOT NULL,
    assigned_bus_id UUID REFERENCES buses(id),
    assigned_stop_id UUID REFERENCES route_stops(id),
    face_embedding vector(512), -- MobileFaceNet embedding
    parent_consent_given BOOLEAN DEFAULT FALSE
);`}</pre>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30"
          >
            Close Specification Viewer
          </button>
        </div>

      </div>
    </div>
  );
}
