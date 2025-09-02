<template>
  <div class="step-content">
    <div class="form-group">
      <label for="establishedYear" class="form-label">설립 연도</label>
      <div class="form-control">
        <select
          id="establishedYear"
          :value="modelValue"
          @input="$emit('update:modelValue', parseInt($event.target.value))"
          class="form-select"
          :class="{ 'input-error': error }"
          required
        >
          <option value="" disabled>설립 연도를 선택하세요</option>
          <option v-for="year in years" :key="year" :value="year">{{ year }}년</option>
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
    type: Number,
    default: null,
  },
  error: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);

const years = computed(() => {
  const currentYear = new Date().getFullYear();
  const years = [];

  // 현재 연도부터 1900년까지 역순으로 생성
  for (let year = currentYear; year >= 1900; year--) {
    years.push(year);
  }

  return years;
});
</script>

<style scoped>
/* 폼 그룹 - 일관된 정렬 */
.form-group {
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  max-width: 600px;
}

.step-content {
  width: 100%;
  max-width: 600px;
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

/* 셀렉트박스 스타일 */
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
