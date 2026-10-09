import React from 'react';
import { 
  Play, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Bus as BusIcon, 
  Zap, 
  LogOut 
} from 'lucide-react';

interface GeofenceSimulatorProps {
  onSimulateGeofenceArrival: () => void;
  onSimulateBoardingScan: () => void;
  onSimulateWrongBusMismatch: () => void;
  onSimulateDropOff: () => void;
  onResetDemo: () => void;
}

export const GeofenceSimulator: React.FC<GeofenceSimulatorProps> = ({
  onSimulateGeofenceArrival,
  onSimulateBoardingScan,
  onSimulateWrongBusMismatch,
  onSimulateDropOff,
  onResetDemo,
}) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-4xl w-[92%] glass-panel p-3.5 rounded-2xl border border-indigo-500/40 shadow-2xl bg-slate-950/90 backdrop-blur-md">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Simulator Label */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="font-extrabold text-white text-xs">Hackathon Live Demo Simulator</h4>
            <p className="text-[10px] text-slate-400">Simulate bus movement, geofence triggers & parent push alerts</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onSimulateGeofenceArrival}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition text-[11px]"
          >
            <MapPin className="w-3.5 h-3.5" />
            1. Geofence Arrival (Alert #1)
          </button>

          <button
            onClick={onSimulateBoardingScan}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition text-[11px]"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            2. Verify Boarding (Alert #2)
          </button>

          <button
            onClick={onSimulateWrongBusMismatch}
            className="bg-rose-600/30 hover:bg-rose-600/40 border border-rose-500/40 text-rose-300 font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition text-[11px]"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            3. Wrong Bus Test
          </button>

          <button
            onClick={onSimulateDropOff}
            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition text-[11px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            4. Verify Drop-Off
          </button>

          <button
            onClick={onResetDemo}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-xl transition text-[11px]"
            title="Reset Simulation State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
