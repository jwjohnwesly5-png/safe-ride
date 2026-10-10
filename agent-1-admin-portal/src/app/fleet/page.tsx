"use client";

import { useState } from "react";
import { MapPin, Bus, UserCircle, Users, Plus, Trash2, X } from "lucide-react";

export default function FleetManager() {
  const [routes, setRoutes] = useState([
    { id: "R-101", name: "North Campus Express", bus: "B01", driver: "Michael D.", students: 42, status: "Active", stop1: "Oakridge Residence", stop2: "Greenwood Apartments" },
    { id: "R-102", name: "Westside Circuit", bus: "B02", driver: "Sarah W.", students: 38, status: "Scheduled", stop1: "Westside Hub", stop2: "Sunset Blvd" },
    { id: "R-103", name: "Downtown Local", bus: "B04", driver: "James P.", students: 45, status: "Active", stop1: "Central Park", stop2: "5th Avenue" }
  ]);

  const [selectedRouteId, setSelectedRouteId] = useState("R-101");
  const [roster, setRoster] = useState([
    { id: "1", name: "Alex Morgan", grade: "8-A", stop: "Oakridge Residence" },
    { id: "2", name: "Jessica Taylor", grade: "9-B", stop: "Greenwood Apartments" },
    { id: "3", name: "Sam Lee", grade: "7-C", stop: "Oakridge Residence" }
  ]);

  const [showCreateRouteModal, setShowCreateRouteModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // New Route Form
  const [newRouteName, setNewRouteName] = useState("");
  const [newBusNumber, setNewBusNumber] = useState("B05");
  const [newDriverName, setNewDriverName] = useState("");

  // New Student Roster Form
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentGrade, setNewStudentGrade] = useState("8-A");

  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteName) return;

    const newR = {
      id: `R-${100 + routes.length + 1}`,
      name: newRouteName,
      bus: newBusNumber,
      driver: newDriverName || "Assigned Driver",
      students: 0,
      status: "Active",
      stop1: "Stop 1",
      stop2: "Stop 2"
    };

    setRoutes(prev => [...prev, newR]);
    setSelectedRouteId(newR.id);
    setShowCreateRouteModal(false);
    setNewRouteName("");
  };

  const handleAddStudentToRoster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName) return;

    const newStu = {
      id: `stu-${Date.now()}`,
      name: newStudentName,
      grade: newStudentGrade,
      stop: selectedRoute.stop1
    };

    setRoster(prev => [...prev, newStu]);
    setShowAddStudentModal(false);
    setNewStudentName("");
  };

  const handleRemoveStudent = (id: string) => {
    setRoster(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bus & Route Manager</h1>
          <p className="text-slate-500 mt-2">Manage fleet assignments, map route waypoints, and bind student rosters.</p>
        </div>
        <button
          onClick={() => setShowCreateRouteModal(true)}
          className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shadow-blue-200"
        >
          <Plus className="w-5 h-5" />
          Create New Route
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Route Configurations</h2>
            <div className="space-y-3">
              {routes.map((route) => {
                const isSelected = selectedRouteId === route.id;
                return (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRouteId(route.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-slate-100 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>{route.name}</h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${route.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                        {route.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 space-y-1">
                      <div className="flex items-center gap-2">
                        <Bus className="w-4 h-4 text-blue-600" /> Bus {route.bus}
                      </div>
                      <div className="flex items-center gap-2">
                        <UserCircle className="w-4 h-4 text-slate-500" /> {route.driver}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600" /> {route.students} Students Assigned
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-semibold text-slate-900">Route Map - {selectedRoute.name} (Bus {selectedRoute.bus})</h2>
              <button
                onClick={() => alert(`Editing Waypoints for ${selectedRoute.name}: Waypoints active.`)}
                className="text-sm text-blue-600 font-medium hover:text-blue-700"
              >
                Edit Waypoints
              </button>
            </div>
            <div className="flex-1 bg-slate-200 relative">
              {/* Simulated Map Background */}
              <div className="absolute inset-0 bg-[#e5e7eb]" style={{backgroundImage: "radial-gradient(#d1d5db 1px, transparent 1px)", backgroundSize: "20px 20px"}}></div>
              
              {/* Map Stop Markers */}
              <div className="absolute top-1/4 left-1/4 flex flex-col items-center group cursor-pointer">
                <div className="bg-white px-2 py-1 rounded text-xs font-bold text-slate-700 mb-1 shadow-sm opacity-100">
                  {selectedRoute.stop1} (50m Radius)
                </div>
                <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 flex flex-col items-center group cursor-pointer">
                <div className="bg-white px-2 py-1 rounded text-xs font-bold text-slate-700 mb-1 shadow-sm opacity-100">
                  {selectedRoute.stop2}
                </div>
                <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>

              <div className="absolute bottom-1/4 right-1/4 flex flex-col items-center group cursor-pointer">
                <div className="bg-white px-2 py-1 rounded text-xs font-bold text-slate-700 mb-1 shadow-sm opacity-100">
                  School Campus Destination
                </div>
                <div className="w-9 h-9 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <MapPin className="w-5 h-5" />
                </div>
              </div>
              
              {/* SVG Route Connection */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{zIndex: 0}}>
                <path d="M 25% 25% L 50% 50% L 75% 75%" stroke="#2563eb" strokeWidth="4" strokeDasharray="6,6" fill="none" />
              </svg>

            </div>
          </div>

          {/* Student Roster Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Student Roster for {selectedRoute.name} ({roster.length})
            </h2>
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
                {roster.map((stu) => (
                  <tr key={stu.id} className="border-b border-slate-100">
                    <td className="py-3 font-medium text-slate-900">{stu.name}</td>
                    <td className="py-3 text-slate-600">{stu.grade}</td>
                    <td className="py-3 text-slate-600">{stu.stop}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleRemoveStudent(stu.id)}
                        className="text-red-500 hover:text-red-700 font-medium inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="mt-4 w-full py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 font-medium hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              + Add Student to Roster
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Create Route */}
      {showCreateRouteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Create New Route</h3>
              <button onClick={() => setShowCreateRouteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoute} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Route Name</label>
                <input
                  type="text"
                  required
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  placeholder="e.g. Eastside Shuttle"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Bus Fleet Number</label>
                <input
                  type="text"
                  required
                  value={newBusNumber}
                  onChange={(e) => setNewBusNumber(e.target.value)}
                  placeholder="e.g. B05"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Assigned Driver Name</label>
                <input
                  type="text"
                  required
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  placeholder="e.g. Robert Martinez"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateRouteModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700"
                >
                  Create Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Student to Roster */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Add Student to {selectedRoute.name}</h3>
              <button onClick={() => setShowAddStudentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudentToRoster} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Liam Smith"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Grade / Class</label>
                <input
                  type="text"
                  required
                  value={newStudentGrade}
                  onChange={(e) => setNewStudentGrade(e.target.value)}
                  placeholder="e.g. 8-A"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700"
                >
                  Add to Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

