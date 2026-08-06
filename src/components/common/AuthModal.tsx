import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { X, User, Mail, Lock, Phone, MapPin, Sparkles, CheckCircle, AlertCircle, UserPlus } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const { loginUser, registerUser } = useMarketplace();
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Lahore');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accountNotFound, setAccountNotFound] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());
        
        const loginRes = loginUser(userInfo.email);
        if (!loginRes.success) {
          // Auto register google user if not registered
          registerUser(
            userInfo.name || userInfo.email.split('@')[0],
            userInfo.email,
            '+92 300 0000000',
            'Lahore',
            'google-auth'
          );
        }
        setSuccessMessage(`Welcome back, ${userInfo.name || userInfo.email}!`);
        setTimeout(() => {
          setSuccessMessage(null);
          onClose();
        }, 1200);
      } catch (error) {
        console.error('Failed to fetch Google user info', error);
      }
    },
    onError: errorResponse => console.error(errorResponse),
  });

  if (!isOpen) return null;

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setAccountNotFound(false);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both email address and password.');
      return;
    }

    const result = loginUser(email, password);
    if (!result.success) {
      setErrorMessage(result.message);
      if (result.message.toLowerCase().includes('create an account') || result.message.toLowerCase().includes('not found')) {
        setAccountNotFound(true);
      }
      return;
    }

    setSuccessMessage('Successfully signed in to your She Hunnar account!');
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1200);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setAccountNotFound(false);

    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setErrorMessage('Please fill in all required fields to create your account.');
      return;
    }

    const result = registerUser(name, email, phone, city, password);
    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    setSuccessMessage('Account created successfully! Welcome to She Hunnar.');
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={onClose} />

        {/* Modal Panel */}
        <div className="relative w-full max-w-[400px] transform overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl border border-white/20 text-left shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transition-all sm:my-8 p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100/50 rounded-full transition-colors z-10"
          >
            <X size={20} />
          </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 mx-auto flex items-center justify-center font-serif font-bold text-lg">
            <Sparkles size={20} className="text-amber-800" />
          </div>
          <h2 className="font-serif text-xl font-bold text-stone-900">
            {mode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="text-xs text-stone-500 max-w-xs mx-auto px-4">
            {mode === 'signin'
              ? 'Sign in to access your orders, saved addresses, and wishlist.'
              : 'Join Pakistan\'s multi-vendor handmade marketplace today.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-stone-100/80 p-1.5 rounded-2xl text-[13px] font-bold shadow-inner">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setSuccessMessage(null);
              setErrorMessage(null);
              setAccountNotFound(false);
            }}
            className={`py-2.5 rounded-xl transition-all duration-300 ${
              mode === 'signin'
                ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-900/5'
                : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
            }`}
          >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setSuccessMessage(null);
                setErrorMessage(null);
                setAccountNotFound(false);
              }}
              className={`py-2.5 rounded-xl transition-all duration-300 ${
                mode === 'register'
                  ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-900/5'
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
              }`}
            >
              Register / Sign Up
            </button>
          </div>
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs space-y-2.5 animate-in fade-in">
            <div className="flex items-start gap-2.5 font-medium text-rose-700">
              <AlertCircle size={18} className="shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
            {accountNotFound && (
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                  setAccountNotFound(false);
                }}
                className="w-full py-2 px-3 bg-amber-900 hover:bg-amber-950 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
              >
                <UserPlus size={14} /> Create Account Now / Sign Up
              </button>
            )}
          </div>
        )}
        {successMessage ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-center space-y-2 py-8">
            <CheckCircle size={36} className="mx-auto text-emerald-600 animate-bounce" />
            <p className="font-bold text-xs">{successMessage}</p>
          </div>
        ) : mode === 'signin' ? (
          /* SIGN IN FORM */
          <form onSubmit={handleSignInSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-stone-800 ml-1">Email Address *</label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3 text-stone-400" />
                <input
                  type="email"
                  required
                  placeholder="sana.malik@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-50/50 border border-stone-200 rounded-xl py-2.5 pl-9 pr-3 focus:outline-none focus:ring-4 focus:ring-amber-900/10 focus:border-amber-700 font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-stone-800 ml-1">Password *</label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3 text-stone-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-50/50 border border-stone-200 rounded-xl py-2.5 pl-9 pr-3 focus:outline-none focus:ring-4 focus:ring-amber-900/10 focus:border-amber-700 font-medium transition-all tracking-widest placeholder:tracking-normal"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-1 bg-gradient-to-r from-amber-900 to-stone-900 hover:from-amber-950 hover:to-stone-950 text-white font-bold rounded-xl text-sm transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(120,53,15,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(120,53,15,0.5)] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Sign In to Account
            </button>

            <div className="relative pt-2 pb-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-[10px] text-stone-500 font-bold uppercase tracking-wider">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => googleLogin()}
              className="w-full flex items-center justify-center gap-3 py-2.5 border border-stone-200 hover:bg-stone-50 rounded-xl text-stone-700 font-bold transition-all shadow-sm active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-stone-800 ml-1">Full Name *</label>
              <div className="relative flex items-center">
                <User size={16} className="absolute left-3 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-50/50 border border-stone-200 rounded-xl py-2.5 pl-9 pr-3 focus:outline-none focus:ring-4 focus:ring-amber-900/10 focus:border-amber-700 font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-stone-800 ml-1">Email Address *</label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3 text-stone-400" />
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-50/50 border border-stone-200 rounded-xl py-2.5 pl-9 pr-3 focus:outline-none focus:ring-4 focus:ring-amber-900/10 focus:border-amber-700 font-medium transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="font-bold text-stone-800 ml-1">Phone *</label>
                <input
                  type="text"
                  required
                  placeholder="+92 3XX XXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-stone-50/50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-4 focus:ring-amber-900/10 focus:border-amber-700 font-medium transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-800 ml-1">City *</label>
                <input
                  type="text"
                  required
                  placeholder="Lahore, Karachi..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-stone-50/50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-4 focus:ring-amber-900/10 focus:border-amber-700 font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-stone-800 ml-1">Create Password *</label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3 text-stone-400" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-50/50 border border-stone-200 rounded-xl py-2.5 pl-9 pr-3 focus:outline-none focus:ring-4 focus:ring-amber-900/10 focus:border-amber-700 font-medium transition-all tracking-widest placeholder:tracking-normal"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-1 bg-gradient-to-r from-amber-900 to-stone-900 hover:from-amber-950 hover:to-stone-950 text-white font-bold rounded-xl text-sm transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(120,53,15,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(120,53,15,0.5)] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Create New Account
            </button>

            <div className="relative pt-2 pb-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-[10px] text-stone-500 font-bold uppercase tracking-wider">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => googleLogin()}
              className="w-full flex items-center justify-center gap-3 py-2.5 border border-stone-200 hover:bg-stone-50 rounded-xl text-stone-700 font-bold transition-all shadow-sm active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>
          </form>
        )}
      </div>
      </div>
    </div>
  );
};
