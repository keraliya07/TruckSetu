import { useDeferredValue, useEffect, useRef, useState } from 'react';
import { Users, Search } from 'lucide-react';

import { getUserById, getUsers, updateUserStatus } from '../../api/admin.api';
import ConfirmModal from '../../components/common/ConfirmModal';
import DashboardShell from '../../components/common/DashboardShell';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, formatDateTime } from '../../utils/formatters';

const statusOptions = ['ACTIVE', 'PENDING', 'SUSPENDED', 'DISABLED'];
const roleOptions = ['ADMIN', 'ANALYST', 'WAREHOUSE', 'DEALER'];

function countLabel(value, label) {
  return `${value || 0} ${label}`;
}

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const canManageUsers = currentUser?.role === 'ADMIN';
  const [filters, setFilters] = useState({
    page: 1,
    limit: 1000,
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
  const deferredSearch = useDeferredValue(filters.search);

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
          search: deferredSearch || undefined,
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
  }, [deferredSearch, filters.limit, filters.page, filters.role, filters.status]);



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

  const selectedUser = selectedUserState.user;

  return (
    <DashboardShell
      accent="text-signal-600"
      eyebrow="Admin Control"
      title="User management"
      subtitle={
        canManageUsers
          ? 'Search platform accounts, inspect role-specific profiles, and update account status without leaving the admin workspace.'
          : 'Search platform accounts and inspect role-specific profiles in read-only mode.'
      }
    >
      <section className="panel p-6">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.9fr_0.9fr_0.6fr]">
          <div className="relative group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-freight-500 transition-colors duration-300">
              <Search size={18} />
            </div>
            <input
              className="w-full rounded-2xl border border-slate-300 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all duration-300 bg-slate-50/50 hover:bg-slate-50 focus:bg-white placeholder:text-slate-400 focus:border-freight-500 focus:ring-4 focus:ring-freight-500/10 shadow-sm"
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
          </div>
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

      {usersState.isLoading && !usersState.users.length ? <LoadingSpinner label="Loading user directory..." /> : null}

      {!usersState.isLoading && !usersState.users.length ? (
        <EmptyState
          description="No users matched the current filters."
          icon={Users}
          title="No accounts found"
        />
      ) : null}

      {usersState.users.length ? (
        <section
          className={`transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
            selectedUserId
              ? 'grid gap-6 xl:grid-cols-[1.4fr_0.9fr] xl:items-start'
              : 'mx-auto max-w-4xl'
          }`}
        >
          <div className="flex flex-col">
            <div className="mb-4 px-2">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Accounts</p>
                <h2 className="mt-2 font-heading text-2xl text-slate-950">Platform users</h2>
              </div>
            </div>

            <div
              className={`space-y-4 transition-opacity duration-200 ${
                usersState.isLoading ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {usersState.users.map((user, index) => (
                <button
                  key={user.id}
                  className={`group w-full relative overflow-hidden rounded-[2rem] border text-left transition-all duration-300 hover:-translate-y-[2px] p-6 sm:p-7 block ${
                    selectedUserId === user.id
                      ? 'border-white/60 bg-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-slate-100 backdrop-blur-xl scale-[1.02] z-10'
                      : 'border-slate-200/60 bg-white hover:border-slate-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] shadow-[0_2px_10px_rgb(0,0,0,0.02)]'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => setSelectedUserId(user.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className={`font-heading text-[1.25rem] font-bold transition ${selectedUserId === user.id ? 'text-freight-900' : 'text-slate-900 group-hover:text-freight-700'}`}>
                        {user.name}
                      </p>
                      <p className="mt-0.5 text-[0.8rem] text-slate-400 font-medium tracking-wide">{user.email}</p>
                    </div>
                    <div className="shrink-0 mt-1">
                      <StatusBadge size="md" status={user.accountStatus} />
                    </div>
                  </div>
                  <div className={`mt-6 flex flex-wrap items-center gap-3 text-[0.7rem] font-bold uppercase tracking-widest ${selectedUserId === user.id ? 'text-freight-600' : 'text-slate-400'}`}>
                    <span>{user.role}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                    <span>{formatDate(user.createdAt)}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                    <span>{countLabel(user._count?.notifications, 'alert(s)')}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedUserId ? (
            <article className="rounded-3xl bg-white/40 border border-slate-100 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl flex h-[calc(100vh-1.5rem)] max-h-[1200px] flex-col xl:sticky xl:top-3 animate-slide-up">
              <div className="flex-1 overflow-y-auto p-5">
                {selectedUserState.isLoading ? <LoadingSpinner label="Loading user details..." /> : null}

            {selectedUserState.error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {selectedUserState.error}
              </div>
            ) : null}

            {selectedUser ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <p className="inline-block rounded-full bg-slate-100/80 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-slate-500 backdrop-blur-sm">User Details</p>
                      <button
                        className="-mr-2 -mt-2 rounded-full p-2 text-slate-400 transition hover:bg-white hover:text-slate-700 hover:shadow-sm"
                        onClick={() => setSelectedUserId(null)}
                        title="Close details"
                        type="button"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <h2 className="mt-3 font-heading text-3xl font-medium bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">{selectedUser.name}</h2>
                    <p className="mt-1 font-medium text-slate-500">{selectedUser.email}</p>
                  </div>
                  <div className="mt-1 sm:mt-0 flex flex-col items-end gap-2">
                    <StatusBadge status={selectedUser.accountStatus} size="md" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200/60 bg-white/60 px-5 py-4 shadow-[0_2px_10px_rgb(0,0,0,0.02)] backdrop-blur-md">
                    <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">Role</p>
                    <p className="mt-1 text-lg font-semibold text-slate-800">{selectedUser.role}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200/60 bg-white/60 px-5 py-4 shadow-[0_2px_10px_rgb(0,0,0,0.02)] backdrop-blur-md">
                    <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">Created</p>
                    <p className="mt-1 text-lg font-semibold text-slate-800">
                      {formatDateTime(selectedUser.createdAt)}
                    </p>
                  </div>
                </div>

                {selectedUser.warehouse ? (
                  <div className="rounded-2xl border border-slate-200/60 bg-white/60 px-5 py-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] backdrop-blur-md">
                    <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">Warehouse profile</p>
                    <p className="mt-2 font-semibold text-slate-800">
                      {selectedUser.warehouse.warehouseName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedUser.warehouse.city} • {selectedUser.warehouse.address}
                    </p>
                  </div>
                ) : null}

                {selectedUser.truckDealer ? (
                  <div className="rounded-2xl border border-slate-200/60 bg-white/60 px-5 py-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] backdrop-blur-md">
                    <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">Dealer profile</p>
                    <p className="mt-2 font-semibold text-slate-800">
                      {selectedUser.truckDealer.companyName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedUser.truckDealer.primaryCity} • {selectedUser.truckDealer.trucks?.length || 0} truck(s)
                    </p>
                  </div>
                ) : null}

                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Account controls</p>
                  {canManageUsers ? (
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
                  ) : (
                    <p className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                      Analysts can review accounts here, but they cannot change status or role.
                    </p>
                  )}
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
            ) : null}
              </div>
            </article>
          ) : null}
        </section>
      ) : null}

      {canManageUsers ? (
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
      ) : null}
    </DashboardShell>
  );
}
