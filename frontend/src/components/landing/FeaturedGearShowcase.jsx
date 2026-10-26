import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { ItemCard } from '../items/ItemCard';
import { Button } from '../ui/Button';
import { ArrowRight, Sparkles, Filter } from 'lucide-react';
import { INITIAL_ITEMS, MOCK_CATEGORIES } from '../../api/mockData';

export const FeaturedGearShowcase = () => {
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: itemsRes } = useQuery({
    queryKey: ['items', selectedCategory],
    queryFn: () => apiClient(selectedCategory ? `/items?categoryId=${selectedCategory}` : '/items')
  });

  const items = itemsRes?.data && itemsRes.data.length > 0 ? itemsRes.data : INITIAL_ITEMS;

  const displayedItems = selectedCategory
    ? items.filter((i) => i.categoryId === selectedCategory || i.category?.id === selectedCategory).slice(0, 6)
    : items.slice(0, 6);

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="handwritten-note block text-lg text-terracotta">Noticeboard Highlights</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-ink dark:text-ink-dark">
            Available on Campus Today
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted dark:text-ink-darkMuted mt-1 max-w-lg">
            Real gear pinned by verified batchmates. Pick up at library steps or canteen within 15 minutes.
          </p>
        </div>

        <Link to="/search">
          <Button variant="secondary" size="md" className="gap-2 font-bold shrink-0">
            View All Pinned Gear
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            !selectedCategory
              ? 'bg-ink text-white dark:bg-paper-sand dark:text-ink shadow-xs'
              : 'bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark hover:bg-paper-sand/30'
          }`}
        >
          All Categories
        </button>
        {MOCK_CATEGORIES.slice(0, 6).map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id === selectedCategory ? '' : cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-terracotta text-white shadow-xs'
                : 'bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark hover:bg-paper-sand/30'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid of Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedItems.map((item, idx) => (
          <ItemCard
            key={item.id}
            item={item}
            tilt={idx % 3 === 0 ? 'left' : idx % 3 === 2 ? 'right' : 'none'}
          />
        ))}
      </div>

      {/* Lend Callout footer */}
      <div className="pt-4 flex items-center justify-between p-4 rounded-2xl bg-paper-sand/30 dark:bg-paper-sandDark/20 border border-paper-sand dark:border-paper-sandDark text-xs">
        <div className="flex items-center gap-2 text-ink dark:text-ink-dark">
          <Sparkles className="w-4 h-4 text-terracotta" />
          <span>Have something sitting idle in your hostel or backpack?</span>
        </div>
        <Link to="/lend">
          <Button variant="primary" size="sm" className="font-bold">
            + Lend It Here
          </Button>
        </Link>
      </div>
    </section>
  );
};
