<template>
  <div class="step-content">
    <div class="form-group">
      <label for="employeeCount" class="form-label">직원 수</label>
      <div class="form-control">
        <div class="input-with-unit">
          <input
            id="employeeCount"
            :value="displayValue"
            @input="handleInput"
            @blur="formatNumber"
            type="text"
            class="form-input"
            :class="{ 'input-error': error }"
            placeholder="직원 수를 입력하세요"
            required
          />
          <span class="input-unit">명</span>
        </div>
        <div class="input-hint">대표자 포함한 총 직원 수</div>
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

// 표시용 값 (콤마 포함)
const displayValue = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) return '';
  return props.modelValue.toLocaleString();
});

// 입력 처리 (콤마 제거 후 숫자만 추출)
const handleInput = (event) => {
  let value = event.target.value;

  // 숫자와 콤마만 허용
  value = value.replace(/[^\d,]/g, '');

  // 콤마 제거하여 순수 숫자만 추출
  const numericValue = value.replace(/,/g, '');

  if (numericValue === '') {
    emit('update:modelValue', null);
    return;
  }

  // 숫자로 변환
  const numValue = parseInt(numericValue, 10);

  // 범위 체크 (1~999,999)
  if (numValue >= 1 && numValue <= 999999) {
    emit('update:modelValue', numValue);
  }
};

// 포커스 벗어날 때 포맷팅
const formatNumber = (event) => {
  if (props.modelValue) {
    event.target.value = props.modelValue.toLocaleString();
  }
};
</script>

<style scoped>
.step-content {
  width: 100%;
  max-width: 600px;
  margin: 0 auto; 
}

/* 폼 그룹 - 일관된 정렬 */
.form-group {
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  max-width: 600px;
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

/* 입력창과 단위를 감싸는 컨테이너 */
.input-with-unit {
  position: relative;
  display: flex;
  align-items: center;
}

/* 입력창 스타일 */
.form-input {
  width: 100%;
  padding: 0.9rem 3rem 0.9rem 1rem;
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

/* 단위 표시 */
.input-unit {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  color: #666;
  font-weight: 500;
  pointer-events: none; 
  user-select: none; 
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

.input-error + .input-unit {
  color: #dc3545;
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
