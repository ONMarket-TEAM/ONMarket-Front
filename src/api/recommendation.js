// @/api/recommendation.js
import api from '@/api';

const BASE_URL = '/api/recommendations';

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
   * 개인화된 추천 상품 조회
   */
  getPersonalRecommendations: async () => {
    try {
      console.log('개인 추천 조회 시작...');

      const response = await retryRequest(async () => {
        return await api.get(`${BASE_URL}/personal`, {
          timeout: 20000, // 20초 타임아웃
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
   * 사용자 상호작용 기록
   */
  recordInteraction: async (interactionData) => {
    try {
      const response = await api.post(`${BASE_URL}/interactions`, interactionData, {
        timeout: 5000, // 상호작용 기록은 짧은 타임아웃
      });
      return response;
    } catch (error) {
      console.warn('상호작용 기록 실패 (무시):', error.message);
      // 상호작용 기록은 실패해도 사용자 경험에 영향을 주지 않도록 조용히 처리
    }
  },
};

// 상호작용 타입 상수
export const InteractionType = {
  VIEW: 'VIEW',
  SCROLL: 'SCROLL',
  CLICK_LINK: 'CLICK_LINK',
  SCRAP: 'SCRAP',
  UNSCRAP: 'UNSCRAP',
  RATING: 'RATING',
  COMMENT: 'COMMENT',
};

// 상호작용 기록을 위한 헬퍼 함수들
export const trackingHelpers = {
  /**
   * 게시물 조회 기록
   */
  trackView: (postId) => {
    return recommendationAPI.recordInteraction({
      postId,
      interactionType: InteractionType.VIEW,
    });
  },

  /**
   * 스크롤 기록
   */
  trackScroll: (postId, scrollPercentage) => {
    return recommendationAPI.recordInteraction({
      postId,
      interactionType: InteractionType.SCROLL,
      scrollPercentage,
    });
  },

  /**
   * 체류시간 기록
   */
  trackDuration: (postId, durationSeconds, scrollPercentage = null) => {
    return recommendationAPI.recordInteraction({
      postId,
      interactionType: InteractionType.VIEW,
      durationSeconds,
      scrollPercentage,
    });
  },

  /**
   * 링크 클릭 기록
   */
  trackLinkClick: (postId) => {
    return recommendationAPI.recordInteraction({
      postId,
      interactionType: InteractionType.CLICK_LINK,
    });
  },

  /**
   * 스크랩 기록
   */
  trackScrap: (postId, isScrap) => {
    return recommendationAPI.recordInteraction({
      postId,
      interactionType: isScrap ? InteractionType.SCRAP : InteractionType.UNSCRAP,
    });
  },

  /**
   * 평점 기록
   */
  trackRating: (postId, rating) => {
    return recommendationAPI.recordInteraction({
      postId,
      interactionType: InteractionType.RATING,
      rating,
    });
  },

  /**
   * 댓글 기록
   */
  trackComment: (postId) => {
    return recommendationAPI.recordInteraction({
      postId,
      interactionType: InteractionType.COMMENT,
    });
  },
};

