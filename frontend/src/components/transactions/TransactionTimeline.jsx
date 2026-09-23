import React from 'react';
import { CheckCircle2, Circle, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

const STEPS = [
  { id: 'ACCEPTED', label: 'Request Accepted', desc: 'Mutual agreement initiated' },
  { id: 'SECURITY_ACKNOWLEDGED', label: 'Security Agreed', desc: 'Offline deposit confirmed' },
  { id: 'HANDOVER_PENDING', label: 'Condition Verified', desc: 'Checklist & photos approved' },
  { id: 'BORROWED', label: 'Item Handed Over', desc: 'QR code scanned & active' },
  { id: 'RETURN_PENDING', label: 'Return & Inspect', desc: 'Item return verified' },
  { id: 'COMPLETED', label: 'Completed', desc: 'Returned & deposit released' }
];

const STATE_ORDER = {
  ACCEPTED: 1,
  SECURITY_ACKNOWLEDGED: 2,
  HANDOVER_PENDING: 3,
  BORROWED: 4,
  OVERDUE: 4,
  RETURN_PENDING: 5,
  RETURNED: 5,
  COMPLETED: 6,
  CANCELLED: -1,
  DISPUTED: -2
};

export const TransactionTimeline = ({ currentStatus, events = [] }) => {
  const currentLevel = STATE_ORDER[currentStatus] || 1;
  const isCancelled = currentStatus === 'CANCELLED';
  const isDisputed = currentStatus === 'DISPUTED';

  if (isCancelled) {
    return (
      <div className="p-4 rounded-xl bg-brick/10 border border-brick/30 text-brick dark:text-brick flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <div>
          <span className="font-bold text-sm block">Transaction Cancelled</span>
          <span className="text-xs text-ink-muted dark:text-ink-darkMuted">
            This exchange was cancelled prior to physical item handover.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-2">
      <div className="relative">
        {/* Desktop Progress Bar */}
        <div className="hidden md:grid grid-cols-6 gap-2 relative">
          {/* Background connecting bar */}
          <div className="absolute top-4 left-[8%] right-[8%] h-0.5 bg-paper-sand dark:bg-paper-sandDark -z-0" />

          {STEPS.map((step, idx) => {
            const stepLevel = STATE_ORDER[step.id];
            const isCompleted = currentLevel > stepLevel;
            const isCurrent = currentLevel === stepLevel;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center text-center px-1">
                <div
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 border-2',
                    isCompleted && 'bg-sage text-white border-sage shadow-sm',
                    isCurrent && 'bg-terracotta text-white border-terracotta ring-4 ring-terracotta/20 animate-pulse',
                    !isCompleted && !isCurrent && 'bg-paper dark:bg-paper-cardDark text-ink-muted border-paper-sand dark:border-paper-sandDark'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <div className="mt-2">
                  <span
                    className={clsx(
                      'text-xs font-bold block leading-tight',
                      isCurrent ? 'text-terracotta font-serif font-bold' : isCompleted ? 'text-ink dark:text-ink-dark' : 'text-ink-muted dark:text-ink-darkMuted'
                    )}
                  >
                    {step.label}
                  </span>
                  <span className="text-[10px] text-ink-muted dark:text-ink-darkMuted block mt-0.5 leading-tight">
                    {step.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Vertical Step Indicator */}
        <div className="md:hidden flex items-center justify-between p-3 rounded-xl bg-paper-card dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-terracotta text-white flex items-center justify-center font-bold text-xs">
              {currentLevel > 0 ? currentLevel : '!'}
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-ink-muted dark:text-ink-darkMuted font-bold">
                Current Step ({currentLevel}/6)
              </span>
              <p className="text-sm font-bold text-ink dark:text-ink-dark font-serif">
                {STEPS[currentLevel - 1]?.label || currentStatus}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded bg-terracotta/10 text-terracotta border border-terracotta/30">
            {currentStatus.replace(/_/g, ' ')}
          </span>
        </div>
      </div>
    </div>
  );
};
