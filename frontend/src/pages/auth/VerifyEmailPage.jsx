import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { sendVerificationEmail, verifyEmail } from '../../api/auth.api';
import FormFeedback from '../../components/common/FormFeedback';
import { useAuth } from '../../hooks/useAuth';
import { useToastStore } from '../../store/toastStore';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { fetchProfile, isAuthenticated, user } = useAuth();
  const [status, setStatus] = useState(token ? 'pending' : 'idle');
  const [message, setMessage] = useState('');
  const [devUrl, setDevUrl] = useState('');
  const [devToken, setDevToken] = useState('');

  const hasToken = useMemo(() => Boolean(token), [token]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let isActive = true;

    const confirmEmail = async () => {
      setStatus('pending');
      try {
        const response = await verifyEmail({ token });
        if (!isActive) {
          return;
        }
        setStatus('success');
        setMessage(response.message);
        useToastStore.getState().success('Email verified', response.message);
        if (isAuthenticated) {
          await fetchProfile().catch(() => null);
        }
      } catch (error) {
        if (!isActive) {
          return;
        }
        setStatus('error');
        setMessage(error.message);
      }
    };

    confirmEmail();

    return () => {
      isActive = false;
    };
  }, [fetchProfile, isAuthenticated, token]);

  const handleSendVerification = async () => {
    setStatus('pending');
    setMessage('');

    try {
      const response = await sendVerificationEmail();
      setStatus('success');
      setMessage(response.message);
      setDevUrl(response.devUrl || '');
      setDevToken(response.devToken || '');
      useToastStore.getState().success('Verification link sent', response.message);
    } catch (error) {
      setStatus('error');
      setMessage(error.message);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-xl">
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <p className="text-xs font-medium text-freight-600">Email Verification</p>
            <h1 className="mt-1.5 font-heading text-xl font-bold text-slate-900">
              Confirm your account email
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Verification stays optional for the current build, but it helps prepare the app for
              production-style authentication flows.
            </p>
          </div>

          <div className="p-6 space-y-5">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                Current status:{' '}
                <span className="font-semibold text-slate-900">
                  {user?.isEmailVerified ? 'Verified' : 'Not verified'}
                </span>
              </p>
              <FormFeedback
                className="mt-3"
                message={message}
                tone={status === 'error' ? 'error' : 'success'}
              />
              {devUrl ? (
                <a className="mt-3 inline-block text-sm font-semibold text-freight-600 underline" href={devUrl}>
                  Open development verification link
                </a>
              ) : null}
              {devToken ? (
                <p className="mt-3 break-all font-mono text-xs text-slate-700">{devToken}</p>
              ) : null}
            </div>

            {!hasToken && isAuthenticated ? (
              <button
                className="inline-flex h-10 w-full items-center justify-center rounded-full bg-freight-600 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-freight-700 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={status === 'pending'}
                onClick={handleSendVerification}
                type="button"
              >
                {status === 'pending' ? 'Generating link...' : 'Send verification link'}
              </button>
            ) : null}

            <div className="flex flex-wrap gap-3 text-sm text-slate-500">
              <Link className="font-semibold text-freight-600 transition hover:text-freight-700" to="/login">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
