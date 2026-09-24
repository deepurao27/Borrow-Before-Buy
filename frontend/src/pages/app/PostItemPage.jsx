import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { NoticeDisclaimer } from '../../components/ui/NoticeDisclaimer';
import { UploadCloud, X, PlusCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

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

const schema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(100),
  description: z.string().trim().min(5, 'Description must be at least 5 characters'),
  categoryId: z.string().min(1, 'Please select a category'),
  customCategory: z.string().trim().max(80).optional(),
  condition: z.enum(['LIKE_NEW', 'GOOD', 'FAIR']),
  securityAmount: z.coerce.number().min(0, 'Security amount cannot be negative').max(50000),
  handoverPointId: z.string().min(1, 'Please select a campus meeting spot'),
  customHandoverPoint: z.string().trim().max(120).optional()
});

export const PostItemPage = () => {
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient('/categories')
  });

  const { data: pointsRes } = useQuery({
    queryKey: ['campus-points'],
    queryFn: () => apiClient('/campus-points')
  });

  // Merge API results with fallbacks and guarantee 'Others' exists at the end
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

  const { register, handleSubmit, watch, formState: { errors }, setError } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      condition: 'GOOD',
      securityAmount: 200,
      categoryId: '',
      handoverPointId: '',
      customCategory: '',
      customHandoverPoint: ''
    }
  });

  const selectedCategoryId = watch('categoryId');
  const selectedHandoverPointId = watch('handoverPointId');

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategoryId);
  const isOtherCategory = selectedCategoryObj?.slug === 'others' || selectedCategoryObj?.name?.toLowerCase() === 'others';

  const selectedPointObj = campusPoints.find((p) => p.id === selectedHandoverPointId);
  const isOtherHandover = selectedPointObj?.name?.toLowerCase() === 'others';

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      toast.error('You can upload a maximum of 5 photos.');
      return;
    }

    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPhotoPreviews([...photoPreviews, ...newPreviews]);
  };

  const removePhoto = (index) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    const updatedPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    setPhotoPreviews(updatedPreviews);
  };

  const onSubmit = async (data) => {
    // Custom validation for 'Others'
    if (isOtherCategory && (!data.customCategory || data.customCategory.trim().length < 2)) {
      setError('customCategory', { message: 'Please specify the category name (at least 2 chars)' });
      return;
    }

    if (isOtherHandover && (!data.customHandoverPoint || data.customHandoverPoint.trim().length < 2)) {
      setError('customHandoverPoint', { message: 'Please specify your designated handover location' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        condition: data.condition,
        securityAmount: data.securityAmount,
        handoverPointId: data.handoverPointId,
        customCategory: isOtherCategory ? data.customCategory.trim() : null,
        customHandoverPoint: isOtherHandover ? data.customHandoverPoint.trim() : null
      };

      // 1. Create Item
      const itemRes = await apiClient('/items', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const createdItem = itemRes?.data;

      // 2. Upload Photos if any
      if (photos.length > 0 && createdItem?.id) {
        const formData = new FormData();
        photos.forEach((file) => {
          formData.append('photos', file);
        });

        await apiClient(`/items/${createdItem.id}/photos`, {
          method: 'POST',
          body: formData
        });
      }

      toast.success('Your item is pinned to the campus noticeboard!');
      navigate(`/items/${createdItem.id}`);
    } catch (err) {
      const fieldErrorMsg = err.fields ? Object.values(err.fields).filter(Boolean).join('. ') : null;
      toast.error(fieldErrorMsg || err.message || 'Failed to list item.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <span className="handwritten-note block text-lg">Batch Sharing</span>
        <h1 className="text-3xl font-extrabold font-serif text-ink dark:text-ink-dark">
          Lend an Item to Your Batch
        </h1>
        <p className="text-xs text-ink-muted dark:text-ink-darkMuted mt-1">
          Have lab gear, cables, or calculators sitting idle in your bag? Pin them here for others to borrow.
        </p>
      </div>

      <NoticeDisclaimer customText="BBB never handles money. Specify the offline security deposit you want settled in person." />

      <form onSubmit={handleSubmit(onSubmit)} className="paper-card p-6 sm:p-8 space-y-6">
        {/* Title */}
        <Input
          label="Item Title"
          placeholder="e.g. Casio fx-991ES Plus Scientific Calculator"
          required
          {...register('title')}
          error={errors.title?.message}
          helperText="Include brand, model, and primary purpose."
        />

        {/* Category & Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink dark:text-ink-dark uppercase tracking-wider mb-1.5">
              Category *
            </label>
            <select
              {...register('categoryId')}
              className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark focus:border-terracotta focus:ring-1 focus:ring-terracotta focus:outline-none cursor-pointer"
            >
              <option value="" className="text-ink-muted bg-white dark:bg-paper-cardDark">
                Select category...
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="text-ink dark:text-ink-dark bg-white dark:bg-paper-cardDark py-1">
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-brick font-medium mt-1">{errors.categoryId.message}</p>
            )}

            {/* Custom Category Input for 'Others' */}
            {isOtherCategory && (
              <div className="mt-3 p-3 rounded-lg bg-paper-sand/20 dark:bg-paper-sandDark/20 border border-paper-sand dark:border-paper-sandDark space-y-1 animate-fadeIn">
                <Input
                  label="Specify Other Category"
                  placeholder="e.g. Drafter, Musical Instrument, Art Supplies..."
                  required
                  {...register('customCategory')}
                  error={errors.customCategory?.message}
                  helperText="Tell borrowers what type of item this is."
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink dark:text-ink-dark uppercase tracking-wider mb-1.5">
              Current Condition *
            </label>
            <select
              {...register('condition')}
              className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark focus:border-terracotta focus:ring-1 focus:ring-terracotta focus:outline-none cursor-pointer"
            >
              <option value="LIKE_NEW" className="text-ink dark:text-ink-dark bg-white dark:bg-paper-cardDark">Like New (Mint, barely used)</option>
              <option value="GOOD" className="text-ink dark:text-ink-dark bg-white dark:bg-paper-cardDark">Good Condition (Working, minor cosmetic wear)</option>
              <option value="FAIR" className="text-ink dark:text-ink-dark bg-white dark:bg-paper-cardDark">Fair (Functional, noticeable wear)</option>
            </select>
          </div>
        </div>

        {/* Offline Security & Meeting Spot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Offline Security Amount (Rs)"
            type="number"
            min="0"
            required
            {...register('securityAmount')}
            error={errors.securityAmount?.message}
            helperText="Returned offline when item is returned in good condition."
          />

          <div>
            <label className="block text-xs font-semibold text-ink dark:text-ink-dark uppercase tracking-wider mb-1.5">
              Handover Spot *
            </label>
            <select
              {...register('handoverPointId')}
              className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark focus:border-terracotta focus:ring-1 focus:ring-terracotta focus:outline-none cursor-pointer"
            >
              <option value="" className="text-ink-muted bg-white dark:bg-paper-cardDark">
                Select campus location...
              </option>
              {campusPoints.map((pt) => (
                <option key={pt.id} value={pt.id} className="text-ink dark:text-ink-dark bg-white dark:bg-paper-cardDark py-1">
                  {pt.name} {pt.zone ? `(${pt.zone})` : ''}
                </option>
              ))}
            </select>
            {errors.handoverPointId && (
              <p className="text-xs text-brick font-medium mt-1">{errors.handoverPointId.message}</p>
            )}

            {/* Custom Handover Location for 'Others' */}
            {isOtherHandover && (
              <div className="mt-3 p-3 rounded-lg bg-paper-sand/20 dark:bg-paper-sandDark/20 border border-paper-sand dark:border-paper-sandDark space-y-1 animate-fadeIn">
                <Input
                  label="Specify Handover Spot"
                  placeholder="e.g. Mechanical Workshop, Hostel 4 Common Room..."
                  required
                  {...register('customHandoverPoint')}
                  error={errors.customHandoverPoint?.message}
                  helperText="Specify a safe, well-lit public campus location."
                />
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-ink dark:text-ink-dark uppercase tracking-wider mb-1.5">
            Description & Usage Notes *
          </label>
          <textarea
            rows={4}
            placeholder="Describe what is included (e.g. cover case, charging cable, user manual), any functional quirks, and your availability."
            {...register('description')}
            className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark focus:border-terracotta focus:outline-none"
          />
          {errors.description && (
            <p className="text-xs text-brick font-medium mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Photo Upload Area */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-ink dark:text-ink-dark uppercase tracking-wider">
            Item Photos (Optional, max 5)
          </label>

          <div className="border-2 border-dashed border-paper-sand dark:border-paper-sandDark rounded-xl p-6 text-center hover:bg-paper-sand/10 transition-colors">
            <UploadCloud className="w-8 h-8 text-ink-muted mx-auto mb-2" />
            <p className="text-xs text-ink dark:text-ink-dark font-medium">
              Click to choose files or drag and drop
            </p>
            <p className="text-[11px] text-ink-muted dark:text-ink-darkMuted mt-0.5">
              PNG, JPG, or WebP up to 5MB each
            </p>
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              onChange={handlePhotoChange}
              className="mt-3 text-xs text-ink-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-paper-sand dark:file:bg-paper-sandDark file:text-ink dark:file:text-ink-dark hover:file:bg-paper-sand/80 cursor-pointer"
            />
          </div>

          {/* Previews Strip */}
          {photoPreviews.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2">
              {photoPreviews.map((src, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-paper-sand shadow-xs">
                  <img src={src} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 bg-ink/70 hover:bg-ink text-white rounded-full p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={submitting}
          className="w-full gap-2 font-bold shadow-sm"
        >
          Pin Item to Noticeboard
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};
