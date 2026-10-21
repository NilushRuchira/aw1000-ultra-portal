import { create } from 'zustand';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  durationMs?: number;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newItem: ToastItem = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newItem] }));

    const duration = toast.durationMs ?? (toast.type === 'error' ? 5000 : 3500);
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, duration);

    return id;
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  clearToasts: () => set({ toasts: [] }),
}));

export const toast = {
  success: (title: string, message?: string, durationMs?: number) =>
    useToastStore.getState().addToast({ type: 'success', title, message, durationMs }),
  error: (title: string, message?: string, durationMs?: number) =>
    useToastStore.getState().addToast({ type: 'error', title, message, durationMs }),
  warning: (title: string, message?: string, durationMs?: number) =>
    useToastStore.getState().addToast({ type: 'warning', title, message, durationMs }),
  info: (title: string, message?: string, durationMs?: number) =>
    useToastStore.getState().addToast({ type: 'info', title, message, durationMs }),
};
