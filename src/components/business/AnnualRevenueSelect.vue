<template>
  <div class="step-content">
    <!-- 추가 -->
    <div class="form-group">
      <label for="annualRevenue" class="form-label">연 매출</label>
      <div class="form-control">
        <select
          id="annualRevenue"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          class="form-select"
          :class="{ 'input-error': error }"
          required
        >
          <option value="" disabled>연 매출 범위를 선택하세요</option>
          <option v-for="revenue in revenueRanges" :key="revenue.value" :value="revenue.value">
            {{ revenue.label }}
          </option>
        </select>
        <div v-if="error" class="check-message error">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

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

const revenueRanges = computed(() => [
  { value: 'UNDER_100M', label: '1억원 미만' },
  { value: 'BETWEEN_100M_500M', label: '1억원 ~ 5억원' },
  { value: 'OVER_500M', label: '5억원 초과' },
]);
</script>

<style scoped>
/* 폼 그룹 */
.step-content {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
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

/* 셀렉트박스 기본 스타일 */
.form-select {
  width: 100%;
  padding: 0.9rem 1rem;
  border: 2px solid var(--color-light-1);
  border-radius: 12px;
  font-size: 1rem;
  background: var(--color-white);
  transition: all 0.3s ease;
}

.form-select:focus {
  outline: none;
  border-color: var(--color-main);
  background: white;
  box-shadow: 0 0 0 3px var(--color-light-3);
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
