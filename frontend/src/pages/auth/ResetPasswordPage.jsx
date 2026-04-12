import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { AlertCircle } from 'lucide-react';

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

const inputCls =
  'w-full rounded-lg border border-slate-200 py-2.5 px-3.5 text-sm text-slate-900 outline-none transition-all duration-200 bg-white hover:border-slate-300 focus:border-freight-500 focus:ring-2 focus:ring-freight-500/10 placeholder:text-slate-400';
const labelCls = 'text-xs font-semibold text-slate-500 block mb-1.5';

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
      <div className="mx-auto max-w-xl">
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <p className="text-xs font-medium text-freight-600">Reset Password</p>
            <h1 className="mt-1.5 font-heading text-xl font-bold text-slate-900">Choose a new password</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Paste the reset token from your email, or open this page through the generated
              reset link.
            </p>
          </div>

          <div className="p-6">
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className={labelCls} htmlFor="token">
                  Reset token
                </label>
                <input className={`${inputCls} font-mono text-xs`} id="token" {...register('token')} />
                {errors.token ? (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                    <AlertCircle className="h-3 w-3" />{errors.token.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label className={labelCls} htmlFor="password">
                  New password
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

              <FormFeedback message={serverError} tone="error" />
              <FormFeedback message={successMessage} tone="success" />

              <button
                className="inline-flex h-10 w-full items-center justify-center rounded-full bg-freight-600 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-freight-700 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? 'Resetting...' : 'Reset password'}
              </button>
            </form>

            <div className="mt-5 text-sm text-slate-500">
              <Link className="font-semibold text-freight-600 transition hover:text-freight-700" to="/login">
                Back to sign in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
