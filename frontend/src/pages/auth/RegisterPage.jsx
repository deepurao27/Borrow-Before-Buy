import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { ShieldCheck, Eye, EyeOff, Check, X, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  collegeEmail: z.string().trim().toLowerCase()
    .email('Please enter a valid email address'),
  department: z.string().min(1, 'Please select your department'),
  year: z.coerce.number().min(1).max(5),
  password: z.string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must have an uppercase letter')
    .regex(/[a-z]/, 'Must have a lowercase letter')
    .regex(/[0-9]/, 'Must have a number')
});

export const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      year: 1,
      department: 'Computer Science'
    }
  });

  const passwordVal = watch('password', '');

  const hasUpper = /[A-Z]/.test(passwordVal);
  const hasLower = /[a-z]/.test(passwordVal);
  const hasNum = /[0-9]/.test(passwordVal);
  const hasMinLength = passwordVal.length >= 8;

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (res?.data?.user) {
        authLogin(res.data.user);
      }
      toast.success('Account created and activated! Welcome to Borrow Before Buy.');
      navigate('/board');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 paper-card overflow-hidden shadow-paperHover">
        {/* Left Side: Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 space-y-6">
          <div>
            <span className="handwritten-note block text-lg mb-1">Join Your Batch</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink dark:text-ink-dark font-serif">
              Create student account
            </h1>
            <p className="text-xs text-ink-muted dark:text-ink-darkMuted mt-1">
              Borrow & lend gear securely with peers from your college.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Aman Verma"
              required
              {...register('name')}
              error={errors.name?.message}
            />

            <div>
              <Input
                label="Email Address"
                placeholder="e.g. yourname@gmail.com or college email"
                type="email"
                required
                {...register('collegeEmail')}
                error={errors.collegeEmail?.message}
              />
              <p className="text-[11px] text-ink-muted dark:text-ink-darkMuted mt-1 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-sage" />
                <span>Instant account activation — no email verification step required.</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink dark:text-ink-dark uppercase tracking-wider mb-1.5">
                  Department *
                </label>
                <select
                  {...register('department')}
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark focus:border-terracotta focus:ring-1 focus:ring-terracotta focus:outline-none"
                >
                  <option value="Computer Science">CSE / IT / AIML</option>
                  <option value="Electronics">ECE / Electrical</option>
                  <option value="Mechanical">Mechanical Engg</option>
                  <option value="Civil">Civil Engg</option>
                  <option value="Biotech">Biotechnology</option>
                  <option value="Management">Management / MBA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink dark:text-ink-dark uppercase tracking-wider mb-1.5">
                  Year of Study *
                </label>
                <select
                  {...register('year')}
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark focus:border-terracotta focus:ring-1 focus:ring-terracotta focus:outline-none"
                >
                  <option value={1}>1st Year (Fresher)</option>
                  <option value={2}>2nd Year (Sophomore)</option>
                  <option value={3}>3rd Year (Junior)</option>
                  <option value={4}>4th Year (Senior)</option>
                  <option value={5}>5th Year (Dual/PG)</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                {...register('password')}
                error={errors.password?.message}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-ink-muted hover:text-ink dark:hover:text-ink-dark"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Live Password Strength Requirements */}
            <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1">
              <span className={`flex items-center gap-1 ${hasMinLength ? 'text-sage font-bold' : 'text-ink-muted'}`}>
                {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} 8+ Characters
              </span>
              <span className={`flex items-center gap-1 ${hasUpper ? 'text-sage font-bold' : 'text-ink-muted'}`}>
                {hasUpper ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Uppercase
              </span>
              <span className={`flex items-center gap-1 ${hasLower ? 'text-sage font-bold' : 'text-ink-muted'}`}>
                {hasLower ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Lowercase
              </span>
              <span className={`flex items-center gap-1 ${hasNum ? 'text-sage font-bold' : 'text-ink-muted'}`}>
                {hasNum ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Number
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full gap-2 font-bold shadow-sm mt-4"
            >
              Create Account & Start Sharing
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-xs text-ink-muted dark:text-ink-darkMuted pt-2">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-terracotta hover:underline">
              Log in here
            </Link>
          </p>
        </div>

        {/* Right Side: Warm Illustrated Campus Panel (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:col-span-5 bg-paper-sand/40 dark:bg-paper-sandDark/30 p-10 flex-col justify-between border-l border-paper-sand dark:border-paper-sandDark relative">
          <div className="tape-strip" />
          <div className="space-y-4">
            <span className="handwritten-note block text-2xl">Don't buy it for 1 day!</span>
            <h3 className="text-2xl font-bold font-serif text-ink dark:text-ink-dark leading-snug">
              "Your batch already owns most of what you need."
            </h3>
            <p className="text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed">
              Every semester, thousands of rupees are wasted on single-use engineering drafters, graphing calculators, and cables. BBB connects verified students to share gear safely.
            </p>
          </div>

          <div className="bg-white dark:bg-paper-cardDark p-4 rounded-xl border border-paper-sand dark:border-paper-sandDark shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-ink dark:text-ink-dark">
              <ShieldCheck className="w-4 h-4 text-sage" />
              <span>Campus Safety Rules</span>
            </div>
            <p className="text-[11px] text-ink-muted dark:text-ink-darkMuted leading-relaxed">
              • Zero money handled by app<br />
              • Handover only at public campus spots<br />
              • Condition photos verified before meet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
