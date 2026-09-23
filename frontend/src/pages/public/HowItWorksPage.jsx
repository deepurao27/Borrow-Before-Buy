import React from 'react';
import { TimelineStory } from '../../components/landing/TimelineStory';
import { NoticeDisclaimer } from '../../components/ui/NoticeDisclaimer';
import { ShieldCheck, MapPin, QrCode, Star, Camera } from 'lucide-react';

export const HowItWorksPage = () => {
  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <span className="handwritten-note block text-lg mb-2">Campus Sharing Protocol</span>
        <h1 className="text-4xl font-extrabold text-ink dark:text-ink-dark font-serif">
          How Borrow Before Buy Works
        </h1>
        <p className="mt-3 text-sm text-ink-muted dark:text-ink-darkMuted leading-relaxed">
          BBB replaces scattered hostel messages with an accountable, 6-stage borrowing journey designed to keep both lenders and borrowers safe.
        </p>
      </div>

      <NoticeDisclaimer />

      <TimelineStory />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="paper-card p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-lg text-ink dark:text-ink-dark">1. Condition Proof</h3>
          <p className="text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed">
            Before meeting, the lender uploads clear condition photos and checks off working aspects (e.g. powers on, screen intact). The borrower confirms before handover.
          </p>
        </div>

        <div className="paper-card p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-marigold/20 text-marigold-dark flex items-center justify-center">
            <QrCode className="w-5 h-5 text-terracotta" />
          </div>
          <h3 className="font-serif font-bold text-lg text-ink dark:text-ink-dark">2. Dynamic QR Handover</h3>
          <p className="text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed">
            When you meet in person at the campus spot, the lender shows a 5-minute signed QR code. The borrower scans it to atomically verify physical transfer.
          </p>
        </div>

        <div className="paper-card p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sage/20 text-sage flex items-center justify-center">
            <Star className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-lg text-ink dark:text-ink-dark">3. Double-Sided Rating</h3>
          <p className="text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed">
            After return inspection, both students leave 1-5 star ratings that directly feed their campus reputation scores. Bad behavior is penalized automatically.
          </p>
        </div>
      </div>
    </div>
  );
};
