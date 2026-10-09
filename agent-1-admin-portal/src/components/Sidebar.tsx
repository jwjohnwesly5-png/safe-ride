import Link from "next/link";
import { Bus, Users, LayoutDashboard, Settings } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0">
      <div className="p-6 font-bold text-2xl flex items-center gap-3 tracking-wide text-blue-400">
        <Bus className="w-8 h-8" />
        SafeRide AI
      </div>
      <nav className="flex-1 mt-6 px-4 space-y-2">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
          <LayoutDashboard className="w-5 h-5" />
          Fleet Dashboard
        </Link>
        <Link href="/students" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
          <Users className="w-5 h-5" />
          Student Onboarding
        </Link>
        <Link href="/fleet" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
          <Bus className="w-5 h-5" />
          Bus & Route Manager
        </Link>
      </nav>
      <div className="p-4 border-t border-slate-800">
        <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </div>
  );
}
