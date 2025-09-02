<template>
  <div class="step-content">
    <div class="form-group">
      <label for="businessName" class="form-label">사업명</label>
      <div class="form-control">
        <input
          id="businessName"
          :value="modelValue"
          @input="handleInput"
          type="text"
          class="form-input"
          :class="{ 'input-error': error }"
          placeholder="사업명을 입력하세요"
          maxlength="100"
          required
        />
        <div class="input-hint">사업자등록증 상의 상호명을 입력해주세요</div>
        <div v-if="error" class="check-message error">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);

const handleInput = (event) => {
  const value = event.target.value;
  emit('update:modelValue', value);
};
</script>

<style scoped>
/* 폼 그룹 */
.form-group {
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  max-width: 800px;
}

.step-content {
  width: 100%;
  max-width: 800px;
  margin: 0 auto; 
}

/* 라벨 스타일 - 고정 너비와 정렬 */
.form-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
  text-align: left;
  padding-top: 0.9rem;
  line-height: 1.2;
}

/* 폼 컨트롤 컨테이너 */
.form-control {
  border: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

/* 입력창 스타일 */
.form-input {
  width: 100%;
  padding: 0.9rem 1rem;
  border: 2px solid var(--color-light-1);
  border-radius: 12px;
  font-size: 1rem;
  background: var(--color-white);
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-main);
  background: white;
  box-shadow: 0 0 0 3px var(--color-light-3);
}

/* 입력 힌트 */
.input-hint {
  font-size: 0.85rem;
  color: #999;
  font-weight: 500;
}

/* 입력 상태 스타일 */
.input-error {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1) !important;
}

/* 메시지 스타일 */
.check-message {
  font-size: 0.85rem;
  font-weight: 500;
}

.check-message.error {
  color: #dc3545;
}
</style>
