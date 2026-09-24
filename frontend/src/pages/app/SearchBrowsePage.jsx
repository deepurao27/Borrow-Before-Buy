import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { ItemCard } from '../../components/items/ItemCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { NoticeDisclaimer } from '../../components/ui/NoticeDisclaimer';
import { Search, Filter, PlusCircle, RotateCcw } from 'lucide-react';

const FALLBACK_CATEGORIES = [
  { id: '00000000-0000-4000-8000-000000000001', name: 'Calculators', slug: 'calculators' },
  { id: '00000000-0000-4000-8000-000000000002', name: 'Cables & Adapters', slug: 'cables-adapters' },
  { id: '00000000-0000-4000-8000-000000000003', name: 'Lab Gear', slug: 'lab-gear' },
  { id: '00000000-0000-4000-8000-000000000004', name: 'Stationery & Drawing', slug: 'stationery' },
  { id: '00000000-0000-4000-8000-000000000005', name: 'Electronics & Dev Boards', slug: 'electronics' },
  { id: '00000000-0000-4000-8000-000000000006', name: 'Tripods & Cameras', slug: 'photography' },
  { id: '00000000-0000-4000-8000-000000000007', name: 'Sports Equipment', slug: 'sports' },
  { id: '00000000-0000-4000-8000-000000000008', name: 'Textbooks & Notes', slug: 'books' },
  { id: '00000000-0000-4000-8000-000000000009', name: 'Others', slug: 'others' }
];

const FALLBACK_CAMPUS_POINTS = [
  { id: '10000000-0000-4000-8000-000000000001', name: 'Library Steps', zone: 'Central Campus' },
  { id: '10000000-0000-4000-8000-000000000002', name: 'Main Gate', zone: 'North Entrance' },
  { id: '10000000-0000-4000-8000-000000000003', name: 'Canteen', zone: 'Student Activity Center' },
  { id: '10000000-0000-4000-8000-000000000004', name: 'Block A Lobby', zone: 'Academic Block A' },
  { id: '10000000-0000-4000-8000-000000000005', name: 'Sports Pavilion', zone: 'Athletic Grounds' },
  { id: '10000000-0000-4000-8000-000000000006', name: 'Others', zone: 'Custom Spot / Designated Location' }
];

