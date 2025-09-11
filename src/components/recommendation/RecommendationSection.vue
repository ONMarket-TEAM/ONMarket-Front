<template>
  <section class="recommend-section">
    <div class="container">
      <div class="section-header">
        <h2>
          <i class="fas fa-sparkles"></i>
          {{ userEmail ? '맞춤 추천 상품' : '개인 맞춤 추천' }}
        </h2>
        <p class="section-subtitle">
          {{
            userEmail
              ? '회원님을 위한 특별한 추천'
              : '로그인하고 나만을 위한 맞춤 상품을 확인해보세요'
          }}
        </p>
      </div>

      <!-- 비회원 로그인 유도 -->
      <div v-if="!userEmail" class="login-prompt-container">
        <div class="login-prompt-content">
          <div class="login-prompt-icon">
            <i class="fas fa-user-circle"></i>
          </div>
          <h3>나만을 위한 맞춤 상품을 찾아보세요!</h3>
          <p>로그인하시면 회원님의 관심사와 조건에 맞는<br />개인화된 금융상품을 추천해드려요</p>
          <div class="login-prompt-features">
            <div class="feature-item">
              <i class="fas fa-chart-line"></i>
              <span>AI 기반 개인화 추천</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-heart"></i>
              <span>관심상품 저장 및 관리</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-bell"></i>
              <span>맞춤 알림 서비스</span>
            </div>
          </div>
          <div class="login-prompt-actions">
            <button @click="goToLogin" class="login-btn primary">
              <i class="fas fa-sign-in-alt"></i>
              로그인하기
            </button>
            <button @click="goToSignup" class="signup-btn secondary">
              <i class="fas fa-user-plus"></i>
              회원가입
            </button>
          </div>
        </div>
      </div>

      <!-- 로그인 사용자 - 로딩 상태 -->
      <div v-else-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>
          {{ refreshing ? '새로운 맞춤 추천을 생성하는 중...' : '맞춤 추천 상품을 분석하는 중...' }}
        </p>
      </div>

      <!-- 로그인 사용자 - 에러 상태 -->
      <div v-else-if="error" class="error-container">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <p class="error-message">{{ error }}</p>
        <div class="error-actions">
          <button class="retry-btn" @click="fetchRecommendations">
            <i class="fas fa-redo"></i>
            다시 시도
          </button>
          <button class="realtime-btn" @click="getRealTimeRecommendations">
            <i class="fas fa-bolt"></i>
            실시간 조회
          </button>
        </div>
      </div>

      <!-- 로그인 사용자 - 빈 상태 -->
      <div v-else-if="recommendations.length === 0" class="empty-container">
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

      <!-- 로그인 사용자 - 추천 상품 카드 그리드 -->
      <div v-else class="recommendations-wrapper">
        <!-- 🔥 업데이트 알림 -->
        <div v-if="showUpdateNotification" class="update-notification">
          <i class="fas fa-check-circle"></i>
          <span>최신 맞춤 추천이 업데이트되었습니다!</span>
          <button @click="hideUpdateNotification" class="close-notification">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="card-scroll-wrapper">
          <div class="card-grid" ref="cardGrid">
            <div
              v-for="(item, index) in displayRecommendations"
              :key="item.id"
              class="card-item"
              :class="{ 'animate-in': isVisible, 'newly-updated': item.isNewlyUpdated }"
              :style="{ animationDelay: `${index * 100}ms` }"
            >
              <RecommendationCard
                :recommendation="item"
                @click="handleCardClick(item)"
                @scrap="handleScrapFromCard"
              />
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import {
  recommendationAPI,
  trackingHelpers,
  recommendationEventBus,
  RecommendationEvents,
} from '@/api/recommendation';
import RecommendationCard from './RecommendationCard.vue';

const router = useRouter();

// 상태 관리
const recommendations = ref([]);
const loading = ref(false);
const refreshing = ref(false);
const error = ref('');
const isVisible = ref(false);
const showUpdateNotification = ref(false);

