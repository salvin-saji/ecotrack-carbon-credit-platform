import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import PremiumButton from '../ui/PremiumButton';
import PremiumInput from '../ui/PremiumInput';
import PasswordStrength from '../ui/PasswordStrength';
import ToastNotification from '../ui/ToastNotification';

export default function AuthCard() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [showForgot, setShowForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'error' });

  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [fuelType, setFuelType] = useState('Petrol');
  
  // Field errors
  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};
    if (!email) nextErrors.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) nextErrors.email = 'Email address is invalid.';

    if (!password) nextErrors.password = 'Password is required.';
    else if (password.length < 6) nextErrors.password = 'Password must be at least 6 characters.';

    if (activeTab === 'register') {
      if (!name) nextErrors.name = 'Full name is required.';
      if (password !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';
      if (!vehicleName) nextErrors.vehicleName = 'Vehicle model is required.';
      if (!regNumber) nextErrors.regNumber = 'Registration number is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      if (activeTab === 'login') {
        await login(email, password);
        setToast({ message: 'Welcome back to EcoTrack!', type: 'success' });
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        await register(email, password, {
          name,
          vehicleName,
          regNumber,
          fuelType,
          userType: 'Driver'
        });
        setToast({ message: 'Account created successfully!', type: 'success' });
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (err) {
      setToast({ message: err.message || 'Authentication failed. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!email) {
      setErrors({ email: 'Please enter your email to reset password.' });
      return;
    }
    setLoading(true);
    // Mimic password reset email behavior
    setTimeout(() => {
      setToast({ message: 'If this email is registered, a reset link has been sent.', type: 'info' });
      setLoading(false);
      setShowForgot(false);
    }, 1200);
  };

  return (
    <div className="relative w-full max-w-[440px] z-10 px-4 md:px-0">
      <ToastNotification 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'error' })} 
      />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full bg-[#0d0d10]/85 border border-[rgba(255,255,255,0.06)] backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.8),_inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden"
      >
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] shadow-[0_0_10px_rgba(34,197,94,0.4)]"></span>
            <span className="text-xs font-semibold tracking-wider text-white/95 uppercase">EcoTrack</span>
          </div>

          {/* Simple slide pill tab switcher */}
          <div className="relative flex bg-[#131316] rounded-xl p-0.5 border border-[rgba(255,255,255,0.02)]">
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => { setActiveTab('login'); setErrors({}); }}
              className={`relative z-10 px-4 py-1.5 text-[11px] font-semibold tracking-wide transition-colors duration-200 ${activeTab === 'login' ? 'text-[#070708]' : 'text-[#6b6b7a] hover:text-[#f1f1f3]'}`}
            >
              LOGIN
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => { setActiveTab('register'); setErrors({}); }}
              className={`relative z-10 px-4 py-1.5 text-[11px] font-semibold tracking-wide transition-colors duration-200 ${activeTab === 'register' ? 'text-[#070708]' : 'text-[#6b6b7a] hover:text-[#f1f1f3]'}`}
            >
              REGISTER
            </motion.button>
            
            {/* Tab highlight selector */}
            <motion.div
              layoutId="activeTabSelector"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute top-0.5 bottom-0.5 left-0.5 rounded-[10px] bg-[#22c55e] shadow-[0_0_12px_rgba(34,197,94,0.15),_0_1px_4px_rgba(0,0,0,0.4)] border border-[rgba(34,197,94,0.08)]"
              style={{
                width: activeTab === 'login' ? '60px' : '78px',
                left: activeTab === 'login' ? '2px' : '62px'
              }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!showForgot ? (
            <motion.form
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'login' ? -15 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === 'login' ? 15 : -15 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleAuthSubmit}
              className="flex flex-col gap-4"
              noValidate
            >
              <div>
                <h3 className="text-xl font-light text-white tracking-tight">
                  {activeTab === 'login' ? 'Welcome back' : 'Create an Account'}
                </h3>
                <p className="text-[12px] text-[#6b6b7a] mt-0.5">
                  {activeTab === 'login' ? 'Sign in to access eco analytics.' : 'Become a certified eco-friendly driver.'}
                </p>
              </div>

              {activeTab === 'register' && (
                <PremiumInput
                  label="FULL NAME"
                  placeholder="Arjun Mehta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                  required
                />
              )}

              <PremiumInput
                label="EMAIL ADDRESS"
                type="email"
                placeholder="driver@ecotrack.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                required
              />

              <div className="flex flex-col gap-1">
                <PremiumInput
                  label="PASSWORD"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  required
                />
                {activeTab === 'register' && password && (
                  <PasswordStrength password={password} />
                )}
              </div>

              {activeTab === 'register' && (
                <>
                  <PremiumInput
                    label="CONFIRM PASSWORD"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={errors.confirmPassword}
                    required
                  />

                  <div className="grid grid-cols-2 gap-3.5">
                    <PremiumInput
                      label="VEHICLE MODEL"
                      placeholder="Hyundai i20"
                      value={vehicleName}
                      onChange={(e) => setVehicleName(e.target.value)}
                      error={errors.vehicleName}
                      required
                    />
                    <PremiumInput
                      label="REGISTRATION NO."
                      placeholder="MH-12-XX-0000"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      error={errors.regNumber}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-semibold text-[#6b6b7a] tracking-[0.8px] uppercase select-none">
                      FUEL TYPE
                    </label>
                    <select
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value)}
                      className="w-full bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-xl px-3.5 py-2.5 text-[13px] text-[#f1f1f3] focus:outline-none focus:border-[#22c55e] transition-all"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="CNG">CNG / LPG</option>
                      <option value="Electric">Electric / EV</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setShowForgot(true); setErrors({}); }}
                    className="text-[11px] text-[#6b6b7a] hover:text-[#22c55e] transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <PremiumButton
                type="submit"
                loading={loading}
                className="w-full mt-2"
              >
                {activeTab === 'login' ? 'SIGN IN' : 'REGISTER DRIVER'}
              </PremiumButton>
            </motion.form>
          ) : (
            <motion.form
              key="forgot"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleResetPassword}
              className="flex flex-col gap-4"
              noValidate
            >
              <div>
                <h3 className="text-xl font-light text-white tracking-tight">Forgot Password?</h3>
                <p className="text-[12px] text-[#6b6b7a] mt-0.5">
                  Enter your email address and we'll send a password recovery link.
                </p>
              </div>

              <PremiumInput
                label="EMAIL ADDRESS"
                type="email"
                placeholder="driver@ecotrack.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                required
              />

              <div className="flex gap-3 mt-2">
                <PremiumButton
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForgot(false)}
                  className="flex-1"
                >
                  BACK
                </PremiumButton>
                <PremiumButton
                  type="submit"
                  loading={loading}
                  className="flex-1"
                >
                  SEND RESET
                </PremiumButton>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
