<template>
  <div class="step-content">
    <div class="region-selector-row">
      <div class="form-group">
        <label for="province" class="form-label">시도</label>
        <div class="form-control">
          <select
            id="province"
            v-model="selectedProvince"
            @change="onProvinceChange"
            class="form-select"
            :class="{ 'input-error': error }"
            required
          >
            <option value="" disabled>시도를 선택하세요</option>
            <option v-for="province in provinces" :key="province" :value="province">
              {{ province }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group no-label">
        <div class="form-control">
          <select
            id="district"
            v-model="selectedDistrict"
            @change="onDistrictChange"
            class="form-select"
            :class="{ 'input-error': error }"
            :disabled="!selectedProvince"
            required
          >
            <option value="" disabled>
              {{ selectedProvince ? '시군구를 선택하세요' : '먼저 시도를 선택하세요' }}
            </option>
            <option
              v-for="district in filteredDistricts"
              :key="district.지역코드"
              :value="district.지역코드"
            >
              {{ district.시군구명 }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="error" class="check-message error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import regionData from '@/data/region.json';

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

const selectedProvince = ref('');
const selectedDistrict = ref('');

// 고유한 시도 목록 생성
const provinces = computed(() => {
  const uniqueProvinces = [...new Set(regionData.map((item) => item.시도명))];
  return uniqueProvinces.sort();
});

// 선택된 시도에 따른 시군구 필터링
const filteredDistricts = computed(() => {
  if (!selectedProvince.value) return [];
  return regionData.filter((item) => item.시도명 === selectedProvince.value);
});

// 시도 선택 시 시군구 초기화
const onProvinceChange = () => {
  selectedDistrict.value = '';
  emit('update:modelValue', '');
};

// 시군구 선택 시 지역코드 전달
const onDistrictChange = () => {
  emit('update:modelValue', selectedDistrict.value);
};
watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      selectedProvince.value = '';
      selectedDistrict.value = '';
      return;
    }

    // 지역코드로부터 시도와 시군구 찾기
    const region = regionData.find((item) => item.지역코드 === newValue);
    if (region) {
      selectedProvince.value = region.시도명;
      selectedDistrict.value = region.지역코드;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
/* 가로 배열을 위한 컨테이너 */
.region-selector-row {
  display: grid;
  grid-template-columns: 160px 1fr 1fr;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  max-width: 800px;
}

/* 폼 그룹 - 시도 선택용  */
.form-group {
  display: contents; 
}

/* 라벨 없는 폼 그룹 - 시군구 선택용 */
.form-group.no-label {
  display: block;
}

.step-content {
  width: 100%;
  max-width: 800px;
  margin: 0 auto; 
}

/* 라벨 스타일 - 다른 컴포넌트와 일치 */
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

.form-select:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
  opacity: 0.65;
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
