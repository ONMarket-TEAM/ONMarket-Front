<template>
  <div class="email-verification">
    <!-- 이메일 입력 -->
    <div class="form-group">
      <div class="email-input-group">
        <input
          id="email"
          v-model="email"
          type="email"
          class="form-input"
          placeholder="example@email.com"
          :disabled="isVerified || disabled"
          required
        />
        <button
          type="button"
          class="send-code-button"
          @click="sendVerificationCode"
          :disabled="!canSendCode || isVerified || disabled"
        >
          <span v-if="isSendingCode">발송중...</span>
          <span v-else>{{ codeSent ? '재발송' : '인증 메일 발송' }}</span>
        </button>
      </div>
      <div class="input-hint">올바른 이메일 주소를 입력해주세요</div>
      <!-- 잠금 안내 -->
      <div v-if="isLocked" class="lock-text">
        재발송 시도를 3회 초과하여 {{ formatTime(lockTimer) }} 후 다시 시도할 수 있습니다.
      </div>
    </div>

    <!-- 인증번호 입력 -->
    <div v-if="codeSent" class="form-group mt-4">
      <div class="verification-input-group">
        <input
          id="verification-code"
          v-model="verificationCode"
          type="text"
          class="form-input"
          placeholder="인증번호 6자리를 입력하세요"
          maxlength="6"
          :disabled="isVerified || disabled"
          @input="filterNumbers"
        />
        <button
          type="button"
          class="verify-button"
          @click="verifyCode"
          :disabled="!canVerifyCode || isVerified || disabled"
        >
          <span v-if="isVerifying">확인중...</span>
          <span v-else>확인</span>
        </button>
      </div>
      <div v-if="timer > 0" class="timer-text">남은 시간: {{ formatTime(timer) }}</div>
      <div v-if="timer === 0" class="expired-text">인증번호가 만료되었습니다. 재발송해주세요.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { mailAPI } from '@/api/mail';

// Props
const props = defineProps({
  modelValue: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  autoReset: { type: Boolean, default: true },
});

// Emits
const emit = defineEmits(['update:modelValue', 'verified', 'error', 'code-sent']);

// Reactive data
const email = ref(props.modelValue);
const verificationCode = ref('');
const isVerified = ref(false);
const codeSent = ref(false);
const isSendingCode = ref(false);
const isVerifying = ref(false);
const timer = ref(0);
const timerInterval = ref(null);

// 재발송 제한 - ref로 변경
const resendCount = ref(0);
const isLocked = ref(false);
const lockTimer = ref(0);
const lockInterval = ref(null);

// Computed
const canSendCode = computed(() => {
  if (props.disabled || isSendingCode.value || isLocked.value) return false;
  const validation = mailAPI.validateEmail(email.value);
  return validation.isValid;
});

const canVerifyCode = computed(() => {
  if (props.disabled || isVerifying.value) return false;
  return verificationCode.value.length === 6 && timer.value > 0;
});

// Watch
watch(
  () => props.modelValue,
  (newValue) => (email.value = newValue)
);

watch(email, (newEmail, oldEmail) => {
  emit('update:modelValue', newEmail);
  if (props.autoReset && oldEmail && newEmail !== oldEmail) {
    resetVerification();
    resendCount.value = 0;
    if (lockInterval.value) {
      clearInterval(lockInterval.value);
      lockInterval.value = null;
    }
    isLocked.value = false;
  }
});

