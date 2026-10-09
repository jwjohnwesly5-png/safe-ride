import React, { useState } from 'react';
import { 
  Radio, 
  Send, 
  Bell, 
  CheckCircle2, 
  Zap, 
  Layers, 
  ShieldCheck, 
  Terminal,
  Activity,
  Copy
} from 'lucide-react';

export default function NotificationDispatcher({ transitEvents, notifications }) {
  const [activePayloadTab, setActivePayloadTab] = useState('STAGE_1');

  const samplePayloads = {
    STAGE_1: {
      to: 'fcm_parent_token_8841',
      notification: {
        title: 'Bus Arrived at Pickup Location',
        body: 'Bus 01 has entered the 50-meter geofence for Alex Smith.',
        sound: 'default'
      },
      data: {
        event_type: 'GEOFENCE_ARRIVAL',
        student_id: 'student-01',
        bus_id: 'bus-01',
        stop_id: 'stop-01',
        geofence_radius: '50m',
        timestamp: '2026-10-09T07:40:00Z'
      }
    },
    STAGE_2: {
      to: 'fcm_parent_token_8841',
      notification: {
        title: 'Boarding Confirmed',
        body: 'Boarding Confirmed: Alex Smith safely boarded Bus 01 at 07:42 AM.',
        sound: 'boarding_chime.mp3'
      },
      data: {
        event_type: 'BOARDING_VERIFIED',
        student_id: 'student-01',
        bus_id: 'bus-01',
        verification_confidence: 0.89,
        face_vector_matched: true,
        timestamp: '2026-10-09T07:42:15Z'
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-3xl border border-indigo-500/30 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Radio className="h-6 w-6 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-outfit">Agent 5: Real-Time Event Dispatcher & FCM Hub</h2>
            <p className="text-xs text-slate-400">
              Low-Latency Firebase Cloud Messaging (&lt;1s) & Supabase Realtime Listener Engine
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            FCM WebSocket Active
          </span>
        </div>
      </div>

      {/* Main Grid: Live Event Log Stream & FCM JSON Payload Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Live Transit Event Stream Log */}
        <div className="glass-card p-5 rounded-3xl border border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white font-outfit">Supabase Transit Event Stream Log</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Events Count: {transitEvents.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
            {transitEvents.map((evt, idx) => (
              <div 
                key={evt.id || idx} 
                className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition-all ${
                  evt.event_type === 'BOARDING_VERIFIED' ? 'bg-emerald-950/30 border-emerald-500/40' :
                  evt.event_type === 'GEOFENCE_ARRIVAL' ? 'bg-amber-950/30 border-amber-500/40' :
                  evt.event_type === 'MISMATCH_FLAGGED' ? 'bg-rose-950/30 border-rose-500/40' :
                  'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                    evt.event_type === 'BOARDING_VERIFIED' ? 'bg-emerald-500/20 text-emerald-300' :
                    evt.event_type === 'GEOFENCE_ARRIVAL' ? 'bg-amber-500/20 text-amber-300' :
                    evt.event_type === 'MISMATCH_FLAGGED' ? 'bg-rose-500/20 text-rose-300' :
                    'bg-indigo-500/20 text-indigo-300'
                  }`}>
                    {evt.event_type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{evt.timestamp}</span>
                </div>

                <p className="text-white font-semibold">{evt.student_name}: {evt.details}</p>

                {evt.confidence && (
                  <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <span>Cosine Similarity: <strong className="text-emerald-400">{evt.confidence}</strong></span>
                    <span>Multi-Factor Pass</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: FCM Payload Inspector & Deduplication Rules */}
        <div className="glass-card p-5 rounded-3xl border border-indigo-500/30 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Terminal className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white font-outfit">FCM JSON Payload Inspector</h3>
              </div>
              
              <div className="flex space-x-1">
                <button
                  onClick={() => setActivePayloadTab('STAGE_1')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    activePayloadTab === 'STAGE_1' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Alert #1
                </button>
                <button
                  onClick={() => setActivePayloadTab('STAGE_2')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    activePayloadTab === 'STAGE_2' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Alert #2
                </button>
              </div>
            </div>

            {/* JSON Payload Viewer */}
            <div className="relative p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
              <pre>{JSON.stringify(samplePayloads[activePayloadTab], null, 2)}</pre>
            </div>
          </div>

          {/* Deduplication & Performance Feature List */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-white font-bold">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Deduplication & Delivery Safeguards</span>
            </div>
            <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-4">
              <li>Atomic Redis Lock prevents duplicate push alerts if bus lingers in geofence.</li>
              <li>FCM high-priority APNS payload guarantees delivery even when screen locked.</li>
              <li>Supabase Realtime channels mirror events instantly to School Web Dashboard.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
