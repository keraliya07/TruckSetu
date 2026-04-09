import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import FormFeedback from '../../components/common/FormFeedback';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardPath } from '../../utils/roleRoutes';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const demoAccounts = [
  { role: 'Warehouse', email: 'warehouse@trucksetu.dev', password: 'Warehouse123' },
  { role: 'Dealer', email: 'dealer@trucksetu.dev', password: 'Dealer123' },
  { role: 'Admin', email: 'admin@trucksetu.dev', password: 'Admin123' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError, user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  const onSubmit = async (values) => {
    clearError();
    const nextUser = await login(values.email, values.password);
    navigate(getDashboardPath(nextUser.role), { replace: true });
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="panel overflow-hidden">
          <div className="bg-gradient-to-br from-freight-700 via-freight-600 to-brand-600 p-8 text-white sm:p-10">
            <p className="font-heading text-sm uppercase tracking-[0.35em] text-white/70">
              TruckSetu
            </p>
            <h1 className="mt-4 max-w-xl font-heading text-4xl leading-tight sm:text-5xl">
              Smart logistics execution starts with the right truck, route, and role.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-white/85 sm:text-lg">
              The current build includes persistent auth sessions, role-based workspaces,
              and live logistics modules backed by Prisma and Supabase.
            </p>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
            {demoAccounts.map((account) => (
              <button
                key={account.role}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-freight-400 hover:bg-white"
                onClick={() => {
                  setValue('email', account.email);
                  setValue('password', account.password);
                }}
                type="button"
              >
                <p className="font-heading text-lg text-slate-900">{account.role}</p>
                <p className="mt-2 text-sm text-slate-600">{account.email}</p>
                <p className="mt-1 text-sm font-medium text-freight-700">{account.password}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="panel p-6 sm:p-8">
          <div className="mb-6">
            <p className="font-heading text-sm uppercase tracking-[0.3em] text-freight-600">
              Sign In
            </p>
            <h2 className="mt-3 font-heading text-3xl text-slate-950">
              Access the current build
            </h2>
            <p className="mt-2 text-slate-600">
              Use a demo account or your registered user to explore the project milestone.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input
                className="input-base"
                id="email"
                placeholder="warehouse@trucksetu.dev"
                {...register('email')}
              />
              {errors.email ? (
                <p className="mt-2 text-sm text-rose-600">{errors.email.message}</p>
              ) : null}
            </div>

            <div>
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <input
                className="input-base"
                id="password"
                placeholder="Enter your password"
                type="password"
                {...register('password')}
              />
              {errors.password ? (
                <p className="mt-2 text-sm text-rose-600">{errors.password.message}</p>
              ) : null}
            </div>

            <FormFeedback message={error} tone="error" />

            <button className="btn-primary w-full" disabled={isLoading} type="submit">
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
            <div className="flex flex-wrap items-center gap-3">
              <Link className="font-semibold text-freight-700" to="/register">
                Create a new account
              </Link>
              <Link className="font-semibold text-slate-700" to="/forgot-password">
                Forgot password
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
