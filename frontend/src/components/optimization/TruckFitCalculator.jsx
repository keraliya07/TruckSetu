import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Truck, MapPin, DollarSign, Leaf } from 'lucide-react';

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
    <section className="relative overflow-hidden rounded-[2rem] bg-white border border-slate-200 p-2 shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-freight-50/40 to-indigo-50/20 opacity-60 pointer-events-none" />

      <div className="relative rounded-[1.5rem] bg-white/80 backdrop-blur-sm border border-white/50">
        {/* Header */}
        <div className="p-8 border-b border-slate-100/80">
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-freight-600">Cost Estimator</p>
          <h3 className="mt-2 font-heading text-3xl font-extrabold tracking-tight bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Truck fit calculator
          </h3>
          <p className="mt-2 text-sm text-slate-500 max-w-xl leading-relaxed">
            Check the likely truck category, market range, and live availability for a proposed load without creating a shipment.
          </p>
        </div>

        {/* Form */}
        <form className="p-8" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Weight */}
            <div>
              <label className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 block mb-2" htmlFor="fit-weightKg">
                Weight (kg)
              </label>
              <input
                className="w-full rounded-2xl border border-slate-300 py-3 px-4 text-sm text-slate-900 outline-none transition-all duration-300 bg-slate-50/50 hover:bg-slate-50 focus:bg-white placeholder:text-slate-400 focus:border-freight-500 focus:ring-4 focus:ring-freight-500/10 shadow-sm"
                id="fit-weightKg"
                type="number"
                {...register('weightKg')}
              />
              {errors.weightKg ? (
                <p className="mt-2 text-sm text-rose-600">{errors.weightKg.message}</p>
              ) : null}
            </div>

            {/* Volume */}
            <div>
              <label className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 block mb-2" htmlFor="fit-volumeM3">
                Volume (m³)
              </label>
              <input
                className="w-full rounded-2xl border border-slate-300 py-3 px-4 text-sm text-slate-900 outline-none transition-all duration-300 bg-slate-50/50 hover:bg-slate-50 focus:bg-white placeholder:text-slate-400 focus:border-freight-500 focus:ring-4 focus:ring-freight-500/10 shadow-sm"
                id="fit-volumeM3"
                step="0.1"
                type="number"
                {...register('volumeM3')}
              />
              {errors.volumeM3 ? (
                <p className="mt-2 text-sm text-rose-600">{errors.volumeM3.message}</p>
              ) : null}
            </div>

            {/* Origin */}
            <div>
              <label className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 block mb-2" htmlFor="fit-originCity">
                Origin city
              </label>
              <select
                className="w-full rounded-2xl border border-slate-300 py-3 px-4 text-sm text-slate-900 outline-none transition-all duration-300 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-freight-500 focus:ring-4 focus:ring-freight-500/10 shadow-sm"
                id="fit-originCity"
                {...register('originCity')}
              >
                {cityOptions.map((city) => (
                  <option key={city.city} value={city.city}>
                    {city.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div>
              <label className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 block mb-2" htmlFor="fit-destCity">
                Destination city
              </label>
              <select
                className="w-full rounded-2xl border border-slate-300 py-3 px-4 text-sm text-slate-900 outline-none transition-all duration-300 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-freight-500 focus:ring-4 focus:ring-freight-500/10 shadow-sm"
                id="fit-destCity"
                {...register('destCity')}
              >
                {cityOptions.map((city) => (
                  <option key={city.city} value={city.city}>
                    {city.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <div className="lg:col-span-2">
              <button
                className="inline-flex h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-freight-600 to-freight-500 px-8 text-sm font-bold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:shadow-freight-500/20 hover:-translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? 'Estimating...' : 'Calculate truck fit'}
              </button>
            </div>
          </div>
        </form>

        {serverError ? (
          <div className="mx-8 mb-8 rounded-2xl border border-rose-200/60 bg-rose-50/60 px-4 py-3 text-sm text-rose-700">
            {serverError}
          </div>
        ) : null}

        {/* Results */}
        {result ? (
          <div className="border-t border-slate-100/80 p-8">
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-freight-600 mb-5">Estimation Results</p>
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Recommended type */}
              <div className="relative overflow-hidden rounded-[1.5rem] border border-freight-100 bg-gradient-to-br from-freight-50 to-indigo-50/40 p-5">
                <div className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 shadow-sm ring-1 ring-freight-100">
                  <Truck className="h-4 w-4 text-freight-600" />
                </div>
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-freight-600">Recommended</p>
                <p className="mt-2 text-xl font-extrabold text-freight-800 tracking-tight">
                  {result.recommendedType}
                </p>
                <p className="mt-1 text-xs font-medium text-freight-400">truck category</p>
              </div>

              {/* Cost */}
              <div className="relative overflow-hidden rounded-[1.5rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50/40 p-5">
                <div className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 shadow-sm ring-1 ring-emerald-100">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-emerald-600">Estimated Cost</p>
                <p className="mt-2 text-2xl font-extrabold text-emerald-800 tracking-tight">
                  {formatCurrency(result.estimatedCost)}
                </p>
                <p className="mt-1 text-xs font-medium text-emerald-500">
                  {formatCurrency(result.estimatedCostRange?.min)} – {formatCurrency(result.estimatedCostRange?.max)} range
                </p>
              </div>

              {/* CO2 */}
              <div className="relative overflow-hidden rounded-[1.5rem] border border-teal-100 bg-gradient-to-br from-teal-50 to-emerald-50/40 p-5">
                <div className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 shadow-sm ring-1 ring-teal-100">
                  <Leaf className="h-4 w-4 text-teal-600" />
                </div>
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-teal-600">Est. CO₂</p>
                <p className="mt-2 text-2xl font-extrabold text-teal-800 tracking-tight">
                  {formatNumber(result.estimatedCO2Kg)} <span className="text-base font-medium">kg</span>
                </p>
                <p className="mt-1 text-xs font-medium text-teal-400">carbon footprint</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
