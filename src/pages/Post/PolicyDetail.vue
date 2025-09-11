<template>
  <div class="policy-detail-container">
    <div class="container section">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>정책 정보를 불러오는 중...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button class="retry-btn" @click="fetchProductDetail">다시 시도</button>
      </div>

      <template v-else>
        <div class="product-info">
          <div class="product-header">
            <div class="product-meta">
              <span class="product-name">{{ productDetail.productName || '제목 없음' }}</span>
              <span class="product-date">{{ formatDate(productDetail.createdAt) }}</span>
              <div class="scrap-info" v-if="productDetail.scrapCount !== undefined">
                <span class="scrap-count"
                  ><i class="fas fa-heart"></i> {{ productDetail.scrapCount }}명이 관심을
                  표시했습니다</span
                >
              </div>
            </div>
            <div class="action-buttons">
              <button class="like-btn" @click="toggleLike" :disabled="likeLoading">
                <i
                  :class="
                    productDetail.scraped
                      ? 'fas fa-heart heart-icon liked'
                      : 'far fa-heart heart-icon'
                  "
                ></i>
                <span class="like-text">{{ productDetail.scraped ? '관심해제' : '관심정책' }}</span>
              </button>
              <button class="interest-btn" @click="applyProduct" :disabled="applyLoading">
                {{ applyLoading ? '처리중...' : '신청하기' }}
              </button>
            </div>
          </div>
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

          <div class="product-description">
            <div
              v-if="productDetail.detailContent"
              v-html="formatContent(productDetail.detailContent)"
            ></div>
            <div v-else class="no-content">상세 내용이 준비 중입니다.</div>
          </div>
        </div>

        <div class="comment-section">
          <div class="comment-header">
            <h3>
              지원금 후기
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
                <span class="owner-badge" v-if="isCommentOwner(comment)">작성자</span>
                <div class="comment-buttons" v-if="isCommentOwner(comment)">
                  <button
                    @click="openEditModal(comment)"
                    class="edit-btn"
                    :disabled="editLoading === comment.commentId"
                  >
                    {{ editLoading === comment.commentId ? '수정중...' : '수정' }}
                  </button>
                  <button
                    @click="deleteComment(comment.commentId)"
                    class="delete-btn"
                    :disabled="deleteLoading === comment.commentId"
                  >
                    {{ deleteLoading === comment.commentId ? '삭제중...' : '삭제' }}
                  </button>
                </div>
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

              <p class="comment-content" v-if="!comment.isDeleted">{{ comment.content }}</p>
              <p class="comment-deleted" v-else>삭제된 댓글입니다.</p>

              <div class="comment-actions" v-if="!comment.isDeleted">
                <button
                  class="reply-btn"
                  @click="openReplyModal(comment.commentId, comment.author)"
                >
                  답글 작성
                </button>
              </div>

              <div class="replies" v-if="comment.replies?.length">
                <div class="reply-item" v-for="reply in comment.replies" :key="reply.commentId">
                  <div class="reply-author">
                    <span class="author-name">{{ reply.author || '익명' }}</span>
                    <span class="comment-date">{{ formatDate(reply.createdAt) }}</span>
                    <span class="owner-badge" v-if="isCommentOwner(reply)">작성자</span>
                    <div class="comment-buttons" v-if="isCommentOwner(reply)">
                      <button
                        @click="openEditModal(reply)"
                        class="edit-btn"
                        :disabled="editLoading === reply.commentId"
                      >
                        {{ editLoading === reply.commentId ? '수정중...' : '수정' }}
                      </button>
                      <button
                        @click="deleteComment(reply.commentId)"
                        class="delete-btn"
                        :disabled="deleteLoading === reply.commentId"
                      >
                        {{ deleteLoading === reply.commentId ? '삭제중...' : '삭제' }}
                      </button>
                    </div>
                  </div>
                  <p class="reply-content" v-if="!reply.isDeleted">↳ {{ reply.content }}</p>
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

    <div
      v-if="isModalOpen && !isReplyMode && !isEditMode"
      class="modal-overlay"
      @click="closeModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>정책 후기를 남겨주세요!</h2>
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

    <div v-if="isModalOpen && isReplyMode && !isEditMode" class="modal-overlay" @click="closeModal">
      <div class="modal-content reply-modal" @click.stop>
        <div class="modal-header">
          <h2>답글 작성</h2>
        </div>

        <div class="comment-form">
          <textarea
            v-model="commentText"
            placeholder="답글 내용을 작성해주세요"
            class="comment-textarea"
            maxlength="300"
          ></textarea>
          <div class="char-count">{{ commentText.length }}/300</div>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="closeModal">취소</button>
          <button
            class="submit-btn"
            @click="submitReply"
            :disabled="!canSubmitReply || commentSubmitting"
          >
            {{ commentSubmitting ? '답글 등록 중...' : '답글 등록' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="isModalOpen && isEditMode" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingComment.parentCommentId ? '답글 수정' : '후기 수정' }}</h2>
        </div>

        <div class="rating-section" v-if="!editingComment.parentCommentId">
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
            :placeholder="
              editingComment.parentCommentId
                ? '답글 내용을 수정해주세요'
                : '후기 내용을 수정해주세요'
            "
            class="comment-textarea"
            :maxlength="editingComment.parentCommentId ? 300 : 500"
          ></textarea>
          <div class="char-count">
            {{ commentText.length }}/{{ editingComment.parentCommentId ? 300 : 500 }}
          </div>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="closeModal">취소</button>
          <button
            class="submit-btn"
            @click="submitEditComment"
            :disabled="!canSubmitEdit || commentSubmitting"
          >
            {{ commentSubmitting ? '수정 중...' : '수정하기' }}
          </button>
        </div>
      </div>
    </div>

    <transition name="fade">
      <button v-if="showScrollTopButton" @click="scrollToTop" class="scroll-top-btn">
        <i class="fas fa-arrow-up"></i>
      </button>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'; // [수정됨] onUnmounted 추가
