<template>
  <teleport to="body">
    <div class="toast-container">
      <transition-group name="toast" tag="div" class="toast-list">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast--${toast.type}`, { 'toast--persistent': toast.persistent }]"
          @click="removeToast(toast.id)"
        >
          <!-- 아이콘 -->
          <div class="toast__icon">
            <svg
              v-if="toast.type === 'success'"
              class="toast__icon-svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else-if="toast.type === 'error'"
              class="toast__icon-svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else-if="toast.type === 'warning'"
              class="toast__icon-svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            <svg v-else class="toast__icon-svg" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              />
            </svg>
          </div>

          <!-- 내용 -->
          <div class="toast__content">
            <div v-if="toast.title" class="toast__title">{{ toast.title }}</div>
            <div class="toast__message">{{ toast.message }}</div>
          </div>

          <!-- 닫기 버튼 -->
          <button class="toast__close" @click.stop="removeToast(toast.id)" aria-label="알림 닫기">
            <svg class="toast__close-icon" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <!-- 진행률 바 (persistent가 아닌 경우) -->
          <div
            v-if="!toast.persistent && toast.duration > 0"
            class="toast__progress"
            :style="{ animationDuration: `${toast.duration}ms` }"
          ></div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useToastStore } from '@/stores/useToastStore';

const toastStore = useToastStore();
const { toasts } = storeToRefs(toastStore);
const { removeToast } = toastStore;
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 9999;
  pointer-events: none;
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
}

.toast {
  position: relative;
  display: flex;
  align-items: center;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  min-width: 300px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left: 4px solid;
  pointer-events: auto;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.toast:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* 타입별 색상 */
.toast--success {
  border-left-color: #10b981;
}

.toast--error {
  border-left-color: #ef4444;
}

.toast--warning {
  border-left-color: #f59e0b;
}

.toast--info {
  border-left-color: #3b82f6;
}

/* 아이콘 */
.toast__icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0;
}

.toast__icon-svg {
  width: 100%;
  height: 100%;
}

.toast--success .toast__icon {
  color: #10b981;
}

.toast--error .toast__icon {
  color: #ef4444;
}

.toast--warning .toast__icon {
  color: #f59e0b;
}

.toast--info .toast__icon {
  color: #3b82f6;
}

/* 내용 */
.toast__content {
  flex: 1;
  min-width: 0;
}

.toast__title {
  font-weight: 600;
  font-size: 14px;
  color: #374151;
  margin-bottom: 4px;
}

.toast__message {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
  align-items: center;
  word-break: break-word;
}

/* 닫기 버튼 */
.toast__close {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.toast__close:hover {
  color: #6b7280;
  background-color: #f3f4f6;
}

.toast__close-icon {
  width: 16px;
  height: 16px;
}

/* 진행률 바 */
.toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #e5e7eb, #9ca3af);
  animation: toast-progress linear forwards;
}

.toast--success .toast__progress {
  background: linear-gradient(90deg, #d1fae5, #10b981);
}

.toast--error .toast__progress {
  background: linear-gradient(90deg, #fee2e2, #ef4444);
}

.toast--warning .toast__progress {
  background: linear-gradient(90deg, #fef3c7, #f59e0b);
}

.toast--info .toast__progress {
  background: linear-gradient(90deg, #dbeafe, #3b82f6);
}

@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* 트랜지션 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s ease;
}

.toast-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.toast-move {
  transition: transform 0.4s ease;
}
</style>
