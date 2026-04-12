import { zodResolver } from '@hookform/resolvers/zod';
import { Package, Truck, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import FormFeedback from '../../components/common/FormFeedback';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardPath } from '../../utils/roleRoutes';

const schema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Za-z]/, 'Password must include a letter')
      .regex(/[0-9]/, 'Password must include a number'),
    confirmPassword: z.string(),
    phone: z.union([z.string().min(8, 'Phone should be at least 8 digits'), z.literal('')]),
    role: z.enum(['WAREHOUSE', 'DEALER']),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

const inputCls =
  'w-full rounded-lg border border-slate-200 py-2.5 px-3.5 text-sm text-slate-900 outline-none transition-all duration-200 bg-white hover:border-slate-300 focus:border-freight-500 focus:ring-2 focus:ring-freight-500/10 placeholder:text-slate-400';
const labelCls = 'text-xs font-semibold text-slate-500 block mb-1.5';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, isAuthenticated, isLoading, error, clearError, user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      role: 'WAREHOUSE',
    },
  });

  const role = watch('role');

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  const onSubmit = async (values) => {
    clearError();
    await registerUser({
      name: values.name,
      email: values.email,
      password: values.password,
      phone: values.phone || '',
      role: values.role,
    });
    navigate('/onboarding', { replace: true });
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6">
      {/* Subtle background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -right-40 -top-40 h-[450px] w-[450px] rounded-full opacity-[0.10] blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.5), transparent 70%)' }}
        />
        <div
          className="absolute -left-40 top-1/2 h-[400px] w-[400px] rounded-full opacity-[0.08] blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4), transparent 70%)' }}
        />
      </div>

      <div className="relative mx-auto grid max-w-5xl gap-6 animate-fade-in lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left — Info panel */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
          <p className="text-xs font-medium text-freight-600">Register</p>
          <h1 className="mt-1.5 font-heading text-2xl font-bold text-slate-900">
            Create your TruckSetu workspace
          </h1>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            This phase supports warehouse and dealer signup, then a lightweight onboarding
            step plus email verification and persistent session handling.
          </p>

          <div className="mt-6 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-sm">
              <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Package className="h-4 w-4" />
              </div>
              <p className="font-semibold text-sm text-slate-900">Warehouse teams</p>
              <p className="mt-1 text-xs text-slate-500">
                Create shipments, check truck estimation, and manage delivery visibility.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-sm">
              <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                <Truck className="h-4 w-4" />
              </div>
              <p className="font-semibold text-sm text-slate-900">Truck dealers</p>
              <p className="mt-1 text-xs text-slate-500">
                Manage fleet readiness, booking queues, and return-load opportunities.
              </p>
            </div>
          </div>
        </section>

        {/* Right — Register form */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="name">
                  Full name
                </label>
                <input className={inputCls} id="name" {...register('name')} />
                {errors.name ? (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                    <AlertCircle className="h-3 w-3" />{errors.name.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label className={labelCls} htmlFor="email">
                  Email
                </label>
                <input className={inputCls} id="email" {...register('email')} />
                {errors.email ? (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                    <AlertCircle className="h-3 w-3" />{errors.email.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label className={labelCls} htmlFor="phone">
                  Phone
                </label>
                <input className={inputCls} id="phone" {...register('phone')} />
                {errors.phone ? (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                    <AlertCircle className="h-3 w-3" />{errors.phone.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label className={labelCls} htmlFor="password">
                  Password
                </label>
                <input className={inputCls} id="password" type="password" {...register('password')} />
                {errors.password ? (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                    <AlertCircle className="h-3 w-3" />{errors.password.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label className={labelCls} htmlFor="confirmPassword">
                  Confirm password
                </label>
                <input className={inputCls} id="confirmPassword" type="password" {...register('confirmPassword')} />
                {errors.confirmPassword ? (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                    <AlertCircle className="h-3 w-3" />{errors.confirmPassword.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <span className={labelCls}>Choose your role</span>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${role === 'WAREHOUSE' ? 'border-freight-300 bg-freight-50/40 ring-1 ring-freight-200' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <input className="sr-only" type="radio" value="WAREHOUSE" {...register('role')} />
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${role === 'WAREHOUSE' ? 'bg-freight-500 text-white' : 'bg-slate-100 text-slate-400'} transition-colors`}>
                      <Package className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-sm text-slate-900">Warehouse</span>
                  </div>
                  <span className="mt-1.5 block text-xs text-slate-500">
                    Coordinate shipments and monitor load planning.
                  </span>
                </label>

                <label className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${role === 'DEALER' ? 'border-freight-300 bg-freight-50/40 ring-1 ring-freight-200' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <input className="sr-only" type="radio" value="DEALER" {...register('role')} />
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${role === 'DEALER' ? 'bg-freight-500 text-white' : 'bg-slate-100 text-slate-400'} transition-colors`}>
                      <Truck className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-sm text-slate-900">Truck dealer</span>
                  </div>
                  <span className="mt-1.5 block text-xs text-slate-500">
                    Manage trucks, bookings, and route availability.
                  </span>
                </label>
              </div>
            </div>

            <FormFeedback message={error} tone="error" />

            <button
              className="inline-flex h-10 w-full items-center justify-center rounded-full bg-freight-600 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-freight-700 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-sm text-slate-500">
            Already have access?{' '}
            <Link className="font-semibold text-freight-600 transition hover:text-freight-700" to="/login">
              Sign in
            </Link>
          </p>
          <p className="mt-1.5 text-sm text-slate-500">
            Need to confirm an account email later?{' '}
            <Link className="font-semibold text-slate-500 transition hover:text-slate-700" to="/verify-email">
              Open verification page
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
