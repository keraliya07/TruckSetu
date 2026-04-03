import { create } from 'zustand';

const buildToast = (payload) => ({
  id:
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  duration: 3600,
  ...payload,
});

export const useToastStore = create((set) => ({
  toasts: [],
  push: (payload) =>
    set((state) => ({
      toasts: [...state.toasts, buildToast(payload)].slice(-5),
    })),
  dismiss: (toastId) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== toastId),
    })),
  success: (title, description) =>
    useToastStore.getState().push({ tone: 'success', title, description }),
  error: (title, description) =>
    useToastStore.getState().push({ tone: 'error', title, description }),
  info: (title, description) =>
    useToastStore.getState().push({ tone: 'info', title, description }),
}));
