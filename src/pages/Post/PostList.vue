<template>
  <div class="post-list-container">
    <div class="container section">
      <h1 class="page-title">{{ pageTitle }}</h1>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>데이터를 불러오는 중...</p>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button class="retry-btn" @click="fetchData">다시 시도</button>
      </div>

      <!-- 데이터가 없는 경우 -->
      <div v-else-if="posts.length === 0" class="empty-container">
        <p>등록된 상품이 없습니다.</p>
      </div>

      <!-- 상품 목록 -->
      <div v-else class="post-grid">
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :id="post.id"
          :title="post.title"
          :description="post.description"
          :tags="post.tags"
          :deadline="post.deadline"
          :companyName="post.companyName"
        />
      </div>

      <!-- 페이지네이션 -->
      <div v-if="pagination.totalPages > 1" class="pagination-container">
        <button
          class="pagination-btn"
          :disabled="currentPage <= PAGE_BLOCK_SIZE || loading"
          @click="goToPreviousBlock"
        >
          이전
        </button>

        <button
          v-for="page in paginationPages"
          :key="page"
          @click="changePage(page)"
          :class="['pagination-btn', { active: page === currentPage }]"
          :disabled="loading"
        >
          {{ page }}
        </button>

        <button
          class="pagination-btn"
          :disabled="
            paginationPages[paginationPages.length - 1] === pagination.totalPages || loading
          "
          @click="goToNextBlock"
        >
          다음
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PostCard from '@/components/post/PostCard.vue';
import { postAPI, getErrorMessage } from '@/api/post';

const route = useRoute();
const router = useRouter();

// [추가] 페이지네이션 블록 크기를 상수로 정의 (5개씩)
const PAGE_BLOCK_SIZE = 5;

const posts = ref([]);
const loading = ref(false);
const error = ref('');

const pagination = ref({
  totalPages: 0,
  totalElements: 0,
  pageNumber: 0,
  size: 9,
});

const currentPage = ref(1);

const pageTitle = computed(() =>
  route.path.includes('/policies') ? '정부 지원금 보기' : '대출 상품 보기'
);

const currentPageType = computed(() => {
  if (route.path.includes('/loans')) return 'loans';
  if (route.path.includes('/policies')) return 'policies';
  return null;
});

const fetchData = async () => {
  if (!currentPageType.value) return;
  loading.value = true;
  error.value = '';
  try {
    const response = await postAPI.getPostsByType(
      currentPageType.value,
      currentPage.value - 1,
      pagination.value.size
    );
    const pageData = response?.body?.data;
    if (pageData && pageData.content) {
      posts.value = transformPostsData(pageData.content);
      pagination.value = {
        totalPages: pageData.totalPages,
        totalElements: pageData.totalElements,
        pageNumber: pageData.number,
        size: pageData.size,
      };
    } else {
      posts.value = [];
      pagination.value.totalPages = 0;
    }
  } catch (err) {
    error.value = getErrorMessage(err);
    posts.value = [];
  } finally {
    loading.value = false;
  }
};

const transformPostsData = (rawData) => {
  if (!Array.isArray(rawData)) return [];
  return rawData.map((post) => ({
    id: post.postId,
    title: post.productName || '제목 없음',
    description: post.summary || '설명 없음',
    tags: post.tags || [],
    deadline: post.deadline || '상시 모집',
    companyName: post.companyName || '',
  }));
};

const changePage = (page) => {
  if (page < 1 || page > pagination.value.totalPages || page === currentPage.value) {
    return;
  }
  router.push({ path: route.path, query: { page } });
};

// [수정] 페이지네이션 UI를 블록 단위로 계산하도록 로직 변경
const paginationPages = computed(() => {
  const totalPages = pagination.value.totalPages;
  if (!totalPages) return [];

  // 현재 페이지가 속한 블록 계산 (0부터 시작)
  const currentBlock = Math.floor((currentPage.value - 1) / PAGE_BLOCK_SIZE);

  // 현재 블록의 시작 페이지와 끝 페이지 계산
  const startPage = currentBlock * PAGE_BLOCK_SIZE + 1;
  const endPage = Math.min(startPage + PAGE_BLOCK_SIZE - 1, totalPages);

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
});

// [추가] 다음 페이지 블록으로 이동하는 함수
const goToNextBlock = () => {
  const totalPages = pagination.value.totalPages;
  const currentBlock = Math.floor((currentPage.value - 1) / PAGE_BLOCK_SIZE);
  const nextPage = (currentBlock + 1) * PAGE_BLOCK_SIZE + 1;

  if (nextPage <= totalPages) {
    changePage(nextPage);
  }
};

// [추가] 이전 페이지 블록으로 이동하는 함수
const goToPreviousBlock = () => {
  const currentBlock = Math.floor((currentPage.value - 1) / PAGE_BLOCK_SIZE);
  const prevPage = (currentBlock - 1) * PAGE_BLOCK_SIZE + 1;

  if (prevPage >= 1) {
    changePage(prevPage);
  }
};

watch(
  () => [route.path, route.query.page],
  ([newPath, newPageQuery]) => {
    currentPage.value = parseInt(newPageQuery || '1', 10);
    fetchData();
  },
  { immediate: true }
);
</script>

<style scoped>
.post-list-container {
  min-height: 100vh;
  background: var(--color-light-1);
}

.container.section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-align: center;
  color: #333; /* 예외 허용 */
}

.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 0.25rem solid var(--color-light-3);
  border-top: 0.25rem solid var(--color-sub);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  color: var(--color-error);
  margin-bottom: 1rem;
  font-size: 1.1rem;
  max-width: 600px;
}

.retry-btn {
  background-color: var(--color-sub);
  color: var(--color-white);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.retry-btn:hover {
  background: var(--color-main);
}

.empty-container p {
  color: #666; /* 예외 허용 */
  font-size: 1.1rem;
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 고정 3컬럼 */
  gap: 2rem;
  margin-bottom: 3rem;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 0.625rem 1rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-white);
  color: #666;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  min-width: 40px;
  text-align: center;
}

.pagination-btn:hover:not(.disabled):not(:disabled) {
  background-color: var(--color-light-2);
  border-color: var(--color-sub);
  color: var(--color-sub);
}

.pagination-btn.active {
  background-color: var(--color-sub);
  color: var(--color-white);
  border-color: var(--color-sub);
}

.pagination-btn.disabled,
.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--color-disabled-bg);
}

.pagination-btn:disabled:hover {
  background-color: var(--color-disabled-bg);
  border-color: var(--color-border);
  color: #666;
}

/* 스켈레톤 로딩 효과 (단색 + opacity) */
.skeleton {
  background-color: var(--color-light-3);
  animation: skeleton-loading 1.5s infinite alternate;
}

@keyframes skeleton-loading {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.6;
  }
}
</style>

