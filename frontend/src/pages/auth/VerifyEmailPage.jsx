import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided in URL.');
      return;
    }

    const verify = async () => {
      try {
        const res = await apiClient('/auth/verify', {
          method: 'POST',
          body: JSON.stringify({ token })
        });
        setStatus('success');
        setMessage(res?.message || 'Your email was verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Verification token is invalid or has expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="paper-card max-w-md w-full p-8 text-center space-y-6 shadow-paperHover relative">
        <div className="tape-strip" />

        {status === 'loading' && (
          <div className="space-y-4 py-8">
            <Loader2 className="w-12 h-12 text-terracotta animate-spin mx-auto" />
            <h2 className="text-xl font-bold font-serif text-ink dark:text-ink-dark">
              Verifying your email...
            </h2>
            <p className="text-xs text-ink-muted dark:text-ink-darkMuted">
              Checking token validity with the server.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-sage/20 text-sage flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="handwritten-note block text-xl">Account Verified!</span>
            <h1 className="text-2xl font-bold font-serif text-ink dark:text-ink-dark">
              Welcome to Borrow Before Buy
            </h1>
            <p className="text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed">
              {message}
            </p>
            <Link to="/login" className="block pt-2">
              <Button variant="primary" size="lg" className="w-full gap-2 font-bold shadow-sm">
                Proceed to Log In
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-brick/20 text-brick flex items-center justify-center mx-auto shadow-sm">
              <XCircle className="w-8 h-8" />
            </div>
            <span className="handwritten-note block text-xl">Verification Failed</span>
            <h1 className="text-2xl font-bold font-serif text-ink dark:text-ink-dark">
              Token Expired or Invalid
            </h1>
            <p className="text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed">
              {message}
            </p>
            <div className="space-y-2 pt-2">
              <Link to="/login" className="block">
                <Button variant="secondary" size="md" className="w-full">
                  Go to Login to Resend Link
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
