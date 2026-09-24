import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { NoticeDisclaimer } from '../../components/ui/NoticeDisclaimer';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  MapPin,
  ShieldCheck,
  Calendar,
  Send,
  ArrowLeft,
  Tag,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

export const ItemDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestedStart, setRequestedStart] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  });
  const [requestedEnd, setRequestedEnd] = useState(() => {
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 3);
    dayAfter.setHours(17, 0, 0, 0);
    return dayAfter.toISOString().slice(0, 16);
  });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: itemRes, isLoading, error } = useQuery({
    queryKey: ['item', id],
    queryFn: () => apiClient(`/items/${id}`)
  });

  const item = itemRes?.data;
  const isOwner = user && item && user.id === item.ownerId;

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/items/${id}` } } });
      return;
    }

    setSubmitting(true);
    try {
      await apiClient(`/requests/items/${id}`, {
        method: 'POST',
        body: JSON.stringify({
          requestedStart: new Date(requestedStart).toISOString(),
          requestedEnd: new Date(requestedEnd).toISOString(),
          message
        })
      });

      toast.success('Borrow request sent to lender!');
      setRequestModalOpen(false);
      navigate('/requests');
    } catch (err) {
      toast.error(err.message || 'Failed to submit borrow request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!window.confirm('Are you sure you want to deactivate this listing?')) return;
    try {
      await apiClient(`/items/${id}`, { method: 'DELETE' });
      toast.success('Item listing deactivated.');
      queryClient.invalidateQueries(['items']);
      navigate('/search');
    } catch (err) {
      toast.error(err.message || 'Failed to delete item.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 max-w-5xl mx-auto px-4 space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <Skeleton className="md:col-span-7 h-96 rounded-2xl" />
          <Skeleton className="md:col-span-5 h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold font-serif text-ink dark:text-ink-dark">Item not found</h2>
        <Link to="/search">
          <Button variant="secondary" size="md">Back to Noticeboard</Button>
        </Link>
      </div>
    );
  }

  const photos = item.photos || [];
  const activePhoto = photos[activePhotoIdx];

  const conditionLabels = {
    LIKE_NEW: 'Like New (Mint)',
    GOOD: 'Good (Minor wear, fully functional)',
    FAIR: 'Fair (Usable, functional)'
  };

  return (
    <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/search"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-ink dark:hover:text-ink-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all items
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Photos Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="paper-card p-3 overflow-hidden rounded-2xl relative bg-white dark:bg-paper-cardDark">
            <div className="w-full h-80 sm:h-96 rounded-xl bg-paper-sand/20 dark:bg-paper-sandDark/20 overflow-hidden flex items-center justify-center">
              {activePhoto ? (
                <img
                  src={activePhoto.url.startsWith('http') ? activePhoto.url : `http://localhost:5000${activePhoto.url}`}
                  alt={item.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-ink-light space-y-2">
                  <Tag className="w-12 h-12 mx-auto opacity-30" />
                  <p className="text-xs font-semibold">No photos uploaded for this listing</p>
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            {photos.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {photos.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      activePhotoIdx === idx ? 'border-terracotta scale-95' : 'border-paper-sand opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={p.url.startsWith('http') ? p.url : `http://localhost:5000${p.url}`}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Offline Security Notice */}
          <NoticeDisclaimer />
        </div>

        {/* Right Column: Listing Details & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="paper-card p-6 sm:p-8 space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted dark:text-ink-darkMuted mb-2">
                <span className="bg-paper-sand/50 dark:bg-paper-sandDark/50 px-2.5 py-0.5 rounded-full font-bold">
                  {item.customCategory || item.category?.name}
                </span>
                <span>•</span>
                <span className="text-sage font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Listing
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-ink dark:text-ink-dark leading-tight">
                {item.title}
              </h1>
            </div>

            {/* Security Deposit & Condition Highlight Box */}
            <div className="p-4 rounded-xl bg-paper-sand/30 dark:bg-paper-sandDark/30 border border-paper-sand dark:border-paper-sandDark flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-ink-muted dark:text-ink-darkMuted block">
                  Offline Security Deposit
                </span>
                <span className="text-2xl font-black text-terracotta dark:text-terracotta-light">
                  Rs {item.securityAmount}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-ink-muted dark:text-ink-darkMuted block">
                  Condition
                </span>
                <span className="text-xs font-bold text-ink dark:text-ink-dark">
                  {conditionLabels[item.condition] || item.condition}
                </span>
              </div>
            </div>

            {/* Handover Spot */}
            <div className="flex items-start gap-2.5 text-xs text-ink dark:text-ink-dark">
              <MapPin className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Campus Handover Location:</span>
                <span className="text-ink-muted dark:text-ink-darkMuted">
                  {item.customHandoverPoint || (item.handoverPoint ? `${item.handoverPoint.name} (${item.handoverPoint.zone})` : 'Campus Location')}
                </span>
              </div>
            </div>

            {/* Full Description */}
            <div className="space-y-1.5 pt-2 border-t border-paper-sand dark:border-paper-sandDark">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-ink-darkMuted">
                Description & Usage Notes
              </h4>
              <p className="text-xs sm:text-sm text-ink dark:text-ink-dark leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-paper-sand dark:border-paper-sandDark space-y-3">
              {isOwner ? (
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-sage/10 text-xs font-bold text-sage text-center">
                    You listed this item.
                  </div>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleDeleteItem}
                    className="w-full gap-2 text-brick"
                  >
                    <Trash2 className="w-4 h-4" />
                    Deactivate Listing
                  </Button>
                </div>
              ) : isAuthenticated ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setRequestModalOpen(true)}
                  className="w-full gap-2 font-bold shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  Request to Borrow
                </Button>
              ) : (
                <Link to="/login" state={{ from: { pathname: `/items/${id}` } }} className="block">
                  <Button variant="accent" size="lg" className="w-full font-bold shadow-sm">
                    Log in to Request Item
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Owner Profile Card */}
          <div className="paper-card p-5 space-y-3">
            <span className="text-[10px] uppercase font-bold text-ink-muted dark:text-ink-darkMuted tracking-wider block">
              Item Lender
            </span>
            <div className="flex items-center gap-3">
              <Avatar name={item.owner?.name || 'Student'} size="md" />
              <div>
                <p className="text-sm font-bold text-ink dark:text-ink-dark">{item.owner?.name}</p>
                <p className="text-xs text-ink-muted dark:text-ink-darkMuted">{item.owner?.department} (Year {item.owner?.year})</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-paper-sand dark:border-paper-sandDark text-center text-xs">
              <div className="bg-paper-light dark:bg-paper-dark p-2 rounded-lg">
                <span className="text-[10px] text-ink-muted block">Lender Trust</span>
                <span className="font-extrabold text-sage">{item.owner?.lenderScore || 50}/100</span>
              </div>
              <div className="bg-paper-light dark:bg-paper-dark p-2 rounded-lg">
                <span className="text-[10px] text-ink-muted block">Successful Lends</span>
                <span className="font-extrabold text-ink dark:text-ink-dark">{item.owner?.completedLends || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Borrow Request Modal */}
      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title="Request to Borrow"
      >
        <form onSubmit={handleSendRequest} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-paper-sand/30 dark:bg-paper-sandDark/30 text-xs text-ink dark:text-ink-dark space-y-1">
            <p className="font-bold font-serif text-sm">{item.title}</p>
            <p className="text-ink-muted dark:text-ink-darkMuted">
              Offline security amount: <strong className="text-terracotta">Rs {item.securityAmount}</strong> (to be settled in-person directly).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink dark:text-ink-dark uppercase tracking-wider mb-1.5">
                Borrow Start Time *
              </label>
              <input
                type="datetime-local"
                value={requestedStart}
                onChange={(e) => setRequestedStart(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark focus:border-terracotta focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink dark:text-ink-dark uppercase tracking-wider mb-1.5">
                Expected Return Time *
              </label>
              <input
                type="datetime-local"
                value={requestedEnd}
                onChange={(e) => setRequestedEnd(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark focus:border-terracotta focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink dark:text-ink-dark uppercase tracking-wider mb-1.5">
              Note to Lender (Optional)
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Need this for my electronics lab on Thursday. Will return it sharp on Friday afternoon."
              className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark focus:border-terracotta focus:outline-none"
            />
          </div>

          <NoticeDisclaimer customText="BBB never handles payments. Handover will take place at the campus meeting point via QR code." />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="md" onClick={() => setRequestModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" loading={submitting} className="font-bold">
              Submit Borrow Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
