import React, { useState } from 'react';
import { apiClient } from '../../api/client';
import { Button } from '../ui/Button';
import { AlertOctagon, X, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export const OpenDisputeModal = ({ isOpen, onClose, transactionId, onDisputeCreated }) => {
  const [type, setType] = useState('DAMAGE');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (description.trim().length < 10) {
      toast.error('Please provide at least 10 characters describing the issue.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient('/disputes', {
        method: 'POST',
        body: JSON.stringify({
          transactionId,
          type,
          description: description.trim()
        })
      });

      toast.success(res.message || 'Dispute opened. Campus moderators have been notified.');
      onDisputeCreated?.(res.data?.dispute);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to file dispute.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 dark:bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-lg paper-card overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 px-6 bg-brick/10 border-b border-brick/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-brick">
            <AlertOctagon className="w-5 h-5" />
            <h3 className="font-serif font-bold text-lg text-ink dark:text-ink-dark">
              Open Transaction Dispute
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-ink-muted hover:text-ink dark:hover:text-ink-dark transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-marigold/15 border border-marigold/40 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
            <p className="text-xs text-ink dark:text-ink-dark leading-relaxed">
              Filing a dispute will freeze this exchange in <strong>DISPUTED</strong> state. A student moderator or campus admin will review photos, agreements, and chat logs to mediate fairly.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-ink dark:text-ink-dark uppercase tracking-wider">
              Issue Category *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full text-xs font-semibold py-2.5 px-3 rounded-xl border border-paper-sand dark:border-paper-sandDark bg-white dark:bg-paper-cardDark text-ink dark:text-ink-dark focus:ring-1 focus:ring-terracotta outline-none"
            >
              <option value="DAMAGE">Item Returned Damaged or Broken</option>
              <option value="NON_RETURN">Item Not Returned / Student Unresponsive</option>
              <option value="FALSE_CLAIM">False Claim Regarding Condition or Terms</option>
              <option value="OTHER">Other Dispute / Offline Safety Concern</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-ink dark:text-ink-dark uppercase tracking-wider">
              Detailed Explanation *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Explain exactly what happened, when the handover/return took place, and what resolution you are requesting..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs py-2.5 px-3 rounded-xl border border-paper-sand dark:border-paper-sandDark bg-white dark:bg-paper-cardDark text-ink dark:text-ink-dark focus:ring-1 focus:ring-terracotta outline-none resize-none leading-relaxed"
            />
            <span className="text-[10px] text-ink-muted dark:text-ink-darkMuted block">
              Minimum 10 characters. Be concise and factual.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-paper-sand dark:border-paper-sandDark">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              loading={loading}
              className="gap-1.5 font-bold shadow-sm"
            >
              <AlertOctagon className="w-4 h-4" />
              File Dispute
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
