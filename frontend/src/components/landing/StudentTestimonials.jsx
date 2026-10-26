import React from 'react';
import { MOCK_REVIEWS } from '../../api/mockData';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export const StudentTestimonials = () => {
  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="handwritten-note block text-lg text-terracotta">Student Experiences</span>
        <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-ink dark:text-ink-dark">
          Real Stories from Campus
        </h2>
        <p className="text-xs sm:text-sm text-ink-muted dark:text-ink-darkMuted leading-relaxed">
          See how batchmates are saving thousands of rupees and helping each other through mid-terms and project deadlines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MOCK_REVIEWS.map((rev) => (
          <div
            key={rev.id}
            className="paper-card p-6 relative flex flex-col justify-between shadow-paper hover:shadow-paperHover transition-all space-y-4"
          >
            <div className="tape-strip" />

            <div className="space-y-3">
              <div className="flex items-center gap-1 text-marigold">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-marigold" />
                ))}
              </div>

              <p className="text-xs sm:text-sm text-ink dark:text-ink-dark leading-relaxed font-sans italic">
                "{rev.comment}"
              </p>
            </div>

            <div className="pt-4 border-t border-paper-sand dark:border-paper-sandDark flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={rev.borrowerAvatar}
                  alt={rev.borrowerName}
                  className="w-9 h-9 rounded-full object-cover border border-paper-sand"
                />
                <div>
                  <h4 className="text-xs font-bold text-ink dark:text-ink-dark flex items-center gap-1">
                    {rev.borrowerName}
                    <CheckCircle2 className="w-3.5 h-3.5 text-sage" />
                  </h4>
                  <p className="text-[10px] text-ink-muted dark:text-ink-darkMuted">
                    {rev.borrowerYear}
                  </p>
                </div>
              </div>

              <span className="text-[10px] bg-paper-sand/50 dark:bg-paper-sandDark/50 px-2 py-0.5 rounded text-terracotta font-semibold">
                {rev.itemTitle}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
