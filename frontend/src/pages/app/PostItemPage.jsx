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

const schema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(80),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  categoryId: z.string().uuid('Please select a category'),
  condition: z.enum(['LIKE_NEW', 'GOOD', 'FAIR']),
  securityAmount: z.coerce.number().min(0, 'Security amount cannot be negative').max(50000),
  handoverPointId: z.string().uuid('Please select a campus meeting spot')
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
  const categories = categoriesRes?.data || [];

  const { data: pointsRes } = useQuery({
    queryKey: ['campus-points'],
    queryFn: () => apiClient('/campus-points')
  });
  const campusPoints = pointsRes?.data || [];

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      condition: 'GOOD',
      securityAmount: 200
    }
  });

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
    setSubmitting(true);
    try {
      // 1. Create Item
      const itemRes = await apiClient('/items', {
        method: 'POST',
        body: JSON.stringify(data)
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
      toast.error(err.message || 'Failed to list item.');
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
              className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark focus:border-terracotta focus:outline-none"
            >
              <option value="">Select category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-brick font-medium mt-1">{errors.categoryId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink dark:text-ink-dark uppercase tracking-wider mb-1.5">
              Current Condition *
            </label>
            <select
              {...register('condition')}
              className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark focus:border-terracotta focus:outline-none"
            >
              <option value="LIKE_NEW">Like New (Mint, barely used)</option>
              <option value="GOOD">Good Condition (Working, minor cosmetic wear)</option>
              <option value="FAIR">Fair (Functional, noticeable wear)</option>
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
              className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark focus:border-terracotta focus:outline-none"
            >
              <option value="">Select campus location...</option>
              {campusPoints.map((pt) => (
                <option key={pt.id} value={pt.id}>{pt.name} ({pt.zone})</option>
              ))}
            </select>
            {errors.handoverPointId && (
              <p className="text-xs text-brick font-medium mt-1">{errors.handoverPointId.message}</p>
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
