import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { forgotPassword } from '../../api/auth.api';
import FormFeedback from '../../components/common/FormFeedback';
import { useToastStore } from '../../store/toastStore';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});

const inputCls =
  'w-full rounded-lg border border-slate-200 py-2.5 px-3.5 text-sm text-slate-900 outline-none transition-all duration-200 bg-white hover:border-slate-300 focus:border-freight-500 focus:ring-2 focus:ring-freight-500/10 placeholder:text-slate-400';

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await forgotPassword(values);
      setResult(response);
      useToastStore
        .getState()
        .success('Reset link generated', 'Use the development link to continue locally.');
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6">
      {/* Subtle background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-40 top-1/4 h-[400px] w-[400px] rounded-full opacity-[0.10] blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.4), transparent 70%)' }}
        />
        <div
          className="absolute -right-40 -top-40 h-[450px] w-[450px] rounded-full opacity-[0.08] blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.5), transparent 70%)' }}
        />
      </div>

      <div className="relative mx-auto grid max-w-5xl gap-6 animate-fade-in lg:grid-cols-[1fr_0.9fr]">
        {/* Left — Hero */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="relative px-8 py-10 text-white" style={{ background: 'linear-gradient(135deg, #16a34a 0%, #0f766e 50%, #0f172a 100%)' }}>
            <p className="text-xs font-medium tracking-widest text-white/60 uppercase">Account Recovery</p>
            <h1 className="mt-3 font-heading text-2xl font-bold leading-snug sm:text-3xl">
              Reset a password without losing your workspace.
            </h1>
            <p className="mt-3 max-w-lg text-sm text-white/70 leading-relaxed">
              Enter your account email and TruckSetu will generate a reset link. In local
              development, the link is shown directly here.
            </p>
          </div>
        </section>

        {/* Right — Form */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-freight-50 text-freight-600">
              <KeyRound className="h-5 w-5" />
            </div>
            <p className="text-xs font-medium text-slate-400">Forgot Password</p>
            <h2 className="mt-1.5 font-heading text-xl font-bold text-slate-900">
              Generate a reset link
            </h2>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1.5" htmlFor="email">
                Email
              </label>
              <input className={inputCls} id="email" placeholder="your@email.com" {...register('email')} />
              {errors.email ? (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                  <AlertCircle className="h-3 w-3" />{errors.email.message}
                </p>
              ) : null}
            </div>

            <FormFeedback message={error} tone="error" />

            {result ? (
              <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <p>{result.message}</p>
                {result.devUrl ? (
                  <a className="font-semibold text-emerald-900 underline" href={result.devUrl}>
                    Open development reset link
                  </a>
                ) : null}
                {result.devToken ? (
                  <p className="break-all font-mono text-xs text-emerald-900">
                    Token: {result.devToken}
                  </p>
                ) : null}
              </div>
            ) : null}

            <button
              className="inline-flex h-10 w-full items-center justify-center rounded-full bg-freight-600 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-freight-700 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Generating…' : 'Send reset instructions'}
            </button>
          </form>

          <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500">
            <Link className="font-semibold text-freight-600 transition hover:text-freight-700" to="/login">
              Back to sign in
            </Link>
            <Link className="font-semibold text-slate-500 transition hover:text-slate-700" to="/register">
              Create account
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
