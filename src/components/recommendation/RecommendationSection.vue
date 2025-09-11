<template>
  <section class="recommend-section">
    <div class="container">
      <div class="section-header">
        <h2>
          <i class="fas fa-sparkles"></i>
          {{ userEmail ? '맞춤 추천 상품' : '인기 추천 상품' }}
        </h2>
        <p class="section-subtitle">
          {{ userEmail ? '회원님을 위한 특별한 추천' : '많은 사람들이 선택한 인기 상품' }}
        </p>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>추천 상품을 불러오는 중...</p>
      </div>

      <!-- 에러 상태 (로그인 사용자만) -->
      <div v-else-if="error && userEmail" class="error-container">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <p class="error-message">{{ error }}</p>
        <button class="retry-btn" @click="fetchRecommendations">
          <i class="fas fa-redo"></i>
          다시 시도
        </button>
      </div>

      <!-- 빈 상태 (로그인 사용자만) -->
      <div v-else-if="recommendations.length === 0 && userEmail" class="empty-container">
        <div class="empty-illustration">
          <i class="fas fa-search"></i>
        </div>
        <h3>아직 추천할 상품이 없어요</h3>
        <p>다양한 상품을 살펴보시면 맞춤 추천을 받을 수 있습니다!</p>
        <div class="empty-actions">
          <button @click="$router.push('/loans')" class="empty-action-btn primary">
            <i class="fas fa-coins"></i>
            대출상품 둘러보기
          </button>
          <button @click="$router.push('/policies')" class="empty-action-btn secondary">
            <i class="fas fa-hand-holding-heart"></i>
            정책지원금 둘러보기
          </button>
        </div>
      </div>

      <!-- 추천 상품 카드 그리드 -->
      <div v-else class="recommendations-wrapper">
        <div class="card-scroll-wrapper">
          <div class="card-grid" ref="cardGrid">
            <div
              v-for="(item, index) in displayRecommendations"
              :key="item.id"
              class="card-item"
              :class="{ 'animate-in': isVisible }"
              :style="{ animationDelay: `${index * 100}ms` }"
            >
              <RecommendationCard :recommendation="item" @click="handleCardClick(item)" />
            </div>
          </div>
        </div>
        <!-- 네비게이션 버튼 -->
        <button
          v-if="canScrollLeft"
          class="nav-btn nav-prev"
          @click="scrollCards('left')"
          aria-label="이전 상품"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <button
          v-if="canScrollRight"
          class="nav-btn nav-next"
          @click="scrollCards('right')"
          aria-label="다음 상품"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { recommendationAPI, trackingHelpers } from '@/api/recommendation';
import { fetchHotTop5Api } from '@/api/posts';
import RecommendationCard from './RecommendationCard.vue';

const router = useRouter();

// 상태 관리
const recommendations = ref([]);
const loading = ref(false);
const error = ref('');
const isVisible = ref(false);

