import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import {
  Package, MapPin, Zap, CheckCircle, Check,
  ChevronRight, ChevronDown, ArrowRight, ArrowLeft,
  Rocket, AlertCircle,
} from 'lucide-react';

import DashboardShell from '../../components/common/DashboardShell';
import PageTabs from '../../components/common/PageTabs';
import { cityOptions, findCity } from '../../data/logisticsOptions';
import { useAuth } from '../../hooks/useAuth';
import { useShipmentStore } from '../../store/shipmentStore';

// ─── Static config ─────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Shipment Brief',   icon: Package  },
  { id: 2, label: 'Pickup & Delivery', icon: MapPin   },
  { id: 3, label: 'Review & Dispatch', icon: Rocket   },
];

// Fields validated per step (used with react-hook-form trigger)
const STEP_FIELDS = {
  1: ['title', 'weightKg', 'volumeM3', 'shipmentType', 'priority'],
  2: ['pickupCity', 'pickupAddress', 'pickupDeadline', 'deliveryCity', 'deliveryAddress', 'deliveryDeadline'],
  3: [],
};

const shipmentTypeChips = [
  { value: 'STANDARD',             label: 'Standard',     emoji: '📦' },
  { value: 'FRAGILE',              label: 'Fragile',       emoji: '🔮' },
  { value: 'HAZARDOUS',            label: 'Hazardous',     emoji: '⚠️' },
  { value: 'TEMPERATURE_CONTROLLED', label: 'Temp Control', emoji: '❄️' },
  { value: 'EXPRESS',              label: 'Express',       emoji: '⚡' },
  { value: 'BULK',                 label: 'Bulk',          emoji: '🏗️' },
];

const priorityLevels = [
  { val: 1, label: 'Normal',   color: 'bg-slate-100  text-slate-600  border-slate-200  ring-slate-300'  },
  { val: 2, label: 'Planned',  color: 'bg-blue-50    text-blue-600   border-blue-100   ring-blue-300'   },
  { val: 3, label: 'High',     color: 'bg-amber-50   text-amber-600  border-amber-100  ring-amber-300'  },
  { val: 4, label: 'Urgent',   color: 'bg-orange-50  text-orange-600 border-orange-100 ring-orange-300' },
  { val: 5, label: 'Critical', color: 'bg-rose-50    text-rose-600   border-rose-100   ring-rose-300'   },
];

// ─── Validation schema ─────────────────────────────────────────────────────────

