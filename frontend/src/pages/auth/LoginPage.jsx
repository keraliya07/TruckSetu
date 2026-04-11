import { zodResolver } from '@hookform/resolvers/zod';
import { Truck, Package, ShieldCheck, AlertCircle } from 'lucide-react';
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
  { role: 'Warehouse', email: 'warehouse@trucksetu.dev', password: 'Warehouse123', icon: Package, bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { role: 'Dealer', email: 'dealer@trucksetu.dev', password: 'Dealer123', icon: Truck, bg: 'bg-sky-50', text: 'text-sky-600' },
  { role: 'Admin', email: 'admin@trucksetu.dev', password: 'Admin123', icon: ShieldCheck, bg: 'bg-violet-50', text: 'text-violet-600' },
];

const inputCls =
  'w-full rounded-lg border border-slate-200 py-2.5 px-3.5 text-sm text-slate-900 outline-none transition-all duration-200 bg-white hover:border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 placeholder:text-slate-400';

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
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6">
      {/* Subtle background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full opacity-[0.12] blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.5), transparent 70%)' }}
        />
        <div
          className="absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full opacity-[0.08] blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.5), transparent 70%)' }}
        />
      </div>

      <div className="relative mx-auto grid max-w-5xl gap-6 animate-fade-in lg:grid-cols-[1.15fr_0.85fr]">
        {/* Left — Hero + Demo accounts */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="relative px-8 py-10 text-white" style={{ background: 'linear-gradient(135deg, #0f766e 0%, #115e59 60%, #0f172a 100%)' }}>
            <p className="text-xs font-medium tracking-widest text-white/60 uppercase">TruckSetu</p>
            <h1 className="mt-3 font-heading text-2xl font-bold leading-snug sm:text-3xl">
              Smart logistics execution starts with the right truck, route, and role.
            </h1>
            <p className="mt-3 max-w-lg text-sm text-white/70 leading-relaxed">
              The current build includes persistent auth sessions, role-based workspaces,
              and live logistics modules backed by Prisma and Supabase.
            </p>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-3">
            {demoAccounts.map((account, index) => {
              const Icon = account.icon;
              return (
                <button
                  key={account.role}
                  className="group rounded-xl border border-slate-200 bg-white p-4 text-left transition-all duration-200 hover:border-slate-300 hover:shadow-sm animate-fade-in"
                  style={{ animationDelay: `${index * 0.08}s` }}
                  onClick={() => {
                    setValue('email', account.email);
                    setValue('password', account.password);
                  }}
                  type="button"
                >
                  <div className={`mb-2.5 inline-flex h-9 w-9 items-center justify-center rounded-lg ${account.bg} ${account.text}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="font-semibold text-sm text-slate-900">{account.role}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{account.email}</p>
                  <p className="mt-0.5 text-xs font-medium text-brand-600">{account.password}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Right — Login form */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-medium text-slate-400">Sign In</p>
            <h2 className="mt-1.5 font-heading text-xl font-bold text-slate-900">
              Access the current build
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Use a demo account or your registered user to explore the project milestone.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                className={inputCls}
                id="email"
                placeholder="warehouse@trucksetu.dev"
                {...register('email')}
              />
              {errors.email ? (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                  <AlertCircle className="h-3 w-3" />{errors.email.message}
                </p>
              ) : null}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                className={inputCls}
                id="password"
                placeholder="Enter your password"
                type="password"
                {...register('password')}
              />
              {errors.password ? (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                  <AlertCircle className="h-3 w-3" />{errors.password.message}
                </p>
              ) : null}
            </div>

            <FormFeedback message={error} tone="error" />

            <button
              className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-brand-600 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-700 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <Link className="font-semibold text-brand-600 transition hover:text-brand-700" to="/register">
              Create a new account
            </Link>
            <Link className="font-semibold text-slate-500 transition hover:text-slate-700" to="/forgot-password">
              Forgot password
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
