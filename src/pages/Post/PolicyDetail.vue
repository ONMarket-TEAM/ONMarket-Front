<template>
  <div class="policy-detail-container">
    <div class="container section">
      <div class="product-image">
        <div class="image-placeholder">
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <div class="product-info">
        <div class="product-header">
          <div class="product-meta">
            <span class="product-name">{{ productDetail.name }}</span>
            <span class="product-date">{{ productDetail.date }}</span>
          </div>
          <div class="action-buttons">
            <button class="like-btn" @click="toggleLike">
              <i class="fas fa-heart heart-icon" :class="{ 'liked': isLiked }" v-if="isLiked"></i>
              <i class="far fa-heart heart-icon" v-else></i>
            </button>
            <button class="interest-btn">가입하기</button>
          </div>
        </div>

        <div class="product-description">
          <p>{{ productDetail.description }}</p>
          <br>
          <p>{{ productDetail.additionalInfo }}</p>
        </div>
      </div>

      <div class="review-section">
        <div class="review-header">
          <h3>상품 후기</h3>
          <button class="write-review-btn" @click="openModal">작성하기</button>
        </div>

        <div class="review-item" v-for="review in reviews" :key="review.id">
          <div class="review-author">
            <span class="author-name">{{ review.author }}</span>
            <span class="review-date">{{ review.date }}</span>
          </div>
          <div class="review-rating">
            <i v-for="n in 5" :key="n" 
               class="star"
               :class="n <= review.rating ? 'fas fa-star filled' : 'far fa-star'">
            </i>
          </div>
          <p class="review-content">{{ review.content }}</p>
        </div>
      </div>
    </div>

    <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>상품 후기를 남겨주세요!</h2>
        </div>
        
        <div class="rating-section">
          <div class="rating-stars">
            <i v-for="n in 5" :key="n"
               class="star-button"
               :class="n <= selectedRating ? 'fas fa-star active' : 'far fa-star'"
               @click="setRating(n)">
            </i>
          </div>
        </div>

        <div class="review-form">
          <textarea 
            v-model="reviewText"
            placeholder="내용을 작성해주세요"
            class="review-textarea"
            maxlength="300">
          </textarea>
          <div class="char-count">{{ reviewText.length }}/300</div>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="closeModal">취소</button>
          <button class="submit-btn" @click="submitReview" :disabled="!canSubmit">등록하기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isLiked = ref(false)

const isModalOpen = ref(false)
const selectedRating = ref(0)
const reviewText = ref('')

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedRating.value = 0
  reviewText.value = ''
}

const setRating = (rating) => {
  selectedRating.value = rating
}

const canSubmit = computed(() => {
  return selectedRating.value > 0 && reviewText.value.trim().length > 0
})

const submitReview = () => {
  if (!canSubmit.value) return
  
  const newReview = {
    id: reviews.value.length + 1,
    author: '사용자',
    date: new Date().toLocaleDateString('ko-KR'),
    rating: selectedRating.value,
    content: reviewText.value
  }
  
  reviews.value.unshift(newReview)
  closeModal()
  
  alert('후기가 등록되었습니다!')
}

const toggleLike = () => {
  isLiked.value = !isLiked.value
}

const productDetail = computed(() => {
  const isPolicyPage = route.path.includes('/policies/')
  
  if (isPolicyPage) {
    return {
      name: '상품 이름',
      date: '2024/01/23',
      description: '여우빛 비나리 메그리나 아름드리 곤다시 이쁜 다숨 다숨 이쁜 늘품 도서 아슬라 여우빛 별빛 아슬라 미리내 늘품 도서 우리는 비나리 소록소록 달별 가온해 별빛 곤다서 여우빛 나비잠 여우별 로온 도서 감또개 채빛 도담도담 이쁜 아슬라 별빛 나래 그루잠 소솜 안녕 아리아 도르래 늘품 아리아 그루잠 도서 나비잠 포도 열구름 미리내.',
      additionalInfo: '바나나 바나나 로온 소록소록 여우빛 로온 아리아 미리내 도르래 그루잠 비나리 가온해 함초롬하다 나래 로온 비나리 별빛 도서곤 가온해 어린 미쁘다 그루잠 나래 로온 감또개 우리는 아름드리 다숨 비나리 곤다서 시과 을 포도 여우빛 아리아 로온 함초롱하다 얌구름 달별 가은누리 이쁜 나비잠 바나나 로온 가온누리 가온누리 아슬라 소록소록 바나나 도르래.'
    }
  } else {
    return {
      name: '지원금 이름',
      date: '2024/01/23',
      description: '정부 지원금 관련 상세 설명이 여기에 들어갑니다...',
      additionalInfo: '추가 정보가 여기에 표시됩니다...'
    }
  }
})

