import { MapPin, Bus, UserCircle, Users, Plus } from "lucide-react";

export default function FleetManager() {
  const routes = [
    { id: "R-101", name: "North Campus Express", bus: "B01", driver: "Michael D.", students: 42, status: "Active" },
    { id: "R-102", name: "Westside Circuit", bus: "B02", driver: "Sarah W.", students: 38, status: "Scheduled" },
    { id: "R-103", name: "Downtown Local", bus: "B04", driver: "James P.", students: 45, status: "Active" }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bus & Route Manager</h1>
          <p className="text-slate-500 mt-2">Manage fleet assignments, map route waypoints, and bind student rosters.</p>
        </div>
        <button className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shadow-blue-200">
          <Plus className="w-5 h-5" />
          Create New Route
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Route Configurations</h2>
            <div className="space-y-3">
              {routes.map((route, i) => (
                <div key={i} className={`p-4 rounded-xl border cursor-pointer transition-all ${i === 0 ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 bg-slate-50 hover:border-slate-300'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-semibold ${i === 0 ? 'text-blue-900' : 'text-slate-900'}`}>{route.name}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${route.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                      {route.status}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500 space-y-1">
                    <div className="flex items-center gap-2">
                      <Bus className="w-4 h-4" /> Bus {route.bus}
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-4 h-4" /> {route.driver}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" /> {route.students} Students Assigned
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-semibold text-slate-900">Route Map - North Campus Express</h2>
              <button className="text-sm text-blue-600 font-medium hover:text-blue-700">Edit Waypoints</button>
            </div>
            <div className="flex-1 bg-slate-200 relative">
              {/* Simulated Map Background */}
              <div className="absolute inset-0 bg-[#e5e7eb]" style={{backgroundImage: "radial-gradient(#d1d5db 1px, transparent 1px)", backgroundSize: "20px 20px"}}></div>
              
              {/* Simulated Map Markers */}
              <div className="absolute top-1/4 left-1/4 flex flex-col items-center group cursor-pointer">
                <div className="bg-white px-2 py-1 rounded text-xs font-bold text-slate-700 mb-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">Stop 1: Elm St</div>
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <MapPin className="w-3 h-3" />
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 flex flex-col items-center group cursor-pointer">
                <div className="bg-white px-2 py-1 rounded text-xs font-bold text-slate-700 mb-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">Stop 2: Oak St</div>
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <MapPin className="w-3 h-3" />
                </div>
              </div>

              <div className="absolute bottom-1/4 right-1/4 flex flex-col items-center group cursor-pointer">
                <div className="bg-white px-2 py-1 rounded text-xs font-bold text-slate-700 mb-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">School Campus</div>
                <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
              
              {/* Simulated Route Line (SVG) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{zIndex: 0}}>
                <path d="M 25% 25% L 50% 50% L 75% 75%" stroke="#2563eb" strokeWidth="4" strokeDasharray="6,6" fill="none" />
              </svg>

            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Student Roster</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 text-sm font-medium text-slate-500">Student Name</th>
                  <th className="pb-3 text-sm font-medium text-slate-500">Grade</th>
                  <th className="pb-3 text-sm font-medium text-slate-500">Pickup Stop</th>
                  <th className="pb-3 text-sm font-medium text-slate-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-slate-100">
                  <td className="py-3 font-medium text-slate-900">Alex M.</td>
                  <td className="py-3 text-slate-600">8-A</td>
                  <td className="py-3 text-slate-600">Stop 1: Elm St</td>
                  <td className="py-3 text-right">
                    <button className="text-red-500 hover:text-red-600 font-medium">Remove</button>
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-3 font-medium text-slate-900">Jessica T.</td>
                  <td className="py-3 text-slate-600">9-B</td>
                  <td className="py-3 text-slate-600">Stop 2: Oak St</td>
                  <td className="py-3 text-right">
                    <button className="text-red-500 hover:text-red-600 font-medium">Remove</button>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-slate-900">Sam L.</td>
                  <td className="py-3 text-slate-600">7-C</td>
                  <td className="py-3 text-slate-600">Stop 1: Elm St</td>
                  <td className="py-3 text-right">
                    <button className="text-red-500 hover:text-red-600 font-medium">Remove</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <button className="mt-4 w-full py-2 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:border-blue-500 hover:text-blue-600 transition-colors">
              + Add Student to Roster
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
