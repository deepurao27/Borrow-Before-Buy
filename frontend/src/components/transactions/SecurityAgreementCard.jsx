import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, Clock, Edit2, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { NoticeDisclaimer } from '../ui/NoticeDisclaimer';
import { Input } from '../ui/Input';

export const SecurityAgreementCard = ({
  transaction,
  currentUserId,
  onAcknowledge,
  onUpdateAgreement,
  isProcessing
}) => {
  const { securityAgreement, lender, borrower, status } = transaction;
  const isLender = currentUserId === lender.id;
  const isBorrower = currentUserId === borrower.id;

  const [isEditing, setIsEditing] = useState(false);
  const [amountInput, setAmountInput] = useState(securityAgreement?.securityAmount || 0);
  const [noteInput, setNoteInput] = useState(securityAgreement?.offlineTipNote || '');
  const [hasAgreedCheck, setHasAgreedCheck] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const hasLenderAcknowledged = securityAgreement?.lenderAcknowledged;
  const hasBorrowerAcknowledged = securityAgreement?.borrowerAcknowledged;
  const hasUserAcknowledged = isLender ? hasLenderAcknowledged : hasBorrowerAcknowledged;
  const canEdit = isLender && status === 'ACCEPTED' && !hasLenderAcknowledged && !hasBorrowerAcknowledged;

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    setUpdateError(null);
    try {
      await onUpdateAgreement({
        securityAmount: parseInt(amountInput, 10),
        offlineTipNote: noteInput
      });
      setIsEditing(false);
    } catch (err) {
      setUpdateError(err.message || 'Failed to update deposit amount');
    }
  };

  const handleAcknowledgeClick = () => {
    if (!hasAgreedCheck) return;
    onAcknowledge();
  };

  return (
    <Card className="relative overflow-hidden border-paper-sand dark:border-paper-sandDark shadow-paper">
      {/* Header Strip */}
      <div className="flex items-center justify-between border-b border-paper-sand dark:border-paper-sandDark pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-ink dark:text-ink-dark">
              Offline Security Deposit Agreement
            </h3>
            <p className="text-xs text-ink-muted dark:text-ink-darkMuted">
              Bilateral peer commitment prior to handover
            </p>
          </div>
        </div>

        {securityAgreement?.status === 'ACKNOWLEDGED' ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sage/15 text-sage border border-sage/30">
            <CheckCircle className="w-3.5 h-3.5" />
            Locked & Agreed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-marigold/15 text-marigold-darker dark:text-marigold border border-marigold/30">
            <Clock className="w-3.5 h-3.5" />
            Pending Sign-off
          </span>
        )}
      </div>

      {/* Mandatory Regulatory No-Money Notice */}
      <div className="mb-5">
        <NoticeDisclaimer variant="warning" />
      </div>

      {/* Agreed Security Deposit Amount Display */}
      <div className="p-4 rounded-xl bg-paper-sand/30 dark:bg-paper-sandDark/20 border border-paper-sand dark:border-paper-sandDark mb-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-ink-muted dark:text-ink-darkMuted font-bold">
              Agreed Security Deposit
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-ink dark:text-ink-dark font-serif">
                ₹{securityAgreement?.securityAmount || 0}
              </span>
              <span className="text-xs text-ink-muted dark:text-ink-darkMuted">
                (Refundable by lender upon return)
              </span>
            </div>
            {securityAgreement?.offlineTipNote && (
              <p className="text-xs text-ink-muted dark:text-ink-darkMuted mt-2 italic bg-white dark:bg-paper-cardDark p-2 rounded border border-paper-sand/60">
                Peer note: &ldquo;{securityAgreement.offlineTipNote}&rdquo;
              </p>
            )}
          </div>

          {canEdit && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-1.5 text-xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Adjust Amount
            </Button>
          )}
        </div>

        {/* Lender edit form if in initial state */}
        {isEditing && (
          <form onSubmit={handleSaveUpdate} className="mt-4 pt-4 border-t border-paper-sand dark:border-paper-sandDark">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-bold text-ink dark:text-ink-dark mb-1">
                  Adjust Deposit Amount (₹)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="10000"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink dark:text-ink-dark mb-1">
                  Handover Note (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Exact cash or UPI at Library Steps"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                />
              </div>
            </div>
            {updateError && (
              <p className="text-xs text-brick mb-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {updateError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isProcessing}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Bilateral Sign-off Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {/* Lender Acknowledgement */}
        <div
          className={`p-3.5 rounded-xl border transition-colors ${
            hasLenderAcknowledged
              ? 'bg-sage/10 border-sage/30'
              : 'bg-paper-sand/20 border-paper-sand dark:border-paper-sandDark'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-ink dark:text-ink-dark">
              Lender: {lender.name}
            </span>
            {hasLenderAcknowledged ? (
              <span className="text-xs font-semibold text-sage flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Acknowledged
              </span>
            ) : (
              <span className="text-xs font-medium text-ink-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Awaiting
              </span>
            )}
          </div>
          <p className="text-[11px] text-ink-muted dark:text-ink-darkMuted">
            {hasLenderAcknowledged
              ? `Confirmed directly on ${new Date(securityAgreement.lenderAcknowledgedAt).toLocaleDateString()}`
              : 'Must agree to collect & return deposit offline.'}
          </p>
        </div>

        {/* Borrower Acknowledgement */}
        <div
          className={`p-3.5 rounded-xl border transition-colors ${
            hasBorrowerAcknowledged
              ? 'bg-sage/10 border-sage/30'
              : 'bg-paper-sand/20 border-paper-sand dark:border-paper-sandDark'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-ink dark:text-ink-dark">
              Borrower: {borrower.name}
            </span>
            {hasBorrowerAcknowledged ? (
              <span className="text-xs font-semibold text-sage flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Acknowledged
              </span>
            ) : (
              <span className="text-xs font-medium text-ink-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Awaiting
              </span>
            )}
          </div>
          <p className="text-[11px] text-ink-muted dark:text-ink-darkMuted">
            {hasBorrowerAcknowledged
              ? `Confirmed directly on ${new Date(securityAgreement.borrowerAcknowledgedAt).toLocaleDateString()}`
              : 'Must agree to provide deposit offline upon inspection.'}
          </p>
        </div>
      </div>

      {/* Action Section for User */}
      {status === 'ACCEPTED' && !hasUserAcknowledged && (
        <div className="p-4 rounded-xl bg-terracotta/5 border border-terracotta/20">
          <label className="flex items-start gap-3 cursor-pointer select-none mb-3">
            <input
              type="checkbox"
              checked={hasAgreedCheck}
              onChange={(e) => setHasAgreedCheck(e.target.checked)}
              className="mt-1 rounded text-terracotta focus:ring-terracotta cursor-pointer"
            />
            <span className="text-xs text-ink dark:text-ink-dark font-medium leading-relaxed">
              I acknowledge that BBB does not hold or collect funds. I agree to settle the refundable
              deposit of <strong>₹{securityAgreement?.securityAmount || 0}</strong> directly in person
              at the designated handover point.
            </span>
          </label>

          <Button
            variant="primary"
            onClick={handleAcknowledgeClick}
            disabled={!hasAgreedCheck || isProcessing}
            isLoading={isProcessing}
            className="w-full gap-2 text-sm shadow-sm"
          >
            <CheckCircle className="w-4 h-4" />
            Confirm & Acknowledge Deposit Agreement
          </Button>
        </div>
      )}

      {hasUserAcknowledged && status === 'ACCEPTED' && (
        <div className="text-center py-2 text-xs text-ink-muted dark:text-ink-darkMuted font-medium flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4 text-sage" />
          You have acknowledged this agreement. Waiting for your peer to sign off.
        </div>
      )}
    </Card>
  );
};
