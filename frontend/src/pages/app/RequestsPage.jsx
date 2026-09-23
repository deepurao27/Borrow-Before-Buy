import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Inbox,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

export const RequestsPage = () => {
  const [activeTab, setActiveTab] = useState('received'); // received, sent
  const queryClient = useQueryClient();

  const { data: requestsRes, isLoading } = useQuery({
    queryKey: ['requests', activeTab],
    queryFn: () => apiClient(`/requests?type=${activeTab}`),
    refetchInterval: 15000
  });

  const requests = requestsRes?.data || [];

  const acceptMutation = useMutation({
    mutationFn: (requestId) => apiClient(`/requests/${requestId}/accept`, { method: 'PATCH' }),
    onSuccess: (data) => {
      toast.success('Borrow request accepted! Transaction created.');
      queryClient.invalidateQueries(['requests']);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to accept request.');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId) => apiClient(`/requests/${requestId}/reject`, { method: 'PATCH' }),
    onSuccess: () => {
      toast.success('Borrow request declined.');
      queryClient.invalidateQueries(['requests']);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to decline request.');
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (requestId) => apiClient(`/requests/${requestId}/cancel`, { method: 'PATCH' }),
    onSuccess: () => {
      toast.success('Request cancelled.');
      queryClient.invalidateQueries(['requests']);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to cancel request.');
    }
  });

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <span className="bg-sage/20 text-sage px-2.5 py-0.5 rounded-full text-xs font-bold">Accepted</span>;
      case 'REJECTED':
        return <span className="bg-brick/20 text-brick px-2.5 py-0.5 rounded-full text-xs font-bold">Declined</span>;
      case 'CANCELLED':
        return <span className="bg-paper-sand dark:bg-paper-sandDark text-ink-muted px-2.5 py-0.5 rounded-full text-xs font-bold">Cancelled</span>;
      default:
        return <span className="bg-marigold/20 text-ink dark:text-ink-dark px-2.5 py-0.5 rounded-full text-xs font-bold">Pending Review</span>;
    }
  };

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <span className="handwritten-note block text-lg">Inbox & Activity</span>
        <h1 className="text-3xl font-extrabold font-serif text-ink dark:text-ink-dark">
          Borrow Requests
        </h1>
        <p className="text-xs text-ink-muted dark:text-ink-darkMuted mt-1">
          Review incoming requests for your gear and monitor requests you’ve sent to peers.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-paper-sand dark:border-paper-sandDark">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'received'
              ? 'border-terracotta text-terracotta'
              : 'border-transparent text-ink-muted dark:text-ink-darkMuted hover:text-ink'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Received (For My Gear)
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'sent'
              ? 'border-terracotta text-terracotta'
              : 'border-transparent text-ink-muted dark:text-ink-darkMuted hover:text-ink'
          }`}
        >
          <Send className="w-4 h-4" />
          Sent (My Requests)
        </button>
      </div>

      {/* Requests Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="paper-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-serif font-bold text-lg text-ink dark:text-ink-dark">
                    {req.item?.title}
                  </h3>
                  {statusBadge(req.status)}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted dark:text-ink-darkMuted">
                  {activeTab === 'received' ? (
                    <div className="flex items-center gap-1.5 font-semibold text-ink dark:text-ink-dark">
                      <Avatar name={req.borrower?.name || 'Borrower'} size="sm" />
                      <span>{req.borrower?.name} ({req.borrower?.department})</span>
                    </div>
                  ) : (
                    <span className="font-semibold text-ink dark:text-ink-dark">
                      Handover: {req.item?.handoverPoint?.name}
                    </span>
                  )}

                  <div className="flex items-center gap-1 text-terracotta font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(req.requestedStart)} &rarr; {formatDate(req.requestedEnd)}</span>
                  </div>

                  <span className="font-bold text-ink dark:text-ink-dark">
                    Offline Sec: Rs {req.item?.securityAmount}
                  </span>
                </div>

                {req.message && (
                  <p className="text-xs bg-paper-sand/30 dark:bg-paper-sandDark/30 p-2.5 rounded-lg text-ink dark:text-ink-dark italic max-w-xl">
                    "{req.message}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                {activeTab === 'received' && req.status === 'PENDING' && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => acceptMutation.mutate(req.id)}
                      loading={acceptMutation.isPending}
                      className="font-bold"
                    >
                      Accept
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => rejectMutation.mutate(req.id)}
                      loading={rejectMutation.isPending}
                      className="text-brick hover:bg-brick/10"
                    >
                      Decline
                    </Button>
                  </>
                )}

                {activeTab === 'sent' && req.status === 'PENDING' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => cancelMutation.mutate(req.id)}
                    loading={cancelMutation.isPending}
                    className="text-brick"
                  >
                    Cancel Request
                  </Button>
                )}

                {req.status === 'ACCEPTED' && req.transaction?.id && (
                  <Link to={`/transactions/${req.transaction.id}`}>
                    <Button variant="accent" size="sm" className="gap-1 font-bold">
                      View Transaction
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={activeTab === 'received' ? 'No incoming requests yet' : 'You haven’t requested any gear yet'}
          description={
            activeTab === 'received'
              ? 'When batchmates ask to borrow your listed items, they will appear here for your approval.'
              : 'Find calculators, cables, lab gear, or tripods on the noticeboard and send a request.'
          }
          actionLabel={activeTab === 'sent' ? 'Browse Noticeboard' : 'List an Item'}
          onAction={() => (activeTab === 'sent' ? window.location.assign('/search') : window.location.assign('/post-item'))}
        />
      )}
    </div>
  );
};