// 스크롤 관련 상태
const cardGrid = ref(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

// 🔥 개발 모드 확인
const isDevelopment = computed(() => process.env.NODE_ENV === 'development');

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
 * 🔥 기본 추천 상품 데이터 가져오기 (캐시 사용)
 */
const fetchRecommendations = async () => {
  if (!userEmail.value) {
    console.log('비로그인 사용자 - 추천 조회 안함');
    return;
  }

  loading.value = true;
  error.value = '';

  console.log('기본 추천 상품 조회 시작, 사용자:', userEmail.value);

  try {
    const response = await recommendationAPI.getPersonalRecommendations();
    const recommendationData =
      response?.data?.recommendations || response?.body?.data || response?.data || [];
    console.log('기본 추천 데이터:', recommendationData);

    const transformedData = transformRecommendationData(recommendationData);

    // 🔥 변환된 데이터 검증
    validateRecommendationsData(transformedData);

    recommendations.value = transformedData;
    console.log('최종 추천 데이터:', recommendations.value);

    // 데이터 로드 후 애니메이션 시작
    await nextTick();
    isVisible.value = true;
    updateScrollButtons();
  } catch (err) {
    console.error('추천 상품 조회 실패:', err);
    error.value = `추천 상품을 불러오는데 실패했습니다. ${err.message}`;
  } finally {
    loading.value = false;
  }
};

const validateRecommendationsData = (recommendations) => {
  console.log('🔍 추천 데이터 검증 시작:', recommendations.length, '건');

  recommendations.forEach((rec, index) => {
    if (!rec.id && rec.id !== 0) {
      console.error(`❌ 추천 ${index}: id 없음`, rec);
    } else if (typeof rec.id !== 'number' || rec.id < 0) {
      console.error(`❌ 추천 ${index}: 유효하지 않은 id`, { id: rec.id, type: typeof rec.id });
    } else {
      console.log(`✅ 추천 ${index}: 유효한 id = ${rec.id}`);
    }
  });
};

/**
 * 🔥 실시간 추천 상품 데이터 가져오기 (캐시 무시)
 */
const getRealTimeRecommendations = async () => {
  if (!userEmail.value) {
    console.log('비로그인 사용자 - 실시간 추천 조회 안함');
    return;
  }

  loading.value = true;
  refreshing.value = true;
  error.value = '';

  console.log('실시간 추천 상품 조회 시작, 사용자:', userEmail.value);

  try {
    const response = await recommendationAPI.getRealtimeRecommendations();
    const recommendationData =
      response?.data?.recommendations || response?.body?.data || response?.data || [];
    console.log('실시간 추천 데이터:', recommendationData);

    const newRecommendations = transformRecommendationData(recommendationData, true);
    recommendations.value = newRecommendations;
    console.log('최종 실시간 추천 데이터:', recommendations.value);

    // 업데이트 알림 표시
    showUpdateNotification.value = true;
    setTimeout(() => {
      showUpdateNotification.value = false;
    }, 3000);

    // 이벤트 발생
    recommendationEventBus.emit(RecommendationEvents.RECOMMENDATIONS_UPDATED, {
      source: 'realtime',
      count: newRecommendations.length,
    });

    await nextTick();
    isVisible.value = true;
    updateScrollButtons();
  } catch (err) {
    console.error('실시간 추천 상품 조회 실패:', err);
    error.value = `실시간 추천을 불러오는데 실패했습니다. ${err.message}`;
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

/**
 * 🔥 강제 추천 갱신
 */
const forceRefreshRecommendations = async () => {
  if (!userEmail.value) return;

  loading.value = true;
  refreshing.value = true;
  error.value = '';

  console.log('강제 추천 갱신 시작, 사용자:', userEmail.value);

  try {
    const response = await recommendationAPI.forceRefreshRecommendations();
    const recommendationData =
      response?.data?.recommendations || response?.body?.data || response?.data || [];
    console.log('강제 갱신 추천 데이터:', recommendationData);

    const newRecommendations = transformRecommendationData(recommendationData, true);
    recommendations.value = newRecommendations;

    // 업데이트 알림 표시
    showUpdateNotification.value = true;
    setTimeout(() => {
      showUpdateNotification.value = false;
    }, 3000);

    // 이벤트 발생
    recommendationEventBus.emit(RecommendationEvents.RECOMMENDATIONS_UPDATED, {
      source: 'force_refresh',
      count: newRecommendations.length,
    });

    await nextTick();
    isVisible.value = true;
    updateScrollButtons();
  } catch (err) {
    console.error('강제 추천 갱신 실패:', err);
    error.value = `추천 갱신에 실패했습니다. ${err.message}`;
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

/**
 * 🔥 캐시 클리어 후 새로고침
 */
const clearCacheAndRefresh = async () => {
  if (!userEmail.value) return;

  loading.value = true;
  refreshing.value = true;
  error.value = '';

  try {
    // 1. 캐시 클리어
    await recommendationAPI.clearCache();
    console.log('캐시 클리어 완료');

    // 2. 새 추천 조회
    await getRealTimeRecommendations();
  } catch (err) {
    console.error('캐시 클리어 후 새로고침 실패:', err);
    error.value = `캐시 클리어 및 새로고침에 실패했습니다. ${err.message}`;
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

/**
 * 🔥 중요한 상호작용 후 자동 갱신 처리
 */
const handleCriticalInteractionUpdate = async (eventData) => {
  console.log('중요한 상호작용 감지, 추천 자동 갱신:', eventData);

  // 일정 시간 후 자동으로 실시간 추천 갱신
  setTimeout(async () => {
    try {
      await getRealTimeRecommendations();
      console.log('중요한 상호작용 후 추천 자동 갱신 완료');
    } catch (error) {
      console.error('중요한 상호작용 후 추천 자동 갱신 실패:', error);
    }
  }, 2000); // 2초 후 갱신
};

/**
 * 추천 데이터 변환
 */
const transformRecommendationData = (data, isNewlyUpdated = false) => {
  console.log('🔄 추천 데이터 변환 시작:', data);

  if (!Array.isArray(data)) {
    console.warn('⚠️ 추천 데이터가 배열이 아님:', data);
    return [];
  }

  return data
    .map((item, index) => {
      // 🔥 각 item의 postId 검증
      if (!item.postId && item.postId !== 0) {
        console.error(`❌ 추천 데이터 ${index}번째 항목의 postId가 없음:`, {
          item,
          index,
          hasPostId: 'postId' in item,
          itemKeys: Object.keys(item),
        });
        return null; // null 반환하여 나중에 필터링
      }

      const numericPostId = Number(item.postId);
      if (isNaN(numericPostId) || numericPostId < 0) {
        console.error(`❌ 추천 데이터 ${index}번째 항목의 postId가 유효하지 않음:`, {
          originalPostId: item.postId,
          numericPostId,
          index,
        });
        return null; // null 반환하여 나중에 필터링
      }

      return {
        id: numericPostId, // 🔥 검증된 숫자 ID 사용
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
        isNewlyUpdated: isNewlyUpdated,
      };
    })
    .filter((item) => item !== null); // null 제거
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
  try {
    // 🔥 상세한 item 검증 로깅
    console.log('🔍 handleCardClick 호출됨:', {
      item: JSON.stringify(item, null, 2),
    });

    // item과 id 검증
    if (!item) {
      console.error('❌ handleCardClick: item이 없음:', item);
      return;
    }

    if (!item.id && item.id !== 0) {
      // 0도 유효한 ID일 수 있음
      console.error('❌ handleCardClick: item.id가 없음:', {
        item,
        itemId: item.id,
        hasId: 'id' in item,
        itemKeys: Object.keys(item),
      });
      return;
    }

    const numericPostId = Number(item.id);
    if (isNaN(numericPostId) || numericPostId < 0) {
      // 0 이상이면 유효
      console.error('❌ handleCardClick: item.id를 유효한 숫자로 변환할 수 없음:', {
        originalId: item.id,
        numericId: numericPostId,
        isNaN: isNaN(numericPostId),
        isNegative: numericPostId < 0,
      });
      return;
    }

    console.log('✅ 카드 클릭 검증 통과:', {
      originalId: item.id,
      validatedId: numericPostId,
      item,
    });

    // 클릭 추적 (비동기로 처리하여 페이지 이동에 영향 주지 않음)
    if (userEmail.value && item.type === 'recommendation') {
      trackingHelpers.trackView(numericPostId).catch((error) => {
        console.warn('⚠️ 카드 클릭 추적 실패 (무시):', error);
      });
    }

    // 상세 페이지로 이동
    const routePath =
      item.postType === 'SUPPORT' ? `/policies/${numericPostId}` : `/loans/${numericPostId}`;

    console.log('🔗 페이지 이동:', routePath);
    router.push(routePath);
  } catch (error) {
    console.error('❌ 카드 클릭 처리 실패:', {
      error: error.message,
      item,
      stack: error.stack,
    });

    // 페이지 이동은 계속 시도
    try {
      if (item?.id) {
        const fallbackPath =
          item?.postType === 'SUPPORT' ? `/policies/${item.id}` : `/loans/${item.id}`;
        console.log('🔗 폴백 페이지 이동:', fallbackPath);
        router.push(fallbackPath);
      }
    } catch (routeError) {
      console.error('❌ 폴백 페이지 이동도 실패:', routeError);
    }
  }
};

/**
 * 🔥 카드에서 스크랩 처리 (중요한 상호작용)
 */
const handleScrapFromCard = async (postId, isScrap) => {
  try {
    // 🔥 상세한 postId 검증 로깅
    console.log('🔍 handleScrapFromCard 호출됨:', {
      postId,
      isScrap,
      postIdType: typeof postId,
      postIdValue: JSON.stringify(postId),
    });

    // postId 검증
    if (postId === null || postId === undefined || postId === '') {
      console.error('❌ handleScrapFromCard: postId가 유효하지 않음:', {
        postId,
        type: typeof postId,
        isNull: postId === null,
        isUndefined: postId === undefined,
        isEmpty: postId === '',
      });
      return;
    }

    // postId를 숫자로 변환
    const numericPostId = Number(postId);
    if (isNaN(numericPostId) || numericPostId <= 0) {
      console.error('❌ handleScrapFromCard: postId를 유효한 숫자로 변환할 수 없음:', {
        originalPostId: postId,
        numericPostId,
        isNaN: isNaN(numericPostId),
        isNegativeOrZero: numericPostId <= 0,
      });
      return;
    }

    console.log('✅ postId 검증 통과:', { originalPostId: postId, validatedPostId: numericPostId });

    // 중요한 상호작용으로 즉시 추천 갱신 요청
    console.log('🚀 스크랩 추적 시작:', { postId: numericPostId, isScrap });

    const result = await trackingHelpers.trackScrap(numericPostId, isScrap);

    console.log('✅ 스크랩 처리 결과:', result);

    // 새로운 추천이 있으면 갱신
    if (result?.data?.success && result.data.newRecommendations?.length > 0) {
      recommendations.value = transformRecommendationData(result.data.newRecommendations);
      console.log('🔄 스크랩 후 새 추천 적용:', recommendations.value.length, '건');

      // 데이터 로드 후 애니메이션 시작
      await nextTick();
      isVisible.value = true;
      updateScrollButtons();
    } else {
      console.warn('⚠️ 스크랩 후 새 추천이 없어서 기존 유지');

      // 대안: 2초 후 일반 추천 새로고침 시도
      setTimeout(async () => {
        try {
          console.log('🔄 지연 새로고침 시도');
          await fetchRecommendations();
          console.log('✅ 지연 새로고침 완료');
        } catch (error) {
          console.error('❌ 지연 새로고침 실패:', error);
        }
      }, 2000);
    }

    // 이벤트 발생
    recommendationEventBus.emit(RecommendationEvents.CRITICAL_INTERACTION, {
      type: isScrap ? 'SCRAP' : 'UNSCRAP',
      postId: numericPostId,
      timestamp: Date.now(),
    });

    console.log('✅ 스크랩 상호작용 처리 완료:', { postId: numericPostId, isScrap });
  } catch (error) {
    console.error('❌ 스크랩 상호작용 처리 실패:', {
      error: error.message,
      postId,
      isScrap,
      stack: error.stack,
    });
    // UI는 이미 변경되었으므로 사용자에게는 성공으로 보임
  }
};

/**
 * 업데이트 알림 숨기기
 */
const hideUpdateNotification = () => {
  showUpdateNotification.value = false;
};

/**
 * 로그인 페이지로 이동
 */
const goToLogin = () => {
  router.push('/login');
};

/**
 * 회원가입 페이지로 이동
 */
const goToSignup = () => {
  router.push('/signup');
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

// 컴포넌트 마운트
onMounted(() => {
  console.log('RecommendationSection 마운트됨');

  // 로그인한 사용자만 추천 데이터 조회
  if (userEmail.value) {
    fetchRecommendations();
  }

  // 스크롤 이벤트 리스너
  if (cardGrid.value) {
    cardGrid.value.addEventListener('scroll', updateScrollButtons);
  }

  // 리사이즈 이벤트 리스너 추가
  window.addEventListener('resize', updateScrollButtons);

  // 🔥 중요한 상호작용 이벤트 리스너 등록
  recommendationEventBus.on(
    RecommendationEvents.CRITICAL_INTERACTION,
    handleCriticalInteractionUpdate
  );
  recommendationEventBus.on(RecommendationEvents.FORCE_REFRESH, getRealTimeRecommendations);
});

// 컴포넌트 언마운트
onUnmounted(() => {
  // 이벤트 리스너 제거
  window.removeEventListener('resize', updateScrollButtons);
  recommendationEventBus.off(
    RecommendationEvents.CRITICAL_INTERACTION,
    handleCriticalInteractionUpdate
  );
  recommendationEventBus.off(RecommendationEvents.FORCE_REFRESH, getRealTimeRecommendations);
});

// 외부에서 새로고침할 수 있도록 expose
defineExpose({
  refresh: fetchRecommendations,
  refreshRealtime: getRealTimeRecommendations,
  forceRefresh: forceRefreshRecommendations,
});
</script>
<style scoped>
.recommend-section {
  padding: 60px 0;
  /* background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%); */
  background: transparent;
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
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
  text-align: center;
  font-size: clamp(20px, 5vw, 32px);
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 16px;
}

.section-header h2 i {
  font-size: clamp(16px, 4vw, 24px);
  flex-shrink: 0;
  color: var(--color-main, #f95453);
}

.section-subtitle {
  font-size: clamp(14px, 3.5vw, 16px);
  color: #666;
  font-weight: 400;
  line-height: 1.4;
  padding: 0 20px;
  max-width: 90%;
  margin: 0 auto;
  word-break: keep-all;
}

/* 로그인 유도 */
.login-prompt-container {
  display: flex;
  justify-content: center;
  padding: 0 20px;
}

.login-prompt-content {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.login-prompt-icon {
  font-size: 64px;
  color: var(--color-main, #f95453);
  margin-bottom: 24px;
}

.login-prompt-content h3 {
  font-size: clamp(18px, 4vw, 24px);
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 16px;
  word-break: keep-all;
}

.login-prompt-content p {
  font-size: clamp(14px, 3.5vw, 16px);
  color: #718096;
  line-height: 1.6;
  margin-bottom: 32px;
  word-break: keep-all;
}

.login-prompt-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
  padding: 0 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
}

.feature-item i {
  color: var(--color-main, #f95453);
  font-size: 16px;
  width: 20px;
  flex-shrink: 0;
}

.login-prompt-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.login-btn,
.signup-btn {
  padding: 16px 32px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  min-width: 140px;
  justify-content: center;
}

.login-btn.primary {
  background: var(--color-main, #f95453);
  color: white;
  border: none;
}

.login-btn.primary:hover {
  background: var(--color-sub, #e74847);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(249, 84, 83, 0.3);
}

.signup-btn.secondary {
  background: white;
  color: var(--color-main, #f95453);
  border: 2px solid var(--color-main, #f95453);
}

.signup-btn.secondary:hover {
  background: var(--color-main, #f95453);
  color: white;
  transform: translateY(-2px);
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
  overflow: hidden;
}

.card-scroll-wrapper {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  gap: 24px;
  padding-bottom: 8px;
  width: 100%;
}

.card-grid {
  display: flex;
  gap: 24px;
  flex: 0 0 auto;
}

.card-item {
  flex: 0 0 auto;
  width: 260px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
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

/* 반응형 */
@media (max-width: 768px) {
  .login-prompt-content {
    padding: 40px 20px;
    margin: 0 10px;
  }

  .login-prompt-features {
    gap: 12px;
    padding: 0 10px;
  }

  .feature-item {
    font-size: 13px;
  }

  .login-prompt-actions {
    flex-direction: column;
    align-items: center;
  }

  .login-btn,
  .signup-btn {
    width: 100%;
    max-width: 200px;
  }

  .empty-actions {
    flex-direction: column;
    align-items: center;
  }

  .empty-action-btn {
    width: 100%;
    max-width: 250px;
  }

  .nav-btn {
    display: none; /* 모바일에서는 네비게이션 버튼 숨김 */
  }
}

@media (max-width: 480px) {
  .recommend-section {
    padding: 40px 0;
  }

  .container {
    padding: 0 15px;
  }

  .section-header {
    margin-bottom: 32px;
  }

  .login-prompt-content {
    padding: 30px 15px;
  }

  .card-item {
    width: 220px;
  }
}
</style>