const reviews = ref([
  {
    id: 1,
    author: '김어원',
    date: '2024/01/23',
    rating: 5,
    content: '위치도 좋고 금리도 생각보다 넘나요, 구리던 음푸드도 다양하고 빌즈 있어서 친구들과 같이 재밌게 놀다 왔습니다. 감사합니다.'
  }
])
</script>

<style scoped>
.policy-detail-container {
  background: var(--color-white);
  border-radius: 1rem;
  box-shadow: 0 0.125rem 0.75rem rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 18.75rem;
  background: var(--color-light-2);
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-dots {
  display: flex;
  gap: 0.5rem;
}

.loading-dots span {
  width: 0.5rem;
  height: 0.5rem;
  background: #ccc;
  border-radius: 50%;
  animation: loading 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes loading {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.product-info {
  margin-bottom: 2rem;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.product-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.product-date {
  color: #666;
  font-size: 0.875rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.like-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: #ddd;
  transition: color 0.2s ease;
  padding: 0.5rem;
}

.heart-icon {
  transition: color 0.2s ease;
}

.heart-icon.liked {
  color: var(--color-sub);
}

.interest-btn {
  background: var(--color-sub);
  color: var(--color-white);
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s ease;
}

.interest-btn:hover {
  background: var(--color-main);
}

.product-description {
  line-height: 1.6;
  color: #333;
  font-size: 0.9375rem;
}

.review-section {
  border-top: 1px solid var(--color-light-2);
  padding-top: 1.5rem;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.review-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
  position: relative;
}

.review-header h3::after {
  content: '';
  display: block;
  width: 2.5rem;
  height: 0.1875rem;
  background: var(--color-sub);
  margin-top: 0.25rem;
}

.write-review-btn {
  background: none;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;
}

.write-review-btn:hover {
  border-color: var(--color-sub);
  color: var(--color-sub);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-white);
  border-radius: 1rem;
  padding: 2rem;
  width: 90%;
  max-width: 31.25rem;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  text-align: center;
  margin-bottom: 2rem;
  display: block !important;
  padding: 0 !important;
  border-bottom: none !important;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 600;
  color: #333;
}

.rating-section {
  text-align: center;
  margin-bottom: 1.5rem;
}

.rating-stars {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.star-button {
  font-size: 2rem;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s ease;
}

.star-button.active {
  color: var(--color-sub);
}

.star-button:hover {
  color: var(--color-sub);
}

.review-form {
  margin-bottom: 1.5rem;
}

.review-textarea {
  width: 100%;
  height: 7.5rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  resize: none;
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.5;
  box-sizing: border-box;
}

.review-textarea:focus {
  outline: none;
  border-color: var(--color-sub);
}

.review-textarea::placeholder {
  color: #999;
}

.char-count {
  text-align: right;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #999;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.cancel-btn {
  background: none;
  border: 1px solid #ddd;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  border-color: #999;
  color: #333;
}

.submit-btn {
  background: var(--color-sub);
  color: var(--color-white);
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: var(--color-main);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.review-item {
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-light-3);
}

.review-item:last-child {
  border-bottom: none;
}

.review-author {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.author-name {
  font-weight: 500;
  color: #333;
}

.review-date {
  color: #999;
  font-size: 0.875rem;
}

.review-rating {
  margin-bottom: 0.75rem;
}

.star {
  color: #ddd;
  font-size: 0.875rem;
  margin-right: 0.125rem;
}

.star.filled {
  color: var(--color-sub);
}

.review-content {
  color: #555;
  line-height: 1.5;
  margin: 0;
}
</style>