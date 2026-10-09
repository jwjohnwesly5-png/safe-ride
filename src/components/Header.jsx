import React from 'react';
import { 
  Building2, 
  UserCheck, 
  Bus, 
  Radio, 
  Trophy, 
  ShieldCheck, 
  Zap,
  Activity
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onOpenArchitecture, eventCount }) {
  const tabs = [
    { id: 'admin', label: 'School Admin', icon: Building2, agent: 'Agent 1' },
    { id: 'parent', label: 'Parent Portal', icon: UserCheck, agent: 'Agent 2' },
    { id: 'driver', label: 'Driver & Camera', icon: Bus, agent: 'Agent 3 & 4' },
    { id: 'dispatcher', label: 'FCM Dispatcher', icon: Radio, agent: 'Agent 5', badge: eventCount },
    { id: 'judging', label: 'Judges Live Demo', icon: Trophy, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent font-outfit">
                  SafeRide AI
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Hardware-Free
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Multi-Factor Geofenced Student Transit Safety
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1 custom-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center space-x-2 whitespace-nowrap ${
                    isActive
                      ? tab.highlight
                        ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg shadow-amber-500/25'
                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : tab.highlight
                      ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : tab.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.agent && !isActive && (
                    <span className="hidden lg:inline text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {tab.agent}
                    </span>
                  )}
                  {tab.badge > 0 && (
                    <span className="h-4 min-w-4 px-1 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Architecture Modal Trigger */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={onOpenArchitecture}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 transition-all flex items-center space-x-1.5 shadow-sm"
            >
              <Zap className="h-3.5 w-3.5 text-indigo-400" />
              <span>5-Agent Spec</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
