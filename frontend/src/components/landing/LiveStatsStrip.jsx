import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Package, Users, CheckCircle2, Layers } from 'lucide-react';

export const LiveStatsStrip = () => {
  const { data: statsResponse, isLoading } = useQuery({
    queryKey: ['public-stats'],
    queryFn: () => apiClient('/public/stats'),
    refetchInterval: 30000
  });

  const stats = statsResponse?.data || {
    totalItems: 0,
    totalBorrows: 0,
    activeStudents: 0,
    categoriesCount: 8
  };

  const statItems = [
    {
      label: 'Items on Noticeboard',
      value: stats.totalItems,
      zeroText: 'Be the first to lend',
      icon: Package
    },
    {
      label: 'Successful Borrows',
      value: stats.totalBorrows,
      zeroText: 'First handover soon',
      icon: CheckCircle2
    },
    {
      label: 'Verified Students',
      value: stats.activeStudents,
      zeroText: 'Join your batchmates',
      icon: Users
    },
    {
      label: 'Gear Categories',
      value: stats.categoriesCount || 8,
      zeroText: '8 categories active',
      icon: Layers
    }
  ];

  return (
    <div className="bg-white dark:bg-paper-cardDark border-y border-paper-sand dark:border-paper-sandDark py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {statItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="space-y-1">
                <div className="inline-flex p-2 rounded-xl bg-paper-sand/30 dark:bg-paper-sandDark/30 text-terracotta dark:text-terracotta-light mb-1">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-ink dark:text-ink-dark font-serif">
                  {isLoading ? (
                    <span className="inline-block w-8 h-6 bg-paper-sand/50 animate-pulse rounded" />
                  ) : item.value > 0 ? (
                    item.value
                  ) : (
                    <span className="text-sm font-sans font-bold text-terracotta">{item.zeroText}</span>
                  )}
                </div>
                <div className="text-xs font-semibold text-ink-muted dark:text-ink-darkMuted uppercase tracking-wider">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
