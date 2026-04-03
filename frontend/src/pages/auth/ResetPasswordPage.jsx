import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { resetPassword } from '../../api/auth.api';
import FormFeedback from '../../components/common/FormFeedback';
import { useToastStore } from '../../store/toastStore';

const schema = z
  .object({
    token: z.string().min(20, 'A valid reset token is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Za-z]/, 'Password must include a letter')
      .regex(/[0-9]/, 'Password must include a number'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      token: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      setValue('token', token);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    setServerError('');

    try {
      const response = await resetPassword({
        token: values.token,
        password: values.password,
      });
      setSuccessMessage(response.message);
      useToastStore
        .getState()
        .success('Password reset', 'You can sign in with the new password now.');
      window.setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1200);
    } catch (error) {
      setServerError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <section className="panel p-6 sm:p-8">
          <p className="font-heading text-sm uppercase tracking-[0.3em] text-brand-600">
            Reset Password
          </p>
          <h1 className="mt-4 font-heading text-4xl text-slate-950">Choose a new password</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Paste the reset token from your email, or open this page through the generated
            reset link.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="field-label" htmlFor="token">
                Reset token
              </label>
              <input className="input-base font-mono text-xs" id="token" {...register('token')} />
              {errors.token ? (
                <p className="mt-2 text-sm text-rose-600">{errors.token.message}</p>
              ) : null}
            </div>

            <div>
              <label className="field-label" htmlFor="password">
                New password
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

            <FormFeedback message={serverError} tone="error" />
            <FormFeedback message={successMessage} tone="success" />

            <button className="btn-primary w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Resetting...' : 'Reset password'}
            </button>
          </form>

          <div className="mt-6 text-sm text-slate-600">
            <Link className="font-semibold text-freight-700" to="/login">
              Back to sign in
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
