import React from 'react';
import { Avatar } from '../ui/Avatar';
import { Award, ShieldCheck, Clock, ThumbsUp } from 'lucide-react';

export const SampleProfileCard = () => {
  return (
    <section className="py-20 bg-paper-sand/20 dark:bg-paper-sandDark/10 border-y border-paper-sand dark:border-paper-sandDark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="handwritten-note block">Dual-Score Reputation Engine</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink dark:text-ink-dark font-serif">
              One account. <br />
              Two independent <span className="doodle-underline">trust scores</span>.
            </h2>
            <p className="text-sm text-ink-muted dark:text-ink-darkMuted leading-relaxed max-w-lg">
              On BBB, there are no permanent "borrowers" or "lenders". You might lend your graphing calculator on Tuesday and borrow an HDMI cord on Thursday. Your reliability in each role is tracked separately.
            </p>
            <ul className="space-y-2 text-xs text-ink-muted dark:text-ink-darkMuted pt-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
                <strong className="text-ink dark:text-ink-dark">Lender Score:</strong> Rewarded for clean item condition, on-time handover, and good reviews.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                <strong className="text-ink dark:text-ink-dark">Borrower Score:</strong> Rewarded for punctual returns, careful care, and mutual ratings.
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 flex justify-center">
            {/* Interactive Sample Profile Card */}
            <div className="paper-card w-full max-w-md p-6 sm:p-8 relative shadow-paperHover">
              <div className="tape-strip" />

              <div className="flex items-center gap-4 pb-6 border-b border-paper-sand dark:border-paper-sandDark">
                <Avatar name="Rahul Sharma" size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-lg text-ink dark:text-ink-dark">Rahul Sharma</h3>
                    <span className="bg-sage/20 text-sage text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified Student
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted dark:text-ink-darkMuted">B.Tech Electronics & Comm. (4th Year)</p>
                  <p className="text-[11px] text-terracotta font-semibold mt-0.5">⭐ Super Lender (280 pts)</p>
                </div>
              </div>

              {/* Two Score Rings / Stats */}
              <div className="grid grid-cols-2 gap-4 py-6">
                <div className="bg-paper-light dark:bg-paper-dark p-4 rounded-xl border border-paper-sand dark:border-paper-sandDark text-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-darkMuted block mb-1">
                    Lender Score
                  </span>
                  <div className="text-3xl font-black font-serif text-terracotta">98<span className="text-sm font-sans text-ink-muted">/100</span></div>
                  <span className="text-[10px] text-sage font-bold block mt-1">12 items lent • 100% on-time</span>
                </div>

                <div className="bg-paper-light dark:bg-paper-dark p-4 rounded-xl border border-paper-sand dark:border-paper-sandDark text-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-darkMuted block mb-1">
                    Borrower Score
                  </span>
                  <div className="text-3xl font-black font-serif text-sage">95<span className="text-sm font-sans text-ink-muted">/100</span></div>
                  <span className="text-[10px] text-sage font-bold block mt-1">6 items borrowed • 0 late</span>
                </div>
              </div>

              {/* Badges Earned */}
              <div className="pt-4 border-t border-paper-sand dark:border-paper-sandDark flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-ink dark:text-ink-dark font-medium">
                  <Award className="w-4 h-4 text-marigold" />
                  <span>Badges:</span>
                  <span className="bg-marigold/20 text-ink dark:text-ink-dark text-[10px] font-bold px-2 py-0.5 rounded">⭐ Trusted Lender</span>
                  <span className="bg-terracotta/20 text-terracotta text-[10px] font-bold px-2 py-0.5 rounded">⚡ Rapid Handover</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
