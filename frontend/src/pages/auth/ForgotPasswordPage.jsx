import { zodResolver } from '@hookform/resolvers/zod';
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
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="panel overflow-hidden">
          <div className="bg-gradient-to-br from-brand-600 via-freight-700 to-slate-950 p-8 text-white sm:p-10">
            <p className="font-heading text-sm uppercase tracking-[0.35em] text-white/70">
              Account Recovery
            </p>
            <h1 className="mt-4 font-heading text-4xl leading-tight sm:text-5xl">
              Reset a password without losing your workspace.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-white/85 sm:text-lg">
              Enter your account email and STLOS will generate a reset link. In local
              development, the link is shown directly here.
            </p>
          </div>
        </section>

        <section className="panel p-6 sm:p-8">
          <div className="mb-6">
            <p className="font-heading text-sm uppercase tracking-[0.3em] text-freight-600">
              Forgot Password
            </p>
            <h2 className="mt-3 font-heading text-3xl text-slate-950">
              Generate a reset link
            </h2>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input className="input-base" id="email" {...register('email')} />
              {errors.email ? (
                <p className="mt-2 text-sm text-rose-600">{errors.email.message}</p>
              ) : null}
            </div>

            <FormFeedback message={error} tone="error" />

            {result ? (
              <div className="space-y-3 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
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

            <button className="btn-primary w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Generating...' : 'Send reset instructions'}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
            <Link className="font-semibold text-freight-700" to="/login">
              Back to sign in
            </Link>
            <Link className="font-semibold text-slate-700" to="/register">
              Create account
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
