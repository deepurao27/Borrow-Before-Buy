import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, Clock, MapPin, ShieldCheck, ChevronRight, Package, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { apiClient } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PaperTag } from '../../components/ui/PaperTag';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';

export const TransactionsListPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'borrowing' | 'lending'
  const [statusFilter, setStatusFilter] = useState('active'); // 'active' | 'past' | 'all'

  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: ['transactions', activeTab, statusFilter],
    queryFn: async () => {
      const res = await apiClient(`/transactions?type=${activeTab}&status=${statusFilter}`);
      return res.data || [];
    },
    refetchInterval: 10000 // auto-refresh active transactions list every 10s
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <PaperTag color="marigold">1. Awaiting Deposit Agreement</PaperTag>;
      case 'SECURITY_ACKNOWLEDGED':
        return <PaperTag color="sage">2. Condition Check Pending</PaperTag>;
      case 'HANDOVER_PENDING':
        return <PaperTag color="terracotta">3. Ready for QR Handover</PaperTag>;
      case 'BORROWED':
        return <PaperTag color="teal">4. Active Borrowing</PaperTag>;
      case 'OVERDUE':
        return <PaperTag color="brick">Overdue</PaperTag>;
      case 'RETURN_PENDING':
        return <PaperTag color="marigold">Return Pending</PaperTag>;
      case 'COMPLETED':
        return <PaperTag color="sage">Completed</PaperTag>;
      case 'CANCELLED':
        return <PaperTag color="default">Cancelled</PaperTag>;
      default:
        return <PaperTag color="default">{status}</PaperTag>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-ink dark:text-ink-dark font-serif">
            Borrowing & Lending
          </h1>
          <p className="text-sm text-ink-muted dark:text-ink-darkMuted mt-1">
            Track your ongoing exchanges, security deposit agreements, and QR handovers.
          </p>
        </div>

        <Link to="/search">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Package className="w-4 h-4" />
            Browse Items
          </Button>
        </Link>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-paper-sand dark:border-paper-sandDark pb-4">
        {/* Main Tabs */}
        <div className="flex bg-paper-sand/40 dark:bg-paper-sandDark/40 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white dark:bg-paper-cardDark text-ink dark:text-ink-dark shadow-xs'
                : 'text-ink-muted dark:text-ink-darkMuted hover:text-ink'
            }`}
          >
            All Exchanges
          </button>
          <button
            onClick={() => setActiveTab('borrowing')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'borrowing'
                ? 'bg-white dark:bg-paper-cardDark text-ink dark:text-ink-dark shadow-xs'
                : 'text-ink-muted dark:text-ink-darkMuted hover:text-ink'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-sage" />
            Borrowing (I&apos;m Borrowing)
          </button>
          <button
            onClick={() => setActiveTab('lending')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'lending'
                ? 'bg-white dark:bg-paper-cardDark text-ink dark:text-ink-dark shadow-xs'
                : 'text-ink-muted dark:text-ink-darkMuted hover:text-ink'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-terracotta" />
            Lending (My Items)
          </button>
        </div>

        {/* Secondary Status Filter */}
        <div className="flex gap-2">
          {['active', 'past', 'all'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
                statusFilter === filter
                  ? 'bg-ink text-white dark:bg-paper-sand dark:text-ink font-bold'
                  : 'text-ink-muted hover:bg-paper-sand/30'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-32 rounded-2xl w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-brick/10 border border-brick/30 text-brick text-sm">
          Failed to load transactions. Please try refreshing the page.
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="No exchanges found"
          description={
            activeTab === 'borrowing'
              ? 'You have not borrowed any items yet. Browse listings to request study tools or gear.'
              : activeTab === 'lending'
              ? 'No one has borrowed your items yet. List study tools to help out peers on campus.'
              : 'You have no active or past exchanges recorded.'
          }
          action={
            <Link to="/search">
              <Button variant="primary" size="sm">
                Explore Available Items
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => {
            const isLender = tx.lenderId === user.id;
            const counterparty = isLender ? tx.borrower : tx.lender;
            const primaryPhoto = tx.item?.photos?.[0]?.url;

            return (
              <Card
                key={tx.id}
                className="hover:shadow-paperHover border-paper-sand dark:border-paper-sandDark transition-all group p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Thumbnail & Item Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-paper-sand/40 overflow-hidden shrink-0 border border-paper-sand">
                      {primaryPhoto ? (
                        <img
                          src={primaryPhoto}
                          alt={tx.item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink-muted">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {getStatusBadge(tx.status)}
                        <span className="text-xs text-ink-muted dark:text-ink-darkMuted font-medium">
                          {isLender ? 'Lending to' : 'Borrowing from'} <strong>{counterparty.name}</strong> ({counterparty.department})
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-base text-ink dark:text-ink-dark group-hover:text-terracotta transition-colors">
                        {tx.item.title}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-ink-muted dark:text-ink-darkMuted mt-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Due: {new Date(tx.dueAt).toLocaleDateString()}
                        </span>
                        {tx.item.handoverPoint && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-terracotta" />
                            {tx.item.handoverPoint.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1 font-semibold text-ink dark:text-ink-dark">
                          <ShieldCheck className="w-3.5 h-3.5 text-sage" />
                          Deposit: ₹{tx.securityAgreement?.securityAmount || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Button */}
                  <div className="flex items-center sm:self-center shrink-0">
                    <Link to={`/transactions/${tx.id}`}>
                      <Button variant="primary" size="sm" className="gap-1.5 text-xs shadow-sm">
                        View Progress
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
