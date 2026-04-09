import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { truckFitEstimate } from '../../api/optimization.api';
import { cityOptions } from '../../data/logisticsOptions';
import { formatCurrency, formatNumber } from '../../utils/formatters';

const schema = z.object({
  weightKg: z.coerce.number().positive(),
  volumeM3: z.coerce.number().positive(),
  originCity: z.string().min(2),
  destCity: z.string().min(2),
});

export default function TruckFitCalculator({ defaultOriginCity }) {
  const [result, setResult] = useState(null);
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      weightKg: 1200,
      volumeM3: 10,
      originCity: defaultOriginCity || 'Ahmedabad',
      destCity: 'Mumbai',
    },
  });

  useEffect(() => {
    if (defaultOriginCity) {
      setValue('originCity', defaultOriginCity);
    }
  }, [defaultOriginCity, setValue]);

  const onSubmit = async (formValues) => {
    setServerError('');

    try {
      const response = await truckFitEstimate(formValues);
      setResult(response);
    } catch (error) {
      setServerError(error.message);
    }
  };

  return (
    <section className="panel p-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Truck fit</p>
        <h3 className="mt-2 font-heading text-3xl text-slate-950">
          Truck estimation check
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Check the likely truck category, market range, and live truck availability for a proposed load without creating a shipment.
        </p>
      </div>

      <form className="mt-6 grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="field-label" htmlFor="fit-weightKg">
            Weight (kg)
          </label>
          <input
            className="input-base"
            id="fit-weightKg"
            type="number"
            {...register('weightKg')}
          />
          {errors.weightKg ? (
            <p className="mt-2 text-sm text-rose-600">{errors.weightKg.message}</p>
          ) : null}
        </div>

        <div>
          <label className="field-label" htmlFor="fit-volumeM3">
            Volume (m3)
          </label>
          <input
            className="input-base"
            id="fit-volumeM3"
            step="0.1"
            type="number"
            {...register('volumeM3')}
          />
          {errors.volumeM3 ? (
            <p className="mt-2 text-sm text-rose-600">{errors.volumeM3.message}</p>
          ) : null}
        </div>

        <div>
          <label className="field-label" htmlFor="fit-originCity">
            Origin city
          </label>
          <select className="input-base" id="fit-originCity" {...register('originCity')}>
            {cityOptions.map((city) => (
              <option key={city.city} value={city.city}>
                {city.city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="fit-destCity">
            Destination city
          </label>
          <select className="input-base" id="fit-destCity" {...register('destCity')}>
            {cityOptions.map((city) => (
              <option key={city.city} value={city.city}>
                {city.city}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2">
          <button className="btn-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Estimating...' : 'Estimate truck fit'}
          </button>
        </div>
      </form>

      {serverError ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {serverError}
        </div>
      ) : null}

      {result ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Recommended</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {result.recommendedType}
            </p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Estimated cost</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {formatCurrency(result.estimatedCost)}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {formatCurrency(result.estimatedCostRange?.min)} to{' '}
              {formatCurrency(result.estimatedCostRange?.max)}
            </p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Estimated CO2</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {formatNumber(result.estimatedCO2Kg)} kg
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
