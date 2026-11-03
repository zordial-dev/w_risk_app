import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid corporate email address.');
      return;
    }

    if (!cleanPass) {
      setError('Please enter your account password.');
      return;
    }

    setIsSubmitting(true);
    const res = await login(cleanEmail, cleanPass);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Invalid credentials or unauthorized account.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md transition-opacity animate-fade-in">
      <div className="bg-white dark:bg-[#0E274A] rounded-2xl max-w-sm w-full p-6 sm:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.3)] border border-black/[0.08] dark:border-blue-900/40 text-center transition-colors">
        {/* Wyndham Brand Header */}
        <div className="mb-4 flex justify-center">
          <img
            src="/wyndham-logo.png"
            alt="Wyndham Hotels & Resorts"
            className="h-9 sm:h-10 w-auto object-contain dark:brightness-0 dark:invert transition-all"
          />
        </div>

        <h2 className="text-[21px] font-semibold text-[#1D1D1F] dark:text-white tracking-tight">
          Sign In
        </h2>
        <p className="text-[13px] text-[#86868B] dark:text-[#94A8C4] mt-1 mb-6 font-normal">
          Country Risk Rating & Advisory Portal
        </p>

        {/* Production Sign-in Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          <div>
            <label className="block text-[11px] font-medium text-[#86868B] dark:text-[#94A8C4] uppercase tracking-wider mb-1">
              Corporate Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#86868B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.75} />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="name@wyndham.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F5F5F7] dark:bg-[#15345F] focus:bg-white dark:focus:bg-[#1A3F72] rounded-xl pl-9 pr-3.5 py-2.5 text-[13px] text-[#1D1D1F] dark:text-white placeholder-[#86868B] dark:placeholder-[#94A8C4] focus:outline-none focus:ring-2 focus:ring-[#0076CE]/25 dark:focus:ring-[#0076CE]/35 focus:border-[#0076CE] border border-black/[0.06] dark:border-blue-900/50 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#86868B] dark:text-[#94A8C4] uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#86868B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.75} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F5F5F7] dark:bg-[#15345F] focus:bg-white dark:focus:bg-[#1A3F72] rounded-xl pl-9 pr-9 py-2.5 text-[13px] text-[#1D1D1F] dark:text-white placeholder-[#86868B] dark:placeholder-[#94A8C4] focus:outline-none focus:ring-2 focus:ring-[#0076CE]/25 dark:focus:ring-[#0076CE]/35 focus:border-[#0076CE] border border-black/[0.06] dark:border-blue-900/50 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" strokeWidth={1.75} />
                ) : (
                  <Eye className="w-4 h-4" strokeWidth={1.75} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] text-[12px] text-center font-medium leading-snug">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-[#0076CE] hover:bg-[#0067B8] text-white text-[13px] font-semibold shadow-[0_4px_14px_rgba(0,118,206,0.25)] transition flex items-center justify-center gap-1.5 mt-2 disabled:opacity-50 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
              </>
            )}
          </button>
        </form>

        {/* Security & Access Notice */}
        <div className="mt-6 pt-4 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-center gap-1.5 text-[11px] text-[#86868B] dark:text-[#98989D]">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-[#34C759]" strokeWidth={2} />
          <span>Restricted to authorized personnel.</span>
        </div>
      </div>
    </div>
  );
};
