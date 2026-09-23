import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck,
  Calendar,
  Package,
  Star,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { PaperTag } from '../../components/ui/PaperTag';
import { Skeleton } from '../../components/ui/Skeleton';
import { TrustScoreRing } from '../../components/trust/TrustScoreRing';

export const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const isSelf = !id || id === currentUser?.id;
  const endpoint = isSelf ? '/users/me/profile' : `/users/${id}/profile`;

  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['profile', id || 'me'],
    queryFn: async () => {
      const res = await apiClient(endpoint);
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-44 rounded-2xl w-full" />
        <Skeleton className="h-64 rounded-2xl w-full" />
        <Skeleton className="h-44 rounded-2xl w-full" />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-brick mx-auto mb-3" />
        <h2 className="text-xl font-bold font-serif text-ink dark:text-ink-dark">
          Student Profile Not Found
        </h2>
        <p className="text-xs text-ink-muted mt-1 mb-6">
          The requested profile could not be loaded.
        </p>
        <Link to="/search">
          <Button variant="primary">Browse Items</Button>
        </Link>
      </div>
    );
  }

  const { user, trustProfile, ratings, activeListings = [] } = profileData;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 1. Header Card */}
      <Card className="p-6 border-paper-sand dark:border-paper-sandDark shadow-paper">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <Avatar name={user.name} size="xl" className="w-24 h-24 text-3xl shrink-0 shadow-paper" />

          <div className="flex-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
              <h1 className="text-2xl font-black font-serif text-ink dark:text-ink-dark">
                {user.name}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sage/15 text-sage border border-sage/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Student
              </span>
            </div>

            <p className="text-xs text-ink-muted dark:text-ink-darkMuted mt-1">
              {user.department} &bull; Year {user.year}
            </p>
            <p className="text-xs text-ink-muted font-mono mt-0.5">
              {user.collegeEmail}
            </p>

            <div className="flex items-center gap-4 text-xs text-ink-muted mt-3 justify-center sm:justify-start">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1 font-semibold text-ink dark:text-ink-dark">
                <Package className="w-3.5 h-3.5 text-terracotta" />
                {activeListings.length} Active Listings
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Trust & Reputation Breakdown */}
      <Card className="p-6 border-paper-sand dark:border-paper-sandDark shadow-paper">
        <div className="border-b border-paper-sand dark:border-paper-sandDark pb-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-terracotta" />
            <h2 className="font-serif font-bold text-lg text-ink dark:text-ink-dark">
              Campus Trust & Reputation Engine
            </h2>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-paper-sand/50 text-ink dark:text-ink-dark">
            {trustProfile.tier.name}
          </span>
        </div>

        {/* 3 Gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-2 mb-8">
          <TrustScoreRing
            score={trustProfile.overallScore}
            label="Overall Score"
            sublabel="Campus-wide index"
            size="lg"
          />
          <TrustScoreRing
            score={trustProfile.lenderScore}
            label="Lender Score"
            sublabel={`${trustProfile.metrics.completedLends} items lent`}
            size="lg"
          />
          <TrustScoreRing
            score={trustProfile.borrowerScore}
            label="Borrower Score"
            sublabel={`${trustProfile.metrics.completedBorrows} items borrowed`}
            size="lg"
          />
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-paper-sand/30 dark:bg-paper-sandDark/20 border border-paper-sand dark:border-paper-sandDark text-center">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold block">
              Completed Borrows
            </span>
            <span className="text-xl font-bold font-serif text-ink dark:text-ink-dark">
              {trustProfile.metrics.completedBorrows}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold block">
              Completed Lends
            </span>
            <span className="text-xl font-bold font-serif text-ink dark:text-ink-dark">
              {trustProfile.metrics.completedLends}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold block">
              On-Time Returns
            </span>
            <span className="text-xl font-bold font-serif text-sage">
              {trustProfile.metrics.onTimeReturns}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold block">
              On-Time Rate
            </span>
            <span className="text-xl font-bold font-serif text-ink dark:text-ink-dark">
              {trustProfile.metrics.onTimeRatePercent}%
            </span>
          </div>
        </div>

        {/* Trust Event Log Timeline */}
        {trustProfile.history?.length > 0 && (
          <div className="mt-6 pt-6 border-t border-paper-sand dark:border-paper-sandDark">
            <h3 className="text-xs font-bold text-ink dark:text-ink-dark uppercase tracking-wider mb-3">
              Recent Trust Verification Log
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {trustProfile.history.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-paper-cardDark border border-paper-sand/60 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-bold text-xs ${
                        evt.delta > 0 ? 'text-sage' : 'text-brick'
                      }`}
                    >
                      {evt.delta > 0 ? `+${evt.delta}` : evt.delta}
                    </span>
                    <span className="font-semibold text-ink dark:text-ink-dark">
                      {evt.eventType.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-ink-muted">({evt.roleContext})</span>
                  </div>
                  <span className="text-[10px] text-ink-muted">
                    {new Date(evt.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* 3. Peer Ratings & Reviews */}
      <Card className="p-6 border-paper-sand dark:border-paper-sandDark shadow-paper">
        <div className="border-b border-paper-sand dark:border-paper-sandDark pb-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-marigold fill-current" />
            <h2 className="font-serif font-bold text-lg text-ink dark:text-ink-dark">
              Peer Ratings & Feedback
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-marigold fill-current" />
            <span className="text-sm font-bold text-ink dark:text-ink-dark font-serif">
              {ratings.averageRating}
            </span>
            <span className="text-xs text-ink-muted">({ratings.totalReviews} reviews)</span>
          </div>
        </div>

        {ratings.reviews.length === 0 ? (
          <div className="text-center py-8 text-xs text-ink-muted italic">
            No peer ratings received yet. Once exchanges are completed, reviews will appear here.
          </div>
        ) : (
          <div className="space-y-4">
            {ratings.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-xl bg-paper-sand/20 dark:bg-paper-sandDark/20 border border-paper-sand dark:border-paper-sandDark space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar name={rev.reviewer.name} size="sm" />
                    <div>
                      <span className="text-xs font-bold text-ink dark:text-ink-dark block leading-tight">
                        {rev.reviewer.name}
                      </span>
                      <span className="text-[10px] text-ink-muted">
                        {rev.reviewer.department} (Year {rev.reviewer.year})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-marigold">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-current' : 'text-paper-sand'}`}
                      />
                    ))}
                  </div>
                </div>

                {rev.comment && (
                  <p className="text-xs text-ink-muted dark:text-ink-darkMuted italic bg-white dark:bg-paper-cardDark p-2.5 rounded-lg border border-paper-sand">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                )}

                <div className="flex justify-between items-center text-[10px] text-ink-muted pt-1">
                  <span>For: {rev.transaction?.item?.title || 'Campus Exchange'}</span>
                  <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 4. Active Listings */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-serif text-ink dark:text-ink-dark">
          Items Available for Borrowing
        </h2>

        {activeListings.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-paper-sand">
            <Package className="w-8 h-8 text-ink-muted mx-auto mb-2" />
            <p className="text-xs text-ink-muted italic">No active listings posted yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeListings.map((item) => (
              <Link key={item.id} to={`/items/${item.id}`}>
                <Card className="p-4 border-paper-sand hover:shadow-paperHover transition-all flex gap-3 group">
                  <div className="w-16 h-16 rounded-xl bg-paper-sand/40 overflow-hidden shrink-0 border border-paper-sand">
                    {item.photos?.[0]?.url ? (
                      <img
                        src={item.photos[0].url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-muted">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-terracotta uppercase tracking-wider block">
                      {item.category?.name}
                    </span>
                    <h3 className="font-serif font-bold text-sm text-ink dark:text-ink-dark group-hover:text-terracotta transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-ink-muted mt-1">
                      <span>Deposit: ₹{item.securityAmount}</span>
                      {item.handoverPoint && <span>&bull; {item.handoverPoint.name}</span>}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
