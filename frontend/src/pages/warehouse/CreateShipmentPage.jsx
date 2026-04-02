import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import DashboardShell from '../../components/common/DashboardShell';
import PageTabs from '../../components/common/PageTabs';
import { cityOptions, findCity } from '../../data/logisticsOptions';
import { useAuth } from '../../hooks/useAuth';
import { useShipmentStore } from '../../store/shipmentStore';

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  weightKg: z.coerce.number().positive(),
  volumeM3: z.coerce.number().positive(),
  destCity: z.string().min(2, 'Choose a destination city'),
  destAddress: z.string().min(5, 'Address is required'),
  destLat: z.coerce.number().min(-90).max(90),
  destLng: z.coerce.number().min(-180).max(180),
  deadline: z.string().min(1, 'Deadline is required'),
  fragile: z.boolean().default(false),
  hazardous: z.boolean().default(false),
  priority: z.coerce.number().min(1).max(5),
  specialInstructions: z.string().optional(),
});

function defaultDeadline() {
  const next = new Date(Date.now() + 48 * 60 * 60 * 1000);
  return new Date(next.getTime() - next.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export default function CreateShipmentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const createShipment = useShipmentStore((state) => state.createShipment);
  const error = useShipmentStore((state) => state.error);
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      weightKg: Number(searchParams.get('weightKg') || 1000),
      volumeM3: Number(searchParams.get('volumeM3') || 8),
      destCity: searchParams.get('destCity') || 'Mumbai',
      destAddress: '',
      destLat: cityOptions[3].lat,
      destLng: cityOptions[3].lng,
      deadline: defaultDeadline(),
      fragile: false,
      hazardous: false,
      priority: 2,
      specialInstructions: '',
    },
  });

  const selectedCity = watch('destCity');

  useEffect(() => {
    const city = findCity(selectedCity);
    if (city) {
      setValue('destLat', city.lat);
      setValue('destLng', city.lng);
    }
  }, [selectedCity, setValue]);

  const onSubmit = async (values) => {
    await createShipment({
      ...values,
      deadline: new Date(values.deadline).toISOString(),
    });
    navigate('/warehouse/shipments');
  };

  return (
    <DashboardShell
      accent="text-brand-600"
      eyebrow="Warehouse Flow"
      title="Create shipment"
      subtitle="Add a shipment with enough detail for the booking and trip pipeline to use immediately."
    >
      <PageTabs
        items={[
          { to: '/warehouse/shipments', label: 'Shipment board' },
          { to: '/warehouse/shipments/new', label: 'Create shipment', active: true },
          { to: '/warehouse/bookings', label: 'Bookings' },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="panel p-6 sm:p-8">
          <h2 className="font-heading text-3xl text-slate-950">Dispatch brief</h2>
          <p className="mt-2 text-slate-600">
            Origin details come from your warehouse profile, so this form stays focused on outbound load planning.
          </p>

          <form className="mt-6 grid gap-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="field-label" htmlFor="title">
                Shipment title
              </label>
              <input className="input-base" id="title" {...register('title')} />
              {errors.title ? (
                <p className="mt-2 text-sm text-rose-600">{errors.title.message}</p>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="weightKg">
                  Weight (kg)
                </label>
                <input className="input-base" id="weightKg" type="number" {...register('weightKg')} />
              </div>
              <div>
                <label className="field-label" htmlFor="volumeM3">
                  Volume (m3)
                </label>
                <input className="input-base" id="volumeM3" step="0.1" type="number" {...register('volumeM3')} />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="destCity">
                  Destination city
                </label>
                <select className="input-base" id="destCity" {...register('destCity')}>
                  {cityOptions.map((city) => (
                    <option key={city.city} value={city.city}>
                      {city.city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="deadline">
                  Deadline
                </label>
                <input className="input-base" id="deadline" type="datetime-local" {...register('deadline')} />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="destAddress">
                Destination address
              </label>
              <textarea className="input-base min-h-28" id="destAddress" {...register('destAddress')} />
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label className="field-label" htmlFor="destLat">
                  Latitude
                </label>
                <input className="input-base" id="destLat" step="0.0001" type="number" {...register('destLat')} />
              </div>
              <div>
                <label className="field-label" htmlFor="destLng">
                  Longitude
                </label>
                <input className="input-base" id="destLng" step="0.0001" type="number" {...register('destLng')} />
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
                placeholder="Gate timing, stacking notes, unloading requirements..."
                {...register('specialInstructions')}
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <button className="btn-primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Creating shipment...' : 'Create shipment'}
            </button>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="panel p-6">
            <p className="font-heading text-sm uppercase tracking-[0.3em] text-slate-500">
              Origin
            </p>
            <h3 className="mt-4 font-heading text-2xl text-slate-950">
              {user?.warehouse?.warehouseName || user?.name}
            </h3>
            <p className="mt-2 text-slate-600">{user?.warehouse?.address}</p>
            <p className="mt-1 text-sm text-slate-500">{user?.warehouse?.city}</p>
          </section>

          <section className="panel p-6">
            <p className="font-heading text-sm uppercase tracking-[0.3em] text-slate-500">
              Route preview
            </p>
            <div className="mt-5 rounded-[28px] bg-gradient-to-br from-slate-950 to-freight-700 p-5 text-white">
              <p className="text-sm text-white/70">Current lane</p>
              <p className="mt-2 font-heading text-2xl">
                {user?.warehouse?.city || 'Origin'} to {selectedCity}
              </p>
              <p className="mt-4 text-sm text-white/75">
                Coordinates auto-fill from a supported city list for now. Manual coordinate edits are still available when you need a more precise destination.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </DashboardShell>
  );
}
