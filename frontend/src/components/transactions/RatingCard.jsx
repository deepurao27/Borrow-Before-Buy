import React, { useState } from 'react';
import { Star, MessageSquare, Check, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const RatingCard = ({
  transaction,
  currentUserId,
  onSubmitRating,
  isProcessing
}) => {
  const { ratings = [], lender, borrower } = transaction;
  const isLender = currentUserId === lender.id;
  const counterparty = isLender ? borrower : lender;

  // Check if current user already rated
  const existingRating = ratings.find((r) => r.reviewerId === currentUserId);

  const [stars, setStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmitRating({ rating: stars, comment });
    } catch (err) {
      setError(err.message || 'Failed to submit rating');
    }
  };

  return (
    <Card className="border-paper-sand dark:border-paper-sandDark shadow-paper">
      <div className="flex items-center gap-2.5 border-b border-paper-sand dark:border-paper-sandDark pb-4 mb-4">
        <div className="w-9 h-9 rounded-xl bg-marigold/15 text-marigold-darker flex items-center justify-center font-bold">
          <Star className="w-5 h-5 fill-current" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-lg text-ink dark:text-ink-dark">
            Peer Rating & Review
          </h3>
          <p className="text-xs text-ink-muted dark:text-ink-darkMuted">
            Rate your exchange with {counterparty.name} to build campus reputation
          </p>
        </div>
      </div>

      {existingRating ? (
        <div className="p-4 rounded-xl bg-sage/5 border border-sage/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sage flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Your Review Submitted
            </span>
            <div className="flex items-center gap-1 text-marigold">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${s <= existingRating.rating ? 'fill-current' : 'text-paper-sand'}`}
                />
              ))}
            </div>
          </div>
          {existingRating.comment && (
            <p className="text-xs text-ink-muted dark:text-ink-darkMuted italic bg-white dark:bg-paper-cardDark p-2.5 rounded-lg border border-paper-sand">
              &ldquo;{existingRating.comment}&rdquo;
            </p>
          )}
          <span className="text-[10px] text-ink-muted block mt-1">
            Submitted on {new Date(existingRating.createdAt).toLocaleDateString()}
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center justify-center py-2">
            <span className="text-xs font-bold text-ink dark:text-ink-dark mb-2">
              How was your experience sharing with {counterparty.name}?
            </span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((starNum) => {
                const active = hoverStars ? starNum <= hoverStars : starNum <= stars;
                return (
                  <button
                    type="button"
                    key={starNum}
                    onMouseEnter={() => setHoverStars(starNum)}
                    onMouseLeave={() => setHoverStars(0)}
                    onClick={() => setStars(starNum)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                    aria-label={`Rate ${starNum} star`}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        active
                          ? 'text-marigold fill-current'
                          : 'text-paper-sand dark:text-paper-sandDark'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] font-bold text-ink-muted mt-1.5">
              {stars === 5 && 'Outstanding peer (+3 Trust bonus awarded)'}
              {stars === 4 && 'Good and smooth exchange'}
              {stars === 3 && 'Average experience'}
              {stars === 2 && 'Had minor issues'}
              {stars === 1 && 'Unsatisfactory'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink dark:text-ink-dark mb-1">
              Add a brief comment (Optional)
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Great communication, item in perfect condition, prompt meetup!"
              className="w-full text-xs p-2.5 rounded-lg border border-paper-sand dark:border-paper-sandDark bg-white dark:bg-paper-cardDark text-ink dark:text-ink-dark focus:ring-1 focus:ring-terracotta"
            />
          </div>

          {error && <p className="text-xs text-brick">{error}</p>}

          <Button
            type="submit"
            variant="primary"
            isLoading={isProcessing}
            className="w-full text-xs gap-1.5 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Submit Rating & Finish
          </Button>
        </form>
      )}
    </Card>
  );
};
