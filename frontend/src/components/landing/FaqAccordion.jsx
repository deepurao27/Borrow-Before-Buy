import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const FaqAccordion = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'Does BBB charge any fees or process payments?',
      a: 'Never. BBB never touches, processes, or holds money. There are zero platform fees, zero wallets, and zero commissions. All offline security amounts and optional tips are settled directly between you and your batchmate in person.'
    },
    {
      q: 'How does the offline security agreement work?',
      a: 'When an item is requested, both students acknowledge an agreed offline security amount on the app. When you meet in person to scan the handover QR, the borrower provides this security amount directly to the lender. Once returned in good condition, the lender returns the amount directly.'
    },
    {
      q: 'Where do handovers take place?',
      a: 'Only at verified public campus locations — such as the Library Steps, Block A Lobby, Canteen, Sports Pavilion, or Main Gate. We never reveal room numbers or private hostel addresses.'
    },
    {
      q: 'What if an item gets damaged or returned late?',
      a: 'Lenders upload condition photos and a checklist before the handover. When returning, the lender inspects the item. If damage occurs, either party can open a dispute which preserves all evidence and routes to the campus moderation queue. Trust scores decrease for non-returns and damage.'
    },
    {
      q: 'Can I lend and borrow with the same account?',
      a: 'Yes! Every verified student has one single account with two independent trust scores (Lender Score and Borrower Score). You can lend a tripod today and borrow an HDMI cable tomorrow.'
    },
    {
      q: 'Can I register with my personal email (Gmail, Outlook, Yahoo, etc.)?',
      a: 'Yes! Anyone can register with their personal or college email address. Email verification via OTP or confirmation link ensures account security and community trust.'
    }
  ];

  return (
    <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <span className="handwritten-note block mb-2">Got questions?</span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-ink dark:text-ink-dark font-serif">
          Frequently asked <span className="doodle-underline">questions</span>
        </h2>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="paper-card overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif font-bold text-base text-ink dark:text-ink-dark cursor-pointer"
                aria-expanded={isOpen}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-terracotta transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed border-t border-paper-sand/50 dark:border-paper-sandDark animate-in fade-in duration-150">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
