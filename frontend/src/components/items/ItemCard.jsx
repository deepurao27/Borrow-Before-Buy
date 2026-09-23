import React from 'react';
import { Link } from 'react-router-dom';
import { PaperTag } from '../ui/PaperTag';
import { Avatar } from '../ui/Avatar';
import { MapPin, ShieldCheck, Tag } from 'lucide-react';

export const ItemCard = ({ item, tilt = 'none' }) => {
  const primaryPhoto = item.photos?.find((p) => p.isPrimary) || item.photos?.[0];

  const conditionLabels = {
    LIKE_NEW: 'Like New',
    GOOD: 'Good Condition',
    FAIR: 'Fair / Usable'
  };

  const conditionBadges = {
    LIKE_NEW: 'bg-sage/20 text-sage dark:text-sage-light',
    GOOD: 'bg-marigold/20 text-ink dark:text-ink-dark',
    FAIR: 'bg-paper-sand text-ink-muted dark:bg-paper-sandDark'
  };

  return (
    <Link to={`/items/${item.id}`} className="block group">
      <PaperTag
        tilt={tilt}
        tape={tilt === 'left'}
        pin={tilt === 'right'}
        className="h-full flex flex-col justify-between hover:shadow-paperHover hover:-translate-y-1 transition-all"
      >
        <div className="space-y-3">
          {/* Item Photo or Category Placeholder */}
          <div className="w-full h-44 rounded-lg bg-paper-sand/30 dark:bg-paper-sandDark/30 overflow-hidden relative border border-paper-sand dark:border-paper-sandDark">
            {primaryPhoto ? (
              <img
                src={primaryPhoto.url.startsWith('http') ? primaryPhoto.url : `http://localhost:5000${primaryPhoto.url}`}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-ink-light dark:text-ink-darkMuted space-y-1">
                <Tag className="w-8 h-8 opacity-40" />
                <span className="text-[11px] font-medium">{item.category?.name || 'Item'}</span>
              </div>
            )}

            {/* Condition Badge */}
            <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${conditionBadges[item.condition] || 'bg-white'}`}>
              {conditionLabels[item.condition] || item.condition}
            </span>
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-ink-muted dark:text-ink-darkMuted mb-1 font-semibold">
              <span>{item.category?.name}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-terracotta">
                <MapPin className="w-3 h-3" />
                {item.handoverPoint?.name}
              </span>
            </div>

            <h3 className="font-serif font-bold text-base text-ink dark:text-ink-dark group-hover:text-terracotta transition-colors line-clamp-1">
              {item.title}
            </h3>

            <p className="text-xs text-ink-muted dark:text-ink-darkMuted line-clamp-2 mt-1 leading-relaxed">
              {item.description}
            </p>
          </div>
        </div>

        {/* Footer: Owner and Offline Security */}
        <div className="mt-4 pt-3 border-t border-paper-sand/70 dark:border-paper-sandDark flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar name={item.owner?.name || 'Student'} size="sm" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-ink dark:text-ink-dark leading-tight">
                {item.owner?.name?.split(' ')[0]}
              </span>
              <span className="text-[10px] text-sage font-bold flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" />
                {item.owner?.lenderScore || 50} Trust
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-ink-muted dark:text-ink-darkMuted block">
              Offline Sec.
            </span>
            <span className="text-sm font-extrabold text-terracotta dark:text-terracotta-light">
              Rs {item.securityAmount}
            </span>
          </div>
        </div>
      </PaperTag>
    </Link>
  );
};
