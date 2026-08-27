import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Lock, ArrowLeft, Clock, CalendarDays, FileCheck, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function EmployeeLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) { setError('Please enter your employee ID or username.'); return; }
    if (!pin.trim()) { setError('Please enter your PIN.'); return; }

    setLoading(true);

    // Verify against saved staff list
    const staffRaw = localStorage.getItem('universal_staff_list');
    const staffList = staffRaw ? JSON.parse(staffRaw) : [];
    const match = staffList.find(
      (s: { username: string; pinCode: string; status: string }) =>
        s.username.toLowerCase() === username.trim().toLowerCase() &&
        s.pinCode === pin.trim() &&
        s.status === 'ACTIVE'
    );

    setTimeout(() => {
      setLoading(false);
      if (match) {
        // Store employee session
        localStorage.setItem('employee_session', JSON.stringify({
          id: match.id,
          name: match.name,
          username: match.username,
          role: match.role,
          phone: match.phone,
          email: match.email,
        }));
        navigate('/employee');
      } else {
        setError('Invalid employee ID or PIN. Please try again.');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full bg-[#080809] text-white font-sans flex flex-col relative overflow-hidden">

      {/* Ambient glow */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-cyan-500/6 blur-[140px] pointer-events-none translate-x-1/3 -translate-y-1/4" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#C5A059]/5 blur-[130px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

      {/* Top bar */}
      <header className="px-6 py-4 flex items-center border-b border-white/[0.06] bg-black/20 backdrop-blur-xl z-10 relative">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-[#0E0E10] border border-cyan-500/20 rounded-3xl shadow-2xl overflow-hidden">

            {/* Top accent */}
            <div className="h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

            <div className="p-8">
              {/* Icon + Title */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/10">
                  <UserCircle className="w-8 h-8 text-cyan-400" />
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">Employee Login</h1>
                <p className="text-xs text-gray-500 mt-1.5">Enter your Employee ID and PIN to access your portal</p>
              </div>

              {/* Features preview */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { icon: Clock, label: 'Punch IN/OUT', color: '#22d3ee' },
                  { icon: CalendarDays, label: 'Apply Leave', color: '#f472b6' },
                  { icon: FileCheck, label: 'Leave History', color: '#34d399' },
                ].map(f => {
                  const Icon = f.icon;
                  return (
                    <div key={f.label} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                      <Icon className="w-4 h-4" style={{ color: f.color }} />
                      <span className="text-[9px] text-gray-500 text-center leading-tight font-mono">{f.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-semibold">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Employee ID / Username
                  </label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full bg-[#141416] border border-[#2A2A2D] hover:border-[#3A3A3D] focus:border-cyan-500/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    PIN Code
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={pin}
                      onChange={e => setPin(e.target.value)}
                      placeholder="Enter your PIN"
                      maxLength={6}
                      className="w-full bg-[#141416] border border-[#2A2A2D] hover:border-[#3A3A3D] focus:border-cyan-500/60 rounded-xl pl-10 pr-12 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors font-mono tracking-widest"
                    />
                    <button type="button" onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 hover:border-cyan-500/70 text-cyan-300 font-bold text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                  ) : (
                    <><UserCircle className="w-4 h-4" /> Access Employee Portal</>
                  )}
                </button>
              </form>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
