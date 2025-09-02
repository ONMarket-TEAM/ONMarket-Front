<template>
  <div class="step-content">
    <div class="form-group">
      <label class="form-label">사업장 유형</label>
      <div class="form-control">
        <div class="radio-group">
          <label class="radio-label">
            <input
              :value="'INDIVIDUAL'"
              :checked="modelValue === 'INDIVIDUAL'"
              @change="$emit('update:modelValue', $event.target.value)"
              type="radio"
              class="radio-input"
              required
            />
            <span class="radio-text">개인사업자</span>
          </label>
          <label class="radio-label">
            <input
              :value="'CORPORATE'"
              :checked="modelValue === 'CORPORATE'"
              @change="$emit('update:modelValue', $event.target.value)"
              type="radio"
              class="radio-input"
              required
            />
            <span class="radio-text">법인사업자</span>
          </label>
        </div>
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
</script>

<style scoped>
.step-content {
  width: 100%;
  max-width: 800px;
  margin: 0 auto; 
}

/* 폼 그룹 */
.form-group {
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  max-width: 800px;
}

/* 라벨 스타일 - 고정 너비와 정렬 */
.form-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
  text-align: left;
  padding-top: 0.5rem; 
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

/* 라디오 버튼 그룹 */
.radio-group {
  display: flex;
  gap: 2rem;
  padding-top: 0.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 1rem;
  color: #333;
  transition: color 0.3s ease;
}

.radio-label:hover {
  color: var(--color-main);
}

.radio-input {
  margin-right: 0.5rem;
  width: 18px;
  height: 18px;
  accent-color: var(--color-main);
  cursor: pointer;
}

.radio-text {
  user-select: none;
  font-weight: 500;
}

/* 메시지 스타일 */
.check-message {
  font-size: 0.85rem;
  font-weight: 500;
}

.check-message.error {
  color: #dc3545;
}

/* 선택된 라디오 버튼 시각적 강조 */
.radio-input:checked + .radio-text {
  color: var(--color-main);
  font-weight: 600;
}
</style>
