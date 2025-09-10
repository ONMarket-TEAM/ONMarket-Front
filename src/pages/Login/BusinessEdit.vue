<template>
  <div class="section step-content">
    <div class="step-header">
      <h1 class="step-title">사업장 정보</h1>
      <p class="step-subtitle">사업장 정보를 입력하시면 더 맞춤형 서비스를 제공받을 수 있습니다</p>
    </div>

    <form @submit.prevent="handleComplete" class="step-form" novalidate>
      <!-- 산업 분야 -->
      <IndustrySelect v-model="businessForm.industry" :error="errors.industry" />

      <!-- 사업장 유형 -->
      <BusinessTypeSelect v-model="businessForm.businessType" :error="errors.businessType" />

      <!-- 사업장 이름 -->
      <BusinessNameInput v-model="businessForm.businessName" :error="errors.businessName" />
      <!-- 지역 코드 -->
      <RegionCodeInput v-model="businessForm.regionCodeId" :error="errors.regionCodeId" />

      <!-- 설립 연도 -->
      <EstablishedYearInput
        v-model="businessForm.establishedYear"
        :error="errors.establishedYear"
      />

      <!-- 연 매출 -->
      <AnnualRevenueSelect v-model="businessForm.annualRevenue" :error="errors.annualRevenue" />

      <!-- 직원 수 -->
      <EmployeeCountInput v-model="businessForm.employeeCount" :error="errors.employeeCount" />

      <!-- 버튼 그룹 -->
      <div class="button-group">
        <button type="button" @click="handleSkip" class="skip-button">나중에 하기</button>
        <button
          type="submit"
          class="complete-button"
          :class="{ active: isFormValid }"
          :disabled="isLoading"
        >
          <span v-if="isLoading">완료 중...</span>
          <span v-else>사업장 등록</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import IndustrySelect from '@/components/business/IndustrySelect.vue';
import BusinessTypeSelect from '@/components/business/BusinessTypeSelect.vue';
import BusinessNameInput from '@/components/business/BusinessName.vue';
import RegionCodeInput from '@/components/business/RegionCodeInput.vue';
import EstablishedYearInput from '@/components/business/EstablishedYearInput.vue';
import AnnualRevenueSelect from '@/components/business/AnnualRevenueSelect.vue';
import EmployeeCountInput from '@/components/business/EmployeeCountInput.vue';
import { useRoute, useRouter } from 'vue-router';
import { businessAPI } from '@/api/business';
import { useToastStore } from '@/stores/useToastStore';
import { computed } from 'vue';

const isFormValid = computed(() => {
  return (
    businessForm.industry &&
    businessForm.businessType &&
    businessForm.businessName &&
    businessForm.regionCodeId &&
    businessForm.establishedYear &&
    businessForm.establishedYear <= new Date().getFullYear() &&
    businessForm.annualRevenue &&
    businessForm.employeeCount &&
    businessForm.employeeCount >= 1
  );
});

const props = defineProps({
  businessData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['complete']);
const route = useRoute();
const router = useRouter();
const toastStore = useToastStore();

// Refs
const isLoading = ref(false);

// 폼 데이터
const businessForm = reactive({
  industry: '',
  businessType: '',
  businessName: '',
  regionCodeId: '',
  establishedYear: null,
  annualRevenue: '',
  employeeCount: null,
});

// 에러 메시지
const errors = reactive({
  industry: '',
  businessType: '',
  businessName: '',
  regionCodeId: '',
  establishedYear: '',
  annualRevenue: '',
  employeeCount: '',
});

// 유효성 검증 (그대로 유지)
const validateForm = () => {
  let isValid = true;
  Object.keys(errors).forEach((key) => (errors[key] = ''));

  if (!businessForm.industry) {
    isValid = false;
  }
  if (!businessForm.businessType) {
    isValid = false;
  }
  if (!businessForm.businessName) {
    isValid = false;
  }
  if (!businessForm.regionCodeId) {
    isValid = false;
  }
  if (!businessForm.establishedYear) {
    isValid = false;
  } else {
    const currentYear = new Date().getFullYear();
    if (businessForm.establishedYear > currentYear) {
      isValid = false;
    }
  }
  if (!businessForm.annualRevenue) {
    isValid = false;
  }
  if (!businessForm.employeeCount) {
    isValid = false;
  } else if (businessForm.employeeCount < 1) {
    isValid = false;
  }

  return isValid;
};

// 건너뛰기
const ALLOWED_RETURN_PATHS = ['/user/mybusiness'];

const handleSkip = () => {
  const returnTo = route.query.returnTo;

  if (returnTo && ALLOWED_RETURN_PATHS.includes(returnTo)) {
    router.push(returnTo);
  } else {
    // 기본 경로로 이동
    router.push('/');
  }
};

// 사업장 등록 API 호출
const handleComplete = async () => {
  // 유효성 검증
  const isValid = validateForm();
  if (!isValid) {
    // 첫 번째 에러 메시지를 찾아서 보여주기
    const firstError = Object.values(errors).find((msg) => msg);
    if (firstError) {
      toastStore.error(firstError);
    } else {
      toastStore.error('입력 정보를 확인해주세요.');
    }
    return;
  }

  try {
    isLoading.value = true;
    const result = await businessAPI.register(businessForm);

    if (result) {
      toastStore.success('사업장이 성공적으로 등록되었습니다.');

      // 부모 컴포넌트 알림
      emit('complete', result);

      // 리다이렉트
      const returnTo = route.query.returnTo;
      router.push(returnTo && ALLOWED_RETURN_PATHS.includes(returnTo) ? returnTo : '/');
    } else {
      toastStore.error('사업장 등록에 실패했습니다. 다시 시도해주세요.');
    }
  } catch (error) {
    console.error('사업장 등록 오류:', error);

    if (error.message && error.message.includes('Network')) {
      toastStore.error('네트워크 연결을 확인해주세요.');
    } else if (error.message && error.message.includes('timeout')) {
      toastStore.error('요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
    } else if (error.response && error.response.status === 429) {
      toastStore.error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
    } else if (error.response && error.response.status >= 500) {
      toastStore.error('서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      toastStore.error('처리 중 알 수 없는 오류가 발생했습니다.');
    }
  } finally {
    isLoading.value = false;
  }
};

// 기존 데이터 복원
onMounted(() => {
  if (props.businessData) {
    Object.assign(businessForm, props.businessData);
  }
});
</script>
<style scoped>
.step-content {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.step-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.step-title {
  color: #333;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.step-subtitle {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.step-form {
  width: 100%;
}

/* 버튼 그룹 */
.button-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}

.skip-button,
.complete-button {
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.skip-button {
  background-color: #f8f9fa;
  color: #6c757d;
  border: 2px solid #dee2e6;
}

.skip-button:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.complete-button {
  background-color: var(--color-main);
  color: white;
}

.complete-button:hover:not(:disabled) {
  box-shadow: 0 10px 30px var(--color-light-3);
}

.complete-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.complete-button.active {
  background-color: var(--color-sub);
}
</style>

