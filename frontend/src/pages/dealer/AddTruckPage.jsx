import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import DashboardShell from '../../components/common/DashboardShell';
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
      subtitle="Register a truck with realistic capacity and fuel assumptions so booking and route workflows can target it correctly."
    >
      <div>
        <section className="panel p-6 sm:p-8">
          <h2 className="font-heading text-3xl text-slate-950">Vehicle profile</h2>

          <form className="mt-6 grid gap-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="registrationNo">
                  Registration number
                </label>
                <input className="input-base" id="registrationNo" {...register('registrationNo')} />
                {errors.registrationNo ? (
                  <p className="mt-2 text-sm text-rose-600">{errors.registrationNo.message}</p>
                ) : null}
              </div>
              <div>
                <label className="field-label" htmlFor="truckType">
                  Truck type
                </label>
                <select className="input-base" id="truckType" {...register('truckType')}>
                  {truckTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="maxWeightKg">
                  Max weight (kg)
                </label>
                <input className="input-base" id="maxWeightKg" type="number" {...register('maxWeightKg')} />
              </div>
              <div>
                <label className="field-label" htmlFor="maxVolumeM3">
                  Max volume (m3)
                </label>
                <input className="input-base" id="maxVolumeM3" step="0.1" type="number" {...register('maxVolumeM3')} />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label className="field-label" htmlFor="emissionFactor">
                  Emission factor
                </label>
                <input className="input-base" id="emissionFactor" step="0.01" type="number" {...register('emissionFactor')} />
              </div>
              <div>
                <label className="field-label" htmlFor="fuelEfficiency">
                  Fuel efficiency
                </label>
                <input className="input-base" id="fuelEfficiency" step="0.1" type="number" {...register('fuelEfficiency')} />
              </div>
              <div>
                <label className="field-label" htmlFor="currentCity">
                  Current city
                </label>
                <select className="input-base" id="currentCity" {...register('currentCity')}>
                  {cityOptions.map((city) => (
                    <option key={city.city} value={city.city}>
                      {city.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <button className="btn-primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Adding truck...' : 'Add truck'}
            </button>
          </form>
        </section>
      </div>
    </DashboardShell>
  );
}
