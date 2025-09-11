// @/api/recommendation.js - 백엔드와 동기화된 버전

import api from '@/api';

const BASE_URL = '/api/recommendations';

// 🔥 postId 검증 헬퍼 함수
const validatePostId = (postId, functionName = 'unknown') => {
  if (postId === null || postId === undefined) {
    const error = `${functionName}: postId가 null 또는 undefined입니다.`;
    console.error(error, { postId, type: typeof postId });
    throw new Error(error);
  }

  const numericPostId = Number(postId);
  if (isNaN(numericPostId) || numericPostId <= 0) {
    const error = `${functionName}: postId가 유효한 숫자가 아닙니다.`;
    console.error(error, { postId, numericPostId, type: typeof postId });
    throw new Error(error);
  }

  return numericPostId;
};

// 재시도 함수
const retryRequest = async (requestFn, maxRetries = 2, delay = 1000) => {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      console.warn(`요청 실패 (${i + 1}/${maxRetries + 1}):`, error.message);

      if (i === maxRetries) {
        throw error;
      }

      // 재시도 전 대기
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

export const recommendationAPI = {
  /**
   * 🔥 기본 개인화 추천 조회 (캐시 사용)
   */
  getPersonalRecommendations: async () => {
    try {
      console.log('개인 추천 조회 시작...');

      const response = await retryRequest(async () => {
        return await api.get(`${BASE_URL}/personal`, {
          timeout: 20000,
        });
      });

      console.log('개인 추천 조회 성공:', response.data);
      return response;
    } catch (error) {
      console.error('개인 추천 조회 실패:', {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url,
        timeout: error.code === 'ECONNABORTED',
      });
      throw error;
    }
  },

  /**
   * 🔥 실시간 추천 조회 (캐시 무시, 즉시 새 추천 생성)
   */
  getRealtimeRecommendations: async () => {
    try {
      console.log('실시간 추천 조회 시작...');

      const response = await retryRequest(async () => {
        return await api.get(`${BASE_URL}/personal/realtime`, {
          timeout: 25000, // 실시간은 조금 더 긴 타임아웃
        });
      });

      console.log('실시간 추천 조회 성공:', response.data);
      return response;
    } catch (error) {
      console.error('실시간 추천 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 🔥 강제 추천 갱신
   */
  forceRefreshRecommendations: async () => {
    try {
      console.log('강제 추천 갱신 시작...');

      const response = await retryRequest(async () => {
        return await api.post(
          `${BASE_URL}/refresh`,
          {},
          {
            timeout: 25000,
          }
        );
      });

      console.log('강제 추천 갱신 성공:', response.data);
      return response;
    } catch (error) {
      console.error('강제 추천 갱신 실패:', error);
      throw error;
    }
  },

  /**
   * 🔥 일반 상호작용 기록 (백엔드 DTO와 일치하도록 수정)
   */
  recordInteraction: async (interactionData) => {
    try {
      // 🔥 postId 검증
      const validatedPostId = validatePostId(interactionData.postId, 'recordInteraction');

      // 🔥 interactionType 검증
      if (!interactionData.interactionType) {
        const error = 'recordInteraction: interactionType이 필요합니다.';
        console.error(error, interactionData);
        throw new Error(error);
      }

      // 🔥 백엔드 InteractionRequest DTO와 정확히 일치하는 구조로 변환
      const validatedData = {
        postId: validatedPostId,
        interactionType: interactionData.interactionType,
        durationSeconds: interactionData.durationSeconds || null,
        scrollPercentage: interactionData.scrollPercentage || null,
        rating: interactionData.rating || null,
      };

      console.log('일반 상호작용 기록 요청:', validatedData);

      const response = await api.post(`${BASE_URL}/interactions`, validatedData, {
        timeout: 5000,
      });

      console.log('상호작용 기록 성공:', response.data);
      return response;
    } catch (error) {
      console.warn('상호작용 기록 실패 (무시):', {
        error: error.message,
        originalData: interactionData,
        stack: error.stack,
      });

      // 상호작용 기록 실패는 사용자 경험에 영향을 주지 않으므로 예외를 던지지 않음
      return {
        data: {
          success: false,
          error: error.message,
        },
      };
    }
  },

  /**
   * 🔥 중요한 상호작용 기록 및 즉시 추천 갱신
   * 백엔드에는 별도 엔드포인트가 없으므로 일반 상호작용으로 처리
   */
  recordCriticalInteraction: async (interactionData) => {
    try {
      // 🔥 postId 검증
      const validatedPostId = validatePostId(interactionData.postId, 'recordCriticalInteraction');

      // 🔥 interactionType 검증
      if (!interactionData.interactionType) {
        const error = 'recordCriticalInteraction: interactionType이 필요합니다.';
        console.error(error, interactionData);
        throw new Error(error);
      }

      // 🔥 백엔드 InteractionRequest DTO와 정확히 일치하는 구조로 변환
      const validatedData = {
        postId: validatedPostId,
        interactionType: interactionData.interactionType,
        durationSeconds: interactionData.durationSeconds || null,
        scrollPercentage: interactionData.scrollPercentage || null,
        rating: interactionData.rating || null,
      };

      console.log('중요한 상호작용 기록 시작:', validatedData);

      // 백엔드에서 중요한 상호작용은 일반 interactions 엔드포인트에서 처리됨
      const response = await retryRequest(async () => {
        return await api.post(`${BASE_URL}/interactions`, validatedData, {
          timeout: 10000, // 중요한 상호작용은 조금 더 긴 타임아웃
        });
      });

      console.log('중요한 상호작용 처리 완료:', response.data);
      return response;
    } catch (error) {
      console.error('중요한 상호작용 처리 실패:', {
        error: error.message,
        originalData: interactionData,
        stack: error.stack,
      });
      throw error;
    }
  },

  /**
   * 🔥 헬스체크 API
   */
  getHealthCheck: async () => {
    try {
      const response = await api.get(`${BASE_URL}/health`);
      return response;
    } catch (error) {
      console.warn('헬스체크 실패:', error.message);
      return null;
    }
  },

  /**
   * 🔥 캐시 상태 확인 - 백엔드에 해당 엔드포인트가 없으므로 헬스체크로 대체
   */
  getCacheStatus: async () => {
    try {
      const response = await recommendationAPI.getHealthCheck();
      return response;
    } catch (error) {
      console.warn('캐시 상태 확인 실패:', error.message);
      return null;
    }
  },

  /**
   * 🔥 캐시 수동 삭제 - 백엔드에 해당 엔드포인트가 없음
   */
  clearCache: async () => {
    console.warn('캐시 삭제 기능이 백엔드에 구현되지 않음');
    return null;
  },

  /**
   * 🔥 추천 통계 조회 - 백엔드에 해당 엔드포인트가 없음
   */
  getRecommendationStats: async () => {
    console.warn('추천 통계 기능이 백엔드에 구현되지 않음');
    return null;
  },
};

// 🔥 백엔드와 동일한 InteractionType enum
export const InteractionType = {
  VIEW: 'VIEW',
  SCROLL: 'SCROLL',
  CLICK_LINK: 'CLICK_LINK',
  SCRAP: 'SCRAP',
  UNSCRAP: 'UNSCRAP',
  RATING: 'RATING',
  COMMENT: 'COMMENT',
};

// 🔥 백엔드 컨트롤러와 동일한 중요한 상호작용 타입 판별 로직
export const CriticalInteractionTypes = [
  InteractionType.SCRAP,
  InteractionType.UNSCRAP,
  InteractionType.RATING,
  InteractionType.CLICK_LINK,
];

// 상호작용 기록을 위한 헬퍼 함수들 (백엔드와 동기화)
export const trackingHelpers = {
  /**
   * 게시물 조회 기록
   */
  trackView: (postId, durationSeconds = null, scrollPercentage = null) => {
    try {
      const validatedPostId = validatePostId(postId, 'trackView');
      return recommendationAPI.recordInteraction({
        postId: validatedPostId,
        interactionType: InteractionType.VIEW,
        durationSeconds,
        scrollPercentage,
      });
    } catch (error) {
      console.warn('trackView 검증 실패:', error.message);
      return Promise.resolve({ data: { success: false, error: error.message } });
    }
  },

  /**
   * 스크롤 기록
   */
  trackScroll: (postId, scrollPercentage) => {
    try {
      const validatedPostId = validatePostId(postId, 'trackScroll');
      return recommendationAPI.recordInteraction({
        postId: validatedPostId,
        interactionType: InteractionType.SCROLL,
        scrollPercentage,
      });
    } catch (error) {
      console.warn('trackScroll 검증 실패:', error.message);
      return Promise.resolve({ data: { success: false, error: error.message } });
    }
  },

  /**
   * 체류시간 기록
   */
  trackDuration: (postId, durationSeconds, scrollPercentage = null) => {
    try {
      const validatedPostId = validatePostId(postId, 'trackDuration');
      return recommendationAPI.recordInteraction({
        postId: validatedPostId,
        interactionType: InteractionType.VIEW,
        durationSeconds,
        scrollPercentage,
      });
    } catch (error) {
      console.warn('trackDuration 검증 실패:', error.message);
      return Promise.resolve({ data: { success: false, error: error.message } });
    }
  },

  /**
   * 🔥 링크 클릭 기록 (중요한 상호작용)
   */
  trackLinkClick: (postId) => {
    try {
      const validatedPostId = validatePostId(postId, 'trackLinkClick');
      return recommendationAPI.recordCriticalInteraction({
        postId: validatedPostId,
        interactionType: InteractionType.CLICK_LINK,
      });
    } catch (error) {
      console.error('trackLinkClick 검증 실패:', error.message);
      throw error; // 중요한 상호작용은 예외를 던짐
    }
  },

  /**
   * 🔥 스크랩 기록 (중요한 상호작용)
   */
  trackScrap: (postId, isScrap) => {
    try {
      const validatedPostId = validatePostId(postId, 'trackScrap');
      return recommendationAPI.recordCriticalInteraction({
        postId: validatedPostId,
        interactionType: isScrap ? InteractionType.SCRAP : InteractionType.UNSCRAP,
      });
    } catch (error) {
      console.error('trackScrap 검증 실패:', error.message);
      throw error; // 중요한 상호작용은 예외를 던짐
    }
  },

  /**
   * 🔥 평점 기록 (중요한 상호작용)
   */
  trackRating: (postId, rating) => {
    try {
      const validatedPostId = validatePostId(postId, 'trackRating');
      return recommendationAPI.recordCriticalInteraction({
        postId: validatedPostId,
        interactionType: InteractionType.RATING,
        rating,
      });
    } catch (error) {
      console.error('trackRating 검증 실패:', error.message);
      throw error; // 중요한 상호작용은 예외를 던짐
    }
  },

  /**
   * 댓글 기록 (일반 상호작용)
   */
  trackComment: (postId) => {
    try {
      const validatedPostId = validatePostId(postId, 'trackComment');
      return recommendationAPI.recordInteraction({
        postId: validatedPostId,
        interactionType: InteractionType.COMMENT,
      });
    } catch (error) {
      console.warn('trackComment 검증 실패:', error.message);
      return Promise.resolve({ data: { success: false, error: error.message } });
    }
  },

  /**
   * 🔥 상호작용이 중요한지 확인 (백엔드 로직과 동일)
   */
  isCriticalInteraction: (interactionType) => {
    return CriticalInteractionTypes.includes(interactionType);
  },
};

// 🔥 추천 갱신 이벤트를 위한 이벤트 버스
class RecommendationEventBus {
  constructor() {
    this.listeners = new Map();
  }

  // 이벤트 리스너 등록
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // 이벤트 리스너 제거
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // 이벤트 발생
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error('이벤트 콜백 실행 오류:', error);
        }
      });
    }
  }
}

// 전역 이벤트 버스 인스턴스
export const recommendationEventBus = new RecommendationEventBus();

// 이벤트 타입 상수
export const RecommendationEvents = {
  CRITICAL_INTERACTION: 'criticalInteraction', // 중요한 상호작용 발생
  RECOMMENDATIONS_UPDATED: 'recommendationsUpdated', // 추천 갱신됨
  FORCE_REFRESH: 'forceRefresh', // 강제 새로고침 요청
};

