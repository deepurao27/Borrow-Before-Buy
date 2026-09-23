import React from 'react';
import { TrustComparison } from '../../components/landing/TrustComparison';
import { NoticeDisclaimer } from '../../components/ui/NoticeDisclaimer';
import { Shield, MapPin, Lock, EyeOff } from 'lucide-react';

export const SafetyPage = () => {
  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <span className="handwritten-note block text-lg mb-2">Campus Trust Principles</span>
        <h1 className="text-4xl font-extrabold text-ink dark:text-ink-dark font-serif">
          Campus Safety & Trust Invariants
        </h1>
        <p className="mt-3 text-sm text-ink-muted dark:text-ink-darkMuted leading-relaxed">
          How Borrow Before Buy keeps students protected: no financial fraud, no private room visits, and verified student identities only.
        </p>
      </div>

      <NoticeDisclaimer />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="paper-card p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-lg text-ink dark:text-ink-dark">Zero Money Processing</h3>
          <p className="text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed">
            We never hold or process student money. Security amounts are settled directly in person, eliminating transaction fees, gateway glitches, and unauthorized withdrawals.
          </p>
        </div>

        <div className="paper-card p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sage/10 text-sage flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-lg text-ink dark:text-ink-dark">Public Meeting Points Only</h3>
          <p className="text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed">
            Handovers happen exclusively in high-visibility campus spots: Library Steps, Main Gate, Block A Lobby, or Canteen. We strictly forbid room visits or unverified locations.
          </p>
        </div>

        <div className="paper-card p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-marigold/15 text-marigold-dark flex items-center justify-center">
            <EyeOff className="w-5 h-5 text-terracotta" />
          </div>
          <h3 className="font-serif font-bold text-lg text-ink dark:text-ink-dark">Private Phone Numbers</h3>
          <p className="text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed">
            No personal mobile numbers are exposed on listings. In-app messaging keeps conversations linked to the specific borrow transaction.
          </p>
        </div>
      </div>

      <TrustComparison />
    </div>
  );
};
