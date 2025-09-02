<template>
  <div class="multi-step-signup">
    <!-- 단계 진행률 표시 -->
    <StepIndicator :current-step="currentStep" :steps="steps" />

    <!-- 단계별 컴포넌트 렌더링 -->
    <component
      :is="currentStepComponent"
      :terms-data="termsData"
      :user-data="userData"
      @next="handleNext"
      @prev="handlePrev"
      @complete="handleComplete"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import StepIndicator from '@/components/signup/StepIndicator.vue';
import TermsAgreementStep from '@/components/signup/TermsAgreementStep.vue';
import UserInfoStep from '@/components/signup/UserInfoStep.vue';
import { useAuthStore } from '@/stores/useAuthStore';

const router = useRouter();

// 현재 단계
const currentStep = ref(1);

// 단계 정보
const steps = ref([{ label: '약관동의' }, { label: '기본정보' }]);

// 약관 동의 데이터
const termsData = ref({
  agreeTerms: false,
  agreePrivacy: false,
  agreeMarketing: false,
});

// 사용자 데이터
const userData = ref({
  username: '',
  nickname: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  profileImage: '',
  birthDate: '',
  gender: '',
  phoneVerified: false,
});

// 현재 단계 컴포넌트
const currentStepComponent = computed(() => {
  const components = {
    1: TermsAgreementStep,
    2: UserInfoStep,
  };
  return components[currentStep.value];
});

// 다음 단계로
const handleNext = (data) => {
  if (currentStep.value === 1) {
    // 약관 동의 정보 저장
    Object.assign(termsData.value, data);
    currentStep.value = 2;
  }
};

// 이전 단계로
const handlePrev = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

// 전체 등록 완료
const handleComplete = async (data) => {
  try {
    Object.assign(userData.value, data);

    // 약관 + 사용자 기본 정보 합치기
    const signupData = {
      ...termsData.value,
      ...userData.value,
    };

    // 회원가입 API 호출
    const signupResult = await useAuthStore().signup(signupData);

    if (!signupResult.success) {
      return;
    }

    // 완료 → 환영 페이지 이동
    router.push('/welcome');
  } catch (error) {
    console.error('회원가입 완료 처리 오류:', error);
  }
};
</script>

<style scoped>
.multi-step-signup {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 2rem 1rem;
  border-radius: 0;
}
</style>
