import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { AlertCircle } from 'lucide-react';

import DashboardShell from '../../components/common/DashboardShell';
import PageTabs from '../../components/common/PageTabs';
import { cityOptions, findTruckType, truckTypes } from '../../data/logisticsOptions';
import { useAuth } from '../../hooks/useAuth';
import { useTruckStore } from '../../store/truckStore';

const schema = z.object({
  registrationNo: z.string().min(5, 'Registration is required'),
  truckType: z.string().min(2, 'Truck type is required'),
  maxWeightKg: z.coerce.number().positive(),
  maxVolumeM3: z.coerce.number().positive(),
  emissionFactor: z.coerce.number().positive(),
  fuelEfficiency: z.coerce.number().positive(),
  currentCity: z.string().min(2, 'Current city is required'),
});

const inputCls =
  'w-full rounded-lg border border-slate-200 py-2.5 px-3.5 text-sm text-slate-900 outline-none transition-all duration-200 bg-white hover:border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 placeholder:text-slate-400';
const labelCls = 'text-xs font-semibold text-slate-500 block mb-1.5';

export default function AddTruckPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const addTruck = useTruckStore((state) => state.addTruck);
  const error = useTruckStore((state) => state.error);
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      registrationNo: '',
      truckType: 'Heavy Truck',
      maxWeightKg: 16000,
      maxVolumeM3: 65,
      emissionFactor: 2.68,
      fuelEfficiency: 4,
      currentCity: user?.truckDealer?.primaryCity || 'Ahmedabad',
    },
  });

  const selectedTruckType = watch('truckType');

  useEffect(() => {
    const preset = findTruckType(selectedTruckType);
    if (preset) {
      setValue('maxWeightKg', preset.weight);
      setValue('maxVolumeM3', preset.volume);
      setValue('fuelEfficiency', preset.fuelEfficiency);
    }
  }, [selectedTruckType, setValue]);

  const onSubmit = async (values) => {
    await addTruck(values);
    navigate('/dealer/fleet');
  };

  return (
    <DashboardShell
      accent="text-freight-600"
      eyebrow="Dealer Flow"
      title="Add fleet vehicle"
    >
      <PageTabs
        items={[
          { to: '/dealer/fleet', label: 'Fleet' },
          { to: '/dealer/bookings', label: 'Booking requests' },
          { to: '/dealer/analytics', label: 'Analytics' },
          { to: '/dealer/return-loads', label: 'Return loads' },
        ]}
      />

      <div className="max-w-3xl mx-auto w-full">
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="font-heading text-base font-semibold text-slate-900">Vehicle profile</h2>
          </div>

          <form className="p-6 grid gap-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls} htmlFor="registrationNo">
                  Registration number
                </label>
                <input className={inputCls} id="registrationNo" {...register('registrationNo')} />
                {errors.registrationNo ? (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                    <AlertCircle className="h-3 w-3" />{errors.registrationNo.message}
                  </p>
                ) : null}
              </div>
              <div>
                <label className={labelCls} htmlFor="truckType">
                  Truck type
                </label>
                <select className={inputCls} id="truckType" {...register('truckType')}>
                  {truckTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls} htmlFor="maxWeightKg">
                  Max weight (kg)
                </label>
                <input className={inputCls} id="maxWeightKg" type="number" {...register('maxWeightKg')} />
              </div>
              <div>
                <label className={labelCls} htmlFor="maxVolumeM3">
                  Max volume (m³)
                </label>
                <input className={inputCls} id="maxVolumeM3" step="0.1" type="number" {...register('maxVolumeM3')} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelCls} htmlFor="emissionFactor">
                  Emission factor
                </label>
                <input className={inputCls} id="emissionFactor" step="0.01" type="number" {...register('emissionFactor')} />
              </div>
              <div>
                <label className={labelCls} htmlFor="fuelEfficiency">
                  Fuel efficiency
                </label>
                <input className={inputCls} id="fuelEfficiency" step="0.1" type="number" {...register('fuelEfficiency')} />
              </div>
              <div>
                <label className={labelCls} htmlFor="currentCity">
                  Current city
                </label>
                <select className={inputCls} id="currentCity" {...register('currentCity')}>
                  {cityOptions.map((city) => (
                    <option key={city.city} value={city.city}>
                      {city.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />{error}
              </div>
            ) : null}

            <button
              className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-700 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Adding truck...' : 'Add truck'}
            </button>
          </form>
        </section>
      </div>
    </DashboardShell>
  );
}
