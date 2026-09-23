import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  ShieldAlert,
  QrCode,
  ScanLine,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  AlertOctagon
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { PaperTag } from '../../components/ui/PaperTag';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { TransactionTimeline } from '../../components/transactions/TransactionTimeline';
import { SecurityAgreementCard } from '../../components/transactions/SecurityAgreementCard';
import { ConditionChecklist } from '../../components/transactions/ConditionChecklist';
import { QRDisplayModal } from '../../components/transactions/QRDisplayModal';
import { QRScannerModal } from '../../components/transactions/QRScannerModal';
import { ReturnConfirmationCard } from '../../components/transactions/ReturnConfirmationCard';
import { RatingCard } from '../../components/transactions/RatingCard';
import { OpenDisputeModal } from '../../components/transactions/OpenDisputeModal';
import { TransactionChatBox } from '../../components/transactions/TransactionChatBox';

export const TransactionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isQRDisplayOpen, setIsQRDisplayOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [tokenData, setTokenData] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  // 1. Fetch Single Transaction Details (polling every 4 seconds)
  const { data: transaction, isLoading, error } = useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const res = await apiClient(`/transactions/${id}`);
      return res.data;
    },
    refetchInterval: 4000
  });

  const isLender = transaction?.lenderId === user?.id;
  const isBorrower = transaction?.borrowerId === user?.id;
  const counterparty = isLender ? transaction?.borrower : transaction?.lender;

  // 2. Mutations
  const updateAgreementMutation = useMutation({
    mutationFn: async (payload) => {
      return await apiClient(`/transactions/${id}/security`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
    },
    onSuccess: () => {
      toast.success('Security agreement updated');
      queryClient.invalidateQueries(['transaction', id]);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update deposit');
    }
  });

  const acknowledgeSecurityMutation = useMutation({
    mutationFn: async () => {
      return await apiClient(`/transactions/${id}/security/acknowledge`, {
        method: 'POST'
      });
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Security deposit acknowledged!');
      queryClient.invalidateQueries(['transaction', id]);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to acknowledge');
    }
  });

  const submitConditionMutation = useMutation({
    mutationFn: async (formData) => {
      return await apiClient(`/transactions/${id}/condition`, {
        method: 'POST',
        body: formData
      });
    },
    onSuccess: () => {
      toast.success('Pre-handover condition photos uploaded!');
      queryClient.invalidateQueries(['transaction', id]);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to submit condition');
    }
  });

  const acknowledgeConditionMutation = useMutation({
    mutationFn: async () => {
      return await apiClient(`/transactions/${id}/condition/acknowledge`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast.success('Condition acknowledged! Transaction is now ready for QR Handover.');
      queryClient.invalidateQueries(['transaction', id]);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to acknowledge condition');
    }
  });

  const generateTokenMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient(`/transactions/${id}/handover/token`, {
        method: 'POST'
      });
      return res.data;
    },
    onSuccess: (data) => {
      setTokenData(data);
      setIsQRDisplayOpen(true);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to generate handover QR token');
    }
  });

  const confirmHandoverMutation = useMutation({
    mutationFn: async (payload) => {
      return await apiClient(`/transactions/${id}/handover/confirm`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    onSuccess: () => {
      setIsQRScannerOpen(false);
      toast.success('Physical handover confirmed! Item status is now BORROWED.');
      queryClient.invalidateQueries(['transaction', id]);
    },
    onError: (err) => {
      toast.error(err.message || 'Verification failed');
      throw err;
    }
  });

  const initiateReturnMutation = useMutation({
    mutationFn: async (note) => {
      return await apiClient(`/transactions/${id}/return/initiate`, {
        method: 'POST',
        body: JSON.stringify({ note })
      });
    },
    onSuccess: () => {
      toast.success('Return meeting requested!');
      queryClient.invalidateQueries(['transaction', id]);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to initiate return');
    }
  });

  const confirmReturnMutation = useMutation({
    mutationFn: async () => {
      return await apiClient(`/transactions/${id}/return/confirm`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast.success('Item return confirmed and exchange completed!');
      queryClient.invalidateQueries(['transaction', id]);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to confirm return');
    }
  });

  const submitRatingMutation = useMutation({
    mutationFn: async (payload) => {
      return await apiClient(`/transactions/${id}/rate`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    onSuccess: () => {
      toast.success('Rating submitted! Trust bonus applied.');
      queryClient.invalidateQueries(['transaction', id]);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to submit rating');
      throw err;
    }
  });


  const cancelTransactionMutation = useMutation({
    mutationFn: async () => {
      return await apiClient(`/transactions/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: cancelReason })
      });
    },
    onSuccess: () => {
      setIsCancelModalOpen(false);
      toast.info('Transaction has been cancelled.');
      queryClient.invalidateQueries(['transaction', id]);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to cancel exchange');
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="h-44 rounded-2xl w-full" />
        <Skeleton className="h-64 rounded-2xl w-full" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-brick mx-auto mb-4" />
        <h2 className="text-xl font-bold font-serif text-ink dark:text-ink-dark mb-2">
          Exchange Not Found
        </h2>
        <p className="text-sm text-ink-muted dark:text-ink-darkMuted mb-6">
          The transaction could not be located, or you are not authorized to view this exchange.
        </p>
        <Link to="/transactions">
          <Button variant="primary">Return to Exchanges</Button>
        </Link>
      </div>
    );
  }

  const primaryPhoto = transaction.item?.photos?.[0]?.url;
  const canCancel = ['ACCEPTED', 'SECURITY_ACKNOWLEDGED', 'HANDOVER_PENDING'].includes(transaction.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back Link */}
      <Link
        to="/transactions"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted dark:text-ink-darkMuted hover:text-ink dark:hover:text-ink-dark mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Borrowing & Lending
      </Link>

      {/* Top Banner Card: Item + Counterparty Summary */}
      <Card className="p-6 border-paper-sand dark:border-paper-sandDark shadow-paper mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Item details */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-paper-sand/40 overflow-hidden shrink-0 border border-paper-sand">
              {primaryPhoto ? (
                <img
                  src={primaryPhoto}
                  alt={transaction.item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink-muted">
                  <Package className="w-8 h-8" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <PaperTag color="terracotta">{transaction.item.category?.name || 'Item'}</PaperTag>
                <span className="text-xs text-ink-muted">
                  {isLender ? 'You are Lending' : 'You are Borrowing'}
                </span>
              </div>
              <h1 className="text-2xl font-bold font-serif text-ink dark:text-ink-dark">
                {transaction.item.title}
              </h1>

              <div className="flex items-center gap-4 text-xs text-ink-muted dark:text-ink-darkMuted mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(transaction.startAt).toLocaleDateString()} &ndash; {new Date(transaction.dueAt).toLocaleDateString()}
                </span>
                {transaction.item.handoverPoint && (
                  <span className="flex items-center gap-1 font-medium text-ink dark:text-ink-dark">
                    <MapPin className="w-3.5 h-3.5 text-terracotta" />
                    Handover Point: {transaction.item.handoverPoint.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Counterparty Badge */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-paper-sand/30 dark:bg-paper-sandDark/20 border border-paper-sand dark:border-paper-sandDark self-stretch sm:self-auto">
            <Avatar name={counterparty.name} size="md" />
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider text-ink-muted dark:text-ink-darkMuted font-bold block">
                {isLender ? 'Borrower' : 'Item Lender'}
              </span>
              <p className="text-sm font-bold text-ink dark:text-ink-dark font-serif leading-tight">
                {counterparty.name}
              </p>
              <span className="text-xs text-ink-muted">
                {counterparty.department} (Year {counterparty.year})
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Progress Timeline */}
      <Card className="p-6 border-paper-sand dark:border-paper-sandDark shadow-paper mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-ink-darkMuted mb-3">
          Exchange Lifecycle
        </h2>
        <TransactionTimeline currentStatus={transaction.status} events={transaction.events} />
      </Card>

      {/* State Machine Main Action Center */}
      <div className="space-y-6">
        {/* Dispute Status Banner */}
        {transaction.status === 'DISPUTED' && (
          <Card className="p-6 border-brick/40 bg-brick/5 dark:bg-brick/10 shadow-paper">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brick text-white flex items-center justify-center shrink-0">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-2">
                <span className="text-xs font-bold text-brick uppercase tracking-wider">
                  Transaction Under Campus Dispute
                </span>
                <h3 className="text-xl font-bold font-serif text-ink dark:text-ink-dark">
                  Exchange Paused for Moderation
                </h3>
                <p className="text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed">
                  A dispute was filed for this exchange. Standard return and rating flows are temporarily frozen while a campus administrator or student moderator reviews photos, logs, and statements.
                </p>
                {transaction.disputes?.[0] && (
                  <div className="p-3 rounded-xl bg-white dark:bg-paper-cardDark border border-brick/30 text-xs">
                    <span className="font-bold text-brick block mb-0.5">
                      Dispute Type: {transaction.disputes[0].type}
                    </span>
                    <p className="text-ink dark:text-ink-dark">
                      "{transaction.disputes[0].description}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Resolved Status Banner */}
        {transaction.status === 'RESOLVED' && (
          <Card className="p-6 border-sage/40 bg-sage/5 dark:bg-sage/10 shadow-paper">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sage text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-2">
                <span className="text-xs font-bold text-sage uppercase tracking-wider">
                  Dispute Mediated & Resolved
                </span>
                <h3 className="text-xl font-bold font-serif text-ink dark:text-ink-dark">
                  Moderator Resolution Applied
                </h3>
                <p className="text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed">
                  Campus moderators have concluded this dispute.
                </p>
                {transaction.disputes?.[0]?.resolution && (
                  <div className="p-3 rounded-xl bg-white dark:bg-paper-cardDark border border-sage/30 text-xs">
                    <span className="font-bold text-sage block mb-0.5">Resolution Outcome:</span>
                    <p className="text-ink dark:text-ink-dark">
                      "{transaction.disputes[0].resolution}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Stage 1: ACCEPTED -> Bilateral Security Agreement */}
        {transaction.status === 'ACCEPTED' && (
          <SecurityAgreementCard
            transaction={transaction}
            currentUserId={user.id}
            onAcknowledge={() => acknowledgeSecurityMutation.mutate()}
            onUpdateAgreement={(payload) => updateAgreementMutation.mutateAsync(payload)}
            isProcessing={acknowledgeSecurityMutation.isPending || updateAgreementMutation.isPending}
          />
        )}

        {/* Stage 2: SECURITY_ACKNOWLEDGED -> Pre-Handover Condition Checklist */}
        {transaction.status === 'SECURITY_ACKNOWLEDGED' && (
          <ConditionChecklist
            transaction={transaction}
            currentUserId={user.id}
            onSubmitCondition={(formData) => submitConditionMutation.mutateAsync(formData)}
            onAcknowledgeCondition={() => acknowledgeConditionMutation.mutate()}
            isProcessing={submitConditionMutation.isPending || acknowledgeConditionMutation.isPending}
          />
        )}

        {/* Stage 3: HANDOVER_PENDING -> Dynamic QR Handover */}
        {transaction.status === 'HANDOVER_PENDING' && (
          <Card className="p-6 border-terracotta/40 bg-gradient-to-br from-paper-card to-terracotta/5 dark:from-paper-cardDark dark:to-terracotta/10 shadow-paper">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-terracotta text-white flex items-center justify-center shadow-sm shrink-0">
                  {isLender ? <QrCode className="w-8 h-8" /> : <ScanLine className="w-8 h-8" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-terracotta uppercase tracking-wider">
                    Step 3: In-Person Physical Handover
                  </span>
                  <h3 className="text-xl font-bold font-serif text-ink dark:text-ink-dark">
                    {isLender ? 'Show Handover QR Code' : 'Scan Lender’s QR Code'}
                  </h3>
                  <p className="text-xs text-ink-muted dark:text-ink-darkMuted mt-1">
                    Meet at <strong>{transaction.item.handoverPoint?.name || 'campus meeting point'}</strong>.
                    Exchange the item and confirm handover.
                  </p>
                </div>
              </div>

              {isLender ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => generateTokenMutation.mutate()}
                  isLoading={generateTokenMutation.isPending}
                  className="gap-2 shrink-0 shadow-sm"
                >
                  <QrCode className="w-4 h-4" />
                  Show Handover Code
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsQRScannerOpen(true)}
                  className="gap-2 shrink-0 shadow-sm"
                >
                  <ScanLine className="w-4 h-4" />
                  Scan Handover Code
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Stage 4: BORROWED -> Active Borrowing */}
        {transaction.status === 'BORROWED' && (
          <Card className="p-6 border-sage/40 bg-sage/5 dark:bg-sage/10 shadow-paper">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sage text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-sage uppercase tracking-wider">
                  Exchange Active & Handed Over
                </span>
                <h3 className="text-xl font-bold font-serif text-ink dark:text-ink-dark">
                  {isBorrower
                    ? 'Item is safely with you!'
                    : `Item has been handed over to ${counterparty.name}`}
                </h3>
                <p className="text-xs text-ink-muted dark:text-ink-darkMuted mt-1 leading-relaxed">
                  Due date is <strong>{new Date(transaction.dueAt).toLocaleDateString()}</strong>.
                  Please keep the item in good condition and return it to the campus handover point on time.
                </p>

                <div className="mt-4 p-3 rounded-xl bg-white dark:bg-paper-cardDark border border-paper-sand text-xs flex items-center gap-2 text-ink-muted">
                  <ShieldAlert className="w-4 h-4 text-terracotta shrink-0" />
                  <span>
                    Agreed offline deposit of <strong>₹{transaction.securityAgreement?.securityAmount || 0}</strong> is
                    held by the lender and will be returned upon item inspection.
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Stage 5: Return Lifecycle */}
        {['BORROWED', 'OVERDUE', 'RETURN_PENDING', 'COMPLETED'].includes(transaction.status) && (
          <ReturnConfirmationCard
            transaction={transaction}
            currentUserId={user.id}
            onInitiateReturn={(note) => initiateReturnMutation.mutate(note)}
            onConfirmReturn={() => confirmReturnMutation.mutate()}
            isProcessing={initiateReturnMutation.isPending || confirmReturnMutation.isPending}
          />
        )}

        {/* Stage 6: Mutual Peer Rating */}
        {transaction.status === 'COMPLETED' && (
          <RatingCard
            transaction={transaction}
            currentUserId={user.id}
            onSubmitRating={(payload) => submitRatingMutation.mutateAsync(payload)}
            isProcessing={submitRatingMutation.isPending}
          />
        )}

        {/* Transaction In-App Peer Chat Box */}
        <div className="pt-2">
          <TransactionChatBox transactionId={transaction.id} />
        </div>

        {/* Dispute Actions */}
        {['BORROWED', 'OVERDUE', 'RETURN_PENDING'].includes(transaction.status) && (
          <div className="p-4 rounded-xl bg-paper-sand/40 dark:bg-paper-sandDark/20 border border-paper-sand dark:border-paper-sandDark flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-ink dark:text-ink-dark">
              <AlertOctagon className="w-4 h-4 text-brick" />
              <span>Experiencing an issue with return, condition, or deposit?</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDisputeModalOpen(true)}
              className="text-brick border-brick/40 hover:bg-brick/10 gap-1.5 font-bold"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              Report Issue / Open Dispute
            </Button>
          </div>
        )}

        {/* Cancellation Section */}

        {canCancel && (
          <div className="pt-6 border-t border-paper-sand dark:border-paper-sandDark flex justify-between items-center text-xs text-ink-muted">
            <span>Need to call off this exchange?</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCancelModalOpen(true)}
              className="text-brick hover:bg-brick/10 text-xs"
            >
              Cancel Transaction
            </Button>
          </div>
        )}
      </div>

      {/* Dispute Modal */}
      <OpenDisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        transactionId={transaction.id}
        onDisputeCreated={() => queryClient.invalidateQueries(['transaction', id])}
      />

      {/* QR Code Display Modal (Lender) */}
      <QRDisplayModal
        isOpen={isQRDisplayOpen}
        onClose={() => setIsQRDisplayOpen(false)}
        tokenData={tokenData}
        onRefreshCode={() => generateTokenMutation.mutate()}
        isRefreshing={generateTokenMutation.isPending}
      />

      {/* QR Code Scanner Modal (Borrower) */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onConfirmHandover={(payload) => confirmHandoverMutation.mutateAsync(payload)}
        isProcessing={confirmHandoverMutation.isPending}
      />

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Exchange"
      >
        <div className="space-y-4">
          <p className="text-xs text-ink dark:text-ink-dark leading-relaxed">
            Are you sure you want to cancel this transaction?
          </p>

          {isLender && (
            <div className="p-3 rounded-xl bg-brick/10 border border-brick/30 text-xs text-brick">
              <strong>Notice:</strong> Cancelling after accepting a request applies a penalty of -10 to your Trust Score.
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-ink dark:text-ink-dark mb-1">
              Reason for Cancellation
            </label>
            <textarea
              rows={2}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Schedule conflict, item unavailable"
              className="w-full text-xs p-2.5 rounded-lg border border-paper-sand dark:border-paper-sandDark bg-white dark:bg-paper-cardDark text-ink dark:text-ink-dark focus:ring-1 focus:ring-terracotta"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsCancelModalOpen(false)}>
              Keep Exchange
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => cancelTransactionMutation.mutate()}
              isLoading={cancelTransactionMutation.isPending}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
