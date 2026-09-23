import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const schema = z.object({
  collegeEmail: z.string().trim().toLowerCase().email('Please enter a valid email address')
});

export const ForgotPasswordPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await apiClient('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      setSubmitted(true);
      toast.success('Password reset instructions dispatched to your email.');
    } catch (err) {
      toast.error(err.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="paper-card max-w-md w-full p-8 space-y-6 shadow-paperHover relative">
        <div className="tape-strip" />

        <div className="w-14 h-14 rounded-2xl bg-terracotta/15 text-terracotta flex items-center justify-center mx-auto shadow-sm">
          <KeyRound className="w-7 h-7" />
        </div>

        <div className="text-center space-y-1">
          <span className="handwritten-note block text-lg">Account Recovery</span>
          <h1 className="text-2xl font-bold font-serif text-ink dark:text-ink-dark">
            Forgot your password?
          </h1>
          <p className="text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed">
            Enter your email address and we'll send you a secure link to reset it.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-sage/15 border border-sage/30 text-xs text-ink dark:text-ink-dark text-center space-y-2">
            <p className="font-bold text-sage">Reset Link Sent!</p>
            <p className="text-ink-muted dark:text-ink-darkMuted leading-relaxed">
              If an account exists for this email, you'll receive a password reset link shortly.
            </p>
            <Link to="/login" className="inline-block pt-2 font-bold text-terracotta hover:underline">
              Back to log in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              placeholder="e.g. yourname@gmail.com or college email"
              required
              {...register('collegeEmail')}
              error={errors.collegeEmail?.message}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full gap-2 font-bold shadow-sm"
            >
              Send Reset Link
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 text-xs font-bold text-ink-muted hover:text-ink dark:hover:text-ink-dark pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to log in
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};