export const SearchBrowsePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const selectedCategory = searchParams.get('category') || '';
  const selectedCondition = searchParams.get('condition') || '';
  const selectedPoint = searchParams.get('point') || '';

  // Fetch Categories
  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient('/categories')
  });

  const categories = React.useMemo(() => {
    let list = categoriesRes?.data && categoriesRes.data.length > 0
      ? [...categoriesRes.data]
      : [...FALLBACK_CATEGORIES];

    if (!list.some((c) => c.slug === 'others' || c.name.toLowerCase() === 'others')) {
      list.push({ id: 'c0000000-0000-4000-8000-000000000009', name: 'Others', slug: 'others' });
    }

    return list.sort((a, b) => {
      if (a.slug === 'others' || a.name.toLowerCase() === 'others') return 1;
      if (b.slug === 'others' || b.name.toLowerCase() === 'others') return -1;
      return a.name.localeCompare(b.name);
    });
  }, [categoriesRes]);

  // Fetch Campus Points
  const { data: pointsRes } = useQuery({
    queryKey: ['campus-points'],
    queryFn: () => apiClient('/campus-points')
  });

  const campusPoints = React.useMemo(() => {
    let list = pointsRes?.data && pointsRes.data.length > 0
      ? [...pointsRes.data]
      : [...FALLBACK_CAMPUS_POINTS];

    if (!list.some((p) => p.name.toLowerCase() === 'others')) {
      list.push({ id: 'p0000000-0000-4000-8000-000000000006', name: 'Others', zone: 'Custom Spot / Designated Location' });
    }

    return list.sort((a, b) => {
      if (a.name.toLowerCase() === 'others') return 1;
      if (b.name.toLowerCase() === 'others') return -1;
      return a.name.localeCompare(b.name);
    });
  }, [pointsRes]);

  // Fetch Items matching filters
  const { data: itemsRes, isLoading, refetch } = useQuery({
    queryKey: ['items', searchParams.toString()],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchParams.get('q')) params.append('q', searchParams.get('q'));
      if (selectedCategory) {
        const cat = categories.find((c) => c.slug === selectedCategory);
        if (cat) params.append('categoryId', cat.id);
      }
      if (selectedCondition) params.append('condition', selectedCondition);
      if (selectedPoint) params.append('handoverPointId', selectedPoint);
      return apiClient(`/items?${params.toString()}`);
    }
  });

  const items = itemsRes?.data || [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      newParams.set('q', searchQuery.trim());
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  const handleCategorySelect = (slug) => {
    const newParams = new URLSearchParams(searchParams);
    if (selectedCategory === slug) {
      newParams.delete('category');
    } else {
      newParams.set('category', slug);
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-paper-sand dark:border-paper-sandDark">
        <div>
          <span className="handwritten-note block text-lg">College Noticeboard</span>
          <h1 className="text-3xl font-extrabold font-serif text-ink dark:text-ink-dark">
            Browse Pinned Gear
          </h1>
          <p className="text-xs text-ink-muted dark:text-ink-darkMuted mt-1">
            Short-term items available to borrow from verified batchmates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/post-item">
            <Button variant="primary" size="md" className="gap-2 font-bold shadow-sm">
              <PlusCircle className="w-4 h-4" />
              Lend an Item
            </Button>
          </Link>
        </div>
      </div>

      <NoticeDisclaimer />

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items (e.g. TI-84 calculator, HDMI cord, lab coat)..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark text-sm placeholder:text-ink-light focus:border-terracotta focus:ring-1 focus:ring-terracotta focus:outline-none"
          />
          <Search className="w-5 h-5 text-ink-muted absolute left-3.5 top-3.5" />
        </div>
        <Button type="submit" variant="accent" size="md" className="font-bold shrink-0">
          Search
        </Button>
      </form>

      {/* Category Pills Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleCategorySelect('')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
            !selectedCategory
              ? 'bg-ink text-paper-light dark:bg-paper-sand dark:text-ink'
              : 'bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark hover:bg-paper-sand/30'
          }`}
        >
          All Items
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategorySelect(cat.slug)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat.slug
                ? 'bg-terracotta text-white'
                : 'bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark hover:bg-paper-sand/30'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Filter Dropdowns Strip */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <select
          value={selectedCondition}
          onChange={(e) => {
            const p = new URLSearchParams(searchParams);
            if (e.target.value) p.set('condition', e.target.value);
            else p.delete('condition');
            setSearchParams(p);
          }}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark"
        >
          <option value="">Any Condition</option>
          <option value="LIKE_NEW">Like New</option>
          <option value="GOOD">Good Condition</option>
          <option value="FAIR">Fair / Usable</option>
        </select>

        <select
          value={selectedPoint}
          onChange={(e) => {
            const p = new URLSearchParams(searchParams);
            if (e.target.value) p.set('point', e.target.value);
            else p.delete('point');
            setSearchParams(p);
          }}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark"
        >
          <option value="">Any Handover Spot</option>
          {campusPoints.map((pt) => (
            <option key={pt.id} value={pt.id}>
              {pt.name} ({pt.zone})
            </option>
          ))}
        </select>

        {(selectedCategory || selectedCondition || selectedPoint || searchQuery) && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-xs font-bold text-terracotta hover:underline ml-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        )}
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Skeleton key={n} className="h-80 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <ItemCard
              key={item.id}
              item={item}
              tilt={idx % 3 === 0 ? 'left' : idx % 3 === 2 ? 'right' : 'none'}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No items found on noticeboard"
          description="Try clearing your search terms or filters, or be the first to pin something in this category!"
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      )}
    </div>
  );
};
