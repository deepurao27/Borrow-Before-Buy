import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Mail, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const CheckInboxPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [cooldown, setCooldown] = useState(60);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    setLoading(true);
    try {
      await apiClient('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ collegeEmail: email })
      });
      toast.success('A new verification email has been sent!');
      setCooldown(60);
    } catch (err) {
      toast.error(err.message || 'Failed to resend verification link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="paper-card max-w-md w-full p-8 text-center space-y-6 shadow-paperHover relative">
        <div className="tape-strip" />

        <div className="w-16 h-16 rounded-2xl bg-marigold/15 text-terracotta flex items-center justify-center mx-auto shadow-sm">
          <Mail className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="handwritten-note block text-xl">Check your inbox</span>
          <h1 className="text-2xl font-bold font-serif text-ink dark:text-ink-dark">
            We sent a verification link
          </h1>
          <p className="text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed">
            We dispatched a 24-hour verification link to{' '}
            <strong className="text-ink dark:text-ink-dark">{email || 'your email'}</strong>. Click the link inside to activate your account.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-paper-sand/30 dark:bg-paper-sandDark/30 text-xs text-ink-muted dark:text-ink-darkMuted text-left space-y-1">
          <p className="font-semibold text-ink dark:text-ink-dark">Haven't received it yet?</p>
          <p>• Check your Spam or Promotions folder</p>
          <p>• If running locally, check Mailpit inbox (port 8025) or terminal console</p>
        </div>

        <div className="space-y-3">
          <Button
            variant="secondary"
            size="md"
            onClick={handleResend}
            disabled={cooldown > 0}
            loading={loading}
            className="w-full gap-2 text-xs font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {cooldown > 0 ? `Resend email in ${cooldown}s` : 'Resend verification email'}
          </Button>

          <Link to="/login" className="block text-xs font-bold text-terracotta hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};
