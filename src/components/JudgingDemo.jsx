import React, { useState } from 'react';
import { 
  Trophy, 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Bus, 
  UserCheck, 
  Bell, 
  ShieldCheck, 
  RotateCcw,
  Star
} from 'lucide-react';

export default function JudgingDemo({ 
  students, 
  onRunStep, 
  currentStepIndex, 
  setCurrentStepIndex, 
  onResetDemo 
}) {
  const steps = [
    {
      step: 1,
      title: 'Step 1: Admin Roster Provisioning',
      desc: 'School Admin assigns Student "Alex Smith" to Bus 01 and Stop #1 on Next.js Portal.',
      actionLabel: '1. Initialize Student & Bus Assignment',
      actor: 'School Admin'
    },
    {
      step: 2,
      title: 'Step 2: Parent Pickup Pin Registration',
      desc: 'Parent registers precise home GPS coordinates (Lat 12.9720, Lng 77.5950) on Flutter Map.',
      actionLabel: '2. Register GPS Pickup Pin',
      actor: 'Parent'
    },
    {
      step: 3,
      title: 'Step 3: Driver Route Execution Start',
      desc: 'Driver starts "Bus 01 Morning Route A". Background telematics streamer begins posting GPS every 5s.',
      actionLabel: '3. Start Bus 01 Route Execution',
      actor: 'Driver Telematics'
    },
    {
      step: 4,
      title: 'Step 4: Geofence Arrival (Alert #1)',
      desc: 'Bus enters 50-meter PostGIS spherical geofence of Stop #1. System dispatches FCM Alert #1 to Parent.',
      actionLabel: '4. Trigger Geofence Arrival (Alert #1)',
      actor: 'PostGIS & FCM Engine'
    },
    {
      step: 5,
      title: 'Step 5: Multi-Factor Biometric Scan',
      desc: 'Alex approaches bus door. Driver camera extracts 512-d vector. 5-Factor Engine validates Cosine 0.89.',
      actionLabel: '5. Perform Camera 5-Factor Verification',
      actor: 'Agent 4 MobileFaceNet'
    },
    {
      step: 6,
      title: 'Step 6: Boarding Confirmed (Alert #2)',
      desc: 'System marks student BOARDED and sends FCM Alert #2: "Alex safely boarded Bus 01 at 07:42 AM".',
      actionLabel: '6. Dispatch Boarding Confirmation (Alert #2)',
      actor: 'FCM Dispatcher'
    },
    {
      step: 7,
      title: 'Step 7: Admin Dashboard Sync',
      desc: 'School Admin Fleet Dashboard updates in real time via WebSockets: Onboard: 1 / Pending: 0.',
      actionLabel: '7. Verify End-to-End Realtime Sync',
      actor: 'System Orchestrator'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Pitch Banner */}
      <div className="glass-card p-6 rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-950 to-indigo-950/40 space-y-3 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white font-outfit">SafeRide AI Live Demo Scenario</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  Hackathon Judging Mode
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Execute the 7-step live workflow scenario from section 34 of the master specification!
              </p>
            </div>
          </div>

          <button
            onClick={onResetDemo}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center space-x-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Demo State</span>
          </button>
        </div>
      </div>

      {/* Step Stepper Navigation */}
      <div className="glass-card p-6 rounded-3xl border border-indigo-500/30 space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-base font-bold text-white font-outfit">7-Step End-to-End Live Workflow</h3>
          <span className="text-xs font-bold text-indigo-400 font-mono">
            Progress: Step {currentStepIndex + 1} of 7
          </span>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {steps.map((s, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div 
                key={s.step} 
                className={`p-3 rounded-2xl border text-center space-y-1 transition-all ${
                  isCurrent 
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/20 scale-105'
                    : isCompleted
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="text-[10px] font-mono font-bold">STEP {s.step}</div>
                <div className="flex justify-center">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-xs ${
                      isCurrent ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {s.step}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Active Step Interactive Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-2 border-indigo-500/40 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider">
              {steps[currentStepIndex].actor} Action Required
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-300 font-mono">
              24-Hour Hackathon Demo Scenario
            </span>
          </div>

          <div>
            <h4 className="text-lg font-bold text-white font-outfit">{steps[currentStepIndex].title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed mt-1">{steps[currentStepIndex].desc}</p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => onRunStep(currentStepIndex)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-sm shadow-xl shadow-amber-500/30 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Execute {steps[currentStepIndex].actionLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {currentStepIndex < 6 && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                Next: {steps[currentStepIndex + 1].title}
              </span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
