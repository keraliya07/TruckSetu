import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import DashboardShell from '../../components/common/DashboardShell';
import PageTabs from '../../components/common/PageTabs';
import { cityOptions, findCity } from '../../data/logisticsOptions';
import { useAuth } from '../../hooks/useAuth';
import { useShipmentStore } from '../../store/shipmentStore';

const shipmentTypeOptions = [
  { value: 'STANDARD', label: 'Standard' },
  { value: 'FRAGILE', label: 'Fragile' },
  { value: 'HAZARDOUS', label: 'Hazardous' },
  { value: 'TEMPERATURE_CONTROLLED', label: 'Temperature controlled' },
  { value: 'EXPRESS', label: 'Express' },
  { value: 'BULK', label: 'Bulk' },
];

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  pickupCity: z.string().min(2, 'Pickup city is required'),
  pickupAddress: z.string().min(5, 'Pickup address is required'),
  pickupLat: z.coerce.number().min(-90).max(90),
  pickupLng: z.coerce.number().min(-180).max(180),
  pickupDeadline: z.string().min(1, 'Pickup deadline is required'),
  deliveryCity: z.string().min(2, 'Delivery city is required'),
  deliveryAddress: z.string().min(5, 'Delivery address is required'),
  deliveryLat: z.coerce.number().min(-90).max(90),
  deliveryLng: z.coerce.number().min(-180).max(180),
  deliveryDeadline: z.string().min(1, 'Delivery deadline is required'),
  weightKg: z.coerce.number().positive('Weight is required'),
  volumeM3: z.coerce.number().positive('Volume is required'),
  shipmentType: z.enum([
    'STANDARD',
    'FRAGILE',
    'HAZARDOUS',
    'TEMPERATURE_CONTROLLED',
    'EXPRESS',
    'BULK',
  ]),
  fragile: z.boolean().default(false),
  hazardous: z.boolean().default(false),
  priority: z.coerce.number().min(1).max(5),
  specialInstructions: z.string().optional(),
});

