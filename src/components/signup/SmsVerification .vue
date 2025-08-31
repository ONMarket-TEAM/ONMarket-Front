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
          <span v-else-if="timer > 0">{{ formatTime(timer) }}</span>
          <span v-else>{{ codeSent ? '재발송' : '인증번호 발송' }}</span>
        </button>
      </div>
      <div class="input-hint">'-' 없이 입력하셔도 자동으로 형식이 맞춰집니다</div>
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

    <!-- 메시지 -->
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { smsAPI } from '@/api/sms';

// Props
const props = defineProps({
  // 초기 전화번호 값
  modelValue: {
    type: String,
    default: '',
  },
  // 컴포넌트 비활성화 여부
  disabled: {
    type: Boolean,
    default: false,
  },
  // 자동 초기화 여부 (새로운 전화번호 입력 시 인증 상태 리셋)
  autoReset: {
    type: Boolean,
    default: true,
  },
});

// Emits
const emit = defineEmits([
  'update:modelValue', // v-model 양방향 바인딩
  'verified', // 인증 완료 시
  'error', // 에러 발생 시
  'code-sent', // 인증번호 발송 완료 시
]);

// Reactive data
const phoneNumber = ref(props.modelValue);
const verificationCode = ref('');
const isVerified = ref(false);
const codeSent = ref(false);
const isSendingCode = ref(false);
const isVerifying = ref(false);
const timer = ref(0);
const timerInterval = ref(null);
const message = ref('');
const messageType = ref('');

// Computed
const canSendCode = computed(() => {
  if (props.disabled || isSendingCode.value) return false;

  const validation = smsAPI.validatePhoneNumber(phoneNumber.value);
  return validation.isValid;
});

const canVerifyCode = computed(() => {
  if (props.disabled || isVerifying.value) return false;

  return verificationCode.value.length === 6 && timer.value > 0;
});

// Watch for external value changes
watch(
  () => props.modelValue,
  (newValue) => {
    phoneNumber.value = newValue;
  }
);

// Watch phone number changes
watch(phoneNumber, (newPhone, oldPhone) => {
  // Emit v-model update
  emit('update:modelValue', newPhone);

  // Auto reset when phone number changes
  if (props.autoReset && oldPhone && newPhone !== oldPhone) {
    resetVerification();
  }
});

// Methods
const formatPhoneNumber = () => {
  let phone = phoneNumber.value.replace(/[^0-9]/g, '');

  if (phone.length <= 3) {
    phoneNumber.value = phone;
  } else if (phone.length <= 7) {
    phoneNumber.value = `${phone.slice(0, 3)}-${phone.slice(3)}`;
  } else if (phone.length <= 11) {
    phoneNumber.value = `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
  }
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
    if (timer.value <= 0) {
      clearInterval(timerInterval.value);
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
  message.value = '';
  stopTimer();
};

const sendVerificationCode = async () => {
  if (!canSendCode.value) return;

  const validation = smsAPI.validatePhoneNumber(phoneNumber.value);

  try {
    isSendingCode.value = true;
    message.value = '';

    const result = await smsAPI.sendVerificationCode(validation.cleanNumber);

    if (result.success) {
      codeSent.value = true;
      isVerified.value = false;
      verificationCode.value = '';
      message.value = '인증번호가 발송되었습니다.';
      messageType.value = 'success';

      // 기존 타이머가 있다면 정지
      stopTimer();
      startTimer();

      emit('code-sent', {
        phone: phoneNumber.value,
        cleanNumber: validation.cleanNumber,
      });
    } else {
      message.value = result.message;
      messageType.value = 'error';
      emit('error', {
        type: 'send-code',
        message: result.message,
      });
    }
  } catch (error) {
    console.error('SMS send error:', error);
    message.value = '인증번호 발송 중 오류가 발생했습니다.';
    messageType.value = 'error';
    emit('error', {
      type: 'send-code',
      error,
    });
  } finally {
    isSendingCode.value = false;
  }
};

const verifyCode = async () => {
  if (!canVerifyCode.value) return;

  const validation = smsAPI.validatePhoneNumber(phoneNumber.value);

  try {
    isVerifying.value = true;
    message.value = '';

    const result = await smsAPI.confirmVerificationCode(
      validation.cleanNumber,
      verificationCode.value
    );

    if (result.success) {
      isVerified.value = true;
      message.value = '휴대폰 인증이 완료되었습니다.';
      messageType.value = 'success';
      stopTimer();

      emit('verified', {
        phone: phoneNumber.value,
        cleanNumber: validation.cleanNumber,
        verificationCode: verificationCode.value,
      });
    } else {
      message.value = result.message;
      messageType.value = 'error';
      emit('error', {
        type: 'verify-code',
        message: result.message,
      });
    }
  } catch (error) {
    console.error('SMS verification error:', error);
    message.value = '인증번호 확인 중 오류가 발생했습니다.';
    messageType.value = 'error';
    emit('error', {
      type: 'verify-code',
      error,
    });
  } finally {
    isVerifying.value = false;
  }
};

// Public methods (template ref로 접근 가능)
const reset = () => {
  phoneNumber.value = '';
  resetVerification();
};

const getVerificationStatus = () => {
  return {
    isVerified: isVerified.value,
    phone: phoneNumber.value,
    codeSent: codeSent.value,
  };
};

// Expose methods for parent component
defineExpose({
  reset,
  getVerificationStatus,
  resetVerification,
});

// Cleanup on unmount
onUnmounted(() => {
  stopTimer();
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
  border: 2px solid var(--color-light-1, #e5e7eb);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: var(--color-white, #ffffff);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-main, #3b82f6);
  background: white;
  box-shadow: 0 0 0 3px var(--color-light-3, #dbeafe);
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
  background-color: var(--color-main, #3b82f6);
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
  background-color: var(--color-main-hover, #2563eb);
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
  color: var(--color-main, #3b82f6);
  margin-top: 0.5rem;
  font-weight: 600;
}

.expired-text {
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

.message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 640px) {
  .phone-input-group,
  .verification-input-group {
    flex-direction: column;
  }

  .send-code-button,
  .verify-button {
    width: 100%;
    min-width: unset;
  }
}
</style>
