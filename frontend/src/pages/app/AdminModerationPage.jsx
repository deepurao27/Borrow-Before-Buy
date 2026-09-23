import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PaperTag } from '../../components/ui/PaperTag';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import {
  ShieldAlert,
  AlertOctagon,
  Users,
  Package,
  CheckCircle2,
  Ban,
  Search,
  Scale,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export const AdminModerationPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('disputes'); // 'disputes' | 'users'

  // Dispute resolution modal state
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolutionText, setResolutionText] = useState('');
  const [penaltyParty, setPenaltyParty] = useState('NONE'); // 'BORROWER' | 'LENDER' | 'NONE'
  const [trustDeduction, setTrustDeduction] = useState(10);

  // User search state
  const [userSearch, setUserSearch] = useState('');

  // 1. Fetch Admin Metrics
  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await apiClient('/admin/stats');
      return res.data?.stats;
    }
  });

  // 2. Fetch Disputes
  const { data: disputesData, isLoading: loadingDisputes } = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: async () => {
      const res = await apiClient('/admin/disputes');
      return res.data?.disputes || [];
    }
  });

  // 3. Fetch Users
  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users', userSearch],
    queryFn: async () => {
      const query = userSearch ? `?search=${encodeURIComponent(userSearch)}` : '';
      const res = await apiClient(`/admin/users${query}`);
      return res.data?.users || [];
    }
  });

  // 4. Resolve Dispute Mutation
  const resolveMutation = useMutation({
    mutationFn: async ({ disputeId, payload }) => {
      return await apiClient(`/admin/disputes/${disputeId}/resolve`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    onSuccess: () => {
      toast.success('Dispute resolved and unfreezed successfully.');
      queryClient.invalidateQueries(['admin-disputes']);
      queryClient.invalidateQueries(['admin-stats']);
      setSelectedDispute(null);
      setResolutionText('');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to resolve dispute.');
    }
  });

  // 5. Toggle User Suspension Mutation
  const userStatusMutation = useMutation({
    mutationFn: async ({ userId, status }) => {
      return await apiClient(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    },
    onSuccess: (res, vars) => {
      toast.success(`User account status updated to ${vars.status}.`);
      queryClient.invalidateQueries(['admin-users']);
      queryClient.invalidateQueries(['admin-stats']);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update user status.');
    }
  });

  const handleConfirmResolve = (e) => {
    e.preventDefault();
    if (!selectedDispute || !resolutionText.trim()) return;

    let penaltyUserId = null;
    if (penaltyParty === 'BORROWER') {
      penaltyUserId = selectedDispute.transaction.borrowerId;
    } else if (penaltyParty === 'LENDER') {
      penaltyUserId = selectedDispute.transaction.lenderId;
    }

    resolveMutation.mutate({
      disputeId: selectedDispute.id,
      payload: {
        resolution: resolutionText.trim(),
        penaltyUserId,
        trustDelta: penaltyUserId ? trustDeduction : undefined
      }
    });
  };

  const disputes = disputesData || [];
  const users = usersData || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-sand dark:border-paper-sandDark pb-6">
        <div>
          <span className="handwritten-note block text-lg text-terracotta mb-0.5">Staff Console</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-ink dark:text-ink-dark flex items-center gap-2.5">
            <Scale className="w-7 h-7 text-terracotta" />
            Campus Moderation & Governance
          </h1>
          <p className="text-xs text-ink-muted dark:text-ink-darkMuted mt-1">
            Resolve peer disputes, audit exchanges, and ensure safe campus borrowing.
          </p>
        </div>

        <button
          onClick={() => {
            queryClient.invalidateQueries(['admin-stats']);
            queryClient.invalidateQueries(['admin-disputes']);
            queryClient.invalidateQueries(['admin-users']);
            toast.success('Data refreshed');
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-ink dark:hover:text-ink-dark bg-paper-sand/50 dark:bg-paper-sandDark/30 px-3 py-2 rounded-xl transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Triage
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-paper-sand flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-brick/10 text-brick flex items-center justify-center shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider block">Open Disputes</span>
            <span className="text-xl font-bold font-mono text-ink dark:text-ink-dark">
              {statsData?.openDisputes ?? '0'}
            </span>
          </div>
        </Card>

        <Card className="p-4 border-paper-sand flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-sage/10 text-sage flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider block">Completed Borrows</span>
            <span className="text-xl font-bold font-mono text-ink dark:text-ink-dark">
              {statsData?.completedTransactions ?? '0'}
            </span>
          </div>
        </Card>

        <Card className="p-4 border-paper-sand flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-marigold/15 text-marigold-dark flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider block">Active Listings</span>
            <span className="text-xl font-bold font-mono text-ink dark:text-ink-dark">
              {statsData?.activeItems ?? '0'}
            </span>
          </div>
        </Card>

        <Card className="p-4 border-paper-sand flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider block">Registered Students</span>
            <span className="text-xl font-bold font-mono text-ink dark:text-ink-dark">
              {statsData?.totalUsers ?? '0'}
            </span>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-paper-sand dark:border-paper-sandDark gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('disputes')}
          className={`pb-3 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'disputes'
              ? 'border-b-2 border-terracotta text-terracotta'
              : 'text-ink-muted hover:text-ink dark:hover:text-ink-dark'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Disputes Queue ({disputes.filter((d) => d.status === 'OPEN').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'users'
              ? 'border-b-2 border-terracotta text-terracotta'
              : 'text-ink-muted hover:text-ink dark:hover:text-ink-dark'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Accounts</span>
        </button>
      </div>

      {/* TAB 1: DISPUTES QUEUE */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          {loadingDisputes ? (
            <Skeleton className="h-64 w-full rounded-2xl" />
          ) : disputes.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <CheckCircle2 className="w-10 h-10 text-sage mx-auto mb-2" />
              <h3 className="font-serif font-bold text-lg text-ink dark:text-ink-dark">
                Queue Clear
              </h3>
              <p className="text-xs text-ink-muted dark:text-ink-darkMuted mt-1">
                There are no open peer disputes pending campus moderator review.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {disputes.map((dispute) => {
                const isOpen = dispute.status === 'OPEN' || dispute.status === 'UNDER_REVIEW';
                return (
                  <Card key={dispute.id} className="p-6 space-y-4 shadow-sm border-paper-sand">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-paper-sand dark:border-paper-sandDark pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isOpen ? 'bg-brick/15 text-brick border-brick/40' : 'bg-sage/15 text-sage border-sage/40'
                        }`}>
                          {dispute.status}
                        </span>
                        <span className="text-xs font-mono font-bold text-terracotta">
                          Category: {dispute.type}
                        </span>
                        <span className="text-[11px] text-ink-muted">
                          Filed {new Date(dispute.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <Link
                        to={`/transactions/${dispute.transactionId}`}
                        className="text-xs font-bold text-terracotta flex items-center gap-1 hover:underline"
                        target="_blank"
                      >
                        Inspect Exchange Details
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-ink-muted uppercase font-bold block mb-1">
                          Item & Exchange Parties
                        </span>
                        <p className="font-bold text-ink dark:text-ink-dark text-sm mb-1">
                          {dispute.transaction?.item?.title}
                        </p>
                        <p className="text-ink-muted">
                          <strong>Lender:</strong> {dispute.transaction?.lender?.name} ({dispute.transaction?.lender?.collegeEmail})
                        </p>
                        <p className="text-ink-muted">
                          <strong>Borrower:</strong> {dispute.transaction?.borrower?.name} ({dispute.transaction?.borrower?.collegeEmail})
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] text-ink-muted uppercase font-bold block mb-1">
                          Filed By {dispute.opener?.name}
                        </span>
                        <div className="p-3 rounded-xl bg-paper-sand/30 dark:bg-paper-sandDark/20 border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark leading-relaxed">
                          "{dispute.description}"
                        </div>
                      </div>
                    </div>

                    {dispute.resolution && (
                      <div className="p-3 rounded-xl bg-sage/10 border border-sage/30 text-xs">
                        <strong className="text-sage block mb-0.5">Resolution Outcome:</strong>
                        <p className="text-ink dark:text-ink-dark">{dispute.resolution}</p>
                      </div>
                    )}

                    {isOpen && (
                      <div className="pt-2 flex justify-end">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedDispute(dispute);
                            setResolutionText('');
                            setPenaltyParty('NONE');
                          }}
                          className="gap-1.5 font-bold shadow-sm"
                        >
                          <Scale className="w-4 h-4" />
                          Mediate & Resolve Dispute
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USER ACCOUNTS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full text-xs py-2.5 pl-9 pr-3 rounded-xl border border-paper-sand dark:border-paper-sandDark bg-white dark:bg-paper-cardDark text-ink dark:text-ink-dark focus:ring-1 focus:ring-terracotta outline-none"
              />
            </div>
          </div>

          {loadingUsers ? (
            <Skeleton className="h-64 w-full rounded-2xl" />
          ) : (
            <Card className="overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-paper-sand dark:border-paper-sandDark text-ink-muted dark:text-ink-darkMuted uppercase tracking-wider font-semibold bg-paper-sand/20 dark:bg-paper-sandDark/10">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">College Email</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Moderator Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-paper-sand/50 dark:divide-paper-sandDark/50">
                    {users.map((student) => {
                      const isSuspended = student.accountStatus === 'SUSPENDED';
                      return (
                        <tr key={student.id} className="hover:bg-paper-sand/20 dark:hover:bg-paper-sandDark/20">
                          <td className="py-3 px-4 font-bold text-ink dark:text-ink-dark">
                            <Link to={`/profile/${student.id}`} className="hover:text-terracotta">
                              {student.name}
                            </Link>
                          </td>
                          <td className="py-3 px-4 font-mono text-ink-muted">
                            {student.collegeEmail}
                          </td>
                          <td className="py-3 px-4 text-ink-muted">
                            {student.department} (Yr {student.year})
                          </td>
                          <td className="py-3 px-4 font-semibold text-ink-muted">
                            {student.role}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isSuspended ? 'bg-brick/15 text-brick border-brick/40' : 'bg-sage/15 text-sage border-sage/40'
                            }`}>
                              {student.accountStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isSuspended ? (
                              <Button
                                variant="secondary"
                                size="xs"
                                onClick={() => userStatusMutation.mutate({ userId: student.id, status: 'ACTIVE' })}
                                isLoading={userStatusMutation.isPending}
                                className="font-bold text-sage"
                              >
                                Unsuspend
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => userStatusMutation.mutate({ userId: student.id, status: 'SUSPENDED' })}
                                isLoading={userStatusMutation.isPending}
                                className="font-bold text-brick hover:bg-brick/10"
                              >
                                Suspend Account
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Dispute Resolution Modal */}
      {selectedDispute && (
        <Modal
          isOpen={!!selectedDispute}
          onClose={() => setSelectedDispute(null)}
          title={`Mediate Dispute: ${selectedDispute.transaction?.item?.title}`}
        >
          <form onSubmit={handleConfirmResolve} className="space-y-4">
            <div className="p-3 rounded-xl bg-paper-sand/40 dark:bg-paper-sandDark/20 border border-paper-sand text-xs space-y-1">
              <span className="font-bold text-brick uppercase block">
                Dispute Claim ({selectedDispute.type}):
              </span>
              <p className="text-ink dark:text-ink-dark">
                "{selectedDispute.description}"
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-ink dark:text-ink-dark uppercase tracking-wider">
                Official Resolution Note *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Explain the mediated outcome (e.g. Item returned with minor wear, deposit refunded offline)..."
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-paper-sand dark:border-paper-sandDark bg-white dark:bg-paper-cardDark text-ink dark:text-ink-dark focus:ring-1 focus:ring-terracotta outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-ink dark:text-ink-dark uppercase tracking-wider">
                Trust Score Penalty (Optional)
              </label>
              <select
                value={penaltyParty}
                onChange={(e) => setPenaltyParty(e.target.value)}
                className="w-full text-xs font-semibold py-2 px-3 rounded-xl border border-paper-sand dark:border-paper-sandDark bg-white dark:bg-paper-cardDark text-ink dark:text-ink-dark focus:ring-1 focus:ring-terracotta outline-none"
              >
                <option value="NONE">No Trust Penalty (Mutual Compromise)</option>
                <option value="BORROWER">Apply Penalty to Borrower ({selectedDispute.transaction?.borrower?.name})</option>
                <option value="LENDER">Apply Penalty to Lender ({selectedDispute.transaction?.lender?.name})</option>
              </select>
            </div>

            {penaltyParty !== 'NONE' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brick uppercase tracking-wider">
                  Deduction Amount (-Points)
                </label>
                <select
                  value={trustDeduction}
                  onChange={(e) => setTrustDeduction(Number(e.target.value))}
                  className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-brick/40 bg-white dark:bg-paper-cardDark text-brick focus:ring-1 focus:ring-brick outline-none"
                >
                  <option value={5}>-5 points (Minor infraction)</option>
                  <option value={10}>-10 points (Standard breach)</option>
                  <option value={20}>-20 points (Severe non-cooperation / damage)</option>
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-paper-sand dark:border-paper-sandDark">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDispute(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={resolveMutation.isPending}
                className="font-bold shadow-sm"
              >
                Confirm & Close Dispute
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
