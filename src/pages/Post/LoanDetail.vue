<template>
  <div class="loan-detail-container">
    <div class="container section">
      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>상품 정보를 불러오는 중...</p>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button class="retry-btn" @click="fetchProductDetail">다시 시도</button>
      </div>

      <!-- 상품 상세 정보 -->
      <template v-else>
        <div class="product-image">
          <img
            v-if="productDetail.imageUrl && !imageError"
            :src="productDetail.imageUrl"
            :alt="productDetail.productName"
            @error="imageError = true"
          />
          <div v-else class="image-placeholder">
            <div class="placeholder-text">이미지를 불러올 수 없습니다</div>
          </div>
        </div>

        <div class="product-info">
          <div class="product-header">
            <div class="product-meta">
              <span class="product-name">{{ productDetail.productName || '제목 없음' }}</span>
              <span class="product-date">{{ formatDate(productDetail.createdAt) }}</span>
              <div class="scrap-info" v-if="productDetail.scrapCount !== undefined">
                <span class="scrap-count"><i class="fas fa-heart"></i> {{ productDetail.scrapCount }}명이 관심을 표시했습니다</span>
              </div>
            </div>
            <div class="action-buttons">
              <button
                class="like-btn"
                @click="toggleLike"
                :disabled="likeLoading"
              >
                <i
                  :class="productDetail.scraped ? 'fas fa-heart heart-icon liked' : 'far fa-heart heart-icon'"
                ></i>
                <span class="like-text">{{ productDetail.scraped ? '관심해제' : '관심상품' }}</span>
              </button>
              <button class="interest-btn" @click="applyProduct" :disabled="applyLoading">
                {{ applyLoading ? '처리중...' : '가입하기' }}
              </button>
            </div>
          </div>

          <div class="product-description">
            <div v-if="productDetail.detailContent" v-html="formatContent(productDetail.detailContent)"></div>
            <div v-else class="no-content">상세 내용이 준비 중입니다.</div>
          </div>
        </div>

        <!-- 댓글 섹션 -->
        <div class="comment-section">
          <div class="comment-header">
            <h3>상품 후기
              <span class="comment-count" v-if="commentData.totalCount">
                ({{ commentData.totalCount }})
              </span>
            </h3>
            <button class="write-comment-btn" @click="openModal">작성하기</button>
          </div>

          <div v-if="commentsLoading" class="comments-loading">
            <div class="loading-spinner small"></div>
            <span>후기를 불러오는 중...</span>
          </div>

          <div v-else-if="commentData.comments?.length">
            <div
              class="comment-item"
              v-for="comment in commentData.comments"
              :key="comment.commentId"
            >
              <div class="comment-author">
                <span class="author-name">{{ comment.author || '익명' }}</span>
                <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                <span class="owner-badge" v-if="comment.owner">작성자</span>
              </div>

              <div class="comment-rating" v-if="comment.rating">
                <i
                  v-for="n in 5"
                  :key="n"
                  class="star"
                  :class="n <= comment.rating ? 'fas fa-star filled' : 'far fa-star'"
                ></i>
                <span class="rating-text">({{ comment.rating }}/5)</span>
              </div>

              <p class="comment-content" v-if="!comment.deleted">{{ comment.content }}</p>
              <p class="comment-deleted" v-else>삭제된 댓글입니다.</p>

              <!-- 대댓글 -->
              <div class="replies" v-if="comment.replies?.length">
                <div
                  class="reply-item"
                  v-for="reply in comment.replies"
                  :key="reply.commentId"
                >
                  <div class="reply-author">
                    <span class="author-name">{{ reply.author || '익명' }}</span>
                    <span class="comment-date">{{ formatDate(reply.createdAt) }}</span>
                    <span class="owner-badge" v-if="reply.owner">작성자</span>
                  </div>
                  <p class="reply-content" v-if="!reply.deleted">↳ {{ reply.content }}</p>
                  <p class="comment-deleted" v-else>↳ 삭제된 댓글입니다.</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="no-comments">
            <p>아직 작성된 후기가 없습니다. 첫 번째 후기를 남겨보세요!</p>
          </div>
        </div>
      </template>
    </div>

    <!-- 댓글 작성 모달 -->
    <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>상품 후기를 남겨주세요!</h2>
        </div>

        <div class="rating-section">
          <p class="rating-label">평점을 선택해주세요</p>
          <div class="rating-stars">
            <i
              v-for="n in 5"
              :key="n"
              class="star-button"
              :class="n <= selectedRating ? 'fas fa-star active' : 'far fa-star'"
              @click="setRating(n)"
            ></i>
          </div>
        </div>

        <div class="comment-form">
          <textarea
            v-model="commentText"
            placeholder="후기 내용을 작성해주세요"
            class="comment-textarea"
            maxlength="500"
          ></textarea>
          <div class="char-count">{{ commentText.length }}/500</div>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="closeModal">취소</button>
          <button
            class="submit-btn"
            @click="submitComment"
            :disabled="!canSubmit || commentSubmitting"
          >
            {{ commentSubmitting ? '등록 중...' : '등록하기' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { postAPI, scrapAPI, commentAPI, getErrorMessage } from '@/api/post'
import { useToastStore } from '@/stores/useToastStore'

const route = useRoute()
const toastStore = useToastStore()

// 반응형 데이터
const productDetail = ref({})
const commentData = ref({ comments: [], totalCount: 0 })
const loading = ref(false)
const commentsLoading = ref(false)
const error = ref('')
const likeLoading = ref(false)
const applyLoading = ref(false)
const imageError = ref(false)

// 모달 상태
const isModalOpen = ref(false)
const selectedRating = ref(0)
const commentText = ref('')
const commentSubmitting = ref(false)

// computed 속성
const productId = computed(() => route.params.id)
const canSubmit = computed(() => selectedRating.value > 0 && commentText.value.trim().length > 0)

// 상품 상세 정보 가져오기
const fetchProductDetail = async () => {
  loading.value = true
  error.value = ''
  imageError.value = false
  try {
    const { body } = await postAPI.getPostById(productId.value)
    const productData = body.data
    productDetail.value = {
      ...productData,
      scraped: productData.scraped ?? productData.isScraped ?? false,
      scrapCount: productData.scrapCount ?? 0
    }
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

// 댓글 목록 가져오기
const fetchComments = async () => {
  commentsLoading.value = true
  try {
    const { body } = await commentAPI.getCommentsByPostId(productId.value)
    commentData.value = body.data
  } catch {
    commentData.value = { comments: [], totalCount: 0 }
  } finally {
    commentsLoading.value = false
  }
}

// 스크랩 토글
const toggleLike = async () => {
  likeLoading.value = true
  try {
    const { body } = await scrapAPI.toggleScrap(productId.value)
    const scrapData = body?.data
    if (scrapData) {
      productDetail.value.scraped = scrapData.scraped
      productDetail.value.scrapCount = scrapData.scrapCount ?? 0
    }
  } catch (err) {
    toastStore.error(getErrorMessage(err))
  } finally {
    likeLoading.value = false
  }
}

// 상품 가입
const applyProduct = () => {
  if (!productDetail.value.joinLink) {
    toastStore.error('가입 링크가 없습니다.')
    return
  }
  if (confirm('이 상품에 가입하시겠습니까?')) {
    window.open(productDetail.value.joinLink, '_blank')
    toastStore.info('새 창에서 가입 페이지가 열렸습니다.')
  }
}

// 모달 관련 함수들
const openModal = () => { isModalOpen.value = true }
const closeModal = () => {
  isModalOpen.value = false
  selectedRating.value = 0
  commentText.value = ''
}
const setRating = (rating) => { selectedRating.value = rating }

// 댓글 제출
const submitComment = async () => {
  if (!canSubmit.value) return
  commentSubmitting.value = true
  try {
    await commentAPI.createComment({
      postId: Number(productId.value),
      content: commentText.value,
      rating: selectedRating.value
    })
    await fetchComments()
    closeModal()
    toastStore.success('후기가 등록되었습니다!')
  } catch (err) {
    toastStore.error(getErrorMessage(err))
  } finally {
    commentSubmitting.value = false
  }
}

// 유틸리티 함수들
const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  } catch {
    return ''
  }
}

const formatContent = (content) => content ? content.replace(/\n/g, '<br>') : ''

// 컴포넌트 마운트 시 데이터 로딩
onMounted(async () => {
  await fetchProductDetail()
  await fetchComments()
})
</script>

<style scoped>
.loan-detail-container {
  background: var(--color-white);
  border-radius: 1rem;
  box-shadow: 0 0.125rem 0.75rem rgba(0, 0, 0, 0.1);
  min-height: 100vh;
}

.container.section {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

/* 로딩, 에러 스타일 */
.loading-container, 
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 0.125rem solid #f3f3f3;
  border-top: 0.125rem solid var(--color-sub);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-spinner.small {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  margin-bottom: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.comments-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #666;
}

.no-comments {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 0.9rem;
}

.error-message {
  color: #e74c3c;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.retry-btn {
  background-color: var(--color-sub);
  color: var(--color-white);
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  transition: background-color 0.2s ease;
}

.retry-btn:hover:not(:disabled) {
  background-color: var(--color-main);
}

/* 상품 정보 스타일 */
.product-image {
  width: 100%;
  height: 18.75rem;
  background: var(--color-light-2);
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 0.9rem;
  height: 100%;
}

.placeholder-text {
  text-align: center;
}

.product-info {
  margin-bottom: 2rem;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.product-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.product-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  line-height: 1.3;
}

.product-date {
  color: #666;
  font-size: 0.875rem;
}

.scrap-info {
  margin-top: 0.25rem;
}

.scrap-count {
  color: var(--color-sub);
  font-size: 0.875rem;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.like-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 1px solid #ddd;
  cursor: pointer;
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.like-btn:hover:not(:disabled) {
  border-color: var(--color-sub);
  color: var(--color-sub);
}

.like-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.heart-icon {
  transition: color 0.2s ease;
}

.heart-icon.liked {
  color: var(--color-sub);
}

.like-text {
  font-size: 0.875rem;
}

.interest-btn {
  background-color: var(--color-sub);
  color: var(--color-white);
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

.interest-btn:hover:not(:disabled) {
  background: var(--color-main);
}

.interest-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.product-description {
  line-height: 1.6;
  color: #333;
  font-size: 0.9375rem;
  margin-bottom: 1rem;
  padding: 1.5rem;
  background: #fafafa;
  border-radius: 0.5rem;
  border: 1px solid #eee;
}

.no-content {
  color: #999;
  font-style: italic;
  text-align: center;
}

/* 댓글 섹션 스타일 */
.comment-section {
  border-top: 1px solid var(--color-light-2);
  padding-top: 1.5rem;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.comment-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
  position: relative;
}

.comment-count {
  font-weight: normal;
  color: var(--color-sub);
  font-size: 0.9rem;
}

.comment-header h3::after {
  content: '';
  display: block;
  width: 2.5rem;
  height: 0.1875rem;
  background: var(--color-sub);
  margin-top: 0.25rem;
}

.write-comment-btn {
  background: none;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.write-comment-btn:hover {
  border-color: var(--color-sub);
  color: var(--color-sub);
}

.comment-item {
  padding: 1.25rem 0;
  border-bottom: 1px solid var(--color-light-3);
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.author-name {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.comment-date {
  color: #999;
  font-size: 0.8rem;
}

.owner-badge {
  background: var(--color-sub);
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 500;
}

.comment-rating {
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.star {
  color: #ddd;
  font-size: 0.875rem;
  margin-right: 0.125rem;
}

.star.filled {
  color: #ffc107;
}

.rating-text {
  font-size: 0.8rem;
  color: #666;
}

.comment-content {
  color: #555;
  line-height: 1.5;
  margin: 0;
  font-size: 0.9rem;
}

.comment-deleted {
  color: #999;
  font-style: italic;
  font-size: 0.9rem;
  margin: 0;
}

/* 대댓글 스타일 */
.replies {
  margin-top: 1rem;
  padding-left: 1.5rem;
  border-left: 2px solid var(--color-light-3);
}

.reply-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-light-3);
}

.reply-item:last-child {
  border-bottom: none;
}

.reply-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.reply-content {
  color: #555;
  line-height: 1.5;
  margin: 0;
  font-size: 0.85rem;
}

/* 모달 스타일 */
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
  padding: 1rem;
}

.modal-content {
  background: var(--color-white);
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 31.25rem;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  text-align: center;
  margin-bottom: 2rem;
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

.rating-label {
  margin-bottom: 1rem;
  color: #333;
  font-size: 0.9rem;
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
  color: #ffc107;
}

.star-button:hover {
  color: #ffc107;
}

.comment-form {
  margin-bottom: 1.5rem;
}

.comment-textarea {
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

.comment-textarea:focus {
  outline: none;
  border-color: var(--color-sub);
}

.comment-textarea::placeholder {
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
  background-color: var(--color-sub);
  color: var(--color-white);
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: var(--color-main);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>