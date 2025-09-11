// @/composables/useUserTracking.js - 백엔드와 동기화된 버전

import { trackingHelpers } from '@/api/recommendation';

/**
 * 사용자 행동 추적을 위한 composable
 * 백엔드 InteractionRequest DTO와 완전히 호환되는 구조
 */
export function useUserTracking(productId) {
  /**
   * 게시물 조회 추적
   * @param {number|null} durationSeconds - 체류 시간 (초)
   * @param {number|null} scrollPercentage - 스크롤 비율 (0-100)
   */
  const trackView = (durationSeconds = null, scrollPercentage = null) => {
    if (!productId?.value && !productId) {
      console.warn('trackView: productId가 없음');
      return Promise.resolve({ data: { success: false, error: 'productId 없음' } });
    }

    const postId = productId?.value || productId;
    return trackingHelpers.trackView(postId, durationSeconds, scrollPercentage);
  };

  /**
   * 스크롤 추적
   * @param {number} scrollPercentage - 스크롤 비율 (0-100)
   */
  const trackScroll = (scrollPercentage) => {
    if (!productId?.value && !productId) {
      console.warn('trackScroll: productId가 없음');
      return Promise.resolve({ data: { success: false, error: 'productId 없음' } });
    }

    const postId = productId?.value || productId;
    return trackingHelpers.trackScroll(postId, scrollPercentage);
  };

  /**
   * 체류시간 추적
   * @param {number} durationSeconds - 체류 시간 (초)
   * @param {number|null} scrollPercentage - 스크롤 비율 (0-100)
   */
  const trackDuration = (durationSeconds, scrollPercentage = null) => {
    if (!productId?.value && !productId) {
      console.warn('trackDuration: productId가 없음');
      return Promise.resolve({ data: { success: false, error: 'productId 없음' } });
    }

    const postId = productId?.value || productId;
    return trackingHelpers.trackDuration(postId, durationSeconds, scrollPercentage);
  };

  /**
   * 링크 클릭 추적 (중요한 상호작용)
   */
  const trackLinkClick = () => {
    if (!productId?.value && !productId) {
      console.error('trackLinkClick: productId가 없음');
      throw new Error('productId가 필요합니다');
    }

    const postId = productId?.value || productId;
    return trackingHelpers.trackLinkClick(postId);
  };

  /**
   * 스크랩 추적 (중요한 상호작용)
   * @param {boolean} isScrap - 스크랩 여부 (true: 스크랩, false: 스크랩 해제)
   */
  const trackScrap = (isScrap) => {
    if (!productId?.value && !productId) {
      console.error('trackScrap: productId가 없음');
      throw new Error('productId가 필요합니다');
    }

    const postId = productId?.value || productId;
    return trackingHelpers.trackScrap(postId, isScrap);
  };

  /**
   * 평점 추적 (중요한 상호작용)
   * @param {number} rating - 평점 (1-5)
   */
  const trackRating = (rating) => {
    if (!productId?.value && !productId) {
      console.error('trackRating: productId가 없음');
      throw new Error('productId가 필요합니다');
    }

    if (!rating || rating < 1 || rating > 5) {
      console.error('trackRating: 유효하지 않은 평점', rating);
      throw new Error('평점은 1-5 사이여야 합니다');
    }

    const postId = productId?.value || productId;
    return trackingHelpers.trackRating(postId, rating);
  };

  /**
   * 댓글 추적 (일반 상호작용)
   */
  const trackComment = () => {
    if (!productId?.value && !productId) {
      console.warn('trackComment: productId가 없음');
      return Promise.resolve({ data: { success: false, error: 'productId 없음' } });
    }

    const postId = productId?.value || productId;
    return trackingHelpers.trackComment(postId);
  };

  /**
   * 페이지 방문 시 기본 추적 (조회수)
   * @param {number|null} durationSeconds - 체류 시간
   * @param {number|null} scrollPercentage - 스크롤 비율
   */
  const trackPageVisit = (durationSeconds = null, scrollPercentage = null) => {
    return trackView(durationSeconds, scrollPercentage);
  };

  /**
   * 종합적인 페이지 이탈 추적
   * @param {number} durationSeconds - 총 체류 시간
   * @param {number} maxScrollPercentage - 최대 스크롤 비율
   */
  const trackPageExit = (durationSeconds, maxScrollPercentage) => {
    // 체류시간과 스크롤 정보를 함께 기록
    return trackDuration(durationSeconds, maxScrollPercentage);
  };

  return {
    trackView,
    trackScroll,
    trackDuration,
    trackLinkClick,
    trackScrap,
    trackRating,
    trackComment,
    trackPageVisit,
    trackPageExit,
  };
}