// Methods
const filterNumbers = () => {
  verificationCode.value = verificationCode.value.replace(/[^0-9]/g, '');
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const startTimer = () => {
  stopTimer();
  timer.value = 300;
  timerInterval.value = setInterval(() => {
    timer.value--;
    if (timer.value <= 0) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
};

const resetVerification = () => {
  isVerified.value = false;
  codeSent.value = false;
  verificationCode.value = '';
  stopTimer();
};

// 재발송 제한
const startLock = () => {
  if (lockInterval.value) clearInterval(lockInterval.value);

  isLocked.value = true;
  lockTimer.value = 180;
  resendCount.value = 0;

  lockInterval.value = setInterval(() => {
    lockTimer.value--;
    if (lockTimer.value <= 0) {
      clearInterval(lockInterval.value);
      lockInterval.value = null;
      isLocked.value = false;
    }
  }, 1000);
};

const sendVerificationCode = async () => {
  if (!canSendCode.value) return;
  const validation = mailAPI.validateEmail(email.value);

  try {
    isSendingCode.value = true;
    const result = await mailAPI.sendVerificationCode(validation.cleanEmail);

    if (result.success) {
      codeSent.value = true;
      isVerified.value = false;
      verificationCode.value = '';
      stopTimer();
      startTimer();

      resendCount.value++;
      if (resendCount.value >= 3) startLock();

      emit('code-sent', { email: email.value, cleanEmail: validation.cleanEmail });
    } else {
      emit('error', { type: 'send-code', message: result.message });
    }
  } catch (error) {
    emit('error', { type: 'send-code', error });
  } finally {
    isSendingCode.value = false;
  }
};

const verifyCode = async () => {
  if (!canVerifyCode.value) return;
  const validation = mailAPI.validateEmail(email.value);

  try {
    isVerifying.value = true;
    const result = await mailAPI.confirmVerificationCode({
      email: validation.cleanEmail,
      code: verificationCode.value,
    });

    if (result.success) {
      isVerified.value = true;
      stopTimer();
      emit('verified', {
        email: email.value,
        cleanEmail: validation.cleanEmail,
        verificationCode: verificationCode.value,
      });
    } else {
      if (result.error === 'FORBIDDEN') {
        codeSent.value = false;
        verificationCode.value = '';
        stopTimer();
      }
      emit('error', { type: 'verify-code', message: result.message });
    }
  } catch (error) {
    emit('error', { type: 'verify-code', error });
  } finally {
    isVerifying.value = false;
  }
};
const reset = () => {
  email.value = '';
  resetVerification();
  resendCount.value = 0;
  if (lockInterval.value) {
    clearInterval(lockInterval.value);
    lockInterval.value = null;
  }
  isLocked.value = false;
  lockTimer.value = 0;
};

const getVerificationStatus = () => ({
  isVerified: isVerified.value,
  email: email.value,
  codeSent: codeSent.value,
});

defineExpose({ reset, getVerificationStatus, resetVerification });

onUnmounted(() => {
  stopTimer();
  if (lockInterval.value) {
    clearInterval(lockInterval.value);
    lockInterval.value = null;
  }
});
</script>
<style scoped>
.email-verification {
  width: 100%;
}

.form-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--color-light-1);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #fff;
}
.form-input:focus {
  outline: none;
  border-color: var(--color-main);
  background: #fff;
  box-shadow: 0 0 0 3px var(--color-light-3);
}
.form-input:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.email-input-group,
.verification-input-group {
  display: flex;
  gap: 0.8rem;
}
.email-input-group .form-input,
.verification-input-group .form-input {
  flex: 1;
}

.send-code-button,
.verify-button {
  padding: 0.9rem 1rem;
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 120px;
}
.send-code-button:hover:not(:disabled),
.verify-button:hover:not(:disabled) {
  box-shadow: 0 10px 30px var(--color-light-3);
}
.send-code-button:disabled,
.verify-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.input-hint {
  font-size: 0.8rem;
  color: #999;
  margin-top: 0.3rem;
}
.timer-text {
  font-size: 0.85rem;
  color: var(--color-main);
  margin-top: 0.5rem;
  font-weight: 600;
}
.expired-text {
  font-size: 0.85rem;
  color: #dc3545;
  margin-top: 0.5rem;
  font-weight: 600;
}

.lock-text {
  font-size: 0.85rem;
  color: #dc3545;
  margin-top: 0.5rem;
  font-weight: 600;
}
</style>
