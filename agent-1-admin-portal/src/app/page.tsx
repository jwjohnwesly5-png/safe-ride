"use client";

import { useEffect, useState } from "react";
import { BusFront, Users, AlertTriangle, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function Dashboard() {
  const [liveEvents, setLiveEvents] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('admin_dashboard_feed')
      .on('broadcast', { event: 'live_transit_update' }, (payload) => {
        console.log("Live transit update received on Admin Dashboard:", payload);
        setLiveEvents((prev) => [payload.payload, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const stats = [
    { title: "Active Buses", value: "12", icon: <BusFront className="w-8 h-8 text-blue-500" />, color: "border-blue-500", bg: "bg-blue-500/10" },
    { title: "Students Onboard", value: "432", icon: <Users className="w-8 h-8 text-emerald-500" />, color: "border-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Pending Pickups", value: "89", icon: <Users className="w-8 h-8 text-orange-500" />, color: "border-orange-500", bg: "bg-orange-500/10" },
    { title: "Safety Exceptions", value: String(liveEvents.filter(e => e.event_type === 'MISMATCH_FLAGGED').length + 2), icon: <AlertTriangle className="w-8 h-8 text-red-500" />, color: "border-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Fleet Analytics Dashboard</h1>
        <p className="text-slate-500 mt-2">Real-time overview of all active routes and student safety verifications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${stat.color} flex items-center justify-between hover:shadow-md transition-shadow`}>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Active Bus Routes</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    B0{i}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Route #{100 + i} - North Campus</h3>
                    <p className="text-sm text-slate-500">Driver: John Doe • 45/50 Students</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    On Time
                  </span>
                  <p className="text-xs text-slate-400 mt-1">Updated 2m ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Recent Alerts & Logs</h2>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent hidden"></div>
          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Manual Override: Wrong Bus</p>
                <p className="text-xs text-slate-500 mt-0.5">Student <span className="font-semibold">Alex M.</span> boarded B02 instead of B01. Override approved by driver.</p>
                <p className="text-xs text-slate-400 mt-1">10:42 AM</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">MFV Verification Success</p>
                <p className="text-xs text-slate-500 mt-0.5">15 students verified at Oak Street Stop.</p>
                <p className="text-xs text-slate-400 mt-1">10:30 AM</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Route Started</p>
                <p className="text-xs text-slate-500 mt-0.5">Bus B03 departed from Main Depot.</p>
                <p className="text-xs text-slate-400 mt-1">10:15 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