const schema = z.object({
  title:               z.string().min(2, 'Title is required'),
  description:         z.string().optional(),
  pickupCity:          z.string().min(2, 'Pickup city is required'),
  pickupAddress:       z.string().min(5, 'Pickup address is required'),
  pickupLat:           z.coerce.number().min(-90).max(90),
  pickupLng:           z.coerce.number().min(-180).max(180),
  pickupDeadline:      z.string().min(1, 'Pickup deadline is required'),
  deliveryCity:        z.string().min(2, 'Delivery city is required'),
  deliveryAddress:     z.string().min(5, 'Delivery address is required'),
  deliveryLat:         z.coerce.number().min(-90).max(90),
  deliveryLng:         z.coerce.number().min(-180).max(180),
  deliveryDeadline:    z.string().min(1, 'Delivery deadline is required'),
  weightKg:            z.coerce.number().positive('Weight is required'),
  volumeM3:            z.coerce.number().positive('Volume is required'),
  shipmentType:        z.enum(['STANDARD','FRAGILE','HAZARDOUS','TEMPERATURE_CONTROLLED','EXPRESS','BULK']),
  fragile:             z.boolean().default(false),
  hazardous:           z.boolean().default(false),
  priority:            z.coerce.number().min(1).max(5),
  specialInstructions: z.string().optional(),
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

function toLocalInputValue(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
const defaultPickupDeadline   = () => toLocalInputValue(new Date(Date.now() + 12 * 60 * 60 * 1000));
const defaultDeliveryDeadline = () => toLocalInputValue(new Date(Date.now() + 48 * 60 * 60 * 1000));

// ─── Style tokens ──────────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-900 outline-none transition-all duration-200 bg-white hover:border-slate-300 focus:border-freight-500 focus:ring-3 focus:ring-freight-500/10 placeholder:text-slate-400';
const labelCls = 'text-xs font-semibold text-slate-500 block mb-1.5';

// ─── Sub-components ────────────────────────────────────────────────────────────

function StepIndicator({ currentStep, completedSteps }) {
  const progress = currentStep === 1 ? 0 : currentStep === 2 ? 50 : 100;

  return (
    <div className="space-y-4">
      {/* Step dots */}
      <div className="flex items-center justify-between w-full">
        {STEPS.map((step, idx) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent   = currentStep === step.id;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-freight-600 text-white shadow-sm shadow-freight-300'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <span className={`text-[0.65rem] font-semibold whitespace-nowrap ${
                  isCurrent ? 'text-freight-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 mx-3 mb-5">
                  <div className={`h-[2px] w-full rounded-full transition-all duration-500 ${
                    completedSteps.includes(step.id) ? 'bg-emerald-400' : 'bg-slate-200'
                  }`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-freight-500 to-emerald-500 transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function ReviewRow({ label, value, highlight }) {
  return (
    <div className={`rounded-xl border px-4 py-3 transition-all ${
      highlight ? 'border-freight-200 bg-freight-50/50' : 'border-slate-100 bg-slate-50/50'
    }`}>
      <p className={labelCls}>{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function CreateShipmentPage() {
  const navigate       = useNavigate();
  const { user }       = useAuth();
  const createShipment = useShipmentStore((s) => s.createShipment);

  const [currentStep,    setCurrentStep]    = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [slideDir,       setSlideDir]       = useState('right'); // 'right' | 'left'
  const [isAnimating,    setIsAnimating]    = useState(false);
  const [submitError,    setSubmitError]    = useState(null);
  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const [showCoords,     setShowCoords]     = useState(false);
  const [showAdvanced,   setShowAdvanced]   = useState(false);
  const formRef = useRef(null);

  const warehouseCity     = user?.warehouse?.city || cityOptions[0].city;
  const warehouseLocation = findCity(warehouseCity) || cityOptions[0];

  const {
    register, watch, setValue, handleSubmit, trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      title:               '',
      description:         '',
      pickupCity:          warehouseCity,
      pickupAddress:       user?.warehouse?.address || '',
      pickupLat:           warehouseLocation.lat,
      pickupLng:           warehouseLocation.lng,
      pickupDeadline:      defaultPickupDeadline(),
      deliveryCity:        'Mumbai',
      deliveryAddress:     '',
      deliveryLat:         (findCity('Mumbai') || cityOptions[0]).lat,
      deliveryLng:         (findCity('Mumbai') || cityOptions[0]).lng,
      deliveryDeadline:    defaultDeliveryDeadline(),
      weightKg:            1000,
      volumeM3:            8,
      shipmentType:        'STANDARD',
      fragile:             false,
      hazardous:           false,
      priority:            2,
      specialInstructions: '',
    },
  });

  // Watched values
  const title            = watch('title');
  const pickupCity       = watch('pickupCity');
  const pickupAddress    = watch('pickupAddress');
  const deliveryCity     = watch('deliveryCity');
  const deliveryAddress  = watch('deliveryAddress');
  const weightKg         = Number(watch('weightKg')   || 0);
  const volumeM3         = Number(watch('volumeM3')   || 0);
  const shipmentType     = watch('shipmentType');
  const pickupDeadline   = watch('pickupDeadline');
  const deliveryDeadline = watch('deliveryDeadline');
  const fragile          = Boolean(watch('fragile'));
  const hazardous        = Boolean(watch('hazardous'));
  const priority         = Number(watch('priority')   || 0);

  // Auto-update coordinates
  useEffect(() => {
    const city = findCity(pickupCity);
    if (city) { setValue('pickupLat', city.lat); setValue('pickupLng', city.lng); }
  }, [pickupCity, setValue]);

  useEffect(() => {
    const city = findCity(deliveryCity);
    if (city) { setValue('deliveryLat', city.lat); setValue('deliveryLng', city.lng); }
  }, [deliveryCity, setValue]);

  const shipmentTypeChip  = shipmentTypeChips.find((c) => c.value === shipmentType);
  const priorityChip      = priorityLevels.find((p) => p.val === priority);

  // ── Navigation ───────────────────────────────────────────────────────────────

  const goToStep = async (targetStep) => {
    if (isAnimating) return;

    if (targetStep > currentStep) {
      // Validate current step fields before advancing
      const fields  = STEP_FIELDS[currentStep];
      const isValid = fields.length ? await trigger(fields) : true;
      if (!isValid) return;

      // Mark current as completed
      setCompletedSteps((prev) => [...new Set([...prev, currentStep])]);
    }

    setSlideDir(targetStep > currentStep ? 'right' : 'left');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(targetStep);
      setIsAnimating(false);
      // Scroll form top
      formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  };

  const goNext = () => goToStep(currentStep + 1);
  const goBack = () => goToStep(currentStep - 1);

  // ── Submit ───────────────────────────────────────────────────────────────────

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createShipment({
        ...values,
        pickupDeadline:   new Date(values.pickupDeadline).toISOString(),
        deliveryDeadline: new Date(values.deliveryDeadline).toISOString(),
      });
      navigate(`/warehouse/shipments/${created.id}`);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  });

  // ── Slide animation class ─────────────────────────────────────────────────────

  const slideClass = isAnimating
    ? slideDir === 'right'
      ? 'opacity-0 translate-x-4'
      : 'opacity-0 -translate-x-4'
    : 'opacity-100 translate-x-0';

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <DashboardShell
      accent="text-freight-600"
      eyebrow="Warehouse Flow"
      title="Create workspace"
      subtitle="Complete each step to build, price, and dispatch your shipment to the top 10 optimized dealers automatically."
    >
      <PageTabs
        items={[
          { to: '/warehouse/shipments',         label: 'Shipment board' },
          { to: '/warehouse/shipments/history', label: 'Shipment history' },
          { to: '/warehouse/shipments/new',     label: 'Create workspace', active: true },
          { to: '/warehouse/bookings',          label: 'Bookings' },
          { to: '/warehouse/truck-estimation',  label: 'Truck estimation' },
        ]}
      />

      {/* ── Single-column centered layout ─────────────────────────────────── */}
      <div className="max-w-3xl mx-auto w-full">
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col overflow-hidden">

          {/* ── Step indicator (inline header) ────────────────────────────── */}
          <div className="border-b border-slate-100 px-6 sm:px-8 pt-6 pb-5">
            <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />
          </div>

          {/* ── Scrollable form area ──────────────────────────────────────── */}
          <div
            ref={formRef}
            className="flex-1 overflow-y-auto custom-scrollbar"
          >
            <form className="p-6 sm:p-8" onSubmit={(e) => e.preventDefault()}>
              <div className={`transition-all duration-200 ease-out ${slideClass}`}>

                {/* ════ STEP 1: Shipment Brief ════════════════════════════════ */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    {/* Section header */}
                    <div>
                      <h2 className="font-heading text-xl font-bold text-slate-900">Shipment brief</h2>
                      <p className="mt-1 text-sm text-slate-500">What you're shipping — load profile, type, and handling.</p>
                    </div>

                    {/* ── Basics group ──────────────────────────────────────── */}
                    <div className="space-y-4">
                      {/* Title */}
                      <div>
                        <label className={labelCls} htmlFor="title">Shipment title <span className="text-rose-400">*</span></label>
                        <input className={inputCls} id="title" placeholder="e.g. Mumbai steel coils batch 12" {...register('title')} />
                        {errors.title && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                            <AlertCircle className="h-3 w-3" />{errors.title.message}
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <label className={labelCls} htmlFor="description">Description <span className="text-slate-300 font-normal">optional</span></label>
                        <textarea className={`${inputCls} min-h-[72px] resize-none`} id="description" placeholder="Any context the dealer should know..." {...register('description')} />
                      </div>

                      {/* Weight + Volume — side by side */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className={labelCls} htmlFor="weightKg">Weight (kg) <span className="text-rose-400">*</span></label>
                          <input className={inputCls} id="weightKg" type="number" {...register('weightKg')} />
                          {errors.weightKg && (
                            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                              <AlertCircle className="h-3 w-3" />{errors.weightKg.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className={labelCls} htmlFor="volumeM3">Volume (m³) <span className="text-rose-400">*</span></label>
                          <input className={inputCls} id="volumeM3" step="0.1" type="number" {...register('volumeM3')} />
                          {errors.volumeM3 && (
                            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                              <AlertCircle className="h-3 w-3" />{errors.volumeM3.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── Classification group ─────────────────────────────── */}
                    <div className="space-y-4">
                      {/* Shipment type — compact horizontal pills */}
                      <div>
                        <p className={labelCls}>Shipment type <span className="text-rose-400">*</span></p>
                        <input type="hidden" {...register('shipmentType')} />
                        <div className="flex flex-wrap gap-2">
                          {shipmentTypeChips.map((chip) => {
                            const isSelected = shipmentType === chip.value;
                            return (
                              <button
                                key={chip.value}
                                type="button"
                                onClick={() => setValue('shipmentType', chip.value, { shouldValidate: true })}
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                                  isSelected
                                    ? 'border-freight-400 bg-freight-50 text-freight-700 ring-2 ring-freight-400/20 shadow-sm'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                <span className="text-sm">{chip.emoji}</span>
                                {chip.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Priority — compact pills */}
                      <div>
                        <p className={labelCls}>Priority level</p>
                        <input type="hidden" {...register('priority')} />
                        <div className="flex flex-wrap gap-2">
                          {priorityLevels.map(({ val, label, color }) => {
                            const isSelected = priority === val;
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setValue('priority', val, { shouldValidate: true })}
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${color} ${
                                  isSelected ? 'ring-2 ring-offset-1 shadow-sm' : 'opacity-50 hover:opacity-80'
                                }`}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* ── Special handling (collapsed by default) ──────────── */}
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setShowAdvanced((v) => !v)}
                        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                      >
                        <span className="text-xs font-semibold text-slate-500">Special handling & instructions</span>
                        {showAdvanced ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                      </button>
                      {showAdvanced && (
                        <div className="border-t border-slate-100 px-4 py-4 space-y-4">
                          {/* Fragile + Hazardous */}
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50">
                              <input className="h-4 w-4 rounded border-slate-300 text-freight-600 focus:ring-freight-500" type="checkbox" {...register('fragile')} />
                              <span className="text-sm text-slate-700">🔮 Fragile handling</span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50">
                              <input className="h-4 w-4 rounded border-slate-300 text-freight-600 focus:ring-freight-500" type="checkbox" {...register('hazardous')} />
                              <span className="text-sm text-slate-700">⚠️ Hazardous cargo</span>
                            </label>
                          </div>

                          {/* Special instructions */}
                          <div>
                            <label className={labelCls} htmlFor="specialInstructions">Special instructions</label>
                            <textarea
                              className={`${inputCls} min-h-[72px] resize-none`}
                              id="specialInstructions"
                              placeholder="Gate timing, unloading rules, stack limits, documents..."
                              {...register('specialInstructions')}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ════ STEP 2: Pickup & Delivery ══════════════════════════════ */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-heading text-xl font-bold text-slate-900">Pickup & delivery</h2>
                      <p className="mt-1 text-sm text-slate-500">Origin, destination, and deadlines for this lane.</p>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                      {/* Pickup — left accent border */}
                      <div className="rounded-xl border border-slate-200 border-l-4 border-l-freight-500 bg-white p-5 space-y-4">
                        <p className="text-xs font-semibold text-freight-600 uppercase tracking-wide">Origin · Pickup</p>
                        <div>
                          <label className={labelCls}>City <span className="text-rose-400">*</span></label>
                          <select className={inputCls} {...register('pickupCity')}>
                            {cityOptions.map((c) => <option key={c.city} value={c.city}>{c.city}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Address <span className="text-rose-400">*</span></label>
                          <textarea className={`${inputCls} min-h-[72px] resize-none`} {...register('pickupAddress')} />
                          {errors.pickupAddress && (
                            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                              <AlertCircle className="h-3 w-3" />{errors.pickupAddress.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className={labelCls}>Pickup deadline <span className="text-rose-400">*</span></label>
                          <input className={inputCls} type="datetime-local" {...register('pickupDeadline')} />
                        </div>
                      </div>

                      {/* Delivery — left accent border */}
                      <div className="rounded-xl border border-slate-200 border-l-4 border-l-slate-700 bg-white p-5 space-y-4">
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Destination · Delivery</p>
                        <div>
                          <label className={labelCls}>City <span className="text-rose-400">*</span></label>
                          <select className={inputCls} {...register('deliveryCity')}>
                            {cityOptions.map((c) => <option key={c.city} value={c.city}>{c.city}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Address <span className="text-rose-400">*</span></label>
                          <textarea className={`${inputCls} min-h-[72px] resize-none`} {...register('deliveryAddress')} />
                          {errors.deliveryAddress && (
                            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                              <AlertCircle className="h-3 w-3" />{errors.deliveryAddress.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className={labelCls}>Delivery deadline <span className="text-rose-400">*</span></label>
                          <input className={inputCls} type="datetime-local" {...register('deliveryDeadline')} />
                        </div>
                      </div>
                    </div>

                    {/* Collapsible coordinates */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowCoords((v) => !v)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showCoords ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        Advanced coordinates
                      </button>
                      {showCoords && (
                        <div className="mt-3 grid gap-3 sm:grid-cols-4">
                          {[
                            { id: 'pickupLat',   label: 'Pickup lat',   key: 'pickupLat'   },
                            { id: 'pickupLng',   label: 'Pickup lng',   key: 'pickupLng'   },
                            { id: 'deliveryLat', label: 'Delivery lat', key: 'deliveryLat' },
                            { id: 'deliveryLng', label: 'Delivery lng', key: 'deliveryLng' },
                          ].map(({ id, label, key }) => (
                            <div key={id}>
                              <label className={labelCls} htmlFor={id}>{label}</label>
                              <input className={inputCls} id={id} step="0.0001" type="number" {...register(key)} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ════ STEP 3: Review & Dispatch ══════════════════════════════ */}
                {currentStep === 3 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-heading text-xl font-bold text-slate-900">Review & dispatch</h2>
                      <p className="mt-1 text-sm text-slate-500">Confirm details below. The platform will price it and invite the top 10 dealers.</p>
                    </div>

                    {/* Review grid */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ReviewRow label="Shipment title" value={title || '—'} highlight />
                      <ReviewRow label="Load profile" value={`${weightKg} kg · ${volumeM3} m³`} />
                      <ReviewRow label="Type" value={`${shipmentTypeChip?.emoji} ${shipmentTypeChip?.label}`} />
                      <ReviewRow label="Priority" value={priorityChip?.label || '—'} />
                    </div>

                    {/* Lane visualization */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                      <p className={labelCls}>Lane</p>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="text-center min-w-0">
                          <span className="flex h-2.5 w-2.5 mx-auto rounded-full bg-freight-500 mb-1" />
                          <p className="text-sm font-bold text-slate-900">{pickupCity}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[140px]">{pickupAddress}</p>
                        </div>
                        <div className="flex-1 flex items-center gap-1">
                          <div className="flex-1 h-px bg-gradient-to-r from-freight-300 to-slate-300" />
                          <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                        </div>
                        <div className="text-center min-w-0">
                          <span className="flex h-2.5 w-2.5 mx-auto rounded-full bg-slate-700 mb-1" />
                          <p className="text-sm font-bold text-slate-900">{deliveryCity}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[140px]">{deliveryAddress}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <ReviewRow label="Pickup deadline" value={pickupDeadline ? new Date(pickupDeadline).toLocaleString() : '—'} />
                      <ReviewRow label="Delivery deadline" value={deliveryDeadline ? new Date(deliveryDeadline).toLocaleString() : '—'} />
                    </div>

                    {(fragile || hazardous) && (
                      <div className="flex flex-wrap gap-2">
                        {fragile   && <span className="inline-flex items-center rounded-full bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-xs font-semibold text-purple-600">🔮 Fragile</span>}
                        {hazardous && <span className="inline-flex items-center rounded-full bg-orange-50 border border-orange-200 px-2.5 py-0.5 text-xs font-semibold text-orange-600">⚠️ Hazardous</span>}
                      </div>
                    )}

                    {submitError && (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />{submitError}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </form>
          </div>

          {/* ── Dispatching overlay ──────────────────────────────────────── */}
          {isSubmitting && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl bg-white/95 backdrop-blur-sm">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-[3px] border-slate-200" />
                <div className="absolute inset-0 h-12 w-12 rounded-full border-[3px] border-emerald-500 border-t-transparent animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-900">Dispatching shipment…</p>
                <p className="mt-1 text-xs text-slate-500">Pricing, optimizing dealers, and sending invitations</p>
              </div>
            </div>
          )}

          {/* ── Step navigation footer ─────────────────────────────────────── */}
          <div className="flex-none border-t border-slate-100 px-6 sm:px-8 py-4 flex items-center justify-between gap-4 bg-white">
            {/* Back */}
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={goBack}
                disabled={isSubmitting}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {/* Next / Submit */}
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-freight-600 px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-freight-700 hover:shadow-md"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Rocket className="h-4 w-4" />
                {isSubmitting ? 'Dispatching…' : 'Confirm & dispatch'}
              </button>
            )}
          </div>

        </section>
      </div>
    </DashboardShell>
  );
}
