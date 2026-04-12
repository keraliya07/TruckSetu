import { AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';

import { cityOptions } from '../../data/logisticsOptions';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardPath } from '../../utils/roleRoutes';

const inputCls =
  'w-full rounded-lg border border-slate-200 py-2.5 px-3.5 text-sm text-slate-900 outline-none transition-all duration-200 bg-white hover:border-slate-300 focus:border-freight-500 focus:ring-2 focus:ring-freight-500/10 placeholder:text-slate-400';
const labelCls = 'text-xs font-semibold text-slate-500 block mb-1.5';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, updateProfile, isLoading, error, isAuthenticated } = useAuth();

  const warehouseForm = useForm({
    defaultValues: {
      warehouseName: user?.warehouse?.warehouseName || '',
      city: user?.warehouse?.city || '',
      address: user?.warehouse?.address || '',
    },
  });

  const dealerForm = useForm({
    defaultValues: {
      companyName: user?.truckDealer?.companyName || '',
      primaryCity: user?.truckDealer?.primaryCity || '',
      baseRatePerKmTon: user?.truckDealer?.baseRatePerKmTon || 24,
    },
  });

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.profileComplete) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  const submitWarehouse = warehouseForm.handleSubmit(async (values) => {
    await updateProfile({
      warehouse: values,
    });
    navigate(getDashboardPath('WAREHOUSE'), { replace: true });
  });

  const submitDealer = dealerForm.handleSubmit(async (values) => {
    await updateProfile({
      truckDealer: {
        ...values,
        baseRatePerKmTon: Number(values.baseRatePerKmTon),
      },
    });
    navigate(getDashboardPath('DEALER'), { replace: true });
  });

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Hero card */}
        <section className="rounded-2xl overflow-hidden shadow-sm">
          <div className="relative px-8 py-8 text-white" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0f766e 100%)' }}>
            <p className="text-xs font-medium tracking-widest text-white/60 uppercase">Onboarding</p>
            <h1 className="mt-2 font-heading text-2xl font-bold">
              Finish your role setup
            </h1>
            <p className="mt-2 max-w-lg text-sm text-white/70 leading-relaxed">
              This step stores a small role-specific profile so the workspace feels tailored instead of generic.
            </p>
          </div>
        </section>

        {user.role === 'WAREHOUSE' ? (
          <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="font-heading text-base font-semibold text-slate-900">Warehouse details</h2>
              <p className="mt-1 text-sm text-slate-500">
                Add a warehouse name, city, and address for the current milestone.
              </p>
            </div>

            <form className="p-6 grid gap-4" onSubmit={submitWarehouse}>
              <div>
                <label className={labelCls} htmlFor="warehouseName">
                  Warehouse name
                </label>
                <input
                  className={inputCls}
                  id="warehouseName"
                  {...warehouseForm.register('warehouseName', { required: true })}
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="city">
                  City
                </label>
                <select
                  className={inputCls}
                  id="city"
                  {...warehouseForm.register('city', { required: true })}
                >
                  {cityOptions.map((city) => (
                    <option key={city.city} value={city.city}>
                      {city.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls} htmlFor="address">
                  Address
                </label>
                <textarea
                  className={`${inputCls} min-h-24`}
                  id="address"
                  {...warehouseForm.register('address', { required: true })}
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />{error}
                </div>
              ) : null}

              <button
                className="inline-flex h-10 items-center justify-center rounded-full bg-freight-600 px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-freight-700 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? 'Saving...' : 'Complete onboarding'}
              </button>
            </form>
          </section>
        ) : (
          <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="font-heading text-base font-semibold text-slate-900">Dealer details</h2>
              <p className="mt-1 text-sm text-slate-500">
                Add company information and a base rate so pricing and booking tasks have a realistic starting point.
              </p>
            </div>

            <form className="p-6 grid gap-4" onSubmit={submitDealer}>
              <div>
                <label className={labelCls} htmlFor="companyName">
                  Company name
                </label>
                <input
                  className={inputCls}
                  id="companyName"
                  {...dealerForm.register('companyName', { required: true })}
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="primaryCity">
                  Primary city
                </label>
                <select
                  className={inputCls}
                  id="primaryCity"
                  {...dealerForm.register('primaryCity', { required: true })}
                >
                  {cityOptions.map((city) => (
                    <option key={city.city} value={city.city}>
                      {city.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls} htmlFor="baseRatePerKmTon">
                  Base rate per km/ton
                </label>
                <input
                  className={inputCls}
                  id="baseRatePerKmTon"
                  min="1"
                  step="1"
                  type="number"
                  {...dealerForm.register('baseRatePerKmTon', { required: true })}
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />{error}
                </div>
              ) : null}

              <button
                className="inline-flex h-10 items-center justify-center rounded-full bg-freight-600 px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-freight-700 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? 'Saving...' : 'Complete onboarding'}
              </button>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
