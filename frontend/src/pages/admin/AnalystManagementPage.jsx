import { useDeferredValue, useEffect, useState } from 'react';
import { ShieldCheck, Users } from 'lucide-react';

import { getUserById, getUsers, updateUserStatus } from '../../api/admin.api';
import ConfirmModal from '../../components/common/ConfirmModal';
import DashboardShell from '../../components/common/DashboardShell';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatDateTime } from '../../utils/formatters';

const statusOptions = ['ACTIVE', 'DISABLED'];

function countLabel(value, label) {
  return `${value || 0} ${label}`;
}

export default function AnalystManagementPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    status: '',
  });
  const [analystsState, setAnalystsState] = useState({
    users: [],
    total: 0,
    isLoading: true,
    error: null,
  });
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserState, setSelectedUserState] = useState({
    user: null,
    isLoading: false,
    error: null,
  });
  const [pendingAccessUpdate, setPendingAccessUpdate] = useState(null);
  const [managementFeedback, setManagementFeedback] = useState('');
  const [managementError, setManagementError] = useState('');
  const [isUpdatingAccess, setIsUpdatingAccess] = useState(false);
  const deferredSearch = useDeferredValue(filters.search);

  useEffect(() => {
    let cancelled = false;

    async function loadAnalysts() {
      setAnalystsState((current) => ({
        ...current,
        isLoading: true,
        error: null,
      }));

      try {
        const result = await getUsers({
          page: filters.page,
          limit: filters.limit,
          role: 'ANALYST',
          search: deferredSearch || undefined,
          status: filters.status || undefined,
        });

        if (cancelled) {
          return;
        }

        setAnalystsState({
          users: result.users || [],
          total: result.total || 0,
          isLoading: false,
          error: null,
        });

        setSelectedUserId((current) =>
          result.users?.some((user) => user.id === current) ? current : result.users?.[0]?.id || null
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        setAnalystsState({
          users: [],
          total: 0,
          isLoading: false,
          error: error.message || 'Failed to load analysts',
        });
      }
    }

    loadAnalysts().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [deferredSearch, filters.limit, filters.page, filters.status]);

  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUserState({
        user: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    let cancelled = false;

    async function loadSelectedUser() {
      setSelectedUserState({
        user: null,
        isLoading: true,
        error: null,
      });

      try {
        const result = await getUserById(selectedUserId);

        if (cancelled) {
          return;
        }

        setSelectedUserState({
          user: result,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setSelectedUserState({
          user: null,
          isLoading: false,
          error: error.message || 'Failed to load analyst details',
        });
      }
    }

    loadSelectedUser().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [selectedUserId]);

  async function handleConfirmAccessUpdate() {
    if (!pendingAccessUpdate) {
      return;
    }

    setIsUpdatingAccess(true);
    setManagementFeedback('');
    setManagementError('');

    try {
      const updated = await updateUserStatus(pendingAccessUpdate.userId, {
        accountStatus: pendingAccessUpdate.accountStatus,
      });

      setAnalystsState((current) => ({
        ...current,
        users: current.users.map((user) =>
          user.id === updated.id ? { ...user, accountStatus: updated.accountStatus } : user
        ),
      }));

      if (selectedUserId === updated.id) {
        setSelectedUserState((current) => ({
          ...current,
          user: current.user ? { ...current.user, accountStatus: updated.accountStatus } : current.user,
        }));
      }

      setManagementFeedback(
        pendingAccessUpdate.accountStatus === 'DISABLED'
          ? `Access revoked for ${pendingAccessUpdate.userName}.`
          : `Access restored for ${pendingAccessUpdate.userName}.`
      );
      setPendingAccessUpdate(null);
    } catch (error) {
      setManagementError(error.message || 'Failed to update analyst access');
    } finally {
      setIsUpdatingAccess(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil((analystsState.total || 0) / filters.limit));
  const selectedUser = selectedUserState.user;

  return (
    <DashboardShell
      accent="text-signal-600"
      eyebrow="Admin Control"
      title="Analyst management"
      subtitle="Review analyst-only accounts, inspect full analyst details, and manage their access from one workspace."
    >
      <section className="panel p-6">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_0.6fr]">
          <input
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-freight-500"
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                page: 1,
                search: event.target.value,
              }))
            }
            placeholder="Search analysts by name or email"
            type="search"
            value={filters.search}
          />
          <select
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-freight-500"
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                page: 1,
                status: event.target.value,
              }))
            }
            value={filters.status}
          >
            <option value="">All analyst statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            {analystsState.total} analyst account(s)
          </div>
        </div>
      </section>

      {managementFeedback ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {managementFeedback}
        </div>
      ) : null}

      {managementError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {managementError}
        </div>
      ) : null}

      {analystsState.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {analystsState.error}
        </div>
      ) : null}

      {analystsState.isLoading ? <LoadingSpinner label="Loading analyst accounts..." /> : null}

      {!analystsState.isLoading && !analystsState.users.length ? (
        <EmptyState
          description="No analyst accounts matched the current filters."
          icon={Users}
          title="No analysts found"
        />
      ) : null}

      {analystsState.users.length ? (
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="panel p-5">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Analysts</p>
              <h2 className="mt-2 font-heading text-2xl text-slate-950">Analyst directory</h2>
            </div>

            <div className="mt-6 space-y-4">
              {analystsState.users.map((user) => (
                <button
                  key={user.id}
                  className={`w-full rounded-3xl border px-5 py-5 text-left transition ${
                    selectedUserId === user.id
                      ? 'border-freight-400 bg-freight-50'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedUserId(user.id)}
                  type="button"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{user.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{user.email}</p>
                    </div>
                    <StatusBadge status={user.accountStatus} />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <span>{formatDate(user.createdAt)}</span>
                    <span>{countLabel(user._count?.notifications, 'notification(s)')}</span>
                  </div>
                </button>
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
                <p className="text-sm font-medium text-slate-500">
                  Page {filters.page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    className="btn-secondary"
                    disabled={filters.page <= 1}
                    onClick={() =>
                      setFilters((current) => ({ ...current, page: Math.max(1, current.page - 1) }))
                    }
                    type="button"
                  >
                    Prev
                  </button>
                  <button
                    className="btn-secondary"
                    disabled={filters.page >= totalPages}
                    onClick={() =>
                      setFilters((current) => ({
                        ...current,
                        page: Math.min(totalPages, current.page + 1),
                      }))
                    }
                    type="button"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </article>

          <article className="panel p-5">
            {selectedUserState.isLoading ? <LoadingSpinner label="Loading analyst details..." /> : null}

            {selectedUserState.error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {selectedUserState.error}
              </div>
            ) : null}

            {selectedUser ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Details</p>
                    <h2 className="mt-2 font-heading text-2xl text-slate-950">{selectedUser.name}</h2>
                    <p className="mt-1 text-sm text-slate-600">{selectedUser.email}</p>
                  </div>
                  <StatusBadge status={selectedUser.accountStatus} size="md" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Role</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{selectedUser.role}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Created</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      {formatDateTime(selectedUser.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Phone</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      {selectedUser.phone || 'Not provided'}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Email status</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      {selectedUser.isEmailVerified ? 'Verified' : 'Pending'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Access controls</p>
                  <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                    {selectedUser.accountStatus === 'ACTIVE'
                      ? 'Revoking access disables this analyst account and blocks future requests immediately.'
                      : 'Restore access to let this analyst sign in again with the same email and password.'}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      className={selectedUser.accountStatus === 'ACTIVE' ? 'btn-primary' : 'btn-secondary'}
                      onClick={() =>
                        setPendingAccessUpdate({
                          userId: selectedUser.id,
                          userName: selectedUser.name,
                          accountStatus: selectedUser.accountStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE',
                        })
                      }
                      type="button"
                    >
                      {selectedUser.accountStatus === 'ACTIVE' ? 'Revoke access' : 'Restore access'}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Recent notifications</p>
                  <div className="mt-3 space-y-3">
                    {selectedUser.notifications?.length ? (
                      selectedUser.notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold text-slate-900">{notification.title}</p>
                            <StatusBadge status={notification.isRead ? 'ACTIVE' : 'PENDING'} />
                          </div>
                          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                            {notification.type} | {formatDateTime(notification.createdAt)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500">
                        No recent notifications found.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : !selectedUserState.isLoading ? (
              <EmptyState
                description="Select an analyst to review details and manage access."
                icon={ShieldCheck}
                title="Choose an analyst"
              />
            ) : null}
          </article>
        </section>
      ) : null}

      <ConfirmModal
        cancelText="Keep current access"
        confirmText={pendingAccessUpdate?.accountStatus === 'DISABLED' ? 'Revoke access' : 'Restore access'}
        isLoading={isUpdatingAccess}
        isOpen={Boolean(pendingAccessUpdate)}
        message={
          pendingAccessUpdate
            ? pendingAccessUpdate.accountStatus === 'DISABLED'
              ? `Revoke analyst access for ${pendingAccessUpdate.userName}?`
              : `Restore analyst access for ${pendingAccessUpdate.userName}?`
            : ''
        }
        onClose={() => setPendingAccessUpdate(null)}
        onConfirm={handleConfirmAccessUpdate}
        title={pendingAccessUpdate?.accountStatus === 'DISABLED' ? 'Revoke analyst access' : 'Restore analyst access'}
        variant={pendingAccessUpdate?.accountStatus === 'DISABLED' ? 'warning' : 'info'}
      />
    </DashboardShell>
  );
}
