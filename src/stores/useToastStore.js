// stores/useToastStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([]);
  let nextId = 1;

  const addToast = ({
    type = 'info',
    title = '',
    message = '',
    duration = 3000,
    persistent = false,
  }) => {
    const toast = {
      id: nextId++,
      type,
      title,
      message,
      duration,
      persistent,
      createdAt: Date.now(),
    };

    toasts.value.push(toast);

    // 자동 제거 (persistent가 아닌 경우)
    if (!persistent && duration > 0) {
      setTimeout(() => {
        removeToast(toast.id);
      }, duration);
    }

    return toast.id;
  };

  const removeToast = (id) => {
    const index = toasts.value.findIndex((toast) => toast.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  const clearAll = () => {
    toasts.value = [];
  };

  // 편의 메소드들
  const success = (message, options = {}) => {
    return addToast({ type: 'success', message, ...options });
  };

  const error = (message, options = {}) => {
    return addToast({ type: 'error', message, duration: 3000, ...options });
  };

  const warning = (message, options = {}) => {
    return addToast({ type: 'warning', message, ...options });
  };

  const info = (message, options = {}) => {
    return addToast({ type: 'info', message, ...options });
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
  };
});
