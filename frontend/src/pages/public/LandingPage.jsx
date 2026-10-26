import React from 'react';
import { HeroNoticeboard } from '../../components/landing/HeroNoticeboard';
import { LiveStatsStrip } from '../../components/landing/LiveStatsStrip';
import { FeaturedGearShowcase } from '../../components/landing/FeaturedGearShowcase';
import { TimelineStory } from '../../components/landing/TimelineStory';
import { CategoryGrid } from '../../components/landing/CategoryGrid';
import { TrustComparison } from '../../components/landing/TrustComparison';
import { SampleProfileCard } from '../../components/landing/SampleProfileCard';
import { StudentTestimonials } from '../../components/landing/StudentTestimonials';
import { FaqAccordion } from '../../components/landing/FaqAccordion';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, PlusCircle } from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="space-y-0">
      {/* 1. Hero Section with Live Activity Ticker & Dual CTAs */}
      <HeroNoticeboard />

      {/* 2. Live Database Stats Strip */}
      <LiveStatsStrip />

      {/* 3. Featured Campus Gear Available Today */}
      <FeaturedGearShowcase />

      {/* 4. 6-Step Story: Aman & Rahul */}
      <TimelineStory />

      {/* 5. Gear Categories */}
      <CategoryGrid />

      {/* 6. What We Do and Don't Do */}
      <TrustComparison />

      {/* 7. Dual-Score Reputation Preview */}
      <SampleProfileCard />

      {/* 8. Student Stories & Testimonials */}
      <StudentTestimonials />

      {/* 9. Post-a-Need & Lend Callout Band */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="paper-card p-8 sm:p-12 bg-gradient-to-r from-marigold/15 via-paper-sand/50 to-sage/15 border-marigold/40 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="tape-strip" />
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="handwritten-note block text-lg text-terracotta">Got Idle Gear in Your Bag?</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-ink dark:text-ink-dark font-serif">
              Lend equipment and build your campus reputation
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted dark:text-ink-darkMuted leading-relaxed">
              Lab coats, calculators, and cables sit unused 90% of the semester. Lend them to your juniors and batchmates with zero fees and secure in-person pickup.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link to="/lend">
              <Button variant="accent" size="lg" className="gap-2 font-bold shadow-sm">
                <PlusCircle className="w-4 h-4" />
                Lend an Item
              </Button>
            </Link>
            <Link to="/search">
              <Button variant="secondary" size="lg" className="gap-2 font-bold">
                Browse All Items
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 10. FAQ Accordion */}
      <FaqAccordion />

      {/* 11. Campus Mission & Creator Note */}
      <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="paper-card p-8 relative border-terracotta/30 bg-terracotta/5 dark:bg-terracotta/10">
          <div className="pin-dot" />
          <span className="handwritten-note block text-lg mb-2">Our Campus Mission</span>
          <h3 className="text-xl font-bold font-serif text-ink dark:text-ink-dark mb-3">
            Why Borrow Before Buy?
          </h3>
          <p className="text-xs sm:text-sm text-ink-muted dark:text-ink-darkMuted leading-relaxed mb-4">
            In college, students buy costly drafters, lab equipment, and scientific calculators used for just a few lab exams. Everyone is either wasting money or asking in chaotic chat groups where items vanish with zero accountability.
          </p>
          <p className="text-xs sm:text-sm text-ink-muted dark:text-ink-darkMuted leading-relaxed mb-4">
            Borrow Before Buy gives our campus a clean, safe, and transparent way to share what we already own. No payments, no hassle — just students helping students with verified college emails and QR handovers.
          </p>
          <div className="pt-3 border-t border-paper-sand dark:border-paper-sandDark flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-ink dark:text-ink-dark">Student Community Initiative</p>
              <p className="text-[11px] text-terracotta font-semibold">Campus Peer Sharing Network</p>
            </div>
            <Link to="/register">
              <Button variant="primary" size="sm">Join Campus Board</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
