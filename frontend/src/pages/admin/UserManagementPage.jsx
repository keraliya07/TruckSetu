import { useEffect, useState } from 'react';
import { ShieldCheck, Users } from 'lucide-react';

import { getUserById, getUsers, updateUserStatus } from '../../api/admin.api';
import ConfirmModal from '../../components/common/ConfirmModal';
import DashboardShell from '../../components/common/DashboardShell';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageTabs from '../../components/common/PageTabs';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatDateTime } from '../../utils/formatters';

const statusOptions = ['ACTIVE', 'PENDING', 'SUSPENDED', 'DISABLED'];
const roleOptions = ['ADMIN', 'WAREHOUSE', 'DEALER'];

function countLabel(value, label) {
  return `${value || 0} ${label}`;
}

export default function UserManagementPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    role: '',
    status: '',
    search: '',
  });
  const [usersState, setUsersState] = useState({
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
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setUsersState((current) => ({
        ...current,
        isLoading: true,
        error: null,
      }));

      try {
        const result = await getUsers({
          ...filters,
          role: filters.role || undefined,
          status: filters.status || undefined,
          search: filters.search || undefined,
        });

        if (cancelled) {
          return;
        }

        setUsersState({
          users: result.users || [],
          total: result.total || 0,
          isLoading: false,
          error: null,
        });

        if (!selectedUserId && result.users?.length) {
          setSelectedUserId(result.users[0].id);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setUsersState({
          users: [],
          total: 0,
          isLoading: false,
          error: error.message || 'Failed to load users',
        });
      }
    }

    loadUsers().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [filters]);

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
          error: error.message || 'Failed to load user details',
        });
      }
    }

    loadSelectedUser().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [selectedUserId]);

  async function handleConfirmStatusUpdate() {
    if (!pendingStatusUpdate) {
      return;
    }

    setIsUpdating(true);

    try {
      const updated = await updateUserStatus(pendingStatusUpdate.userId, {
        accountStatus: pendingStatusUpdate.accountStatus,
      });

      setUsersState((current) => ({
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

      setPendingStatusUpdate(null);
    } catch (error) {
      setUsersState((current) => ({
        ...current,
        error: error.message || 'Failed to update user status',
      }));
    } finally {
      setIsUpdating(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil((usersState.total || 0) / filters.limit));
  const selectedUser = selectedUserState.user;

  return (
    <DashboardShell
      accent="text-signal-600"
      eyebrow="Admin Control"
      title="User management"
      subtitle="Search platform accounts, inspect role-specific profiles, and update account status without leaving the admin workspace."
    >
      <PageTabs
        items={[
          { to: '/admin/analytics', label: 'Analytics' },
          { to: '/admin/users', label: 'Users', active: true },
          { to: '/admin/disputes', label: 'Disputes' },
        ]}
      />

      <section className="panel p-6">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.9fr_0.9fr_0.6fr]">
          <input
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-freight-500"
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                page: 1,
                search: event.target.value,
              }))
            }
            placeholder="Search by name or email"
            type="search"
            value={filters.search}
          />
          <select
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-freight-500"
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                page: 1,
                role: event.target.value,
              }))
            }
            value={filters.role}
          >
            <option value="">All roles</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
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
            <option value="">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            {usersState.total} account(s)
          </div>
        </div>
      </section>

      {usersState.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {usersState.error}
        </div>
      ) : null}

      {usersState.isLoading ? <LoadingSpinner label="Loading user directory..." /> : null}

      {!usersState.isLoading && !usersState.users.length ? (
        <EmptyState
          description="No users matched the current filters."
          icon={Users}
          title="No accounts found"
        />
      ) : null}

      {usersState.users.length ? (
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="panel p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Accounts</p>
                <h2 className="mt-2 font-heading text-2xl text-slate-950">Platform users</h2>
              </div>
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

            <div className="mt-6 space-y-4">
              {usersState.users.map((user) => (
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
                    <span>{user.role}</span>
                    <span>{formatDate(user.createdAt)}</span>
                    <span>{countLabel(user._count?.sessions, 'session(s)')}</span>
                    <span>{countLabel(user._count?.notifications, 'notification(s)')}</span>
                  </div>
                </button>
              ))}
            </div>
          </article>

          <article className="panel p-5">
            {selectedUserState.isLoading ? <LoadingSpinner label="Loading user details..." /> : null}

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

                {selectedUser.warehouse ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Warehouse profile</p>
                    <p className="mt-2 font-semibold text-slate-950">
                      {selectedUser.warehouse.warehouseName}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {selectedUser.warehouse.city} • {selectedUser.warehouse.address}
                    </p>
                  </div>
                ) : null}

                {selectedUser.truckDealer ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Dealer profile</p>
                    <p className="mt-2 font-semibold text-slate-950">
                      {selectedUser.truckDealer.companyName}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {selectedUser.truckDealer.primaryCity} • {selectedUser.truckDealer.trucks?.length || 0} truck(s)
                    </p>
                  </div>
                ) : null}

                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Account controls</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {statusOptions
                      .filter((status) => status !== selectedUser.accountStatus)
                      .map((status) => (
                        <button
                          key={status}
                          className="btn-secondary"
                          onClick={() =>
                            setPendingStatusUpdate({
                              userId: selectedUser.id,
                              userName: selectedUser.name,
                              accountStatus: status,
                            })
                          }
                          type="button"
                        >
                          Set {status}
                        </button>
                      ))}
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Recent sessions</p>
                    <div className="mt-3 space-y-3">
                      {selectedUser.sessions?.length ? (
                        selectedUser.sessions.map((session) => (
                          <div
                            key={session.id}
                            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700"
                          >
                            <p className="font-semibold text-slate-900">
                              {session.userAgent || 'Unknown device'}
                            </p>
                            <p className="mt-1">{session.ipAddress || 'IP not captured'}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">
                              Expires {formatDateTime(session.expiresAt)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500">
                          No active sessions recorded.
                        </p>
                      )}
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
                              {notification.type} • {formatDateTime(notification.createdAt)}
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
              </div>
            ) : !selectedUserState.isLoading ? (
              <EmptyState
                description="Select a user from the list to inspect profile and activity details."
                icon={ShieldCheck}
                title="Choose an account"
              />
            ) : null}
          </article>
        </section>
      ) : null}

      <ConfirmModal
        cancelText="Keep current status"
        confirmText={pendingStatusUpdate ? `Set ${pendingStatusUpdate.accountStatus}` : 'Confirm'}
        isLoading={isUpdating}
        isOpen={Boolean(pendingStatusUpdate)}
        message={
          pendingStatusUpdate
            ? `Update ${pendingStatusUpdate.userName}'s account to ${pendingStatusUpdate.accountStatus}?`
            : ''
        }
        onClose={() => setPendingStatusUpdate(null)}
        onConfirm={handleConfirmStatusUpdate}
        title="Update user status"
        variant="warning"
      />
    </DashboardShell>
  );
}
