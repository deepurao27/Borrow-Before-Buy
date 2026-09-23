import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Package,
  ArrowLeftRight,
  Inbox,
  Clock,
  AlertTriangle,
  ChevronRight,
  PlusCircle,
  ShieldCheck,
  User,
  Sparkles,
  MapPin,
  Calendar
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { PaperTag } from '../../components/ui/PaperTag';
import { Skeleton } from '../../components/ui/Skeleton';
import { TrustScoreRing } from '../../components/trust/TrustScoreRing';

export const DashboardPage = () => {
  const { user } = useAuth();

  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await apiClient('/users/me/dashboard');
      return res.data;
    },
    refetchInterval: 10000
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-40 rounded-2xl w-full" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl w-full" />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-10 h-10 text-brick mx-auto mb-3" />
        <h2 className="text-xl font-bold font-serif text-ink dark:text-ink-dark">
          Unable to load dashboard
        </h2>
        <p className="text-xs text-ink-muted mt-1">Please check your network and try again.</p>
      </div>
    );
  }

  const { trustProfile, counts, dueSoonItems = [], activeBorrowing = [], activeLending = [] } = dashboard;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 1. Header Banner with Profile Summary & Trust Gauges */}
      <Card className="p-6 border-paper-sand dark:border-paper-sandDark shadow-paper relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Student Info */}
          <div className="flex items-center gap-4 text-center sm:text-left">
            <Avatar name={user.name} size="lg" className="w-16 h-16 text-xl" />
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl font-black font-serif text-ink dark:text-ink-dark">
                  Welcome, {user.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sage/15 text-sage border border-sage/30">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>
              <p className="text-xs text-ink-muted dark:text-ink-darkMuted mt-1">
                {user.department} &bull; Year {user.year} &bull; {user.collegeEmail}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <Link to="/profile">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                    <User className="w-3.5 h-3.5" />
                    View My Public Profile
                  </Button>
                </Link>
                <Link to="/post-item">
                  <Button variant="primary" size="sm" className="text-xs gap-1.5 h-8 shadow-sm">
                    <PlusCircle className="w-3.5 h-3.5" />
                    Lend an Item
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Dual Trust Score Gauges */}
          <div className="flex items-center gap-6 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-paper-sand dark:border-paper-sandDark md:pl-8">
            <TrustScoreRing
              score={trustProfile.borrowerScore}
              label="Borrower Score"
              sublabel={`${trustProfile.metrics.completedBorrows} completed`}
              size="md"
            />
            <TrustScoreRing
              score={trustProfile.lenderScore}
              label="Lender Score"
              sublabel={`${trustProfile.metrics.completedLends} completed`}
              size="md"
            />
          </div>
        </div>
      </Card>

      {/* 2. Urgent Due Soon Banner (if any item due < 24h) */}
      {dueSoonItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-marigold/20 via-terracotta/15 to-brick/20 border border-marigold/40 flex items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-terracotta text-white flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <span className="text-xs font-bold text-terracotta uppercase tracking-wider block">
                Item Due Soon Alert
              </span>
              <p className="text-sm font-bold text-ink dark:text-ink-dark">
                You have {dueSoonItems.length} borrowed item(s) due within the next 24 hours.
              </p>
              <span className="text-xs text-ink-muted">
                &ldquo;{dueSoonItems[0]?.item?.title}&rdquo; is due on{' '}
                {new Date(dueSoonItems[0]?.dueAt).toLocaleDateString()}. Please coordinate the return.
              </span>
            </div>
          </div>
          <Link to={`/transactions/${dueSoonItems[0]?.id}`}>
            <Button variant="primary" size="sm" className="shrink-0 text-xs gap-1.5 shadow-sm">
              Initiate Return
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* 3. Activity Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link to="/transactions?type=borrowing">
          <Card className="p-4 border-paper-sand dark:border-paper-sandDark hover:shadow-paperHover transition-all cursor-pointer">
            <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
              Active Borrows
            </span>
            <span className="text-3xl font-extrabold text-ink dark:text-ink-dark font-serif mt-1 block">
              {counts.activeBorrowing}
            </span>
            <span className="text-xs text-sage font-medium mt-1 flex items-center gap-1">
              Items in your hands &rarr;
            </span>
          </Card>
        </Link>

        <Link to="/transactions?type=lending">
          <Card className="p-4 border-paper-sand dark:border-paper-sandDark hover:shadow-paperHover transition-all cursor-pointer">
            <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
              Active Loans
            </span>
            <span className="text-3xl font-extrabold text-ink dark:text-ink-dark font-serif mt-1 block">
              {counts.activeLending}
            </span>
            <span className="text-xs text-terracotta font-medium mt-1 flex items-center gap-1">
              Items lent out &rarr;
            </span>
          </Card>
        </Link>

        <Link to="/requests?type=received">
          <Card className="p-4 border-paper-sand dark:border-paper-sandDark hover:shadow-paperHover transition-all cursor-pointer">
            <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
              Incoming Requests
            </span>
            <span className="text-3xl font-extrabold text-ink dark:text-ink-dark font-serif mt-1 block">
              {counts.pendingRequestsReceived}
            </span>
            <span className="text-xs text-teal font-medium mt-1 flex items-center gap-1">
              Pending review &rarr;
            </span>
          </Card>
        </Link>

        <Link to="/profile">
          <Card className="p-4 border-paper-sand dark:border-paper-sandDark hover:shadow-paperHover transition-all cursor-pointer">
            <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
              On-Time Rate
            </span>
            <span className="text-3xl font-extrabold text-ink dark:text-ink-dark font-serif mt-1 block">
              {trustProfile.metrics.onTimeRatePercent}%
            </span>
            <span className="text-xs text-sage font-medium mt-1 flex items-center gap-1">
              {trustProfile.tier.name} &rarr;
            </span>
          </Card>
        </Link>
      </div>

      {/* 4. Active Exchanges Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-serif text-ink dark:text-ink-dark">
            Active Exchanges & Handovers
          </h2>
          <Link
            to="/transactions"
            className="text-xs font-bold text-terracotta hover:underline flex items-center gap-1"
          >
            View all exchanges &rarr;
          </Link>
        </div>

        {activeBorrowing.length === 0 && activeLending.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-paper-sand dark:border-paper-sandDark">
            <Package className="w-10 h-10 text-ink-muted mx-auto mb-2" />
            <p className="text-sm font-bold text-ink dark:text-ink-dark">No active exchanges right now</p>
            <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
              Borrow study essentials from your campus peers or lend unused gear to help classmates.
            </p>
            <div className="flex justify-center gap-3 mt-4">
              <Link to="/search">
                <Button variant="primary" size="sm">
                  Browse Items
                </Button>
              </Link>
              <Link to="/post-item">
                <Button variant="outline" size="sm">
                  Lend an Item
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Borrowing Column */}
            {activeBorrowing.slice(0, 3).map((tx) => (
              <Card
                key={tx.id}
                className="p-4 border-paper-sand dark:border-paper-sandDark hover:shadow-paper transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <PaperTag color="sage">Borrowing</PaperTag>
                    <span className="text-xs font-semibold text-terracotta">
                      {tx.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base text-ink dark:text-ink-dark">
                    {tx.item.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-ink-muted mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Due {new Date(tx.dueAt).toLocaleDateString()}
                    </span>
                    <span>Lender: {tx.lender.name}</span>
                  </div>
                </div>
                <div className="pt-4 mt-3 border-t border-paper-sand flex justify-end">
                  <Link to={`/transactions/${tx.id}`}>
                    <Button variant="outline" size="sm" className="text-xs gap-1">
                      View Progress &rarr;
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}

            {/* Lending Column */}
            {activeLending.slice(0, 3).map((tx) => (
              <Card
                key={tx.id}
                className="p-4 border-paper-sand dark:border-paper-sandDark hover:shadow-paper transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <PaperTag color="terracotta">Lending</PaperTag>
                    <span className="text-xs font-semibold text-terracotta">
                      {tx.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base text-ink dark:text-ink-dark">
                    {tx.item.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-ink-muted mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Due {new Date(tx.dueAt).toLocaleDateString()}
                    </span>
                    <span>Borrower: {tx.borrower.name}</span>
                  </div>
                </div>
                <div className="pt-4 mt-3 border-t border-paper-sand flex justify-end">
                  <Link to={`/transactions/${tx.id}`}>
                    <Button variant="outline" size="sm" className="text-xs gap-1">
                      View Progress &rarr;
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
