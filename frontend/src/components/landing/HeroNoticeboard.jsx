import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { PaperTag } from '../ui/PaperTag';
import { Avatar } from '../ui/Avatar';
import { ShieldCheck, QrCode, ArrowRight, CheckCircle2, PlusCircle, Sparkles, Search } from 'lucide-react';

export const HeroNoticeboard = () => {
  return (
    <section className="relative pt-10 pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Campus Live Activity Ticker */}
        <div className="mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs font-medium text-slate-200 shadow-sm animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-bold text-amber-400">Campus Live:</span>
          <span className="text-slate-300 truncate">
            Kabir S. (CSE-AIML) borrowed TI-84 Plus CE from Deepu Rao - 3m ago • 100% Free Peer Lending
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Headline & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink dark:text-ink-dark leading-[1.12]">
              Why buy it for one lab? <br />
              <span className="doodle-underline">Borrow it</span> from someone in your batch.
            </h1>

            <p className="text-lg text-ink-muted dark:text-ink-darkMuted leading-relaxed max-w-xl">
              Scientific calculators, HDMI presentation cables, lab coats, and engineering drafters. Verified students sharing short-term gear right on campus with condition photos, QR handovers, and zero money handling.
            </p>

            {/* Dual Core CTAs: Borrow & Lend */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/search">
                <Button variant="accent" size="lg" className="gap-2 shadow-sm font-bold text-sm">
                  <Search className="w-4 h-4" />
                  Find an Item to Borrow
                </Button>
              </Link>
              <Link to="/lend">
                <Button variant="primary" size="lg" className="gap-2 shadow-sm font-bold text-sm">
                  <PlusCircle className="w-4 h-4" />
                  Lend an Idle Item
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="secondary" size="lg" className="text-sm font-semibold">
                  How it works
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-ink-muted dark:text-ink-darkMuted font-medium">
              <div className="flex items-center gap-1.5 text-sage dark:text-sage-light font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified student accounts</span>
              </div>
              <span className="text-paper-sand dark:text-paper-sandDark">•</span>
              <span>100% Free peer sharing</span>
              <span className="text-paper-sand dark:text-paper-sandDark">•</span>
              <span>Designated public campus spots</span>
            </div>
          </div>

          {/* Right Column: Noticeboard Collage */}
          <div className="lg:col-span-5 relative">
            {/* Visual Corkboard Canvas Frame */}
            <div className="relative p-6 sm:p-8 rounded-3xl bg-paper-sand/30 dark:bg-paper-sandDark/20 border-2 border-dashed border-paper-sand dark:border-paper-sandDark min-h-[440px] flex flex-col justify-between">
              {/* Tilted Item Tag 1: Calculator */}
              <Link to="/search?category=calculators">
                <PaperTag tilt="left" pin={true} className="w-full sm:w-72 self-start shadow-paper hover:z-20 transition-all hover:scale-102 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar name="Deepu Rao" size="sm" />
                      <div>
                        <p className="text-xs font-bold text-ink dark:text-ink-dark">Deepu Rao</p>
                        <p className="text-[10px] text-emerald-400 font-bold">⭐ 98 Trust Score</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-paper-sand/50 dark:bg-paper-sandDark/50 px-2 py-0.5 rounded-full font-medium">
                      Library Steps
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-ink dark:text-ink-dark font-serif">TI-84 Plus CE Calculator</h4>
                  <div className="mt-2 pt-2 border-t border-paper-sand/60 dark:border-paper-sandDark flex justify-between items-center text-xs">
                    <span className="text-terracotta font-semibold">Offline Sec: ₹500</span>
                    <span className="text-[11px] text-ink-muted dark:text-ink-darkMuted">2 days free</span>
                  </div>
                </PaperTag>
              </Link>

              {/* Tilted Item Tag 2: HDMI Cable */}
              <Link to="/search?category=cables-adapters">
                <PaperTag tilt="right" tape={true} className="w-full sm:w-72 self-end shadow-paper -mt-4 hover:z-20 transition-all hover:scale-102 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar name="Priya Patel" size="sm" />
                      <div>
                        <p className="text-xs font-bold text-ink dark:text-ink-dark">Priya P.</p>
                        <p className="text-[10px] text-sage font-bold">⭐ 95 Trust Score</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-paper-sand/50 dark:bg-paper-sandDark/50 px-2 py-0.5 rounded-full font-medium">
                      Block A Lobby
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-ink dark:text-ink-dark font-serif">USB-C to HDMI 4K Cable</h4>
                  <div className="mt-2 pt-2 border-t border-paper-sand/60 dark:border-paper-sandDark flex justify-between items-center text-xs">
                    <span className="text-terracotta font-semibold">Offline Sec: ₹200</span>
                    <span className="text-[11px] text-ink-muted dark:text-ink-darkMuted">Available today</span>
                  </div>
                </PaperTag>
              </Link>

              {/* Sticky Note & Mini QR Handover Slip */}
              <div className="flex items-center justify-between gap-3 mt-4">
                <div className="bg-[#FFF9D2] text-[#695800] p-3 rounded-lg shadow-sm border border-[#E8DD95] -rotate-2 text-xs font-hand text-base max-w-[190px]">
                  "Ananya returned Rahul's calculator on time and in mint condition!"
                </div>

                <div className="bg-white dark:bg-paper-cardDark p-2.5 rounded-xl border border-paper-sand dark:border-paper-sandDark shadow-sm rotate-2 flex items-center gap-2 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-terracotta/10 flex items-center justify-center text-terracotta">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-[10px] uppercase tracking-wider text-ink dark:text-ink-dark">Dynamic QR Handover</span>
                    <span className="text-[10px] text-sage font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Safe Return Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
