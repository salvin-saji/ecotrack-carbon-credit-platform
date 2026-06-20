import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  // readOnly trick — fields start readOnly so browser can't inject autofill.
  // After a short delay they become interactive. This defeats Chrome/Edge/Safari
  // credential injection which happens on mount before any user interaction.
  const [emailRO,    setEmailRO]    = useState(true);
  const [passwordRO, setPasswordRO] = useState(true);

  const emailRef    = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    // Force blank state on every mount (logout, refresh, revisit)
    setEmail('');
    setPassword('');
    setError('');

    // Remove readOnly after 200 ms — autofill has already been blocked by then
    const t = setTimeout(() => {
      setEmailRO(false);
      setPasswordRO(false);
    }, 200);

    // Aggressively clear any value the browser may have injected anyway
    if (emailRef.current)    emailRef.current.value    = '';
    if (passwordRef.current) passwordRef.current.value = '';

    return () => clearTimeout(t);
  }, []);

  // Extra guard: if browser manages to inject after readOnly lifts, clear it
  useEffect(() => {
    if (!emailRO && !passwordRO) {
      if (emailRef.current    && emailRef.current.value    !== email)    emailRef.current.value    = '';
      if (passwordRef.current && passwordRef.current.value !== password) passwordRef.current.value = '';
    }
  }, [emailRO, passwordRO, email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) { setError('Please fill in all fields.'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError('Invalid email address.'); return; }
    if (password.length < 6)    { setError('Password must be at least 6 characters.'); return; }

    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      console.log('[LOGIN SUCCESS]', user);
      setEmail('');
      setPassword('');
      navigate('/dashboard');
    } catch (err) {
      console.error('[AUTH ERROR]', err);
      setError(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-lg " +
    "px-3.5 py-2.5 text-[13px] text-[#f1f1f3] placeholder-[#3a3a45] " +
    "focus:outline-none focus:border-[rgba(34,197,94,0.4)] " +
    "focus:ring-4 focus:ring-[rgba(34,197,94,0.06)] transition-all";

  return (
    <div className="w-screen h-screen flex bg-[#070708] text-[#f1f1f3] font-sans selection:bg-[#22c55e] selection:text-[#070708]">

      {/* ── Honeypot fields: invisible, absorb browser autofill before real inputs ── */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none', tabIndex: -1 }}>
        <input type="text"     name="username"       tabIndex={-1} autoComplete="username"        readOnly />
        <input type="email"    name="email"          tabIndex={-1} autoComplete="email"           readOnly />
        <input type="password" name="password"       tabIndex={-1} autoComplete="current-password" readOnly />
      </div>

      {/* Left Column - Form */}
      <div className="w-full flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <div className="max-w-[400px] w-full mx-auto flex flex-col gap-6">

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
            <span className="text-lg font-semibold tracking-tight">EcoTrack</span>
          </div>

          <div>
            <h2 className="text-[28px] font-extralight text-white leading-tight">Welcome back</h2>
            <p className="text-[13px] text-[#6b6b7a] mt-1.5">Sign in to your EcoTrack dashboard</p>
          </div>

          {error && (
            <div className="bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.15)] text-[#ef4444] text-[12px] p-3 rounded-lg">
              {error}
            </div>
          )}

          {/*
            autoComplete="off" on form.
            Inputs use readOnly initially (lifted after 200ms) to defeat Chrome's
            credential injection. name attributes use non-standard values so the
            browser's credential manager does not recognize them.
          */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            autoComplete="off"
          >
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-[#6b6b7a] tracking-[0.8px] uppercase">
                EMAIL ADDRESS
              </label>
              <input
                ref={emailRef}
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setEmailRO(false)}
                placeholder="driver@ecotrack.com"
                readOnly={emailRO}
                autoComplete="off"
                name="eco_nofill_email"
                data-lpignore="true"
                data-form-type="other"
                spellCheck="false"
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-semibold text-[#6b6b7a] tracking-[0.8px] uppercase">
                  PASSWORD
                </label>
                <button type="button" className="text-[11px] text-[#3a3a45] hover:text-[#6b6b7a] transition-colors">
                  Forgot password?
                </button>
              </div>
              <input
                ref={passwordRef}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setPasswordRO(false)}
                placeholder="••••••••"
                readOnly={passwordRO}
                autoComplete="new-password"
                name="eco_nofill_pw"
                data-lpignore="true"
                data-form-type="other"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-70 disabled:pointer-events-none text-[#070708] text-[13px] font-semibold py-3 rounded-lg transition-all shadow-[0_4px_12px_rgba(34,197,94,0.15)] mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center my-2 text-[#3a3a45] text-xs justify-center gap-3">
            <span className="h-[1px] bg-[rgba(255,255,255,0.04)] flex-grow"></span>
            <span>or</span>
            <span className="h-[1px] bg-[rgba(255,255,255,0.04)] flex-grow"></span>
          </div>

          <div className="text-[13px] text-[#6b6b7a] text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#22c55e] hover:underline font-medium">
              Create account
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
