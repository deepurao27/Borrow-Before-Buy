import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { PaperTag } from '../ui/PaperTag';
import { Avatar } from '../ui/Avatar';
import { ShieldCheck, QrCode, ArrowRight, CheckCircle2 } from 'lucide-react';

export const HeroNoticeboard = () => {
  return (
    <section className="relative pt-12 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Headline & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-marigold/15 border border-marigold/30 text-xs font-bold text-ink dark:text-ink-dark">
              <span className="w-2 h-2 rounded-full bg-marigold animate-pulse" />
              Verified College Campus Community
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink dark:text-ink-dark leading-[1.12]">
              Why buy it for one lab? <br />
              <span className="doodle-underline">Borrow it</span> from someone in your batch.
            </h1>

            <p className="text-lg text-ink-muted dark:text-ink-darkMuted leading-relaxed max-w-xl">
              Scientific calculators, HDMI cords, lab coats, and camera tripods. Real students sharing short-term items right on campus with condition photos, QR handover, and zero money handling.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/register">
                <Button variant="accent" size="lg" className="gap-2 shadow-sm font-bold">
                  Get started with your email
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="secondary" size="lg">
                  See how a borrow works
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-3 pt-3 text-xs text-ink-muted dark:text-ink-darkMuted font-medium">
              <div className="flex items-center gap-1.5 text-sage dark:text-sage-light font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified email & instant OTP</span>
              </div>
              <span className="text-paper-sand dark:text-paper-sandDark">•</span>
              <span>No payments, ever</span>
              <span className="text-paper-sand dark:text-paper-sandDark">•</span>
              <span>Public spots only</span>
            </div>
          </div>

          {/* Right Column: Noticeboard Collage */}
          <div className="lg:col-span-5 relative">
            {/* Visual Corkboard Canvas Frame */}
            <div className="relative p-6 sm:p-8 rounded-3xl bg-paper-sand/30 dark:bg-paper-sandDark/20 border-2 border-dashed border-paper-sand dark:border-paper-sandDark min-h-[440px] flex flex-col justify-between">
              {/* Tilted Item Tag 1: Calculator */}
              <PaperTag tilt="left" pin={true} className="w-full sm:w-72 self-start shadow-paper hover:z-20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar name="Rahul Sharma" size="sm" />
                    <div>
                      <p className="text-xs font-bold text-ink dark:text-ink-dark">Rahul S.</p>
                      <p className="text-[10px] text-sage font-bold">⭐ 98 Trust Score</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-paper-sand/50 dark:bg-paper-sandDark/50 px-2 py-0.5 rounded-full font-medium">
                    Library Steps
                  </span>
                </div>
                <h4 className="text-sm font-bold text-ink dark:text-ink-dark font-serif">TI-84 Plus CE Calculator</h4>
                <div className="mt-2 pt-2 border-t border-paper-sand/60 dark:border-paper-sandDark flex justify-between items-center text-xs">
                  <span className="text-terracotta font-semibold">Offline Sec: Rs 500</span>
                  <span className="text-[11px] text-ink-muted dark:text-ink-darkMuted">2 days free</span>
                </div>
              </PaperTag>

              {/* Tilted Item Tag 2: HDMI Cable */}
              <PaperTag tilt="right" tape={true} className="w-full sm:w-72 self-end shadow-paper -mt-4 hover:z-20 transition-all">
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
                  <span className="text-terracotta font-semibold">Offline Sec: Rs 200</span>
                  <span className="text-[11px] text-ink-muted dark:text-ink-darkMuted">Available today</span>
                </div>
              </PaperTag>

              {/* Sticky Note & Mini QR Handover Slip */}
              <div className="flex items-center justify-between gap-3 mt-4">
                <div className="bg-[#FFF9D2] text-[#695800] p-3 rounded-lg shadow-sm border border-[#E8DD95] -rotate-2 text-xs font-hand text-base max-w-[190px]">
                  "Aman returned Rahul's calculator on time and in mint condition!"
                </div>

                <div className="bg-white dark:bg-paper-cardDark p-2.5 rounded-xl border border-paper-sand dark:border-paper-sandDark shadow-sm rotate-2 flex items-center gap-2 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-terracotta/10 flex items-center justify-center text-terracotta">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-[10px] uppercase tracking-wider text-ink dark:text-ink-dark">QR Handover</span>
                    <span className="text-[10px] text-sage font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Handover Done
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
