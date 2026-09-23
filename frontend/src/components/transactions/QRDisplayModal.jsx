import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Clock, RefreshCw, Copy, Check, ShieldAlert, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const QRDisplayModal = ({
  isOpen,
  onClose,
  tokenData,
  onRefreshCode,
  isRefreshing
}) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!tokenData?.expiresAt) return;

    const calculateTimeLeft = () => {
      const diff = Math.max(0, Math.floor((new Date(tokenData.expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(diff);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [tokenData]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCopyCode = () => {
    if (!tokenData?.manualCode) return;
    navigator.clipboard.writeText(tokenData.manualCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isExpired = timeLeft <= 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Handover QR Code" maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center">
        {/* Subtitle */}
        <p className="text-xs text-ink-muted dark:text-ink-darkMuted mb-4">
          Show this code to the borrower at your campus handover meeting point.
        </p>

        {/* QR Code Canvas */}
        <div className="relative p-5 bg-white rounded-2xl border-2 border-paper-sand dark:border-paper-sandDark shadow-paper mb-4 flex items-center justify-center">
          {tokenData?.token && !isExpired ? (
            <div className="relative">
              <QRCodeSVG
                value={tokenData.token}
                size={220}
                level="H"
                includeMargin={false}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <Sparkles className="w-12 h-12 text-terracotta" />
              </div>
            </div>
          ) : (
            <div className="w-[220px] h-[220px] flex flex-col items-center justify-center text-ink-muted bg-paper-sand/20 rounded-xl">
              <ShieldAlert className="w-10 h-10 text-terracotta mb-2" />
              <p className="text-xs font-bold text-ink dark:text-ink-dark">Code Expired</p>
              <p className="text-[11px] text-ink-muted mt-1">Generate a fresh dynamic token</p>
            </div>
          )}
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-2 mb-4">
          <Clock className={`w-4 h-4 ${isExpired ? 'text-brick' : 'text-terracotta'}`} />
          <span className={`text-sm font-mono font-bold ${isExpired ? 'text-brick' : 'text-ink dark:text-ink-dark'}`}>
            {isExpired ? 'Expired' : `Expires in ${formatTimer(timeLeft)}`}
          </span>
        </div>

        {/* Manual 6-Digit Backup Code */}
        <div className="w-full p-3 rounded-xl bg-paper-sand/30 dark:bg-paper-sandDark/20 border border-paper-sand dark:border-paper-sandDark mb-5">
          <span className="text-[11px] font-bold text-ink-muted dark:text-ink-darkMuted uppercase tracking-wider block mb-1">
            Manual Backup Code (If Camera Unavailable)
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl font-mono font-black text-terracotta tracking-widest">
              {tokenData?.manualCode || '------'}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-1.5 rounded-lg hover:bg-paper-sand dark:hover:bg-paper-sandDark text-ink-muted transition-colors cursor-pointer"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-sage" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <span className="text-[10px] text-ink-muted block mt-1">
            Read this 6-character code aloud to the borrower.
          </span>
        </div>

        {/* Actions */}
        <div className="flex w-full gap-2">
          <Button
            variant="outline"
            onClick={onRefreshCode}
            isLoading={isRefreshing}
            className="flex-1 text-xs gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh QR Code
          </Button>
          <Button variant="ghost" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
