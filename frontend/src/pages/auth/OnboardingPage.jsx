import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';

import { cityOptions } from '../../data/logisticsOptions';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardPath } from '../../utils/roleRoutes';

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
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="panel bg-gradient-to-r from-slate-950 to-freight-700 p-8 text-white">
          <p className="font-heading text-sm uppercase tracking-[0.35em] text-white/65">
            Onboarding
          </p>
          <h1 className="mt-4 font-heading text-4xl">
            Finish your role setup
          </h1>
          <p className="mt-3 max-w-2xl text-white/80">
            This step stores a small role-specific profile so the current demo workspace feels tailored instead of generic.
          </p>
        </section>

        {user.role === 'WAREHOUSE' ? (
          <section className="panel p-6 sm:p-8">
            <h2 className="font-heading text-3xl text-slate-950">Warehouse details</h2>
            <p className="mt-2 text-slate-600">
              Add a warehouse name, city, and address for the current milestone.
            </p>

            <form className="mt-6 grid gap-5" onSubmit={submitWarehouse}>
              <div>
                <label className="field-label" htmlFor="warehouseName">
                  Warehouse name
                </label>
                <input
                  className="input-base"
                  id="warehouseName"
                  {...warehouseForm.register('warehouseName', { required: true })}
                />
              </div>

              <div>
                <label className="field-label" htmlFor="city">
                  City
                </label>
                <select
                  className="input-base"
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
                <label className="field-label" htmlFor="address">
                  Address
                </label>
                <textarea
                  className="input-base min-h-28"
                  id="address"
                  {...warehouseForm.register('address', { required: true })}
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <button className="btn-primary" disabled={isLoading} type="submit">
                {isLoading ? 'Saving...' : 'Complete onboarding'}
              </button>
            </form>
          </section>
        ) : (
          <section className="panel p-6 sm:p-8">
            <h2 className="font-heading text-3xl text-slate-950">Dealer details</h2>
            <p className="mt-2 text-slate-600">
              Add company information and a base rate so later pricing and booking tasks have a realistic starting point.
            </p>

            <form className="mt-6 grid gap-5" onSubmit={submitDealer}>
              <div>
                <label className="field-label" htmlFor="companyName">
                  Company name
                </label>
                <input
                  className="input-base"
                  id="companyName"
                  {...dealerForm.register('companyName', { required: true })}
                />
              </div>

              <div>
                <label className="field-label" htmlFor="primaryCity">
                  Primary city
                </label>
                <select
                  className="input-base"
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
                <label className="field-label" htmlFor="baseRatePerKmTon">
                  Base rate per km/ton
                </label>
                <input
                  className="input-base"
                  id="baseRatePerKmTon"
                  min="1"
                  step="1"
                  type="number"
                  {...dealerForm.register('baseRatePerKmTon', { required: true })}
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <button className="btn-primary" disabled={isLoading} type="submit">
                {isLoading ? 'Saving...' : 'Complete onboarding'}
              </button>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