// 스크롤 관련 상태
const cardGrid = ref(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

// 사용자 정보
const userEmail = computed(() => {
  try {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('토큰 페이로드:', payload);
    return payload.sub || payload.email;
  } catch (error) {
    console.error('토큰 파싱 실패:', error);
    return null;
  }
});

// 표시할 추천 상품 (최대 5개)
const displayRecommendations = computed(() => {
  return recommendations.value.slice(0, 5);
});

/**
 * 추천 상품 데이터 가져오기
 */
const fetchRecommendations = async () => {
  loading.value = true;
  error.value = '';

  console.log('추천 상품 조회 시작, 사용자:', userEmail.value);

  try {
    if (userEmail.value) {
      console.log('로그인 사용자 - 개인화 추천 조회');
      const response = await recommendationAPI.getPersonalRecommendations();
      const recommendationData = response?.body?.data || response?.data || [];
      console.log('개인화 추천 데이터:', recommendationData);
      recommendations.value = transformRecommendationData(recommendationData);
    } else {
      console.log('비로그인 사용자 - HOT TOP5 조회');
      const hotTop5Data = await fetchHotTop5Api();
      console.log('HOT TOP5 데이터:', hotTop5Data);
      recommendations.value = transformHotTop5Data(hotTop5Data);
    }

    console.log('최종 추천 데이터:', recommendations.value);

    // 데이터 로드 후 애니메이션 시작
    await nextTick();
    isVisible.value = true;
    updateScrollButtons();
  } catch (err) {
    console.error('추천 상품 조회 실패:', err);
    error.value = `추천 상품을 불러오는데 실패했습니다. ${err.message}`;

    // 실패 시 HOT TOP5로 폴백 (로그인 사용자인 경우만)
    if (userEmail.value) {
      console.log('폴백으로 HOT TOP5 시도...');
      try {
        const hotTop5Data = await fetchHotTop5Api();
        console.log('폴백 HOT TOP5 데이터:', hotTop5Data);
        recommendations.value = transformHotTop5Data(hotTop5Data);
        error.value = '';
        console.log('폴백 성공');

        await nextTick();
        isVisible.value = true;
        updateScrollButtons();
      } catch (fallbackErr) {
        console.error('폴백 데이터 조회도 실패:', fallbackErr);
        error.value = `데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.`;
      }
    }
  } finally {
    loading.value = false;
  }
};

/**
 * 추천 데이터 변환
 */
const transformRecommendationData = (data) => {
  console.log('추천 데이터 변환 시작:', data);

  if (!Array.isArray(data)) {
    console.warn('추천 데이터가 배열이 아님:', data);
    return [];
  }

  return data.map((item) => ({
    id: item.postId,
    title: item.productName || '상품명 없음',
    agency: item.companyName || '기관명 없음',
    period: item.deadline || '상시모집',
    category: getPostTypeLabel(item.postType),
    categoryClass: getPostTypeCategoryClass(item.postType),
    type: 'recommendation',
    interestScore: item.interestScore,
    recommendationReason: item.recommendationReason,
    imageUrl: item.imageUrl,
    postType: item.postType,
  }));
};

/**
 * HOT TOP5 데이터 변환
 */
const transformHotTop5Data = (data) => {
  console.log('HOT TOP5 데이터 변환 시작:', data);

  if (!Array.isArray(data)) {
    console.warn('HOT TOP5 데이터가 배열이 아님:', data);
    return [];
  }

  return data
    .filter((item) => item && item.id) // 유효한 데이터만 필터링
    .map((item) => ({
      id: item.id,
      title: item.title || '상품명 없음',
      agency: item.agency || '기관명 없음',
      period: item.period || '상시모집',
      category: item.category || '기타',
      categoryClass: item.categoryClass || 'loan',
      type: 'hot',
      imageUrl: item.imageUrl || '',
      postType: 'LOAN', // 기본값
    }));
};

/**
 * 게시물 타입 라벨 변환
 */
const getPostTypeLabel = (postType) => {
  const labels = {
    LOAN: '대출',
    SUPPORT: '공공지원금',
    CREDIT_LOAN: '신용대출',
  };
  return labels[postType] || '기타';
};

/**
 * 게시물 타입별 CSS 클래스
 */
const getPostTypeCategoryClass = (postType) => {
  const classes = {
    LOAN: 'loan',
    SUPPORT: 'public',
    CREDIT_LOAN: 'loan',
  };
  return classes[postType] || 'loan';
};

/**
 * 카드 클릭 처리
 */
const handleCardClick = (item) => {
  console.log('카드 클릭:', item);

  // 클릭 추적 (로그인한 사용자만)
  if (userEmail.value && item.type === 'recommendation') {
    trackingHelpers.trackView(item.id);
  }

  // 상세 페이지로 이동
  if (item.postType === 'SUPPORT') {
    router.push(`/policies/${item.id}`);
  } else {
    router.push(`/loans/${item.id}`);
  }
};

/**
 * 카드 스크롤 처리
 */
const scrollCards = (direction) => {
  if (!cardGrid.value) return;

  const cardWidth = cardGrid.value.querySelector('.card-item')?.offsetWidth || 260;
  const gap = 24;
  const scrollAmount = cardWidth + gap;
  const currentScroll = cardGrid.value.scrollLeft;

  if (direction === 'left') {
    cardGrid.value.scrollTo({
      left: Math.max(0, currentScroll - scrollAmount),
      behavior: 'smooth',
    });
  } else {
    cardGrid.value.scrollTo({
      left: currentScroll + scrollAmount,
      behavior: 'smooth',
    });
  }

  // 스크롤 후 버튼 상태 업데이트
  setTimeout(updateScrollButtons, 300);
};

/**
 * 스크롤 버튼 상태 업데이트
 */
const updateScrollButtons = () => {
  if (!cardGrid.value) return;

  const { scrollLeft, scrollWidth, clientWidth } = cardGrid.value;
  canScrollLeft.value = scrollLeft > 10;
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 10;
};

/**
 * 전체 추천 페이지로 이동
 */
const goToFullRecommendations = () => {
  router.push('/recommendations');
};

// 컴포넌트 마운트
onMounted(() => {
  console.log('RecommendationSection 마운트됨');
  fetchRecommendations();

  // 스크롤 이벤트 리스너
  if (cardGrid.value) {
    cardGrid.value.addEventListener('scroll', updateScrollButtons);
  }

  // 리사이즈 이벤트 리스너 추가
  window.addEventListener('resize', updateScrollButtons);
});

// 외부에서 새로고침할 수 있도록 expose
defineExpose({
  refresh: fetchRecommendations,
});
</script>

<style scoped>
.recommend-section {
  padding: 60px 0;
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-header h2 {
  display: flex;
  flex-direction: column; /* 좁아져도 아이콘 위로 올라가도록 */
  justify-content: center;
  align-items: center;
  gap: 6px;
  text-align: center;
}

.section-header h2 i {
  font-size: clamp(16px, 4vw, 24px); /* 아이콘도 반응형 */
  flex-shrink: 0;
  color: var(--color-main, #f95453);
}

.section-subtitle {
  font-size: clamp(14px, 3.5vw, 16px); /* 반응형 */
  color: #666;
  font-weight: 400;
  line-height: 1.4;
  padding: 0 20px;
  max-width: 90%; /* 부모보다 조금 작게 제한 */
  margin: 0 auto;
  word-break: keep-all;
}

/* 로딩 상태 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--color-main, #f95453);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 에러 상태 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background: #fff5f5;
  border-radius: 16px;
  border: 1px solid #fed7d7;
}

.error-icon {
  font-size: 48px;
  color: #e53e3e;
  margin-bottom: 20px;
}

.error-message {
  color: #c53030;
  margin-bottom: 24px;
  font-size: 16px;
  line-height: 1.5;
}

.retry-btn {
  background: var(--color-main, #f95453);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: var(--color-sub, #e74847);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(249, 84, 83, 0.3);
}

/* 빈 상태 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background: #fafafa;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.empty-illustration {
  font-size: 64px;
  color: #cbd5e0;
  margin-bottom: 24px;
}

.empty-container h3 {
  color: #2d3748;
  margin-bottom: 12px;
  font-size: 20px;
  font-weight: 700;
}

.empty-container p {
  color: #718096;
  margin-bottom: 32px;
  line-height: 1.6;
  font-size: 16px;
}

.empty-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.empty-action-btn {
  padding: 14px 24px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  min-width: 160px;
  justify-content: center;
}

.empty-action-btn.primary {
  background: var(--color-main, #f95453);
  color: white;
  border: none;
}

.empty-action-btn.primary:hover {
  background: var(--color-sub, #e74847);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(249, 84, 83, 0.3);
}

.empty-action-btn.secondary {
  background: white;
  color: var(--color-main, #f95453);
  border: 2px solid var(--color-main, #f95453);
}

.empty-action-btn.secondary:hover {
  background: var(--color-main, #f95453);
  color: white;
  transform: translateY(-2px);
}

/* 추천 상품 래퍼 */
.recommendations-wrapper {
  position: relative;
  overflow: hidden; /* 부모에서 스크롤 방지 */
}
.card-scroll-wrapper {
  display: flex;
  overflow-x: auto; /* 카드만 스크롤 */
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  gap: 24px;
  padding-bottom: 8px;
  width: 100%; /* 부모 width에 맞춤 */
}

.card-grid {
  display: flex;
  gap: 24px;
  flex: 0 0 auto; /* 카드가 축소되지 않도록 */
}

.card-item {
  flex: 0 0 auto;
  width: 260px;
}

.card-item.animate-in {
  opacity: 1;
  transform: translateY(0);
}

/* 네비게이션 버튼 */
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  opacity: 0.8;
}

.nav-btn:hover {
  background: var(--color-main, #f95453);
  color: white;
  transform: translateY(-50%) scale(1.1);
  opacity: 1;
}

.nav-prev {
  left: -24px;
}

.nav-next {
  right: -24px;
}
</style>

