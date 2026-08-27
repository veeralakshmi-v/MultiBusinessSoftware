import React, { useState } from 'react';
import { useAuth, Role } from '../context/AuthContext';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Receipt, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // After login go to requested redirect route
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get('redirect') || '/dashboard';
  const forcePrompt = params.get('prompt') === 'true';

  if (user && !forcePrompt) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanUser = username.trim();
      const cleanPass = password.trim();

      let token = 'demo-live-token-' + Date.now();
      let userObj = { id: 'user-admin', username: cleanUser || 'admin', role: 'ADMIN' as Role };

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanUser, password: cleanPass }),
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (data && data.token) {
              token = data.token;
              userObj = data.user;
            }
          }
        }
      } catch (e) {
        // Fall back to client demo authentication
      }

      if (cleanUser === 'admin' && (cleanPass === 'admin123' || cleanPass === 'admin')) {
        login(token, userObj);
        navigate(redirectTo, { replace: true });
      } else {
        throw new Error('Invalid username or password');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-[#C5A059] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#C5A059]/20">
            <Receipt className="h-8 w-8 text-[#0A0A0B]" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-serif font-bold tracking-tight text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Multi-Business Billing System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#131315] py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-[#1F1F21]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-[#2D2D30] bg-[#0A0A0B] px-3 py-2.5 text-white placeholder-gray-500 shadow-sm focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059] sm:text-sm"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-[#2D2D30] bg-[#0A0A0B] px-3 py-2.5 text-white placeholder-gray-500 shadow-sm focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059] sm:text-sm"
                  placeholder="admin123"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[#2D2D30] bg-[#0A0A0B] text-[#C5A059] focus:ring-[#C5A059] accent-[#C5A059]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-[#C5A059] hover:text-[#b08d4a]">
                  Forgot your password?
                </a>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "flex w-full justify-center rounded-lg border border-transparent bg-[#C5A059] py-2.5 px-4 text-sm font-bold tracking-widest uppercase text-[#0A0A0B] shadow-lg shadow-[#C5A059]/20 hover:bg-[#b08d4a] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 focus:ring-offset-[#131315] transition-all duration-200",
                  loading && "opacity-70 cursor-not-allowed"
                )}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 border-t border-[#1F1F21] pt-6">
             <div className="text-xs text-center text-gray-500">
                <p>Default Admin credentials:</p>
                <p className="font-mono text-[#C5A059] mt-1">admin / admin123</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
