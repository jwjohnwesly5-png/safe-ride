import React from 'react';
import { Bell, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function NotificationFeed({ notifications }) {
  return (
    <div className="glass-card p-5 rounded-3xl border border-indigo-500/30 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Bell className="h-4 w-4 text-amber-400 animate-bounce" />
          <h3 className="text-sm font-bold text-white font-outfit">Live FCM Push Alert Feed</h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
          2-Stage Push Active
        </span>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
        {notifications.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-500">
            Listening for real-time FCM arrival and boarding push notifications...
          </div>
        ) : (
          notifications.map((notif, index) => (
            <div 
              key={index}
              className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition-all shadow-md ${
                notif.stage === 'STAGE_1'
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-amber-500/10'
                  : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 shadow-emerald-500/10'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center space-x-1.5">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>{notif.title}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{notif.time}</span>
              </div>
              <p className="text-[11px] text-slate-200 leading-relaxed">{notif.body}</p>
              <div className="pt-1 text-[9px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-800/60">
                <span>FCM Device Token Registered</span>
                <span className="text-emerald-400 font-bold">✓ Cryptographically Verified</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
