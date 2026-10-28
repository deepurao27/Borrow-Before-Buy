import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PaperTag } from '../../components/ui/PaperTag';
import { Avatar } from '../../components/ui/Avatar';
import { NoticeDisclaimer } from '../../components/ui/NoticeDisclaimer';
import {
  UploadCloud,
  X,
  PlusCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Image as ImageIcon,
  HelpCircle,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { SAMPLE_ITEM_PHOTOS, MOCK_USERS } from '../../api/mockData';

const FALLBACK_CATEGORIES = [
  { id: 'cat-calc-001', name: 'Calculators', slug: 'calculators' },
  { id: 'cat-cable-002', name: 'Cables & Adapters', slug: 'cables-adapters' },
  { id: 'cat-lab-003', name: 'Lab Gear', slug: 'lab-gear' },
  { id: 'cat-draw-004', name: 'Stationery & Drawing', slug: 'stationery' },
  { id: 'cat-elec-005', name: 'Electronics & Dev Boards', slug: 'electronics' },
  { id: 'cat-photo-006', name: 'Tripods & Cameras', slug: 'photography' },
  { id: 'cat-sport-007', name: 'Sports Equipment', slug: 'sports' },
  { id: 'cat-book-008', name: 'Textbooks & Notes', slug: 'books' },
  { id: 'cat-other-009', name: 'Others', slug: 'others' }
];

const FALLBACK_CAMPUS_POINTS = [
  { id: 'pt-lib-001', name: 'Central Library Steps', zone: 'Central Campus' },
  { id: 'pt-gate-002', name: 'Main Campus Gate', zone: 'North Entrance' },
  { id: 'pt-cant-003', name: 'Student Canteen / Food Court', zone: 'Student Activity Center' },
  { id: 'pt-blocka-004', name: 'Block A Lobby', zone: 'Academic Block A' },
  { id: 'pt-sport-005', name: 'Sports Pavilion Bench', zone: 'Athletic Grounds' },
  { id: 'pt-custom-006', name: 'Designated Spot', zone: 'Mutually agreed campus location' }
];

const ITEM_PRESETS = [
  {
    label: '🧮 TI-84 Plus Calculator',
    title: 'Texas Instruments TI-84 Plus Color Graphing Calculator',
    categoryId: 'cat-calc-001',
    condition: 'LIKE_NEW',
    securityAmount: 500,
    description: 'Fully charged and ready for math/stats labs. Includes sliding plastic case and charging cable.'
  },
  {
    label: '🔌 USB-C to HDMI Cable',
    title: 'Anker USB-C to HDMI 4K Display Cable (2m)',
    categoryId: 'cat-cable-002',
    condition: 'GOOD',
    securityAmount: 200,
    description: 'Needed for seminar hall and project presentations. Plug-and-play for MacBook, iPad, and PC laptops.'
  },
  {
    label: '🥼 White Chemistry Lab Coat',
    title: 'Cotton Chemistry Lab Coat (Unisex, Size L)',
    categoryId: 'cat-lab-003',
    condition: 'GOOD',
    securityAmount: 150,
    description: 'Freshly washed and ironed with two side pockets. Compliant with all departmental safety standards.'
  },
  {
    label: '📐 Mini Drafter with Clamp',
    title: 'Rotring Engineering Mini Drafter with Sheet Clamps',
    categoryId: 'cat-draw-004',
    condition: 'LIKE_NEW',
    securityAmount: 400,
    description: 'Essential for Engineering Graphics sheet submissions. Fully calibrated scales and tight pivot lock.'
  },
  {
    label: '⚡ Arduino Uno Kit',
    title: 'Arduino Uno R3 Kit with Breadboard & Jumper Cables',
    categoryId: 'cat-elec-005',
    condition: 'GOOD',
    securityAmount: 500,
    description: 'Complete with USB cable, breadboard, sensors, and jumper wires for electronics mini-projects.'
  }
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
  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [selectedSampleUrl, setSelectedSampleUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient('/categories')
  });

  const { data: pointsRes } = useQuery({
    queryKey: ['campus-points'],
    queryFn: () => apiClient('/campus-points')
  });

  const categories = React.useMemo(() => {
    let list = categoriesRes?.data && categoriesRes.data.length > 0
      ? [...categoriesRes.data]
      : [...FALLBACK_CATEGORIES];

    if (!list.some((c) => c.slug === 'others' || c.name.toLowerCase() === 'others')) {
      list.push({ id: 'cat-other-009', name: 'Others', slug: 'others' });
    }
    return list;
  }, [categoriesRes]);

  const campusPoints = React.useMemo(() => {
    let list = pointsRes?.data && pointsRes.data.length > 0
      ? [...pointsRes.data]
      : [...FALLBACK_CAMPUS_POINTS];

    if (!list.some((p) => p.name.toLowerCase() === 'others')) {
      list.push({ id: 'pt-custom-006', name: 'Others', zone: 'Custom Spot / Designated Location' });
    }
    return list;
  }, [pointsRes]);

  const { register, handleSubmit, watch, setValue, formState: { errors }, setError } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      condition: 'GOOD',
      securityAmount: 200,
      categoryId: 'cat-calc-001',
      handoverPointId: 'pt-lib-001',
      customCategory: '',
      customHandoverPoint: '',
      title: '',
      description: ''
    }
  });

  // Watch form fields for live bulletin card preview
  const watchTitle = watch('title');
  const watchDescription = watch('description');
  const watchSecurityAmount = watch('securityAmount');
  const watchCondition = watch('condition');
  const selectedCategoryId = watch('categoryId');
  const selectedHandoverPointId = watch('handoverPointId');

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategoryId) || categories[0];
  const isOtherCategory = selectedCategoryObj?.slug === 'others' || selectedCategoryObj?.name?.toLowerCase() === 'others';

  const selectedPointObj = campusPoints.find((p) => p.id === selectedHandoverPointId) || campusPoints[0];
  const isOtherHandover = selectedPointObj?.name?.toLowerCase() === 'others';

  // Apply Quick Template
  const handleApplyPreset = (preset) => {
    setValue('title', preset.title);
    setValue('categoryId', preset.categoryId);
    setValue('condition', preset.condition);
    setValue('securityAmount', preset.securityAmount);
    setValue('description', preset.description);
    toast.success(`Template loaded: "${preset.label}"`);
  };

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

  const handleSelectSamplePhoto = (url) => {
    setSelectedSampleUrl(url);
    if (!photoPreviews.includes(url)) {
      setPhotoPreviews([url, ...photoPreviews]);
    }
    toast.info('Sample gear photo attached!');
  };

  const removePhoto = (index) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    const updatedPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    setPhotoPreviews(updatedPreviews);
  };

  // 1-Click Guest Login Helper
  const handleQuickLogin = async (selectedUser = MOCK_USERS[1]) => {
    try {
      const res = await apiClient('/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({
          userId: selectedUser.id,
          name: selectedUser.name,
          email: selectedUser.collegeEmail
        })
      });
      if (res?.data?.user) {
        login(res.data.user, res.data.accessToken);
        toast.success(`Signed in as ${res.data.user.name} (Peer Sharer)!`);
        return;
      }
    } catch {
      // Fallback to local login if backend is unreachable
    }
    login(selectedUser, `mock_token_${selectedUser.id}_${Date.now()}`);
    toast.success(`Signed in as ${selectedUser.name}!`);
  };

  const onSubmit = async (data) => {
    // Custom validation for 'Others'
    if (isOtherCategory && (!data.customCategory || data.customCategory.trim().length < 2)) {
      setError('customCategory', { message: 'Please specify category name (at least 2 chars)' });
      return;
    }

    if (isOtherHandover && (!data.customHandoverPoint || data.customHandoverPoint.trim().length < 2)) {
      setError('customHandoverPoint', { message: 'Please specify your designated campus location' });
      return;
    }

    // If user is not logged in, automatically authenticate as verified student
    let activeUser = user;
    if (!activeUser) {
      activeUser = MOCK_USERS[1]; // Priya Patel
      try {
        const res = await apiClient('/auth/demo-login', {
          method: 'POST',
          body: JSON.stringify({
            userId: activeUser.id,
            name: activeUser.name,
            email: activeUser.collegeEmail
          })
        });
        if (res?.data?.user) {
          login(res.data.user, res.data.accessToken);
        } else {
          login(activeUser, `mock_token_${activeUser.id}_${Date.now()}`);
        }
      } catch (e) {
        login(activeUser, `mock_token_${activeUser.id}_${Date.now()}`);
      }
      toast.info(`Posting listing as verified student: ${activeUser.name}.`);
    }

    setSubmitting(true);
    try {
      const payload = {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        condition: data.condition,
        securityAmount: Number(data.securityAmount) || 0,
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

      // 2. Upload / attach photos if any
      if (createdItem?.id) {
        if (photos.length > 0) {
          const formData = new FormData();
          photos.forEach((file) => formData.append('photos', file));
          await apiClient(`/items/${createdItem.id}/photos`, {
            method: 'POST',
            body: formData
          }).catch(() => null);
        } else if (selectedSampleUrl) {
          await apiClient(`/items/${createdItem.id}/photos`, {
            method: 'POST',
            body: JSON.stringify({ photoUrl: selectedSampleUrl })
          }).catch(() => null);
        }
      }

      toast.success('🎉 Your item is pinned to the campus noticeboard! Any batchmate can now request to borrow it.');
      navigate(createdItem?.id ? `/items/${createdItem.id}` : '/search');
    } catch (err) {
      const fieldErrorMsg = err.fields ? Object.values(err.fields).filter(Boolean).join('. ') : null;
      toast.error(fieldErrorMsg || err.message || 'Failed to list item.');
    } finally {
      setSubmitting(false);
    }
  };

  const previewImage = photoPreviews[0] || selectedSampleUrl || 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-paper-sand dark:border-paper-sandDark">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-terracotta/15 text-terracotta text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Campus Peer Sharing &bull; Dual Role (Lend & Borrow)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-ink dark:text-ink-dark">
            Lend an Item to Your Campus
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted dark:text-ink-darkMuted mt-1 max-w-xl">
            Have a calculator, lab coat, or HDMI cable sitting idle? Lend it to a batchmate, build your campus trust score, and borrow whatever gear you need anytime!
          </p>
        </div>

        {/* Demo Mode / Active Student Status Helper */}
        {isAuthenticated ? (
          <div className="p-3.5 rounded-xl bg-sage/15 border border-sage/40 flex items-center gap-3 text-xs">
            <Avatar name={user.name} size="sm" />
            <div>
              <p className="font-bold text-ink dark:text-ink-dark">
                Posting as {user.name}
              </p>
              <p className="text-[11px] text-ink-muted">
                Verified Student &bull; Dual Role: Lend your items & borrow gear anytime
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-marigold/15 border border-marigold/40 flex items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-ink dark:text-ink-dark">Campus Peer Mode</p>
              <p className="text-[11px] text-ink-muted">1-click sign in as verified student:</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="accent"
                size="sm"
                onClick={() => handleQuickLogin(MOCK_USERS[1])}
                className="gap-1 font-bold text-xs shrink-0"
              >
                Sign in as Priya
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleQuickLogin(MOCK_USERS[0])}
                className="gap-1 font-bold text-xs shrink-0"
              >
                Sign in as Arjun
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Templates Strip */}
      <div className="p-4 rounded-2xl bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-ink dark:text-ink-dark flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-terracotta" />
            1-Click Popular Templates (Click to fill instantly):
          </span>
          <span className="text-[11px] text-ink-muted">Saves time typing</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {ITEM_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-paper-sand/40 dark:bg-paper-sandDark/30 hover:bg-terracotta hover:text-white border border-paper-sand dark:border-paper-sandDark transition-all cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <NoticeDisclaimer customText="BBB never touches student cash. Set an offline security deposit you will exchange directly in-person at your campus pickup spot." />

      {/* Main Grid: Form on Left (7 cols), Live Preview Card on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container (7 cols) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit(onSubmit)} className="paper-card p-6 sm:p-8 space-y-6">
            {/* Step 1: Title */}
            <div>
              <Input
                label="Item Title *"
                placeholder="e.g. Texas Instruments TI-84 Plus CE Color Graphing Calculator"
                required
                {...register('title')}
                error={errors.title?.message}
                helperText="Include model name, brand, or version so batchmates know what it is."
              />
            </div>

            {/* Step 2: Category & Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink dark:text-ink-dark uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  {...register('categoryId')}
                  className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark focus:border-terracotta focus:ring-1 focus:ring-terracotta focus:outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="text-ink dark:text-ink-dark bg-white dark:bg-paper-cardDark py-1">
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-xs text-brick font-medium mt-1">{errors.categoryId.message}</p>
                )}

                {isOtherCategory && (
                  <div className="mt-3 p-3 rounded-lg bg-paper-sand/20 dark:bg-paper-sandDark/20 border border-paper-sand dark:border-paper-sandDark space-y-1">
                    <Input
                      label="Specify Custom Category *"
                      placeholder="e.g. Art Easel, Musical Keyboard, Soldering Station"
                      required
                      {...register('customCategory')}
                      error={errors.customCategory?.message}
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
                  <option value="LIKE_NEW">Like New (Mint, barely used)</option>
                  <option value="GOOD">Good Condition (Working, normal cosmetic wear)</option>
                  <option value="FAIR">Fair (Functional, noticeable scuffs/wear)</option>
                </select>
              </div>
            </div>

            {/* Step 3: Offline Security Deposit & Handover Point */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Offline Security Deposit (₹) *"
                  type="number"
                  min="0"
                  required
                  {...register('securityAmount')}
                  error={errors.securityAmount?.message}
                  helperText="Returned 100% when item is handed back in good condition."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink dark:text-ink-dark uppercase tracking-wider mb-1.5">
                  Campus Pickup Spot *
                </label>
                <select
                  {...register('handoverPointId')}
                  className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark focus:border-terracotta focus:ring-1 focus:ring-terracotta focus:outline-none cursor-pointer"
                >
                  {campusPoints.map((pt) => (
                    <option key={pt.id} value={pt.id} className="text-ink dark:text-ink-dark bg-white dark:bg-paper-cardDark py-1">
                      {pt.name} {pt.zone ? `(${pt.zone})` : ''}
                    </option>
                  ))}
                </select>
                {errors.handoverPointId && (
                  <p className="text-xs text-brick font-medium mt-1">{errors.handoverPointId.message}</p>
                )}

                {isOtherHandover && (
                  <div className="mt-3 p-3 rounded-lg bg-paper-sand/20 dark:bg-paper-sandDark/20 border border-paper-sand dark:border-paper-sandDark space-y-1">
                    <Input
                      label="Specify Campus Location *"
                      placeholder="e.g. Mechanical Workshop or Tech Block Canteen"
                      required
                      {...register('customHandoverPoint')}
                      error={errors.customHandoverPoint?.message}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Description */}
            <div>
              <label className="block text-xs font-semibold text-ink dark:text-ink-dark uppercase tracking-wider mb-1.5">
                Description & Availability *
              </label>
              <textarea
                rows={3}
                placeholder="What is included? (e.g. cables, cover case). When are you available to meet on campus?"
                {...register('description')}
                className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark focus:border-terracotta focus:outline-none leading-relaxed"
              />
              {errors.description && (
                <p className="text-xs text-brick font-medium mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Step 5: Photos & Quick Sample Pickers */}
            <div className="space-y-3 pt-1 border-t border-paper-sand/60 dark:border-paper-sandDark">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-ink dark:text-ink-dark uppercase tracking-wider">
                  Item Photos
                </label>
                <span className="text-[11px] text-ink-muted">Upload or select sample photo</span>
              </div>

              {/* Sample Photo Badges for Instant Picker */}
              <div className="p-3 rounded-xl bg-paper-sand/30 dark:bg-paper-sandDark/30 border border-paper-sand dark:border-paper-sandDark space-y-2">
                <span className="text-[11px] font-bold text-ink dark:text-ink-dark block">
                  📸 Quick Sample Photos (Click to attach without camera):
                </span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_ITEM_PHOTOS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSamplePhoto(sample.url)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                        selectedSampleUrl === sample.url
                          ? 'bg-terracotta text-white border-terracotta'
                          : 'bg-white dark:bg-paper-cardDark text-ink dark:text-ink-dark border-paper-sand hover:border-terracotta'
                      }`}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-2 border-dashed border-paper-sand dark:border-paper-sandDark rounded-xl p-5 text-center hover:bg-paper-sand/10 transition-colors">
                <UploadCloud className="w-7 h-7 text-ink-muted mx-auto mb-1.5" />
                <p className="text-xs text-ink dark:text-ink-dark font-medium">
                  Upload your own device photos
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoChange}
                  className="mt-2 text-xs text-ink-muted file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-paper-sand dark:file:bg-paper-sandDark file:text-ink dark:file:text-ink-dark hover:file:bg-paper-sand/80 cursor-pointer"
                />
              </div>

              {/* Previews Strip */}
              {photoPreviews.length > 0 && (
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {photoPreviews.map((src, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-paper-sand shadow-xs">
                      <img src={src} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 bg-ink/80 hover:bg-ink text-white rounded-full p-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
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
              className="w-full gap-2 font-bold shadow-sm pt-3"
            >
              <PlusCircle className="w-5 h-5" />
              Pin Item to Campus Noticeboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Live Real-Time Noticeboard Card Preview (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink dark:text-ink-dark uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-terracotta" />
              Live Noticeboard Preview
            </span>
            <span className="text-[10px] text-sage font-bold bg-sage/15 px-2 py-0.5 rounded-full">
              Real-time
            </span>
          </div>

          {/* Preview Card */}
          <div className="paper-card p-5 relative overflow-hidden shadow-paper border-2 border-paper-sand dark:border-paper-sandDark space-y-4">
            <div className="pin-dot" />

            {/* Photo preview */}
            <div className="w-full h-44 rounded-xl overflow-hidden bg-paper-sand/30 dark:bg-paper-sandDark/30 relative">
              <img
                src={previewImage}
                alt="Item preview"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-xs">
                {selectedCategoryObj?.name || 'Category'}
              </span>
              <span className="absolute bottom-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/90 dark:bg-black/80 text-ink dark:text-ink-dark shadow-xs">
                {watchCondition === 'LIKE_NEW' ? '✨ Like New' : watchCondition === 'GOOD' ? '👍 Good' : '👌 Fair'}
              </span>
            </div>

            <div>
              <h3 className="font-serif font-bold text-lg text-ink dark:text-ink-dark leading-snug">
                {watchTitle || 'Your Item Title Will Appear Here'}
              </h3>
              <p className="text-xs text-ink-muted dark:text-ink-darkMuted line-clamp-2 mt-1 leading-relaxed">
                {watchDescription || 'Item description and notes about what is included will be displayed here for students on the noticeboard.'}
              </p>
            </div>

            <div className="pt-3 border-t border-paper-sand dark:border-paper-sandDark flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-ink-muted block uppercase tracking-wider">Offline Deposit</span>
                <span className="font-bold text-terracotta text-sm">₹{watchSecurityAmount || 0}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-ink-muted block uppercase tracking-wider">Campus Meeting</span>
                <span className="font-semibold text-ink dark:text-ink-dark text-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-terracotta" />
                  {selectedPointObj?.name || 'Library Steps'}
                </span>
              </div>
            </div>

            {/* Lender badge */}
            <div className="p-2.5 rounded-xl bg-paper-sand/30 dark:bg-paper-sandDark/30 flex items-center gap-2.5">
              <Avatar name={user?.name || 'Campus Student'} size="sm" />
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-ink dark:text-ink-dark truncate">
                  {user?.name || 'You (Verified Campus Student)'}
                </p>
                <p className="text-[10px] text-sage font-semibold">
                  ⭐ 98 Campus Trust Score
                </p>
              </div>
            </div>
          </div>

          {/* Safety & Community Pledge */}
          <div className="p-4 rounded-xl bg-sage/10 border border-sage/30 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-ink dark:text-ink-dark">
              <ShieldCheck className="w-4 h-4 text-sage" />
              <span>Campus Lender Protection</span>
            </div>
            <p className="text-ink-muted dark:text-ink-darkMuted leading-relaxed text-[11px]">
              Every borrow request requires lender approval. You inspect condition together at the campus spot and both confirm the handover via dynamic QR scan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
