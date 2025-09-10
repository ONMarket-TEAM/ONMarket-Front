<template>
  <div class="post-list-container">
    <div class="container section">
      <div class="search-container">
        <div class="search-bar">
          <i class="fas fa-search search-icon"></i>
          <input
            type="search"
            class="search-input"
            placeholder="검색어를 입력해주세요"
            v-model="searchKeyword"
            @keydown.enter="handleSearch"
          />
        </div>
        <button class="search-btn" @click="handleSearch">검색</button>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>데이터를 불러오는 중...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button class="retry-btn" @click="fetchData">다시 시도</button>
      </div>

      <div v-else-if="posts.length === 0" class="empty-container">
        <p>{{ isSearching ? '검색 결과가 없습니다.' : '등록된 상품이 없습니다.' }}</p>
      </div>

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
            paginationPages.length &&
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

const PAGE_BLOCK_SIZE = 5;

// === 상태 관리 ===
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
const searchKeyword = ref('');

// === Computed ===
const currentPageType = computed(() => {
  if (route.path.includes('/loans')) return 'loans';
  if (route.path.includes('/policies')) return 'policies';
  return null;
});

// [수정됨] isSearching 로직에서 available 조건 삭제
const isSearching = computed(() => !!route.query.keyword);

// === 데이터 로직 ===
const fetchData = async () => {
  if (!currentPageType.value) return;
  loading.value = true;
  error.value = '';

  try {
    let response;
    if (isSearching.value) {
      response = await postAPI.searchPosts({
        type: currentPageType.value,
        keyword: route.query.keyword,
        page: currentPage.value - 1,
        size: pagination.value.size,
      });
    } else {
      response = await postAPI.getPostsByType(
        currentPageType.value,
        currentPage.value - 1,
        pagination.value.size
      );
    }
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

// === 페이지네이션 & 검색 로직 ===
const handleSearch = () => {
  const query = {};
  if (searchKeyword.value) {
    query.keyword = searchKeyword.value;
  }
  // [수정됨] available 관련 로직 삭제
  query.page = '1';
  router.push({ path: route.path, query });
};

const changePage = (page) => {
  if (page < 1 || page > pagination.value.totalPages || page === currentPage.value) {
    return;
  }
  const query = { ...route.query, page };
  router.push({ path: route.path, query });
};

const paginationPages = computed(() => {
  const totalPages = pagination.value.totalPages;
  if (!totalPages) return [];
  const currentBlock = Math.floor((currentPage.value - 1) / PAGE_BLOCK_SIZE);
  const startPage = currentBlock * PAGE_BLOCK_SIZE + 1;
  const endPage = Math.min(startPage + PAGE_BLOCK_SIZE - 1, totalPages);
  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
});

const goToNextBlock = () => {
  const totalPages = pagination.value.totalPages;
  const currentBlock = Math.floor((currentPage.value - 1) / PAGE_BLOCK_SIZE);
  const nextPage = (currentBlock + 1) * PAGE_BLOCK_SIZE + 1;
  if (nextPage <= totalPages) {
    changePage(nextPage);
  }
};

const goToPreviousBlock = () => {
  const currentBlock = Math.floor((currentPage.value - 1) / PAGE_BLOCK_SIZE);
  const prevPage = (currentBlock - 1) * PAGE_BLOCK_SIZE + 1;
  if (prevPage >= 1) {
    changePage(prevPage);
  }
};

watch(
  () => route.query,
  (newQuery) => {
    searchKeyword.value = newQuery.keyword || '';
    // [수정됨] available 관련 로직 삭제
    currentPage.value = parseInt(newQuery.page || '1', 10);
    fetchData();
  },
  { immediate: true, deep: true }
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

/* [수정됨] 검색 UI 전체 컨테이너 스타일 */
.search-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

/* [수정됨] 돋보기 아이콘 스타일 */
.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  pointer-events: none; /* 아이콘이 클릭되지 않도록 설정 */
}

/* [수정됨] 검색 입력창 스타일 (왼쪽 패딩 추가) */
.search-input {
  width: 100%;
  min-width: 300px;
  padding: 0.75rem 1rem 0.75rem 2.5rem; /* 왼쪽 패딩으로 아이콘 공간 확보 */
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-sub);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

/* [수정됨] 검색 버튼 스타일 (돋보기 아이콘이 아닌 별도의 버튼) */
.search-btn {
  background-color: var(--color-sub);
  color: var(--color-white);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

.search-btn:hover {
  background: var(--color-main);
}


/* ... 이하 스타일은 기존과 동일 ... */
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  color: #666;
  font-size: 1.1rem;
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

.pagination-btn:hover:not(:disabled) {
  background-color: var(--color-light-2);
  border-color: var(--color-sub);
  color: var(--color-sub);
}

.pagination-btn.active {
  background-color: var(--color-sub);
  color: var(--color-white);
  border-color: var(--color-sub);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--color-disabled-bg);
}
</style>