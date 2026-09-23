import React, { useState } from 'react';
import { RotateCcw, CheckCircle, Clock, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { NoticeDisclaimer } from '../ui/NoticeDisclaimer';

export const ReturnConfirmationCard = ({
  transaction,
  currentUserId,
  onInitiateReturn,
  onConfirmReturn,
  isProcessing
}) => {
  const { status, lender, borrower, dueAt, securityAgreement, item } = transaction;
  const isLender = currentUserId === lender.id;
  const isBorrower = currentUserId === borrower.id;
  const isOverdue = status === 'OVERDUE' || (new Date() > new Date(dueAt) && status === 'BORROWED');

  const [returnNote, setReturnNote] = useState('');
  const [hasInspectedCheck, setHasInspectedCheck] = useState(false);
  const [hasReturnedDepositCheck, setHasReturnedDepositCheck] = useState(false);

  return (
    <Card className="border-paper-sand dark:border-paper-sandDark shadow-paper">
      <div className="flex items-center justify-between border-b border-paper-sand dark:border-paper-sandDark pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal/10 text-teal flex items-center justify-center font-bold">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-ink dark:text-ink-dark">
              Return & Deposit Release
            </h3>
            <p className="text-xs text-ink-muted dark:text-ink-darkMuted">
              Step 5: Physical item return, inspection & deposit handback
            </p>
          </div>
        </div>

        {status === 'COMPLETED' ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sage/15 text-sage border border-sage/30">
            <CheckCircle className="w-3.5 h-3.5" />
            Completed
          </span>
        ) : status === 'RETURN_PENDING' ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-marigold/15 text-marigold-darker dark:text-marigold border border-marigold/30">
            <Clock className="w-3.5 h-3.5" />
            Return In Progress
          </span>
        ) : isOverdue ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brick/15 text-brick border border-brick/30">
            Overdue
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sage/15 text-sage border border-sage/30">
            Active Borrow
          </span>
        )}
      </div>

      {/* Due date notice */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-paper-sand/20 dark:bg-paper-sandDark/20 text-xs mb-4">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${isOverdue ? 'text-brick' : 'text-ink-muted'}`} />
          <span>
            Scheduled Due Date: <strong>{new Date(dueAt).toLocaleDateString()}</strong>
          </span>
        </div>
        {item.handoverPoint && (
          <div className="flex items-center gap-1 text-ink-muted">
            <MapPin className="w-3.5 h-3.5 text-terracotta" />
            <span>{item.handoverPoint.name}</span>
          </div>
        )}
      </div>

      {/* Stage A: BORROWED or OVERDUE */}
      {['BORROWED', 'OVERDUE'].includes(status) && (
        <div className="space-y-4">
          {isBorrower ? (
            <div className="p-4 rounded-xl bg-paper-sand/30 dark:bg-paper-sandDark/20 border border-paper-sand space-y-3">
              <p className="text-xs text-ink dark:text-ink-dark leading-relaxed">
                Finished using the item? Coordinate with <strong>{lender.name}</strong> to meet at the
                campus handover point, return the item, and collect your refundable deposit.
              </p>

              <div>
                <label className="block text-xs font-bold text-ink dark:text-ink-dark mb-1">
                  Meeting message for Lender (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Free today after 3 PM near Library Steps"
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-paper-sand dark:border-paper-sandDark bg-white dark:bg-paper-cardDark text-ink dark:text-ink-dark"
                />
              </div>

              <Button
                variant="primary"
                onClick={() => onInitiateReturn(returnNote)}
                isLoading={isProcessing}
                className="w-full text-xs gap-2 shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                I&apos;m Ready to Return &ndash; Request Return Meeting
              </Button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-paper-sand/30 dark:bg-paper-sandDark/20 border border-paper-sand space-y-3">
              <p className="text-xs text-ink dark:text-ink-dark">
                The item is currently with <strong>{borrower.name}</strong>. Once they are ready, they will
                initiate the return meeting.
              </p>
              <div className="pt-2 border-t border-paper-sand flex items-center justify-between">
                <span className="text-xs text-ink-muted">Already received the item back?</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onConfirmReturn()}
                  isLoading={isProcessing}
                  className="text-xs gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-sage" />
                  Confirm Return Now
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stage B: RETURN_PENDING */}
      {status === 'RETURN_PENDING' && (
        <div className="space-y-4">
          <NoticeDisclaimer variant="warning" />

          {isLender ? (
            <div className="p-4 rounded-xl bg-sage/5 border border-sage/30 space-y-3">
              <h4 className="font-serif font-bold text-sm text-ink dark:text-ink-dark">
                Lender Inspection & Deposit Release
              </h4>
              <p className="text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed">
                Meet with <strong>{borrower.name}</strong>. Inspect the item to ensure it is in good
                condition with all cables and accessories, then return the offline security deposit of{' '}
                <strong>₹{securityAgreement?.securityAmount || 0}</strong>.
              </p>

              <div className="space-y-2 pt-2 border-t border-sage/20">
                <label className="flex items-start gap-2.5 text-xs text-ink dark:text-ink-dark cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasInspectedCheck}
                    onChange={(e) => setHasInspectedCheck(e.target.checked)}
                    className="mt-0.5 rounded text-sage focus:ring-sage"
                  />
                  <span>I have physically inspected the item and verified its condition.</span>
                </label>
                <label className="flex items-start gap-2.5 text-xs text-ink dark:text-ink-dark cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasReturnedDepositCheck}
                    onChange={(e) => setHasReturnedDepositCheck(e.target.checked)}
                    className="mt-0.5 rounded text-sage focus:ring-sage"
                  />
                  <span>
                    I have returned the offline security deposit of <strong>₹{securityAgreement?.securityAmount || 0}</strong> directly to {borrower.name}.
                  </span>
                </label>
              </div>

              <Button
                variant="primary"
                disabled={!hasInspectedCheck || !hasReturnedDepositCheck || isProcessing}
                onClick={onConfirmReturn}
                isLoading={isProcessing}
                className="w-full text-xs gap-2 shadow-sm mt-3"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm Item Returned & Complete Exchange
              </Button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-paper-sand/20 border border-paper-sand text-center space-y-2">
              <Clock className="w-6 h-6 text-marigold-darker mx-auto" />
              <p className="text-xs font-bold text-ink dark:text-ink-dark">
                Waiting for Lender ({lender.name}) Sign-Off
              </p>
              <p className="text-[11px] text-ink-muted leading-relaxed max-w-sm mx-auto">
                Meet {lender.name} at the designated handover point. Once they inspect the item and
                hand back your ₹{securityAgreement?.securityAmount || 0} deposit, they will confirm
                and close this exchange.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Stage C: COMPLETED */}
      {status === 'COMPLETED' && (
        <div className="p-4 rounded-xl bg-sage/10 border border-sage/30 text-center space-y-2">
          <CheckCircle className="w-8 h-8 text-sage mx-auto" />
          <h4 className="font-serif font-bold text-base text-ink dark:text-ink-dark">
            Exchange Successfully Completed!
          </h4>
          <p className="text-xs text-ink-muted dark:text-ink-darkMuted max-w-md mx-auto">
            The item was safely returned and the offline deposit has been released. Both parties have
            earned trust points for this verified exchange!
          </p>
        </div>
      )}
    </Card>
  );
};
