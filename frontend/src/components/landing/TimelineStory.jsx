import React from 'react';
import { Search, Send, ShieldAlert, QrCode, RotateCcw, Star } from 'lucide-react';
import { NoticeDisclaimer } from '../ui/NoticeDisclaimer';

export const TimelineStory = () => {
  const steps = [
    {
      num: '01',
      title: 'Find it on the noticeboard',
      desc: 'Aman needs a scientific calculator for his Friday physics lab. He searches the campus noticeboard and spots Rahul’s TI-84 Plus pinned with a verified trust score.',
      icon: Search,
      tag: 'Search & Pick'
    },
    {
      num: '02',
      title: 'Send a request',
      desc: 'Aman specifies the exact borrow duration (Friday to Sunday) and adds a friendly note. Rahul receives an instant notification.',
      icon: Send,
      tag: '1-Click Request'
    },
    {
      num: '03',
      title: 'Agree on offline security',
      desc: 'Both acknowledge an offline security amount of Rs 500. BBB never touches money; this is settled in-person directly between Aman and Rahul.',
      icon: ShieldAlert,
      tag: 'Offline Agreement'
    },
    {
      num: '04',
      title: 'Meet & scan the QR',
      desc: 'They meet at the Library Steps. Rahul opens his dynamic 5-minute handover QR code on his phone. Aman scans it. Status moves to Borrowed.',
      icon: QrCode,
      tag: 'Verified Handover'
    },
    {
      num: '05',
      title: 'Return & inspect',
      desc: 'Two days later, Aman hands the calculator back at the Library Steps. Rahul verifies the condition and taps "Confirm Return".',
      icon: RotateCcw,
      tag: 'Completed'
    },
    {
      num: '06',
      title: 'Rate & build trust',
      desc: 'Both submit honest 5-star feedback. Rahul earns lender reward points and a badge; Aman boosts his campus borrower reputation.',
      icon: Star,
      tag: 'Reputation+'
    }
  ];

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="handwritten-note block mb-2">Step-by-step walkthrough</span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-ink dark:text-ink-dark font-serif">
          A borrow, <span className="doodle-underline">start to finish</span>
        </h2>
        <p className="mt-3 text-sm text-ink-muted dark:text-ink-darkMuted">
          Follow Aman and Rahul’s calculator journey to see how BBB replaces awkward WhatsApp groups with transparent peer borrowing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="paper-card p-6 relative flex flex-col justify-between hover:shadow-paperHover hover:-translate-y-1 transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black font-serif text-terracotta dark:text-terracotta-light">
                    {step.num}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-paper-sand/40 dark:bg-paper-sandDark/40 px-2.5 py-1 rounded-md text-ink dark:text-ink-dark">
                    {step.tag}
                  </span>
                </div>

                <div className="w-10 h-10 rounded-xl bg-marigold/15 text-marigold-dark flex items-center justify-center">
                  <Icon className="w-5 h-5 text-terracotta dark:text-terracotta-light" />
                </div>

                <h3 className="text-lg font-bold text-ink dark:text-ink-dark font-serif">
                  {step.title}
                </h3>

                <p className="text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {step.num === '03' && (
                <div className="mt-4 pt-3 border-t border-paper-sand dark:border-paper-sandDark">
                  <NoticeDisclaimer customText="Zero money handling. Settled directly in cash or UPI offline." />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
