<template>
  <div class="container section">
    <h1>사업정보</h1>
    <hr />

    <!-- 로딩/에러 상태 -->
    <div v-if="loading" class="state-box">불러오는 중 ...</div>
    <div v-else-if="error" class="state-box error">에러: {{ error }}</div>

    <!-- 폼 -->
    <form v-else class="card" @submit.prevent="handleSave">
      <!-- 사업장명 -->
      <div class="form-group mt-4">
        <BusinessNameInput v-model="businessForm.businessName" :error="errors.businessName" />
      </div>

      <!-- 업종 -->
      <div class="form-group">
        <IndustrySelect v-model="businessForm.industry" :error="errors.industry" />
      </div>

      <!-- 사업 형태 -->
      <div class="form-group">
        <BusinessTypeSelect v-model="businessForm.businessType" :error="errors.businessType" />
      </div>

      <!-- 사업 지역 - RegionInput 사용으로 변경 -->
      <div class="form-group">
        <RegionInput
          v-model:sidoName="businessForm.sidoName"
          v-model:sigunguName="businessForm.sigunguName"
          :error="errors.region"
        />
      </div>

      <!-- 설립 연도 (읽기 전용) -->
      <div class="form-group">
        <fieldset class="readonly-field" disabled aria-disabled="true">
          <EstablishedYearInput v-model="businessForm.establishedYear" :error="''" />
        </fieldset>
        <small class="hint">설립 연도는 수정할 수 없습니다.</small>
      </div>

      <!-- 연 매출 -->
      <div class="form-group">
        <AnnualRevenueSelect v-model="businessForm.annualRevenue" :error="errors.annualRevenue" />
      </div>

      <!-- 상시 근로자 수 -->
      <div class="form-group">
        <EmployeeCountInput v-model="businessForm.employeeCount" :error="errors.employeeCount" />
      </div>

      <!-- 버튼 -->
      <div class="button-group">
        <button type="button" class="btn ghost" @click="goBack">뒤로</button>
        <button type="submit" class="btn primary" :disabled="saving">
          {{ saving ? '저장 중…' : '사업정보 변경하기' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { businessAPI } from '@/api/business';
import { useToastStore } from '@/stores/useToastStore';

import IndustrySelect from '@/components/business/IndustrySelect.vue';
import BusinessTypeSelect from '@/components/business/BusinessTypeSelect.vue';
import BusinessNameInput from '@/components/business/BusinessName.vue';
import RegionInput from '@/components/business/RegionCodeInput.vue'; // RegionCodeInput 대신 RegionInput 사용
import EstablishedYearInput from '@/components/business/EstablishedYearInput.vue';
import AnnualRevenueSelect from '@/components/business/AnnualRevenueSelect.vue';
import EmployeeCountInput from '@/components/business/EmployeeCountInput.vue';

const route = useRoute();
const router = useRouter();
const toast = useToastStore();

const businessId = computed(() => route.query.businessId || route.params.businessId);

const loading = ref(true);
const saving = ref(false);
const error = ref('');

const businessForm = reactive({
  businessName: '',
  industry: '',
  businessType: '',
  sidoName: '',
  sigunguName: '', // 추가
  establishedYear: null,
  annualRevenue: '',
  employeeCount: null,
});

// 기존과 비교하여 변경된 정보만 수정
const original = ref(null);

// errors도 수정
const errors = reactive({
  businessName: '',
  industry: '',
  businessType: '',
  region: '',
  annualRevenue: '',
  employeeCount: '',
});

function resetErrors() {
  Object.keys(errors).forEach((k) => (errors[k] = ''));
}

async function load() {
  if (!businessId.value) {
    error.value = 'businessId가 없습니다.';
    toast.error('잘못된 접근입니다.');
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const res = await businessAPI.getMyBusiness(businessId.value);

    if (!res.success || !res.data) {
      error.value = res.message || '사업장 정보를 불러오지 못했습니다.';
      toast.error(error.value);
      loading.value = false;
      return;
    }

    // 백엔드 응답값 폼에 주입 - sidoName, sigunguName 사용
    const d = res.data;
    Object.assign(businessForm, {
      businessName: d.businessName ?? '',
      industry: d.industry ?? '',
      businessType: d.businessType ?? '',
      sidoName: d.sidoName ?? '',
      sigunguName: d.sigunguName ?? '', // 추가
      establishedYear: d.establishedYear ?? null,
      annualRevenue: d.annualRevenue ?? '',
      employeeCount: d.employeeCount ?? null,
    });

    // 원본 저장
    original.value = { ...businessForm };
  } catch (e) {
    error.value = '사업장 정보를 불러오지 못했습니다.';
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
}

function validate() {
  resetErrors();
  let ok = true;

  if (!businessForm.businessName?.trim()) {
    errors.businessName = '사업명을 입력하세요.';
    ok = false;
  }
  if (!businessForm.industry) {
    errors.industry = '산업분야를 선택하세요.';
    ok = false;
  }
  if (!businessForm.businessType) {
    errors.businessType = '사업장 유형을 선택하세요.';
    ok = false;
  }
  if (!businessForm.sidoName || !businessForm.sigunguName) {
    errors.region = '사업 지역을 선택하세요.';
    ok = false;
  }
  if (!businessForm.annualRevenue) {
    errors.annualRevenue = '연매출 규모를 선택하세요.';
    ok = false;
  }
  if (businessForm.employeeCount == null || businessForm.employeeCount < 0) {
    errors.employeeCount = '상시 근로자 수를 입력하세요.';
    ok = false;
  }

  return ok;
}

// 변경된 필드만 추출하는 함수 수정
function buildDiffPayload(curr, base) {
  const payload = {};
  [
    'businessName',
    'industry',
    'businessType',
    'sidoName',
    'sigunguName', // 추가
    'annualRevenue',
    'employeeCount',
  ].forEach((field) => {
    if (curr[field] !== base[field]) payload[field] = curr[field];
  });
  // establishedYear 는 읽기 전용이라 보내지 않음
  return payload;
}

async function handleSave() {
  if (!validate()) {
    toast.error('입력값을 확인해주세요.');
    return;
  }

  const payload = buildDiffPayload(businessForm, original.value || {});
  if (Object.keys(payload).length === 0) {
    toast.info('변경된 내용이 없습니다.');
    return;
  }

  saving.value = true;
  try {
    const res = await businessAPI.updateMyBusiness(businessId.value, payload);

    if (!res.success) {
      toast.error(res.message || '수정 중 오류가 발생했습니다.');
      return;
    }

    toast.success('사업 정보가 변경되었습니다.');
    // 원본 갱신
    original.value = { ...businessForm };

    setTimeout(() => {
      router.push('/user/mybusiness');
    }, 1000);
  } catch (e) {
    toast.error('사업정보 수정 중 오류가 발생했습니다.');
  } finally {
    saving.value = false;
  }
}

function goBack() {
  router.back();
}

onMounted(load);
</script>

<style scoped>
.state-box {
  padding: 24px;
  text-align: center;
  color: #333;
}
.state-box.error {
  background: #fce8e8;
  color: #9b1c1c;
  border-radius: 12px;
}

.card {
  max-width: 650px;
  margin: 0 auto;
  background: var(--color-white);
  border-radius: 12px;
  border: 1px solid #f3eee8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 24px;
}

.form-group {
  margin-bottom: 1.5rem;
  margin-left: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

/* 설립연도 읽기전용 느낌 */
.readonly-field {
  border: 0;
  padding: 0;
  margin-bottom: -20px;
}
.readonly-field :deep(input),
.readonly-field :deep(select) {
  pointer-events: none;
  background: #fafafa !important;
  color: #666 !important;
}
.hint {
  display: inline-block;
  margin-top: 6px;
  margin-left: 180px;
  margin-bottom: 1.5rem;
  font-size: 0.85rem;
  color: #999;
  font-weight: 500;
}

/* 버튼 그룹 */
.button-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
  margin-top: 2rem;
}

.btn {
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn.ghost {
  background-color: #f8f9fa;
  color: #6c757d;
  border: 2px solid #dee2e6;
}

.btn.ghost:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.btn.primary {
  background: var(--color-main);
  color: var(--color-white);
}

.btn.primary:hover:not(:disabled) {
  filter: brightness(0.95);
  transform: translateY(-1px);
  box-shadow: 0 10px 30px var(--color-light-3);
}

.btn.primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>

