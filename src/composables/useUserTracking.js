// @/composables/useUserTracking.js
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { trackingHelpers } from '@/api/recommendation';

export function useUserTracking(postId) {
  const startTime = ref(Date.now());
  const maxScrollPercentage = ref(0);
  const isTracking = ref(false);
  const viewTrackingTimeout = ref(null);
  const scrollTrackingTimeout = ref(null);

  /**
   * 뷰 추적 시작
   */
  const startViewTracking = () => {
    if (!postId.value || isTracking.value) return;

    isTracking.value = true;
    startTime.value = Date.now();

    // 즉시 VIEW 이벤트 기록
    trackingHelpers.trackView(postId.value);

    // 5초 후에 체류시간과 함께 다시 기록
    viewTrackingTimeout.value = setTimeout(() => {
      const duration = Math.floor((Date.now() - startTime.value) / 1000);
      trackingHelpers.trackDuration(postId.value, duration, maxScrollPercentage.value);
    }, 5000);
  };

  /**
   * 뷰 추적 종료
   */
  const stopViewTracking = () => {
    if (!isTracking.value) return;

    const duration = Math.floor((Date.now() - startTime.value) / 1000);

    // 최소 3초 이상 머물렀을 때만 기록
    if (duration >= 3) {
      trackingHelpers.trackDuration(postId.value, duration, maxScrollPercentage.value);
    }

    isTracking.value = false;

    if (viewTrackingTimeout.value) {
      clearTimeout(viewTrackingTimeout.value);
      viewTrackingTimeout.value = null;
    }
  };

  /**
   * 스크롤 추적
   */
  const trackScroll = () => {
    if (!postId.value || !isTracking.value) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    const scrollPercentage = Math.min(
      100,
      Math.round(((scrollTop + windowHeight) / documentHeight) * 100)
    );

    if (scrollPercentage > maxScrollPercentage.value) {
      maxScrollPercentage.value = scrollPercentage;

      // 스크롤 이벤트 debounce 처리
      if (scrollTrackingTimeout.value) {
        clearTimeout(scrollTrackingTimeout.value);
      }

      scrollTrackingTimeout.value = setTimeout(() => {
        trackingHelpers.trackScroll(postId.value, scrollPercentage);
      }, 1000);
    }
  };

  /**
   * 링크 클릭 추적
   */
  const trackLinkClick = () => {
    if (!postId.value) return;
    trackingHelpers.trackLinkClick(postId.value);
  };

  /**
   * 스크랩 추적
   */
  const trackScrap = (isScrap) => {
    if (!postId.value) return;
    trackingHelpers.trackScrap(postId.value, isScrap);
  };

  /**
   * 평점 추적
   */
  const trackRating = (rating) => {
    if (!postId.value) return;
    trackingHelpers.trackRating(postId.value, rating);
  };

  /**
   * 댓글 추적
   */
  const trackComment = () => {
    if (!postId.value) return;
    trackingHelpers.trackComment(postId.value);
  };

  /**
   * 페이지 가시성 변경 처리
   */
  const handleVisibilityChange = () => {
    if (document.hidden) {
      stopViewTracking();
    } else if (postId.value) {
      startViewTracking();
    }
  };

  /**
   * 페이지 언로드 처리
   */
  const handleBeforeUnload = () => {
    stopViewTracking();
  };

  // 라이프사이클 훅
  onMounted(() => {
    nextTick(() => {
      if (postId.value) {
        startViewTracking();
      }
    });

    // 이벤트 리스너 등록
    window.addEventListener('scroll', trackScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
  });

  onUnmounted(() => {
    stopViewTracking();

    // 이벤트 리스너 제거
    window.removeEventListener('scroll', trackScroll);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);

    // 타이머 정리
    if (viewTrackingTimeout.value) {
      clearTimeout(viewTrackingTimeout.value);
    }
    if (scrollTrackingTimeout.value) {
      clearTimeout(scrollTrackingTimeout.value);
    }
  });

  return {
    maxScrollPercentage,
    isTracking,
    startViewTracking,
    stopViewTracking,
    trackLinkClick,
    trackScrap,
    trackRating,
    trackComment
  };
}
