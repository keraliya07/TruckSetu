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
      <div className="mx-auto max-w-3xl">
        <section className="panel p-6 sm:p-8">
          <p className="font-heading text-sm uppercase tracking-[0.3em] text-brand-600">
            Email Verification
          </p>
          <h1 className="mt-4 font-heading text-4xl text-slate-950">
            Confirm your account email
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Verification stays optional for the current build, but it helps prepare the app for
            production-style authentication flows.
          </p>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5">
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
              <a className="mt-3 inline-block font-semibold text-freight-700 underline" href={devUrl}>
                Open development verification link
              </a>
            ) : null}
            {devToken ? (
              <p className="mt-3 break-all font-mono text-xs text-slate-700">{devToken}</p>
            ) : null}
          </div>

          {!hasToken && isAuthenticated ? (
            <button
              className="btn-primary mt-6"
              disabled={status === 'pending'}
              onClick={handleSendVerification}
              type="button"
            >
              {status === 'pending' ? 'Generating link...' : 'Send verification link'}
            </button>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
            <Link className="font-semibold text-freight-700" to="/login">
              Sign in
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
