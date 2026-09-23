import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-paper-cardDark border-t border-paper-sand dark:border-paper-sandDark py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-marigold flex items-center justify-center font-bold text-ink text-sm font-serif">
                B
              </div>
              <span className="font-serif font-black text-lg text-ink dark:text-ink-dark">Borrow Before Buy</span>
            </div>
            <p className="text-sm text-ink-muted dark:text-ink-darkMuted max-w-sm leading-relaxed">
              Why buy it for one lab? Borrow it from someone in your batch. Built for verified college students to share gear safely.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-sage font-semibold pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>We never touch money. Zero platform fees, zero wallets.</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-ink dark:text-ink-dark uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-ink-muted dark:text-ink-darkMuted">
              <li><Link to="/search" className="hover:text-terracotta transition-colors">Browse Noticeboard</Link></li>
              <li><Link to="/how-it-works" className="hover:text-terracotta transition-colors">How a Borrow Works</Link></li>
              <li><Link to="/safety" className="hover:text-terracotta transition-colors">Trust & Campus Safety</Link></li>
              <li><Link to="/post-item" className="hover:text-terracotta transition-colors">List an Item</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-ink dark:text-ink-dark uppercase tracking-wider mb-3">Campus Spots</h4>
            <ul className="space-y-2 text-sm text-ink-muted dark:text-ink-darkMuted">
              <li>Library Steps (Central)</li>
              <li>Block A Lobby</li>
              <li>Canteen (Student Center)</li>
              <li>Sports Pavilion</li>
              <li>Main Gate</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-paper-sand dark:border-paper-sandDark flex flex-col sm:flex-row items-center justify-between text-xs text-ink-muted dark:text-ink-darkMuted gap-4">
          <p>© {new Date().getFullYear()} Borrow Before Buy (BBB). College-only peer sharing.</p>
          <p className="font-medium text-ink dark:text-ink-dark flex items-center gap-1">
            Built for campus communities. 100% free peer sharing.
          </p>
        </div>
      </div>
    </footer>
  );
};
