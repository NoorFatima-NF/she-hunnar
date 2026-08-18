import React, { useState, useEffect } from 'react';
import { Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { useMarketplace } from '../context/MarketplaceContext';

export const ResetPasswordPage: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useMarketplace();

  useEffect(() => {
    // Supabase automatically parses the hash fragment and establishes a session for the user
    // if the token is valid. We can listen to auth state changes, but it's typically ready.
    const checkSession = async () => {
      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setMessage({
            text: 'Invalid or expired password reset link. Please request a new one.',
            type: 'error'
          });
        }
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }

    if (password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters long.', type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          setMessage({ text: error.message || 'Failed to update password.', type: 'error' });
        } else {
          setMessage({ text: 'Password has been successfully reset! You can now sign in.', type: 'success' });
          showToast('Password reset successful');
          setTimeout(() => {
            // Remove the hash and route to home
            window.history.replaceState({}, document.title, '/');
            onNavigate('home');
          }, 3000);
        }
      } else {
         setMessage({ text: 'Supabase is not configured.', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: 'An unexpected error occurred.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-amber-900" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 mb-2">Reset Password</h1>
          <p className="text-slate-500 text-sm">Create a new password for your account.</p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 text-sm ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <p>{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 ml-1">New Password</label>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-4 focus:ring-amber-900/10 focus:border-amber-700 transition-all tracking-widest placeholder:tracking-normal"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 ml-1">Confirm New Password</label>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-3 text-slate-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-4 focus:ring-amber-900/10 focus:border-amber-700 transition-all tracking-widest placeholder:tracking-normal"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || message?.type === 'success'}
            className="w-full py-3 mt-4 bg-gradient-to-r from-amber-900 to-stone-900 hover:from-amber-950 hover:to-stone-950 text-white font-bold rounded-xl text-sm transition-all shadow-[0_8px_20px_-6px_rgba(120,53,15,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              window.history.replaceState({}, document.title, '/');
              onNavigate('home');
            }}
            className="text-sm font-semibold text-slate-500 hover:text-amber-900 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};
