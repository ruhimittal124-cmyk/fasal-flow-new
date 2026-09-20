import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  User as UserIcon, 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Sparkles,
  Lock,
  Building2,
  Sprout,
  ShoppingBag,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../data/mockData';
import { PhoneInput } from './PhoneInput';
import { OTPInput } from './OTPInput';
import { 
  normalizePhoneNumber, 
  formatIndianPhoneNumber, 
  validateIndianPhoneNumber, 
  getUserProfileByPhone, 
  saveUserProfile 
} from '../utils/userProfiles';

type AuthStep = 'PHONE' | 'OTP' | 'PROFILE_SETUP';

interface AuthModalProps {
  onLoginSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess }) => {
  const { t } = useTranslation();
  const { authModalOpen, setAuthModalOpen, setCurrentUser, addToast } = useApp();

  // Multi-step authentication state
  const [step, setStep] = useState<AuthStep>('PHONE');
  const [phone, setPhone] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // OTP state
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [resendCountdown, setResendCountdown] = useState<number>(30);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);

  // Profile Setup state (for first-time users)
  const [name, setName] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [district, setDistrict] = useState<string>('Osmanabad');
  const [village, setVillage] = useState<string>('');
  const [profileError, setProfileError] = useState<string | null>(null);

  // Reset modal state when closed or opened
  useEffect(() => {
    if (authModalOpen) {
      setStep('PHONE');
      setPhone('');
      setPhoneError(null);
      setGeneratedOtp('');
      setEnteredOtp('');
      setOtpError(null);
      setName('');
      setSelectedRole('farmer');
      setDistrict('Osmanabad');
      setVillage('');
      setProfileError(null);
      setResendCountdown(30);
    }
  }, [authModalOpen]);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'OTP' && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  if (!authModalOpen) return null;

  // Generate 6-digit random numeric OTP
  const generateRandomOtp = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Step 1: Send OTP handler
  const handleSendOtp = (targetPhone?: string) => {
    const rawPhoneToVerify = targetPhone || phone;
    const cleanPhone = normalizePhoneNumber(rawPhoneToVerify);
    const validation = validateIndianPhoneNumber(cleanPhone);

    if (!validation.isValid) {
      setPhoneError(validation.error || 'Please enter a valid 10-digit mobile number');
      return;
    }

    setPhoneError(null);
    setIsSendingOtp(true);

    const newOtp = generateRandomOtp();
    setGeneratedOtp(newOtp);
    setEnteredOtp('');
    setOtpError(null);
    setResendCountdown(30);

    setTimeout(() => {
      setIsSendingOtp(false);
      setStep('OTP');

      // Dispatch alert toast for demo convenience
      addToast({
        type: 'info',
        title: 'SMS OTP Dispatched',
        message: `Your verification code is: ${newOtp} (Sent to +91 ${cleanPhone})`,
      });
    }, 450);
  };

  // Step 2: Verify OTP handler
  const handleVerifyOtp = (otpToVerify?: string) => {
    const code = otpToVerify || enteredOtp;
    if (code.length < 6) {
      setOtpError('Please enter the complete 6-digit OTP code');
      return;
    }

    setIsVerifying(true);
    setOtpError(null);

    setTimeout(() => {
      setIsVerifying(false);
      // Strict verification check
      if (code !== generatedOtp) {
        setOtpError('Invalid OTP, please try again');
        addToast({
          type: 'error',
          title: 'Verification Failed',
          message: 'Invalid OTP, please try again',
        });
        return;
      }

      // OTP Verified successfully!
      const cleanPhone = normalizePhoneNumber(phone);
      const existingUser = getUserProfileByPhone(cleanPhone);

      if (existingUser) {
        // RETURNING USER: Load saved profile directly
        setCurrentUser(existingUser);
        setAuthModalOpen(false);
        addToast({
          type: 'success',
          title: `Welcome back, ${existingUser.name}!`,
          message: `Logged in with +91 ${cleanPhone}. Role: ${existingUser.role.toUpperCase()}`,
        });
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        // FIRST-TIME USER: Proceed to Profile Setup
        setStep('PROFILE_SETUP');
      }
    }, 400);
  };

  // Step 3: Complete Profile Setup handler
  const handleCompleteProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileError('Please enter your full name');
      return;
    }

    const cleanPhone = normalizePhoneNumber(phone);
    const creationDate = new Date().toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    });

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      phone: formatIndianPhoneNumber(cleanPhone),
      role: selectedRole,
      district,
      village: village.trim() || undefined,
      state: 'Maharashtra',
      isKycVerified: true,
      rating: 5.0,
      memberSince: creationDate,
      trustScore: 90,
      freeTransactionAvailable: true,
      walletBalance: selectedRole === 'buyer' ? 100000 : 25000,
    };

    // Save uniquely to localStorage
    const saved = saveUserProfile(newUser);
    setCurrentUser(saved);
    setAuthModalOpen(false);

    addToast({
      type: 'success',
      title: `Welcome to FasalFlow, ${saved.name}!`,
      message: `Your verified ${saved.role.toUpperCase()} account is ready. First transaction is 100% free!`,
    });

    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  // Quick Demo Login helper
  const handleSelectDemoUser = (demoUser: typeof MOCK_USERS[0]) => {
    const clean = normalizePhoneNumber(demoUser.phone);
    setPhone(clean);
    setPhoneError(null);
    handleSendOtp(clean);
  };

  const cleanPhone = normalizePhoneNumber(phone);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div 
        id="auth-modal-dialog"
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transition-all my-auto"
      >
        {/* Header with Step Progress */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 relative">
          <button
            id="auth-modal-close-btn"
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-5 right-5 p-1.5 rounded-full text-emerald-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>
              {step === 'PHONE' && 'Step 1 of 2: Phone Login'}
              {step === 'OTP' && 'Step 2 of 2: OTP Verification'}
              {step === 'PROFILE_SETUP' && 'Profile Setup (New Member)'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {step === 'PHONE' && 'Sign In / Register'}
            {step === 'OTP' && 'Verify Mobile OTP'}
            {step === 'PROFILE_SETUP' && 'Create Your Profile'}
          </h2>

          <p className="text-xs text-emerald-100/80 mt-1">
            {step === 'PHONE' && 'Direct Mandi Access with Secure OTP Verification'}
            {step === 'OTP' && `Enter 6-digit code sent to +91 ${cleanPhone}`}
            {step === 'PROFILE_SETUP' && 'Setup your details once to access trade features'}
          </p>

          {/* Step Progress Bar */}
          <div className="grid grid-cols-3 gap-1.5 mt-4">
            <div className={`h-1.5 rounded-full transition-all ${step === 'PHONE' ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
            <div className={`h-1.5 rounded-full transition-all ${step === 'OTP' ? 'bg-emerald-400' : step === 'PROFILE_SETUP' ? 'bg-emerald-500' : 'bg-emerald-950/60'}`} />
            <div className={`h-1.5 rounded-full transition-all ${step === 'PROFILE_SETUP' ? 'bg-emerald-400' : 'bg-emerald-950/60'}`} />
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6">

          {/* ========================================================================= */}
          {/* STEP 1: PHONE NUMBER INPUT */}
          {/* ========================================================================= */}
          {step === 'PHONE' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Mobile Number
                </label>
                <PhoneInput
                  id="auth-phone-input"
                  value={phone}
                  onChange={(val) => {
                    setPhone(val);
                    if (phoneError) setPhoneError(null);
                  }}
                  onEnterPress={() => handleSendOtp()}
                  error={phoneError}
                  autoFocus
                />
              </div>

              <button
                id="auth-send-otp-btn"
                type="button"
                onClick={() => handleSendOtp()}
                disabled={isSendingOtp || cleanPhone.length !== 10}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:cursor-not-allowed hover:shadow-emerald-600/20"
              >
                {isSendingOtp ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Sending SMS OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick Demo Logins Section */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Or Test with Demo Account
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                    Pre-saved Profiles
                  </span>
                </div>

                <div className="space-y-2">
                  {MOCK_USERS.map((demo) => {
                    const demoDigits = normalizePhoneNumber(demo.phone);
                    return (
                      <button
                        key={demo.id}
                        type="button"
                        onClick={() => handleSelectDemoUser(demo)}
                        className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            {demo.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-emerald-950">
                              {demo.name}
                            </p>
                            <p className="text-[11px] text-slate-500 capitalize">
                              {demo.role} • {demo.phone}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white px-2 py-1 rounded-lg transition-colors">
                          Send OTP
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: OTP VERIFICATION */}
          {/* ========================================================================= */}
          {step === 'OTP' && (
            <div className="space-y-6">
              {/* Phone info banner */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Sent to Mobile</span>
                    <span className="text-xs font-bold text-slate-900">+91 {cleanPhone}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('PHONE');
                    setEnteredOtp('');
                    setOtpError(null);
                  }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* Demo Simulation Alert Banner with Generated OTP */}
              <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-amber-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Demo SMS Gateway</span>
                  </div>
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-semibold px-1.5 py-0.5 rounded">
                    Simulated
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-amber-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500 font-medium">Your One-Time Code:</span>
                    <span className="font-mono text-base font-black tracking-widest text-slate-950">
                      {generatedOtp}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEnteredOtp(generatedOtp);
                      setOtpError(null);
                      handleVerifyOtp(generatedOtp);
                    }}
                    className="px-2.5 py-1 text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Auto-Fill</span>
                  </button>
                </div>
              </div>

              {/* 6-box OTP Input */}
              <div className="space-y-2 text-center">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Enter 6-Digit Verification Code
                </label>
                
                <OTPInput
                  length={6}
                  value={enteredOtp}
                  onChange={(val) => {
                    setEnteredOtp(val);
                    if (otpError) setOtpError(null);
                  }}
                  onComplete={(val) => handleVerifyOtp(val)}
                  hasError={!!otpError}
                  disabled={isVerifying}
                />

                {otpError && (
                  <div className="flex items-center justify-center space-x-1.5 text-xs text-rose-600 font-bold animate-pulse pt-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  id="auth-verify-otp-btn"
                  type="button"
                  onClick={() => handleVerifyOtp()}
                  disabled={isVerifying || enteredOtp.length < 6}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Continue</span>
                    </>
                  )}
                </button>

                {/* Resend OTP with countdown timer */}
                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <span className="text-slate-500">Didn't receive the SMS?</span>
                  {resendCountdown > 0 ? (
                    <span className="flex items-center space-x-1 text-slate-400 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Resend OTP in {resendCountdown}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Resend OTP</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: FIRST-TIME PROFILE SETUP */}
          {/* ========================================================================= */}
          {step === 'PROFILE_SETUP' && (
            <form onSubmit={handleCompleteProfile} className="space-y-5">
              <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Mobile <strong>+91 {cleanPhone}</strong> verified! Please enter your details to create your trader profile.
                </span>
              </div>

              {profileError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  I am a:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('farmer')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedRole === 'farmer'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Sprout className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs block">Farmer</span>
                    <span className="text-[10px] opacity-80 block">किसान</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('buyer')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedRole === 'buyer'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs block">Buyer / Miller</span>
                    <span className="text-[10px] opacity-80 block">व्यापारी</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('fpo')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedRole === 'fpo'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Building2 className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs block">FPO Lead</span>
                    <span className="text-[10px] opacity-80 block">एफपीओ</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name / Entity Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="profile-setup-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (profileError) setProfileError(null);
                    }}
                    placeholder="e.g. Dnyaneshwar Shinde"
                    required
                    autoFocus
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* District & Village */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    District (Maharashtra) *
                  </label>
                  <select
                    id="profile-setup-district"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-slate-800"
                  >
                    <option value="Osmanabad">Osmanabad / Dharashiv</option>
                    <option value="Latur">Latur</option>
                    <option value="Solapur">Solapur</option>
                    <option value="Nashik">Nashik</option>
                    <option value="Pune">Pune</option>
                    <option value="Jalgaon">Jalgaon</option>
                    <option value="Ahmednagar">Ahmednagar</option>
                    <option value="Amravati">Amravati</option>
                    <option value="Nanded">Nanded</option>
                    <option value="Kolhapur">Kolhapur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Village / Tehsil (Optional)
                  </label>
                  <input
                    id="profile-setup-village"
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Dhoki / Kalamb"
                    className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                id="profile-setup-submit-btn"
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer hover:shadow-emerald-600/20"
              >
                <span>Save Profile & Enter Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