import { useRoute } from 'vue-router';
import { postAPI, scrapAPI, commentAPI, getErrorMessage } from '@/api/post';
import { useToastStore } from '@/stores/useToastStore';
import { useUserTracking } from '@/composables/useUserTracking'; // 추가

const route = useRoute();
const toastStore = useToastStore();

// 반응형 데이터
const productDetail = ref({});
const commentData = ref({ comments: [], totalCount: 0 });
const loading = ref(false);
const commentsLoading = ref(false);
const error = ref('');
const likeLoading = ref(false);
const applyLoading = ref(false);
const imageError = ref(false);
const deleteLoading = ref(null);
const editLoading = ref(null);
const currentUser = ref(null);

// 모달 상태
const isModalOpen = ref(false);
const isReplyMode = ref(false);
const isEditMode = ref(false);
const parentCommentId = ref(null);
const replyToAuthor = ref('');
const selectedRating = ref(0);
const commentText = ref('');
const commentSubmitting = ref(false);
const editingComment = ref(null);

// computed 속성
const productId = computed(() => route.params.id);
const canSubmit = computed(() => selectedRating.value > 0 && commentText.value.trim().length > 0);
const canSubmitReply = computed(() => commentText.value.trim().length > 0);
const canSubmitEdit = computed(() => {
  if (editingComment.value?.parentCommentId) {
    return commentText.value.trim().length > 0;
  } else {
    return selectedRating.value > 0 && commentText.value.trim().length > 0;
  }
});

const { trackLinkClick, trackScrap, trackRating, trackComment } = useUserTracking(productId);

// 현재 사용자 정보 가져오기
const getCurrentUser = () => {
  try {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      email: payload.sub || payload.email,
      userId: payload.userId || payload.id,
      username: payload.username || payload.name,
    };
  } catch (error) {
    return null;
  }
};

// 댓글 소유자 확인 함수
const isCommentOwner = (comment) => {
  if (!currentUser.value || !comment) return false;
  if (comment.isOwner === true) return true;
  if (comment.isOwner === false) return false;
  if (comment.userId && currentUser.value.userId) {
    return comment.userId === currentUser.value.userId;
  }
  if (comment.author && currentUser.value.email) {
    if (comment.author.includes('@')) {
      return comment.author === currentUser.value.email;
    }
    if (currentUser.value.username) {
      return comment.author === currentUser.value.username;
    }
  }
  if (comment.author && currentUser.value.email) {
    const emailUsername = currentUser.value.email.split('@')[0];
    return comment.author === emailUsername;
  }
  return false;
};

