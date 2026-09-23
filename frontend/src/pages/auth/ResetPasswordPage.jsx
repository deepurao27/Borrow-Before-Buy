import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const schema = z.object({
  password: z.string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must have an uppercase letter')
    .regex(/[a-z]/, 'Must have a lowercase letter')
    .regex(/[0-9]/, 'Must have a number')
});

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Missing reset token in URL.');
      return;
    }

    setLoading(true);
    try {
      await apiClient('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password: data.password })
      });
      toast.success('Password reset successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="paper-card max-w-md w-full p-8 space-y-6 shadow-paperHover relative">
        <div className="tape-strip" />

        <div className="w-14 h-14 rounded-2xl bg-sage/15 text-sage flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-7 h-7" />
        </div>

        <div className="text-center space-y-1">
          <span className="handwritten-note block text-lg">Secure Account</span>
          <h1 className="text-2xl font-bold font-serif text-ink dark:text-ink-dark">
            Create new password
          </h1>
          <p className="text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed">
            Choose a strong password with letters, numbers, and symbols.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <Input
              label="New Password"
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

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full gap-2 font-bold shadow-sm"
          >
            Update Password
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Link
            to="/login"
            className="block text-center text-xs font-bold text-terracotta hover:underline pt-2"
          >
            Cancel and back to log in
          </Link>
        </form>
      </div>
    </div>
  );
};
