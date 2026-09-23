import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  ArrowRight,
  Mail,
  AlertTriangle,
  Eye,
  EyeOff,
  KeyRound,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
  collegeEmail: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const LoginPage = () => {
  // Tab: 'otp' | 'password'
  const [authMethod, setAuthMethod] = useState('otp');

  // Password Login state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resending, setResending] = useState(false);

  // Email OTP state
  const [otpStep, setOtpStep] = useState(1); // 1 = enter email, 2 = enter otp
  const [otpEmail, setOtpEmail] = useState('');
  const [otpName, setOtpName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/search';

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Standard Password Login
  const onPasswordSubmit = async (data) => {
    setLoading(true);
    setUnverifiedEmail(null);

    try {
      const res = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (res?.data?.user) {
        login(res.data.user);
        toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`);
        navigate(from, { replace: true });
      }
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(data.collegeEmail);
      } else {
        toast.error(err.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!unverifiedEmail) return;
    setResending(true);
    try {
      await apiClient('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ collegeEmail: unverifiedEmail })
      });
      toast.success('New verification link sent to your inbox!');
    } catch (err) {
      toast.error(err.message || 'Failed to resend verification link.');
    } finally {
      setResending(false);
    }
  };

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!otpEmail || !otpEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await apiClient('/auth/otp/send', {
        method: 'POST',
        body: JSON.stringify({
          email: otpEmail.trim(),
          name: otpName.trim() || undefined
        })
      });

      toast.success(res.message || '6-digit verification code sent to your email!');
      setOtpStep(2);
      setResendCooldown(45);
    } catch (err) {
      toast.error(err.message || 'Failed to dispatch verification code.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 2: Verify OTP and Login
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      toast.error('Please enter the full 6-digit code received on your email.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await apiClient('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: otpEmail.trim(),
          otp: otpCode.trim()
        })
      });

      if (res?.data?.user) {
        login(res.data.user);
        toast.success(`Welcome to BBB, ${res.data.user.name.split(' ')[0]}!`);
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Invalid or expired verification code.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 paper-card overflow-hidden shadow-paperHover">
        {/* Left Side: Form Container */}
        <div className="lg:col-span-7 p-6 sm:p-10 space-y-6">
          <div>
            <span className="handwritten-note block text-lg mb-1">Campus Community</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink dark:text-ink-dark font-serif">
              Sign in to BBB
            </h1>
            <p className="text-xs text-ink-muted dark:text-ink-darkMuted mt-1">
              Borrow, lend, and exchange with verified students on your campus.
            </p>
          </div>

          {/* Authentication Method Tabs */}
          <div className="grid grid-cols-2 p-1 bg-paper-sand/50 dark:bg-paper-sandDark/30 rounded-xl border border-paper-sand dark:border-paper-sandDark text-xs font-bold">
            <button
              type="button"
              onClick={() => { setAuthMethod('otp'); setUnverifiedEmail(null); }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMethod === 'otp'
                  ? 'bg-white dark:bg-paper-cardDark text-terracotta shadow-sm'
                  : 'text-ink-muted dark:text-ink-darkMuted hover:text-ink dark:hover:text-ink-dark'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Email OTP Code</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMethod('password'); }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMethod === 'password'
                  ? 'bg-white dark:bg-paper-cardDark text-terracotta shadow-sm'
                  : 'text-ink-muted dark:text-ink-darkMuted hover:text-ink dark:hover:text-ink-dark'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Password Login</span>
            </button>
          </div>

          {/* METHOD 1: EMAIL OTP PASSWORDLESS LOGIN */}
          {authMethod === 'otp' && (
            <div className="space-y-4">
              {otpStep === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-sage/10 border border-sage/30 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-sage shrink-0 mt-0.5" />
                    <p className="text-xs text-ink dark:text-ink-dark leading-relaxed">
                      <strong>Passwordless Sign-In:</strong> Anyone can log in with their email address. We will send an instant 6-digit verification code to your mail.
                    </p>
                  </div>

                  <Input
                    label="Email Address"
                    placeholder="your.email@gmail.com or @iet.edu"
                    type="email"
                    required
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                  />

                  <Input
                    label="Your Name (Optional if returning)"
                    placeholder="e.g. Rahul Sharma"
                    type="text"
                    value={otpName}
                    onChange={(e) => setOtpName(e.target.value)}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={otpLoading}
                    className="w-full gap-2 font-bold shadow-sm mt-4"
                  >
                    <Mail className="w-4 h-4" />
                    Send Verification Code
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-4 rounded-xl bg-marigold/15 border border-marigold/40 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-ink dark:text-ink-dark">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-terracotta" />
                        Code sent to: {otpEmail}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setOtpStep(1); setOtpCode(''); }}
                        className="text-terracotta underline font-semibold cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                    <p className="text-xs text-ink-muted dark:text-ink-darkMuted">
                      Please check your inbox (and spam folder) for the 6-digit code.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-ink dark:text-ink-dark uppercase tracking-wider">
                      6-Digit Verification Code *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center tracking-[0.5em] text-2xl font-mono font-bold py-3 px-4 rounded-xl border border-paper-sand dark:border-paper-sandDark bg-white dark:bg-paper-cardDark text-ink dark:text-ink-dark focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta outline-none transition-all shadow-inner"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={otpLoading}
                    className="w-full gap-2 font-bold shadow-sm mt-2"
                  >
                    Verify & Enter BBB
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || otpLoading}
                      onClick={handleSendOtp}
                      className="flex items-center gap-1.5 text-ink-muted hover:text-ink dark:hover:text-ink-dark font-medium disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setOtpStep(1); setOtpCode(''); }}
                      className="text-terracotta hover:underline font-medium cursor-pointer"
                    >
                      Use different email
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* METHOD 2: STANDARD PASSWORD LOGIN */}
          {authMethod === 'password' && (
            <div className="space-y-4">
              {/* Email Not Verified Alert */}
              {unverifiedEmail && (
                <div className="p-4 rounded-xl bg-marigold/15 border border-marigold/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-ink dark:text-ink-dark">
                    <AlertTriangle className="w-4 h-4 text-terracotta" />
                    <span>Email Verification Required</span>
                  </div>
                  <p className="text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed">
                    You must verify your email address before accessing the borrowing board.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleResend}
                    loading={resending}
                    className="gap-1.5 text-xs font-bold"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Resend Verification Link
                  </Button>
                </div>
              )}

              <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
                <Input
                  label="Email Address"
                  placeholder="e.g. yourname@gmail.com or college email"
                  type="email"
                  required
                  {...register('collegeEmail')}
                  error={errors.collegeEmail?.message}
                />

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-ink dark:text-ink-dark uppercase tracking-wider">
                      Password *
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-terracotta hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      required
                      {...register('password')}
                      error={errors.password?.message}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-ink-muted hover:text-ink dark:hover:text-ink-dark cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full gap-2 font-bold shadow-sm mt-4"
                >
                  <Lock className="w-4 h-4" />
                  Log in with Password
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            </div>
          )}

          <p className="text-center text-xs text-ink-muted dark:text-ink-darkMuted pt-2">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-terracotta hover:underline">
              Register here
            </Link>
          </p>
        </div>

        {/* Right Side: Warm Illustrated Campus Panel */}
        <div className="hidden lg:flex lg:col-span-5 bg-paper-sand/40 dark:bg-paper-sandDark/30 p-10 flex-col justify-between border-l border-paper-sand dark:border-paper-sandDark relative">
          <div className="tape-strip" />
          <div className="space-y-4">
            <span className="handwritten-note block text-2xl">Campus Trusted</span>
            <h3 className="text-2xl font-bold font-serif text-ink dark:text-ink-dark leading-snug">
              "Borrow what you need, return what you borrowed."
            </h3>
            <p className="text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed">
              Every completed borrow builds your campus reputation score and helps your batchmates save money.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark shadow-sm space-y-2">
            <span className="text-[11px] font-bold text-terracotta uppercase tracking-wider block">
              Zero Payment Gateway
            </span>
            <p className="text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed">
              BBB never asks for credit card, debit card, or UPI credentials. Security agreements and items are shared peer-to-peer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