function toLocalInputValue(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

function defaultPickupDeadline() {
  return toLocalInputValue(new Date(Date.now() + 12 * 60 * 60 * 1000));
}

function defaultDeliveryDeadline() {
  return toLocalInputValue(new Date(Date.now() + 48 * 60 * 60 * 1000));
}

export default function CreateShipmentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createShipment = useShipmentStore((state) => state.createShipment);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const warehouseCity = user?.warehouse?.city || cityOptions[0].city;
  const warehouseLocation = findCity(warehouseCity) || cityOptions[0];

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      pickupCity: warehouseCity,
      pickupAddress: user?.warehouse?.address || '',
      pickupLat: warehouseLocation.lat,
      pickupLng: warehouseLocation.lng,
      pickupDeadline: defaultPickupDeadline(),
      deliveryCity: 'Mumbai',
      deliveryAddress: '',
      deliveryLat: (findCity('Mumbai') || cityOptions[0]).lat,
      deliveryLng: (findCity('Mumbai') || cityOptions[0]).lng,
      deliveryDeadline: defaultDeliveryDeadline(),
      weightKg: 1000,
      volumeM3: 8,
      shipmentType: 'STANDARD',
      fragile: false,
      hazardous: false,
      priority: 2,
      specialInstructions: '',
    },
  });

  const pickupCity = watch('pickupCity');
  const deliveryCity = watch('deliveryCity');
  const title = watch('title');
  const weightKg = Number(watch('weightKg') || 0);
  const volumeM3 = Number(watch('volumeM3') || 0);
  const shipmentType = watch('shipmentType');
  const pickupDeadline = watch('pickupDeadline');
  const deliveryDeadline = watch('deliveryDeadline');
  const fragile = Boolean(watch('fragile'));
  const hazardous = Boolean(watch('hazardous'));
  const priority = Number(watch('priority') || 0);

  useEffect(() => {
    const city = findCity(pickupCity);
    if (city) {
      setValue('pickupLat', city.lat);
      setValue('pickupLng', city.lng);
    }
  }, [pickupCity, setValue]);

  useEffect(() => {
    const city = findCity(deliveryCity);
    if (city) {
      setValue('deliveryLat', city.lat);
      setValue('deliveryLng', city.lng);
    }
  }, [deliveryCity, setValue]);

  const shipmentTypeLabel = useMemo(
    () =>
      shipmentTypeOptions.find((option) => option.value === shipmentType)?.label || shipmentType,
    [shipmentType]
  );

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const createdShipment = await createShipment({
        ...values,
        pickupDeadline: new Date(values.pickupDeadline).toISOString(),
        deliveryDeadline: new Date(values.deliveryDeadline).toISOString(),
      });

      navigate(`/warehouse/shipments/${createdShipment.id}`);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <DashboardShell
      accent="text-brand-600"
      eyebrow="Warehouse Flow"
      title="Create shipment"
      subtitle="Capture the shipment once, then let the platform price it, fetch the best dealer matches, and send the request to the top 10 optimized dealers automatically."
    >
      <PageTabs
        items={[
          { to: '/warehouse/shipments', label: 'Shipment board' },
          { to: '/warehouse/shipments/history', label: 'Shipment history' },
          { to: '/warehouse/shipments/new', label: 'Create shipment', active: true },
          { to: '/warehouse/bookings', label: 'Bookings' },
          { to: '/warehouse/truck-estimation', label: 'Truck estimation' },
        ]}
      />

      <div className="space-y-6">
        <section className="panel p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-heading text-sm uppercase tracking-[0.3em] text-slate-500">
                Auto dispatch flow
              </p>
              <h2 className="mt-2 font-heading text-3xl text-slate-950">
                Create, price, optimize, and invite
              </h2>
            </div>
            <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Shipment price and dealer requests are generated by the platform after submit.
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Step 1</p>
              <p className="mt-2 font-semibold text-slate-900">Enter shipment details</p>
              <p className="mt-1 text-sm text-slate-600">
                Pickup, delivery, deadlines, load, and shipment type.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Step 2</p>
              <p className="mt-2 font-semibold text-slate-900">System generates price</p>
              <p className="mt-1 text-sm text-slate-600">
                Pricing is based on distance, weight, volume, and shipment type.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Step 3</p>
              <p className="mt-2 font-semibold text-slate-900">Top 10 dealers are invited</p>
              <p className="mt-1 text-sm text-slate-600">
                Only optimized dealer requests are sent, and the first acceptance wins.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <section className="panel p-6 sm:p-8">
            <form className="grid gap-6" onSubmit={(event) => event.preventDefault()}>
              <div>
                <p className="font-heading text-sm uppercase tracking-[0.3em] text-slate-500">
                  Step 1 of 3
                </p>
                <h2 className="mt-2 font-heading text-3xl text-slate-950">Shipment brief</h2>
              </div>

              <div>
                <label className="field-label" htmlFor="title">
                  Shipment title
                </label>
                <input className="input-base" id="title" {...register('title')} />
                {errors.title ? (
                  <p className="mt-2 text-sm text-rose-600">{errors.title.message}</p>
                ) : null}
              </div>

              <div>
                <label className="field-label" htmlFor="description">
                  Description
                </label>
                <textarea className="input-base min-h-24" id="description" {...register('description')} />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="weightKg">
                    Shipment weight (kg)
                  </label>
                  <input className="input-base" id="weightKg" type="number" {...register('weightKg')} />
                  {errors.weightKg ? (
                    <p className="mt-2 text-sm text-rose-600">{errors.weightKg.message}</p>
                  ) : null}
                </div>
                <div>
                  <label className="field-label" htmlFor="volumeM3">
                    Shipment volume (m3)
                  </label>
                  <input
                    className="input-base"
                    id="volumeM3"
                    step="0.1"
                    type="number"
                    {...register('volumeM3')}
                  />
                  {errors.volumeM3 ? (
                    <p className="mt-2 text-sm text-rose-600">{errors.volumeM3.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="shipmentType">
                    Shipment type
                  </label>
                  <select className="input-base" id="shipmentType" {...register('shipmentType')}>
                    {shipmentTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label" htmlFor="priority">
                    Priority
                  </label>
                  <select className="input-base" id="priority" {...register('priority')}>
                    <option value={1}>1 - Normal</option>
                    <option value={2}>2 - Planned</option>
                    <option value={3}>3 - High</option>
                    <option value={4}>4 - Urgent</option>
                    <option value={5}>5 - Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                  <input className="mr-3" type="checkbox" {...register('fragile')} />
                  Fragile handling required
                </label>
                <label className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                  <input className="mr-3" type="checkbox" {...register('hazardous')} />
                  Hazardous cargo
                </label>
              </div>

              <div>
                <label className="field-label" htmlFor="specialInstructions">
                  Special instructions
                </label>
                <textarea
                  className="input-base min-h-24"
                  id="specialInstructions"
                  placeholder="Gate timing, unloading rules, stack limits, documents..."
                  {...register('specialInstructions')}
                />
              </div>

              <div>
                <p className="font-heading text-sm uppercase tracking-[0.3em] text-slate-500">
                  Step 2 of 3
                </p>
                <h2 className="mt-2 font-heading text-3xl text-slate-950">Pickup and delivery</h2>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pickup</p>

                  <div className="mt-4 grid gap-4">
                    <label>
                      <span className="field-label">Pickup city</span>
                      <select className="input-base" {...register('pickupCity')}>
                        {cityOptions.map((city) => (
                          <option key={city.city} value={city.city}>
                            {city.city}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span className="field-label">Pickup address</span>
                      <textarea className="input-base min-h-24" {...register('pickupAddress')} />
                    </label>

                    <label>
                      <span className="field-label">Pickup deadline</span>
                      <input className="input-base" type="datetime-local" {...register('pickupDeadline')} />
                    </label>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Delivery</p>

                  <div className="mt-4 grid gap-4">
                    <label>
                      <span className="field-label">Delivery city</span>
                      <select className="input-base" {...register('deliveryCity')}>
                        {cityOptions.map((city) => (
                          <option key={city.city} value={city.city}>
                            {city.city}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span className="field-label">Delivery address</span>
                      <textarea className="input-base min-h-24" {...register('deliveryAddress')} />
                    </label>

                    <label>
                      <span className="field-label">Delivery deadline</span>
                      <input className="input-base" type="datetime-local" {...register('deliveryDeadline')} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-4">
                <div>
                  <label className="field-label" htmlFor="pickupLat">
                    Pickup lat
                  </label>
                  <input className="input-base" id="pickupLat" step="0.0001" type="number" {...register('pickupLat')} />
                </div>
                <div>
                  <label className="field-label" htmlFor="pickupLng">
                    Pickup lng
                  </label>
                  <input className="input-base" id="pickupLng" step="0.0001" type="number" {...register('pickupLng')} />
                </div>
                <div>
                  <label className="field-label" htmlFor="deliveryLat">
                    Delivery lat
                  </label>
                  <input className="input-base" id="deliveryLat" step="0.0001" type="number" {...register('deliveryLat')} />
                </div>
                <div>
                  <label className="field-label" htmlFor="deliveryLng">
                    Delivery lng
                  </label>
                  <input className="input-base" id="deliveryLng" step="0.0001" type="number" {...register('deliveryLng')} />
                </div>
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <section className="panel p-6">
              <p className="font-heading text-sm uppercase tracking-[0.3em] text-slate-500">
                Step 3 of 3
              </p>
              <h2 className="mt-2 font-heading text-3xl text-slate-950">System handoff</h2>
              <p className="mt-3 text-sm text-slate-600">
                After you create the shipment, the platform will price it, fetch eligible truck
                dealers, rank them, and send requests only to the first 10 optimized matches.
              </p>

              <div className="mt-5 grid gap-4">
                <div className="rounded-3xl bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Shipment</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {title || 'Untitled shipment'}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {pickupCity} to {deliveryCity}
                  </p>
                </div>

                <div className="rounded-3xl bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Load profile</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {weightKg} kg and {volumeM3} m3
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{shipmentTypeLabel}</p>
                </div>

                <div className="rounded-3xl bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Timing</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    Pickup {pickupDeadline ? new Date(pickupDeadline).toLocaleString() : 'Not set'}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Delivery {deliveryDeadline ? new Date(deliveryDeadline).toLocaleString() : 'Not set'}
                  </p>
                </div>

                <div className="rounded-3xl bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Handling</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {fragile ? 'Fragile' : 'Standard'} / {hazardous ? 'Hazardous' : 'Non-hazardous'}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">Priority {priority}</p>
                </div>
              </div>

              <button
                className="btn-primary mt-6 w-full"
                disabled={isSubmitting}
                onClick={onSubmit}
                type="button"
              >
                {isSubmitting
                  ? 'Creating shipment and sending requests...'
                  : 'Create shipment and send top 10 requests'}
              </button>

              <p className="mt-4 text-sm text-slate-600">
                Dealers can only accept or reject. Counter offers are disabled in this workflow.
              </p>

              {submitError ? (
                <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {submitError}
                </div>
              ) : null}
            </section>
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}
