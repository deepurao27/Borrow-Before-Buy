import React, { useState } from 'react';
import { Camera, CheckSquare, UploadCloud, Eye, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const ConditionChecklist = ({
  transaction,
  currentUserId,
  onSubmitCondition,
  onAcknowledgeCondition,
  isProcessing
}) => {
  const { conditionRecords = [], lender, borrower, status } = transaction;
  const isLender = currentUserId === lender.id;
  const isBorrower = currentUserId === borrower.id;

  // Find BEFORE stage record if exists
  const beforeRecord = conditionRecords.find((r) => r.stage === 'BEFORE');

  // Local state for lender upload form
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState({
    workingState: true,
    scratchesChecked: true,
    accessoriesComplete: true
  });
  const [selectedPhotoModal, setSelectedPhotoModal] = useState(null);
  const [error, setError] = useState(null);

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (files.length > 5) {
      setError('You can select a maximum of 5 evidence photos.');
      return;
    }

    setPhotos(files);
    const previews = files.map((f) => URL.createObjectURL(f));
    setPhotoPreviews(previews);
    setError(null);
  };

  const handleLenderSubmit = async (e) => {
    e.preventDefault();
    if (!photos.length && !beforeRecord) {
      setError('Please upload at least 1 clear photo of the item.');
      return;
    }

    setError(null);
    try {
      const formData = new FormData();
      formData.append('stage', 'BEFORE');
      formData.append('notes', notes);
      formData.append('checklist', JSON.stringify(checklist));
      photos.forEach((file) => {
        formData.append('photos', file);
      });

      await onSubmitCondition(formData);
      setPhotos([]);
      setPhotoPreviews([]);
    } catch (err) {
      setError(err.message || 'Failed to submit condition evidence');
    }
  };

  return (
    <Card className="border-paper-sand dark:border-paper-sandDark shadow-paper">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-paper-sand dark:border-paper-sandDark pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sage/10 text-sage flex items-center justify-center font-bold">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-ink dark:text-ink-dark">
              Pre-Handover Condition Inspection
            </h3>
            <p className="text-xs text-ink-muted dark:text-ink-darkMuted">
              Inspect working state and physical condition before exchange
            </p>
          </div>
        </div>

        {beforeRecord?.acknowledgedAt ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sage/15 text-sage border border-sage/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Condition Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-marigold/15 text-marigold-darker dark:text-marigold border border-marigold/30">
            Pending Inspection
          </span>
        )}
      </div>

      {/* Existing Evidence Display */}
      {beforeRecord && (
        <div className="p-4 rounded-xl bg-paper-sand/20 dark:bg-paper-sandDark/20 border border-paper-sand dark:border-paper-sandDark mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-ink dark:text-ink-dark uppercase tracking-wider">
              Documented Evidence Photos
            </span>
            <span className="text-xs text-ink-muted">
              Uploaded by {beforeRecord.creator?.name || 'Lender'}
            </span>
          </div>

          {/* Photo Gallery Grid */}
          {beforeRecord.photoKeys && beforeRecord.photoKeys.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
              {beforeRecord.photoKeys.map((key, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPhotoModal(`/api/transactions/${transaction.id}/evidence/${key}`)}
                  className="aspect-square rounded-lg bg-paper-sand/40 overflow-hidden relative group cursor-pointer border border-paper-sand"
                >
                  <img
                    src={`/api/transactions/${transaction.id}/evidence/${key}`}
                    alt={`Evidence ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      // Fallback placeholder if image not accessible yet
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';
                    }}
                  />
                  <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink-muted italic mb-3">No photos attached to this record.</p>
          )}

          {/* Checklist Points */}
          <div className="space-y-1.5 text-xs text-ink dark:text-ink-dark mb-3 bg-white dark:bg-paper-cardDark p-3 rounded-lg border border-paper-sand">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sage shrink-0" />
              <span>Item powers on and operates as expected</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sage shrink-0" />
              <span>Pre-existing scratches or cosmetic marks documented</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sage shrink-0" />
              <span>All cables, accessories, and adapters present</span>
            </div>
          </div>

          {beforeRecord.notes && (
            <p className="text-xs text-ink-muted dark:text-ink-darkMuted italic">
              Lender notes: &ldquo;{beforeRecord.notes}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* Lender Upload Form (when in SECURITY_ACKNOWLEDGED) */}
      {isLender && status === 'SECURITY_ACKNOWLEDGED' && (
        <form onSubmit={handleLenderSubmit} className="space-y-4">
          <div className="p-4 rounded-xl border border-dashed border-paper-sand dark:border-paper-sandDark bg-paper-sand/10">
            <label className="block text-xs font-bold text-ink dark:text-ink-dark mb-2">
              Upload Item Condition Photos (Up to 5)
            </label>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoSelect}
              className="block w-full text-xs text-ink-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-terracotta/10 file:text-terracotta hover:file:bg-terracotta/20 cursor-pointer"
            />
            <p className="text-[11px] text-ink-muted mt-1.5">
              Take photos right at the handover location showing working state & accessories.
            </p>

            {photoPreviews.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {photoPreviews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg border border-paper-sand shrink-0"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-paper-sand/20 dark:bg-paper-sandDark/20 space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-ink dark:text-ink-dark cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.workingState}
                onChange={(e) => setChecklist({ ...checklist, workingState: e.target.checked })}
                className="rounded text-terracotta focus:ring-terracotta"
              />
              Item powers on and operates cleanly
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-ink dark:text-ink-dark cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.scratchesChecked}
                onChange={(e) => setChecklist({ ...checklist, scratchesChecked: e.target.checked })}
                className="rounded text-terracotta focus:ring-terracotta"
              />
              Any cosmetic marks or scratches are clearly captured in photos
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-ink dark:text-ink-dark cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.accessoriesComplete}
                onChange={(e) => setChecklist({ ...checklist, accessoriesComplete: e.target.checked })}
                className="rounded text-terracotta focus:ring-terracotta"
              />
              All required cables, chargers, and cases are included
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink dark:text-ink-dark mb-1">
              Inspection Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Minor scuff on lower corner, works 100%, original pouch included"
              className="w-full text-xs p-2.5 rounded-lg border border-paper-sand dark:border-paper-sandDark bg-white dark:bg-paper-cardDark text-ink dark:text-ink-dark focus:ring-1 focus:ring-terracotta"
            />
          </div>

          {error && (
            <p className="text-xs text-brick flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            isLoading={isProcessing}
            className="w-full text-xs gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            {beforeRecord ? 'Update Condition Record' : 'Save Pre-Handover Condition Evidence'}
          </Button>
        </form>
      )}

      {/* Borrower Review & Acknowledge Section */}
      {isBorrower && status === 'SECURITY_ACKNOWLEDGED' && (
        <div className="mt-4 pt-4 border-t border-paper-sand dark:border-paper-sandDark">
          {beforeRecord ? (
            <div className="space-y-3">
              <p className="text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed">
                Please review the evidence photos and checklist provided by {lender.name}. Once you
                verify the condition in person, confirm to proceed with the physical handover.
              </p>
              <Button
                variant="primary"
                onClick={onAcknowledgeCondition}
                isLoading={isProcessing}
                className="w-full text-xs gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Acknowledge Condition & Proceed to QR Handover
              </Button>
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-ink-muted dark:text-ink-darkMuted italic bg-paper-sand/20 rounded-xl">
              Waiting for lender ({lender.name}) to upload condition inspection photos...
            </div>
          )}
        </div>
      )}

      {/* Enlarge Photo Modal */}
      {selectedPhotoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm"
          onClick={() => setSelectedPhotoModal(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden bg-white p-2">
            <img src={selectedPhotoModal} alt="Enlarged evidence" className="max-h-[80vh] w-auto object-contain rounded-xl" />
          </div>
        </div>
      )}
    </Card>
  );
};
