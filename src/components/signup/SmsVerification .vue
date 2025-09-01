<!-- SmsVerification.vue -->
<template>
  <div class="sms-verification">
    <!-- 휴대폰 번호 입력 -->
    <div class="form-group">
      <label for="phone" class="form-label">휴대폰 번호</label>
      <div class="phone-input-group">
        <input
          id="phone"
          v-model="phoneNumber"
          type="tel"
          class="form-input"
          placeholder="010-0000-0000"
          maxlength="13"
          :disabled="isVerified || disabled"
          required
          @input="formatPhoneNumber"
        />
        <button
          type="button"
          class="send-code-button"
          @click="sendVerificationCode"
          :disabled="!canSendCode || isVerified || disabled"
        >
          <span v-if="isSendingCode">발송중...</span>
          <span v-else>{{ codeSent ? '재발송' : '인증번호 발송' }}</span>
        </button>
      </div>
      <div class="input-hint">'-' 없이 입력하셔도 자동으로 형식이 맞춰집니다</div>
      <!-- 잠금 안내 -->
      <div v-if="isLocked" class="lock-text">
        재발송 시도를 3회 초과하여 {{ formatTime(lockTimer) }} 후 다시 시도할 수 있습니다.
      </div>
    </div>

    <!-- 인증번호 입력 -->
    <div v-if="codeSent" class="form-group">
      <label for="verification-code" class="form-label">인증번호</label>
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

    <!-- 인증 완료 표시 -->
    <div v-if="isVerified" class="verification-success">
      <div class="success-icon">✓</div>
      <span>휴대폰 인증이 완료되었습니다</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { smsAPI } from '@/api/sms';

// Props
const props = defineProps({
  modelValue: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  autoReset: { type: Boolean, default: true },
});

// Emits
const emit = defineEmits(['update:modelValue', 'verified', 'error', 'code-sent']);

// Reactive data
const phoneNumber = ref(props.modelValue);
const verificationCode = ref('');
const isVerified = ref(false);
const codeSent = ref(false);
const isSendingCode = ref(false);
const isVerifying = ref(false);
const timer = ref(0);
const timerInterval = ref(null);

// 메시지 (내부용)
const message = ref('');
const messageType = ref('');

// 재발송 제한
const resendCount = ref(0);
const isLocked = ref(false);
const lockTimer = ref(0);
let lockInterval = null;

// Computed
const canSendCode = computed(() => {
  if (props.disabled || isSendingCode.value || isLocked.value) return false;
  const validation = smsAPI.validatePhoneNumber(phoneNumber.value);
  return validation.isValid;
});

const canVerifyCode = computed(() => {
  if (props.disabled || isVerifying.value) return false;
  return verificationCode.value.length === 6 && timer.value > 0;
});

// Watch
watch(
  () => props.modelValue,
  (newValue) => (phoneNumber.value = newValue)
);

watch(phoneNumber, (newPhone, oldPhone) => {
  emit('update:modelValue', newPhone);
  if (props.autoReset && oldPhone && newPhone !== oldPhone) resetVerification();
});

// Methods
const formatPhoneNumber = () => {
  let phone = phoneNumber.value.replace(/[^0-9]/g, '');
  if (phone.length <= 3) phoneNumber.value = phone;
  else if (phone.length <= 7) phoneNumber.value = `${phone.slice(0, 3)}-${phone.slice(3)}`;
  else if (phone.length <= 11)
    phoneNumber.value = `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
};

const filterNumbers = () => {
  verificationCode.value = verificationCode.value.replace(/[^0-9]/g, '');
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const startTimer = () => {
  timer.value = 300; // 5분
  timerInterval.value = setInterval(() => {
    timer.value--;
    if (timer.value <= 0) clearInterval(timerInterval.value);
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
  message.value = '';
  stopTimer();
};

// --- 재발송 제한 로직 ---
const startLock = () => {
  isLocked.value = true;
  lockTimer.value = 180; // 3분
  resendCount.value = 0;

  lockInterval = setInterval(() => {
    lockTimer.value--;
    if (lockTimer.value <= 0) {
      clearInterval(lockInterval);
      isLocked.value = false;
    }
  }, 1000);
};

const sendVerificationCode = async () => {
  if (!canSendCode.value) return;
  const validation = smsAPI.validatePhoneNumber(phoneNumber.value);

  try {
    isSendingCode.value = true;
    const result = await smsAPI.sendVerificationCode(validation.cleanNumber);

    if (result.success) {
      codeSent.value = true;
      isVerified.value = false;
      verificationCode.value = '';
      stopTimer();
      startTimer();

      // 재발송 횟수 체크
      resendCount.value++;
      if (resendCount.value >= 3) startLock();

      emit('code-sent', { phone: phoneNumber.value, cleanNumber: validation.cleanNumber });
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
  const validation = smsAPI.validatePhoneNumber(phoneNumber.value);

  try {
    isVerifying.value = true;
    const result = await smsAPI.confirmVerificationCode(
      validation.cleanNumber,
      verificationCode.value
    );

    if (result.success) {
      isVerified.value = true;
      stopTimer();
      emit('verified', {
        phone: phoneNumber.value,
        cleanNumber: validation.cleanNumber,
        verificationCode: verificationCode.value,
      });
    } else {
      emit('error', { type: 'verify-code', message: result.message });
    }
  } catch (error) {
    emit('error', { type: 'verify-code', error });
  } finally {
    isVerifying.value = false;
  }
};

// Expose
const reset = () => {
  phoneNumber.value = '';
  resetVerification();
};

const getVerificationStatus = () => ({
  isVerified: isVerified.value,
  phone: phoneNumber.value,
  codeSent: codeSent.value,
});

defineExpose({ reset, getVerificationStatus, resetVerification });

// Cleanup
onUnmounted(() => {
  stopTimer();
  if (lockInterval) clearInterval(lockInterval);
});
</script>

<style scoped>
.sms-verification {
  width: 100%;
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
  font-size: 0.9rem;
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

.phone-input-group,
.verification-input-group {
  display: flex;
  gap: 0.8rem;
}
.phone-input-group .form-input,
.verification-input-group .form-input {
  flex: 1;
}

.send-code-button,
.verify-button {
  padding: 1rem 1.2rem;
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 100px;
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

.verification-success {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 12px;
  margin-bottom: 1rem;
}
.success-icon {
  width: 24px;
  height: 24px;
  background-color: #28a745;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}
</style>
