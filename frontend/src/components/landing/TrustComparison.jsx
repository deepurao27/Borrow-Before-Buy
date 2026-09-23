import React from 'react';
import { Check, X, ShieldAlert, Sparkles } from 'lucide-react';

export const TrustComparison = () => {
  const doItems = [
    { title: 'Secure Email Verification', desc: 'Every user is authenticated with verified OTP or email confirmation link.' },
    { title: 'Condition Evidence Photos', desc: 'Lender uploads before-photos; borrower confirms prior to handover.' },
    { title: '5-Minute Dynamic QR Handover', desc: 'Physical meeting confirmed in real time with single-use cryptographically signed tokens.' },
    { title: 'Due Date Reminders & Alerts', desc: 'Automated warnings so you never forget to return or collect your item.' },
    { title: 'Transparent Moderation', desc: 'Dispute queue with photographic proof and audited trust score penalties.' }
  ];

  const dontItems = [
    { title: 'Never Touch Your Money', desc: 'Zero wallets, zero bank accounts, zero UPI fees. Security deposits are settled offline.' },
    { title: 'Never Expose Your Phone Number', desc: 'All coordination and messaging stays securely inside the app thread.' },
    { title: 'Never Reveal Private Room Addresses', desc: 'Handovers strictly take place at public campus landmarks like Library Steps or Canteen.' },
    { title: 'Never Fake Statistics or Reviews', desc: 'Reputation scores are mathematically derived from actual completed transactions.' },
    { title: 'Zero Platform Commissions', desc: '100% free peer sharing built by students, for students.' }
  ];

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="handwritten-note block mb-2">Honest Boundaries</span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-ink dark:text-ink-dark font-serif">
          What we <span className="doodle-underline">do</span> and <span className="doodle-underline-terracotta">don’t do</span>
        </h2>
        <p className="mt-3 text-sm text-ink-muted dark:text-ink-darkMuted">
          Built for campus trust. No marketing jargon, no corporate doublespeak.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* What We Do */}
        <div className="paper-card p-6 sm:p-8 border-sage/40 dark:border-sage/30 bg-sage/5 dark:bg-sage/10 relative">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-sage text-white flex items-center justify-center font-bold">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <h3 className="text-xl font-bold font-serif text-ink dark:text-ink-dark">What BBB does for you</h3>
          </div>

          <ul className="space-y-4">
            {doItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-sage shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-ink dark:text-ink-dark">{item.title}</h4>
                  <p className="text-xs text-ink-muted dark:text-ink-darkMuted mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* What We Don't Do */}
        <div className="paper-card p-6 sm:p-8 border-brick/40 dark:border-brick/30 bg-brick/5 dark:bg-brick/10 relative">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-brick text-white flex items-center justify-center font-bold">
              <X className="w-5 h-5 stroke-[3]" />
            </div>
            <h3 className="text-xl font-bold font-serif text-ink dark:text-ink-dark">What BBB will never do</h3>
          </div>

          <ul className="space-y-4">
            {dontItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <X className="w-5 h-5 text-brick shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-ink dark:text-ink-dark">{item.title}</h4>
                  <p className="text-xs text-ink-muted dark:text-ink-darkMuted mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
