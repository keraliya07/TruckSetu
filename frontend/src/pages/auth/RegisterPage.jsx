import { zodResolver } from '@hookform/resolvers/zod';
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
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="panel p-6 sm:p-8">
          <p className="font-heading text-sm uppercase tracking-[0.35em] text-brand-600">
            Register
          </p>
          <h1 className="mt-4 font-heading text-4xl text-slate-950">
            Create your STLOS workspace
          </h1>
          <p className="mt-3 text-slate-600">
            This phase supports warehouse and dealer signup, then a lightweight onboarding
            step plus email verification and persistent session handling.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Warehouse teams</p>
              <p className="mt-2 text-sm text-slate-600">
                Create shipments, review planned optimization modules, and manage delivery visibility.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Truck dealers</p>
              <p className="mt-2 text-sm text-slate-600">
                Review fleet readiness, booking queues, and return-load opportunities prepared for later phases.
              </p>
            </div>
          </div>
        </section>

        <section className="panel p-6 sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="name">
                  Full name
                </label>
                <input className="input-base" id="name" {...register('name')} />
                {errors.name ? (
                  <p className="mt-2 text-sm text-rose-600">{errors.name.message}</p>
                ) : null}
              </div>

              <div>
                <label className="field-label" htmlFor="email">
                  Email
                </label>
                <input className="input-base" id="email" {...register('email')} />
                {errors.email ? (
                  <p className="mt-2 text-sm text-rose-600">{errors.email.message}</p>
                ) : null}
              </div>

              <div>
                <label className="field-label" htmlFor="phone">
                  Phone
                </label>
                <input className="input-base" id="phone" {...register('phone')} />
                {errors.phone ? (
                  <p className="mt-2 text-sm text-rose-600">{errors.phone.message}</p>
                ) : null}
              </div>

              <div>
                <label className="field-label" htmlFor="password">
                  Password
                </label>
                <input
                  className="input-base"
                  id="password"
                  type="password"
                  {...register('password')}
                />
                {errors.password ? (
                  <p className="mt-2 text-sm text-rose-600">{errors.password.message}</p>
                ) : null}
              </div>

              <div>
                <label className="field-label" htmlFor="confirmPassword">
                  Confirm password
                </label>
                <input
                  className="input-base"
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword ? (
                  <p className="mt-2 text-sm text-rose-600">
                    {errors.confirmPassword.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <span className="field-label">Choose your role</span>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={`rounded-3xl border p-4 transition ${role === 'WAREHOUSE' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white'}`}>
                  <input className="sr-only" type="radio" value="WAREHOUSE" {...register('role')} />
                  <span className="font-semibold text-slate-900">Warehouse</span>
                  <span className="mt-2 block text-sm text-slate-600">
                    Coordinate shipments and monitor load planning.
                  </span>
                </label>

                <label className={`rounded-3xl border p-4 transition ${role === 'DEALER' ? 'border-freight-500 bg-teal-50' : 'border-slate-200 bg-white'}`}>
                  <input className="sr-only" type="radio" value="DEALER" {...register('role')} />
                  <span className="font-semibold text-slate-900">Truck dealer</span>
                  <span className="mt-2 block text-sm text-slate-600">
                    Manage trucks, bookings, and route availability.
                  </span>
                </label>
              </div>
            </div>

            <FormFeedback message={error} tone="error" />

            <button className="btn-primary w-full" disabled={isLoading} type="submit">
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            Already have access?{' '}
            <Link className="font-semibold text-freight-700" to="/login">
              Sign in
            </Link>
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Need to confirm an account email later?{' '}
            <Link className="font-semibold text-slate-700" to="/verify-email">
              Open verification page
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
