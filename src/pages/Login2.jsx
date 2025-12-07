import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexts';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, googleLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      // Redirect to the intended page or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError(`${isSignup ? 'Sign up' : 'Sign in'} failed: ` + err.message);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await googleLogin();
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError('Google sign-in failed: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div
      className="
        fixed inset-0 w-screen h-screen
        flex items-center justify-end
        bg-no-repeat bg-center bg-cover
        pr-4 md:pr-24
      "
      style={{ backgroundImage: "url('/finallogin.png')" }}
    >
      <div className="relative w-full max-w-xs md:max-w-sm mr-0 md:mr-12">
        <div className="absolute inset-0 bg-white/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20" />
        <div className="absolute -top-8 -left-8 w-24 h-24 bg-gradient-to-br from-green-200/60 to-green-400/40 rounded-full blur-2xl opacity-80 pointer-events-none" />
        <div className="relative z-10 p-7 md:p-8">
          <h2 className="text-2xl font-extralight mb-6 text-center text-green-900 tracking-widest drop-shadow">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>

          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-0 py-2.5 bg-transparent border-b border-green-300/60 focus:border-green-500 focus:outline-none transition-colors text-base placeholder-green-700/60 font-light"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="username"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-0 py-2.5 bg-transparent border-b border-green-300/60 focus:border-green-500 focus:outline-none transition-colors text-base placeholder-green-700/60 font-light"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              minLength={isSignup ? 6 : undefined}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2.5 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  {isSignup ? "Signing up..." : "Signing in..."}
                </span>
              ) : (
                isSignup ? "Sign Up" : "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg disabled:opacity-70"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M21.35 11.1H12v2.8h5.35c-.23 1.25-1.4 3.66-5.35 3.66-3.22 0-5.85-2.67-5.85-5.96s2.63-5.96 5.85-5.96c1.83 0 3.06.78 3.76 1.45l2.56-2.5C16.15 3.83 14.27 3 12 3 6.48 3 2 7.48 2 13s4.48 10 10 10c5.52 0 10-4.48 10-10 0-.67-.07-1.33-.2-1.9z" />
              </svg>
              Sign in with Google
            </button>
          </div>

          <div className="flex justify-between items-center mt-5">
            <a href="#" className="text-xs text-green-700/70 hover:text-green-800 transition-colors">Forgot?</a>
            <button
              type="button"
              onClick={() => setIsSignup((prev) => !prev)}
              className="text-xs text-green-700/70 hover:text-green-800 transition-colors"
            >
              {isSignup ? "Have an account? Sign In" : "Create account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;