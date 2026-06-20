import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('driver');
  
  // Custom vehicle fields for driver
  const [vehicleName, setVehicleName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [fuelType, setFuelType] = useState('Petrol');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear state on mount
  useEffect(() => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setVehicleName('');
    setRegNumber('');
    setFuelType('Petrol');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[Register] Form submission started for email:', email);
    
    // Validate empty inputs
    if (!name || !email || !password || !confirmPassword) {
      console.warn('[Register] Missing mandatory registration fields.');
      setError('Please fill in all fields.');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.warn('[Register] Invalid email format:', email);
      setError('Invalid email address.');
      return;
    }
    
    if (role === 'driver') {
      if (!vehicleName || !regNumber || !fuelType) {
        console.warn('[Register] Missing vehicle registration fields for driver.');
        setError('Please fill in all vehicle and driver fields.');
        return;
      }
    }
    
    if (password.length < 6) {
      console.warn('[Register] Password length is too short.');
      setError('Password must be at least 6 characters.');
      return;
    }
    
    if (password !== confirmPassword) {
      console.warn('[Register] Passwords do not match.');
      setError('Passwords do not match.');
      return;
    }
    
    setError('');
    setSuccess('');
    setLoading(true);

    const formData = {
      name,
      email,
      role,
      ...(role === 'driver' ? { vehicleName, regNumber, fuelType } : {})
    };
    console.log('[REGISTER]', formData);

    try {
      console.log('[Register] Attempting auth sign-up...');
      await register(email, password, formData);
      console.log('[Register] Auth sign-up successful.');
      setSuccess('Account created successfully! Redirecting to login...');
      
      // Clear fields after successful registration
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setVehicleName('');
      setRegNumber('');
      setFuelType('Petrol');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('[AUTH ERROR]', err);
      setError(err.message || 'Failed to create account.');
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex bg-[#070708] text-[#f1f1f3] font-sans selection:bg-[#22c55e] selection:text-[#070708]">
      
      {/* Left Column - Form */}
      <div className="w-full flex flex-col justify-center px-8 sm:px-16 lg:px-24 overflow-y-auto py-8">
        <div className="max-w-[400px] w-full mx-auto flex flex-col gap-5">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
            <span className="text-lg font-semibold tracking-tight">EcoTrack</span>
          </div>

          <div>
            <h2 className="text-[26px] font-extralight text-white leading-tight">Create your account</h2>
            <p className="text-[13px] text-[#6b6b7a] mt-1">Start monitoring your carbon footprint</p>
          </div>

          {error && (
            <div className="bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.15)] text-[#ef4444] text-[12px] p-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-[rgba(34,197,94,0.06)] border border-[rgba(34,197,94,0.15)] text-[#22c55e] text-[12px] p-3 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" autoComplete="off">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-[#6b6b7a] tracking-[0.8px] uppercase">FULL NAME</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Salvin Saji"
                autoComplete="off"
                name="eco_name_nofill"
                data-lpignore="true"
                data-form-type="other"
                className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-lg px-3.5 py-2.5 text-[13px] text-[#f1f1f3] placeholder-[#3a3a45] focus:outline-none focus:border-[rgba(34,197,94,0.4)] focus:ring-4 focus:ring-[rgba(34,197,94,0.06)] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-[#6b6b7a] tracking-[0.8px] uppercase">EMAIL ADDRESS</label>
              <input 
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver@ecotrack.com"
                autoComplete="off"
                name="eco_reg_email_nofill"
                data-lpignore="true"
                data-form-type="other"
                spellCheck="false"
                className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-lg px-3.5 py-2.5 text-[13px] text-[#f1f1f3] placeholder-[#3a3a45] focus:outline-none focus:border-[rgba(34,197,94,0.4)] focus:ring-4 focus:ring-[rgba(34,197,94,0.06)] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-[#6b6b7a] tracking-[0.8px] uppercase">ACCOUNT TYPE</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setRole('driver')}
                  className={`py-2 rounded-lg text-[13px] font-medium transition-all border ${
                    role === 'driver' 
                      ? 'bg-[rgba(34,197,94,0.06)] border-[#22c55e] text-[#22c55e]' 
                      : 'bg-[#131316] border-[rgba(255,255,255,0.06)] text-[#6b6b7a]'
                  }`}
                >
                  Driver
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2 rounded-lg text-[13px] font-medium transition-all border ${
                    role === 'admin' 
                      ? 'bg-[rgba(34,197,94,0.06)] border-[#22c55e] text-[#22c55e]' 
                      : 'bg-[#131316] border-[rgba(255,255,255,0.06)] text-[#6b6b7a]'
                  }`}
                >
                  Gov Admin
                </button>
              </div>
            </div>

            {role === 'driver' && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-[#6b6b7a] tracking-[0.8px] uppercase">VEHICLE MODEL</label>
                  <input 
                    type="text"
                    value={vehicleName}
                    onChange={(e) => setVehicleName(e.target.value)}
                    placeholder="e.g. Tesla Model 3 / EcoCar"
                    autoComplete="off"
                    className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-lg px-3.5 py-2.5 text-[13px] text-[#f1f1f3] placeholder-[#3a3a45] focus:outline-none focus:border-[rgba(34,197,94,0.4)] focus:ring-4 focus:ring-[rgba(34,197,94,0.06)] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-[#6b6b7a] tracking-[0.8px] uppercase">REGISTRATION NUMBER</label>
                  <input 
                    type="text"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    placeholder="e.g. MH-12-XX-0000"
                    autoComplete="off"
                    className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-lg px-3.5 py-2.5 text-[13px] text-[#f1f1f3] placeholder-[#3a3a45] focus:outline-none focus:border-[rgba(34,197,94,0.4)] focus:ring-4 focus:ring-[rgba(34,197,94,0.06)] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-[#6b6b7a] tracking-[0.8px] uppercase">FUEL TYPE</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-lg px-3.5 py-2.5 text-[13px] text-[#f1f1f3] focus:outline-none focus:border-[rgba(34,197,94,0.4)] focus:ring-4 focus:ring-[rgba(34,197,94,0.06)] transition-all cursor-pointer"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="EV">EV</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-[#6b6b7a] tracking-[0.8px] uppercase">PASSWORD</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                name="eco_reg_pw_nofill"
                data-lpignore="true"
                data-form-type="other"
                className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-lg px-3.5 py-2.5 text-[13px] text-[#f1f1f3] placeholder-[#3a3a45] focus:outline-none focus:border-[rgba(34,197,94,0.4)] focus:ring-4 focus:ring-[rgba(34,197,94,0.06)] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-[#6b6b7a] tracking-[0.8px] uppercase">CONFIRM PASSWORD</label>
              <input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                name="eco_reg_cpw_nofill"
                data-lpignore="true"
                data-form-type="other"
                className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-lg px-3.5 py-2.5 text-[13px] text-[#f1f1f3] placeholder-[#3a3a45] focus:outline-none focus:border-[rgba(34,197,94,0.4)] focus:ring-4 focus:ring-[rgba(34,197,94,0.06)] transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-70 disabled:pointer-events-none text-[#070708] text-[13px] font-semibold py-3 rounded-lg transition-all shadow-[0_4px_12px_rgba(34,197,94,0.15)] mt-2`}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center my-1 text-[#3a3a45] text-xs justify-center gap-3">
            <span className="h-[1px] bg-[rgba(255,255,255,0.04)] flex-grow"></span>
            <span>or</span>
            <span className="h-[1px] bg-[rgba(255,255,255,0.04)] flex-grow"></span>
          </div>

          <div className="text-[13px] text-[#6b6b7a] text-center">
            Already have an account? <Link to="/login" className="text-[#22c55e] hover:underline font-medium">Sign in</Link>
          </div>

        </div>
      </div>

    </div>
  );
}
