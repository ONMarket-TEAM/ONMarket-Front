<template>
  <article
    class="data-card"
    @click="$emit('click', recommendation)"
    :class="{
      'has-score': recommendation?.interestScore,
      'is-hot': recommendation?.type === 'hot',
    }"
  >
    <!-- 카드 상단 이미지 영역 -->
    <div class="thumb-wrapper">
      <img
        v-if="recommendation?.imageUrl && !imageError"
        :src="recommendation.imageUrl"
        :alt="recommendation?.title || '상품 이미지'"
        class="card-image"
        @error="handleImageError"
        @load="isImageLoading = false"
      />

      <!-- 로딩 상태나 이미지 없을 때 -->
      <div v-if="!recommendation?.imageUrl || imageError" class="image-placeholder">
        <i class="fas fa-image"></i>
      </div>

      <!-- 추천 스코어 배지 (개인화 추천인 경우) -->
      <div v-if="recommendation?.interestScore" class="score-badge">
        <i class="fas fa-star"></i>
        <span>{{ formatScore(recommendation.interestScore) }}%</span>
      </div>

      <!-- HOT 배지 (인기 상품인 경우) -->
      <div v-else-if="recommendation?.type === 'hot'" class="hot-badge">
        <i class="fas fa-fire"></i>
        <span>HOT</span>
      </div>

      <!-- 랭킹 배지 (HOT TOP5용) -->
      <span v-if="rank" class="rank-badge">{{ rank }}</span>
    </div>

    <!-- 카드 하단 정보 영역 -->
    <div class="meta">
      <div class="meta-header">
        <span class="category-tag" :class="recommendation?.categoryClass || 'loan'">
          {{ recommendation?.category || '기타' }}
        </span>
      </div>

      <h3 class="title" :title="recommendation?.title || ''">
        {{ recommendation?.title || '상품명 없음' }}
      </h3>

      <p class="sub">{{ recommendation?.agency || '기관명 없음' }}</p>

      <p class="period">{{ recommendation?.period || '상시모집' }}</p>

      <!-- 추천 이유 (개인화 추천인 경우) -->
      <div v-if="recommendation?.recommendationReason" class="recommendation-reason">
        <div class="reason-header">
          <i class="fas fa-lightbulb"></i>
          <span class="reason-label">추천 이유</span>
        </div>
        <p class="reason-text">{{ recommendation.recommendationReason }}</p>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  recommendation: {
    type: Object,
    required: true,
    default: () => ({
      id: 0,
      title: '상품명 없음',
      agency: '기관명 없음',
      period: '상시모집',
      category: '기타',
      categoryClass: 'loan',
      type: 'hot',
    }),
  },
  rank: {
    type: [Number, String],
    default: null,
  },
});

const emits = defineEmits(['click']);

const imageError = ref(false);
const isImageLoading = ref(true);

/**
 * 이미지 에러 처리
 */
const handleImageError = () => {
  imageError.value = true;
  isImageLoading.value = false;
};

/**
 * 관심도 스코어 포맷팅
 */
const formatScore = (score) => {
  if (score >= 100) return '100';
  if (score >= 10) return Math.round(score).toString();
  return score.toFixed(1);
};
</script>

<style scoped>
/* 홈페이지와 동일한 카드 스타일 */
.data-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  height: 100%;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

/* 개인화 추천 카드 스타일링 */
.data-card.has-score {
  border: 2px solid rgba(52, 97, 255, 0.1);
}

.data-card.has-score:hover {
  border-color: rgba(52, 97, 255, 0.3);
}

/* HOT 카드 미묘한 글로우 효과 */
.data-card.is-hot {
  position: relative;
}

.data-card.is-hot::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255, 107, 53, 0.02), rgba(247, 147, 30, 0.02));
  pointer-events: none;
  z-index: 0;
}

/* 이미지 영역 */
.thumb-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1/1.2;
  background: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.data-card:hover .card-image {
  transform: scale(1.05);
}

.image-placeholder {
  color: #ccc;
  font-size: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 배지들 */
.score-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.score-badge i {
  font-size: 0.7rem;
}

.hot-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 2;
  animation: pulse 2s ease-in-out infinite;
}

.hot-badge i {
  font-size: 0.7rem;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* HOT TOP5 랭킹 배지 */
.rank-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ff4d4d;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 2;
}

/* 콘텐츠 영역 */
.meta {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  position: relative;
  z-index: 1;
}

.meta-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.category-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
}

.category-tag.public {
  background: #e0f7fa;
  color: #00796b;
}

.category-tag.loan {
  background: #f3e5f5;
  color: #6a1b9a;
}

.card-id {
  font-size: 12px;
  color: #bdbdbd;
  font-weight: 500;
  align-self: center;
}

.title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  color: #212121;
  height: 2.8em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.sub {
  margin: 0 0 6px 0;
  font-size: 13px;
  color: #757575;
}

.period {
  margin: 0;
  font-size: 12px;
  color: #9e9e9e;
  font-weight: 400;
}

/* 추천 이유 */
.recommendation-reason {
  background: #f8f9ff;
  border: 1px solid #e8f0ff;
  border-radius: 8px;
  padding: 8px 10px;
  margin-top: 12px;
}

.reason-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.reason-header i {
  color: #fbbf24;
  font-size: 0.7rem;
}

.reason-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.reason-text {
  margin: 0;
  font-size: 0.75rem;
  color: #4a5568;
  line-height: 1.4;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .thumb-wrapper {
    aspect-ratio: 1/1;
  }

  .meta {
    padding: 14px;
  }

  .title {
    font-size: 15px;
    height: auto;
    -webkit-line-clamp: 3;
  }

  .sub,
  .period {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .data-card {
    border-radius: 10px;
  }

  .title {
    font-size: 14px;
  }

  .meta {
    padding: 12px;
  }
}
</style>

