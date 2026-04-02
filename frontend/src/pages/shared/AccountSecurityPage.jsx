import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';

import {
  getSessions,
  revokeOtherSessions,
  revokeSession,
  sendVerificationEmail,
} from '../../api/auth.api';
import DashboardShell from '../../components/common/DashboardShell';
import { useAuth } from '../../hooks/useAuth';

const formatRelativeTime = (value) => {
  if (!value) {
    return 'Never';
  }

  return `${formatDistanceToNow(new Date(value), { addSuffix: true })}`;
};

export default function AccountSecurityPage() {
  const { fetchProfile, user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [verificationLink, setVerificationLink] = useState('');

  const loadSessions = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await getSessions();
      setSessions(response.sessions);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleSendVerification = async () => {
    setIsSendingVerification(true);
    setFeedback('');
    setError('');

    try {
      const response = await sendVerificationEmail();
      setFeedback(response.message);
      setVerificationLink(response.devUrl || '');
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    setFeedback('');
    setError('');

    try {
      const response = await revokeSession(sessionId);
      setFeedback(response.message);
      await loadSessions();
    } catch (nextError) {
      setError(nextError.message);
    }
  };

  const handleRevokeOthers = async () => {
    setFeedback('');
    setError('');

    try {
      const response = await revokeOtherSessions();
      setFeedback(response.message);
      await loadSessions();
    } catch (nextError) {
      setError(nextError.message);
    }
  };

  const refreshProfile = async () => {
    try {
      await fetchProfile();
      setFeedback('Account profile refreshed.');
    } catch (nextError) {
      setError(nextError.message);
    }
  };

  return (
    <DashboardShell
      accent="text-brand-600"
      eyebrow="Account Security"
      title="Session and identity controls"
      subtitle="Manage device sessions, resend verification links, and keep the persistent auth layer tidy."
    >
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="panel p-6">
          <p className="font-heading text-sm uppercase tracking-[0.3em] text-slate-500">
            Verification
          </p>
          <h2 className="mt-4 font-heading text-2xl text-slate-950">Email status</h2>
          <p className="mt-3 text-sm text-slate-600">
            Current status:{' '}
            <span className="font-semibold text-slate-900">
              {user?.isEmailVerified ? 'Verified' : 'Not verified'}
            </span>
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {!user?.isEmailVerified ? (
              <button
                className="btn-primary"
                disabled={isSendingVerification}
                onClick={handleSendVerification}
                type="button"
              >
                {isSendingVerification ? 'Generating...' : 'Send verification link'}
              </button>
            ) : null}
            <button className="btn-secondary" onClick={refreshProfile} type="button">
              Refresh profile
            </button>
          </div>

          {verificationLink ? (
            <a className="mt-4 inline-block text-sm font-semibold text-freight-700 underline" href={verificationLink}>
              Open development verification link
            </a>
          ) : null}
        </article>

        <article className="panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-heading text-sm uppercase tracking-[0.3em] text-slate-500">
                Sessions
              </p>
              <h2 className="mt-4 font-heading text-2xl text-slate-950">Active sign-ins</h2>
            </div>
            <button className="btn-secondary" onClick={handleRevokeOthers} type="button">
              Revoke other sessions
            </button>
          </div>

          {feedback ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {feedback}
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-5 space-y-4">
            {isLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                Loading sessions...
              </div>
            ) : null}

            {!isLoading && sessions.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                No sessions found.
              </div>
            ) : null}

            {!isLoading
              ? sessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {session.isCurrent ? 'Current session' : 'Saved session'}
                        </p>
                        <p className="text-sm text-slate-600">
                          {session.userAgent || 'Unknown device'}
                        </p>
                        <p className="text-xs text-slate-500">
                          IP: {session.ipAddress || 'Unknown'} · created{' '}
                          {formatRelativeTime(session.createdAt)}
                        </p>
                        <p className="text-xs text-slate-500">
                          Last used {formatRelativeTime(session.lastUsedAt)} · expires{' '}
                          {formatRelativeTime(session.expiresAt)}
                        </p>
                      </div>

                      {!session.isCurrent ? (
                        <button
                          className="btn-secondary"
                          onClick={() => handleRevokeSession(session.id)}
                          type="button"
                        >
                          Revoke
                        </button>
                      ) : (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Current
                        </span>
                      )}
                    </div>
                  </div>
                ))
              : null}
          </div>
        </article>
      </section>
    </DashboardShell>
  );
}
