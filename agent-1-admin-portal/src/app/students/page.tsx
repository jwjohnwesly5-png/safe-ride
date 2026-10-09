"use client";

import { useState } from "react";
import { UserPlus, Camera, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function StudentOnboarding() {
  const [step, setStep] = useState(1);
  const [vectorGenerated, setVectorGenerated] = useState(false);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Student Onboarding</h1>
        <p className="text-slate-500 mt-2">Enroll new students, capture biometric consent, and generate 512-d facial vectors.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Progress bar */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          {[
            { num: 1, label: "Student Details" },
            { num: 2, label: "Parent Details & Consent" },
            { num: 3, label: "Biometric Setup" }
          ].map((s) => (
            <div key={s.num} className={`flex-1 py-4 px-6 text-sm font-medium ${step >= s.num ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>
              <div className="flex items-center gap-2">
                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${step >= s.num ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {s.num}
                </span>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-900">Student Information</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">First Name</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Enter first name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Last Name</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Enter last name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Student ID</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="e.g. STU-2023-0142" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Grade / Section</label>
                  <select className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 bg-white">
                    <option>Select grade...</option>
                    <option>Grade 8 - Section A</option>
                    <option>Grade 8 - Section B</option>
                    <option>Grade 9 - Section A</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button onClick={() => setStep(2)} className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
                  Continue to Parent Details
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-900">Parent / Guardian Details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Parent Full Name</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Enter parent name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Contact Number</label>
                  <input type="tel" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="+1 (555) 000-0000" />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium text-slate-700">Email Address (For App Login)</label>
                  <input type="email" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="parent@example.com" />
                </div>
              </div>
              
              <div className="mt-8 p-5 bg-blue-50 border border-blue-100 rounded-xl">
                <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  Digital Consent Collection
                </h3>
                <p className="text-sm text-blue-800 mt-2">
                  By checking this box, the parent provides explicit consent for the SafeRide AI system to extract and securely store a 512-dimensional facial embedding vector of their child strictly for the purpose of bus boarding verification. No raw images will be stored on cloud servers.
                </p>
                <label className="flex items-center gap-3 mt-4">
                  <input type="checkbox" className="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm font-medium text-blue-900">I confirm parent has signed the biometric consent form.</span>
                </label>
              </div>

              <div className="pt-4 flex justify-between">
                <button onClick={() => setStep(1)} className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors">
                  Back
                </button>
                <button onClick={() => setStep(3)} className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
                  Continue to Biometrics
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-900">Facial Vector Extraction</h2>
              <p className="text-slate-500">Take a photo to generate the 512-d biometric embedding. The photo will be immediately discarded after vector extraction.</p>
              
              {!vectorGenerated ? (
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 flex flex-col items-center justify-center bg-slate-50 text-center">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <Camera className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Capture Student Photo</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm mb-6">Align the student's face in the camera to extract features.</p>
                  <button onClick={() => setVectorGenerated(true)} className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Simulate Capture & Extract Vector
                  </button>
                </div>
              ) : (
                <div className="border-2 border-emerald-100 bg-emerald-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-emerald-900">Vector Extracted Successfully</h3>
                  <p className="text-sm text-emerald-700 mt-2 max-w-md">
                    Generated 512-d float array (e.g. [-0.043, 0.12, ...]). Raw image deleted from memory. Ready to save to PostgreSQL pgvector column.
                  </p>
                </div>
              )}

              <div className="pt-4 flex justify-between">
                <button onClick={() => setStep(2)} className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors">
                  Back
                </button>
                <button 
                  disabled={!vectorGenerated} 
                  onClick={async () => {
                    try {
                      // Example Supabase insert call:
                      // const { data, error } = await supabase.from('students').insert([
                      //   { 
                      //     first_name: 'Jane', 
                      //     last_name: 'Doe', 
                      //     facial_vector: '[0.01, -0.05, ...]',
                      //     // ... other fields
                      //   }
                      // ]);
                      // if (error) throw error;
                      alert('Student successfully enrolled and data saved to Supabase (Simulation)!');
                    } catch (err) {
                      console.error('Error saving to Supabase:', err);
                      alert('Error saving to Supabase. Check console.');
                    }
                  }} 
                  className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Complete Enrollment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