// 상품 상세 정보 가져오기
const fetchProductDetail = async () => {
  loading.value = true;
  error.value = '';
  imageError.value = false;
  try {
    const { body } = await postAPI.getPostById(productId.value);
    const productData = body.data;
    productDetail.value = {
      ...productData,
      scraped: productData.scraped ?? productData.isScraped ?? false,
      scrapCount: productData.scrapCount ?? 0,
    };
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
};

// 댓글 목록 가져오기
const fetchComments = async () => {
  commentsLoading.value = true;
  try {
    const response = await commentAPI.getCommentsByPostId(productId.value);
    if (response.body && response.body.data) {
      commentData.value = response.body.data;
    } else if (response.data) {
      commentData.value = response.data;
    } else {
      commentData.value = response;
    }
  } catch (err) {
    commentData.value = { comments: [], totalCount: 0 };
    if (err.response?.status !== 401) {
      toastStore.error('댓글을 불러오는데 실패했습니다.');
    }
  } finally {
    commentsLoading.value = false;
  }
};

// 댓글 수정 모달 열기 함수
const openEditModal = (comment) => {
  if (!currentUser.value) {
    toastStore.error('로그인이 필요합니다.');
    return;
  }
  if (!isCommentOwner(comment)) {
    toastStore.error('수정 권한이 없습니다.');
    return;
  }
  editingComment.value = comment;
  commentText.value = comment.content || '';
  selectedRating.value = comment.rating || 0;
  isEditMode.value = true;
  isReplyMode.value = false;
  isModalOpen.value = true;
};

// 댓글 수정 제출 함수
const submitEditComment = async () => {
  if (!canSubmitEdit.value || !editingComment.value) return;
  if (!currentUser.value) {
    toastStore.error('로그인이 필요합니다.');
    return;
  }
  commentSubmitting.value = true;
  try {
    const updateData = {
      content: commentText.value,
    };
    if (!editingComment.value.parentCommentId && selectedRating.value > 0) {
      updateData.rating = selectedRating.value;
    }
    await commentAPI.updateComment(editingComment.value.commentId, updateData);
    await fetchComments();
    closeModal();
    toastStore.success('댓글이 수정되었습니다!');
    // 평점이 변경된 경우 추적
    if (!editingComment.value.parentCommentId && selectedRating.value > 0) {
      trackRating(selectedRating.value);
    }
  } catch (err) {
    toastStore.error(getErrorMessage(err));
  } finally {
    commentSubmitting.value = false;
  }
};

// 댓글 삭제
const deleteComment = async (commentId) => {
  const comment = findCommentById(commentId);
  if (!comment || !isCommentOwner(comment)) {
    toastStore.error('삭제 권한이 없습니다.');
    return;
  }
  if (!confirm('댓글을 삭제하시겠습니까?\n답글이 있다면 함께 삭제됩니다.')) {
    return;
  }
  deleteLoading.value = commentId;
  try {
    await commentAPI.deleteComment(commentId);
    await fetchComments();
    toastStore.success('댓글이 삭제되었습니다.');
  } catch (err) {
    toastStore.error(getErrorMessage(err));
  } finally {
    deleteLoading.value = null;
  }
};

// 댓글 찾기 유틸 함수
const findCommentById = (commentId) => {
  if (!commentData.value.comments) return null;
  for (const comment of commentData.value.comments) {
    if (comment.commentId === commentId) return comment;
    if (comment.replies) {
      for (const reply of comment.replies) {
        if (reply.commentId === commentId) return reply;
      }
    }
  }
  return null;
};

// 스크랩 토글
const toggleLike = async () => {
  likeLoading.value = true;
  try {
    const { body } = await scrapAPI.toggleScrap(productId.value);
    const scrapData = body?.data;
    if (scrapData) {
      productDetail.value.scraped = scrapData.scraped;
      productDetail.value.scrapCount = scrapData.scrapCount ?? 0;

      trackScrap(scrapData.scraped);
    }
  } catch (err) {
    toastStore.error(getErrorMessage(err));
  } finally {
    likeLoading.value = false;
  }
};

// 상품 신청
const applyProduct = () => {
  if (!productDetail.value.joinLink) {
    toastStore.error('신청 링크가 없습니다.');
    return;
  }
  if (confirm('이 정책에 신청하시겠습니까?')) {
    trackLinkClick();

    window.open(productDetail.value.joinLink, '_blank');
    toastStore.info('새 창에서 신청 페이지가 열렸습니다.');
  }
};

// 모달 관련 함수들
const openModal = () => {
  if (!currentUser.value) {
    toastStore.error('로그인이 필요합니다.');
    return;
  }
  isModalOpen.value = true;
  isReplyMode.value = false;
  isEditMode.value = false;
};

const openReplyModal = (commentId, authorName) => {
  if (!currentUser.value) {
    toastStore.error('로그인이 필요합니다.');
    return;
  }
  parentCommentId.value = commentId;
  replyToAuthor.value = authorName;
  isModalOpen.value = true;
  isReplyMode.value = true;
  isEditMode.value = false;
  selectedRating.value = 0;
};

const closeModal = () => {
  isModalOpen.value = false;
  isReplyMode.value = false;
  isEditMode.value = false;
  parentCommentId.value = null;
  replyToAuthor.value = '';
  selectedRating.value = 0;
  commentText.value = '';
  editingComment.value = null;
};

const setRating = (rating) => {
  selectedRating.value = rating;
};

// 일반 댓글 제출
const submitComment = async () => {
  if (!canSubmit.value) return;
  if (!currentUser.value) {
    toastStore.error('로그인이 필요합니다.');
    return;
  }
  commentSubmitting.value = true;
  try {
    await commentAPI.createComment({
      postId: Number(productId.value),
      content: commentText.value,
      rating: selectedRating.value,
    });
    await fetchComments();
    closeModal();
    toastStore.success('후기가 등록되었습니다!');
    // 댓글 작성 추적
    trackComment();
    // 평점 추적
    if (selectedRating.value > 0) {
      trackRating(selectedRating.value);
    }
  } catch (err) {
    toastStore.error(getErrorMessage(err));
  } finally {
    commentSubmitting.value = false;
  }
};

// 대댓글 제출
const submitReply = async () => {
  if (!canSubmitReply.value) return;
  if (!currentUser.value) {
    toastStore.error('로그인이 필요합니다.');
    return;
  }
  commentSubmitting.value = true;
  try {
    await commentAPI.createComment({
      postId: Number(productId.value),
      content: commentText.value,
      parentCommentId: parentCommentId.value,
    });
    await fetchComments();
    closeModal();
    toastStore.success('답글이 등록되었습니다!');
    trackComment();
  } catch (err) {
    toastStore.error(getErrorMessage(err));
  } finally {
    commentSubmitting.value = false;
  }
};

// 유틸리티 함수들
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

const formatContent = (content) => (content ? content.replace(/\n/g, '<br>') : '');

// [추가됨] Scroll to Top 관련 로직
const showScrollTopButton = ref(false);

const handleScroll = () => {
  if (window.scrollY > 200) {
    showScrollTopButton.value = true;
  } else {
    showScrollTopButton.value = false;
  }
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

// 컴포넌트 마운트 및 언마운트 시 로직
onMounted(async () => {
  currentUser.value = getCurrentUser();
  await fetchProductDetail();
  await fetchComments();
  // [추가됨] 스크롤 이벤트 리스너 등록
  window.addEventListener('scroll', handleScroll);
});

// [추가됨] 컴포넌트가 사라질 때 이벤트 리스너 제거
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.policy-detail-container {
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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
  height: 100%;
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

.comment-author,
.reply-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
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

/* 댓글 버튼들을 위한 스타일 */
.comment-buttons {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

/* 수정 버튼 스타일 */
.edit-btn {
  background: none;
  border: none;
  color: var(--color-sub);
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.edit-btn:hover:not(:disabled) {
  background-color: #e8f4fd;
  color: var(--color-main);
}

.edit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 삭제 버튼 스타일 */
.delete-btn {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.delete-btn:hover:not(:disabled) {
  background-color: #fee;
  color: #c0392b;
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

/* 댓글 액션 스타일 (답글 작성 버튼) */
.comment-actions {
  margin-top: 0.75rem;
}

.reply-btn {
  background: none;
  border: 1px solid #ddd;
  color: #666;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.reply-btn:hover {
  border-color: var(--color-sub);
  color: var(--color-sub);
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

.reply-modal {
  max-width: 28rem;
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

.reply-info {
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.9rem;
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

/* 모달 버튼 스타일 */
.cancel-btn,
.submit-btn {
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 6rem;
}

/* 취소 버튼 */
.cancel-btn {
  background: #f5f5f5;
  border: 1px solid #ddd;
  color: #555;
}

.cancel-btn:hover:not(:disabled) {
  background: #eee;
  border-color: #ccc;
}

/* 등록 버튼 */
.submit-btn {
  background: var(--color-sub);
  border: none;
  color: var(--color-white);
}

.submit-btn:hover:not(:disabled) {
  background: var(--color-main);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .container.section {
    padding: 1rem;
  }

  .product-header {
    flex-direction: column;
    gap: 1rem;
  }

  .action-buttons {
    width: 100%;
    justify-content: flex-start;
  }

  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .comment-author,
  .reply-author {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .comment-buttons {
    margin-left: 0;
    margin-top: 0.5rem;
    flex-basis: 100%;
  }

  .replies {
    padding-left: 1rem;
  }
}

/* [추가됨] 맨 위로 가기 버튼 스타일 */
.scroll-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: var(--color-sub);
  color: var(--color-white);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  z-index: 100;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.scroll-top-btn:hover {
  background-color: var(--color-main);
  transform: translateY(-2px);
}

/* [추가됨] 트랜지션 효과 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

