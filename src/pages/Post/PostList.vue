<template>
  <div class="post-list-container">
    <div class="container section">
      <div class="controls-container">
        <div class="search-container">
          <div class="search-bar">
            <input
              type="search"
              class="search-input"
              placeholder="상품명 또는 회사명 검색"
              v-model="searchKeyword"
              @keydown.enter="handleEnterKey"
            />
            <button class="search-icon-btn" @click="handleSearch" :disabled="loading">
              <i class="fas fa-search"></i>
            </button>
          </div>
        </div>

        <div class="sort-dropdown">
          <button class="sort-display" @click="toggleDropdown">
            <span>{{ currentSortLabel }}</span>
            <i class="fas fa-chevron-down dropdown-arrow" :class="{ open: isDropdownOpen }"></i>
          </button>
          <transition name="fade">
            <ul v-if="isDropdownOpen" class="sort-options-list">
              <li @click="changeSort('latest')">최신순</li>
               <li @click="changeSort('oldest')">오래된순</li>
              <li @click="changeSort('popular')">인기순</li>
            </ul>
          </transition>
        </div>
      </div>

      <div v-if="isSearching && !loading" class="search-info">
        <p>
          <strong>'{{ route.query.keyword }}'</strong> 검색 결과:
          <span class="result-count">{{ pagination.totalElements }}개</span>
        </p>
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
        <h3>{{ isSearching ? '검색 결과가 없습니다.' : '등록된 상품이 없습니다.' }}</h3>
        <p v-if="isSearching">다른 검색어로 시도해보세요.</p>
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
        <div class="pagination-buttons">
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PostCard from '@/components/post/PostCard.vue';
import { postAPI, getErrorMessage } from '@/api/post';

const route = useRoute();
const router = useRouter();

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
const searchKeyword = ref('');
const sortOption = ref('latest');
const isDropdownOpen = ref(false);

const currentPageType = computed(() => {
  if (route.path.includes('/loans')) return 'loans';
  if (route.path.includes('/policies')) return 'policies';
  return null;
});

const currentSortLabel = computed(() => {
  const options = {
    latest: '최신순',
    popular: '인기순',
    oldest: '오래된순',
  };
  return options[sortOption.value] || '최신순';
});

const isSearching = computed(() => route.query.keyword !== undefined && route.query.keyword !== '');

const fetchData = async () => {
  if (!currentPageType.value) return;
  loading.value = true;
  error.value = '';

  try {
    let response;
    let sortValue = 'createdAt,desc';
    if (route.query.sortBy === 'popular') {
      sortValue = 'scrapCount,desc';
    } else if (route.query.sortBy === 'oldest') {
      sortValue = 'createdAt,asc';
    }

    if (isSearching.value) {
      response = await postAPI.searchPosts({
        type: currentPageType.value,
        keyword: route.query.keyword,
        page: currentPage.value - 1,
        size: pagination.value.size,
        sort: sortValue,
      });
    } else {
      response = await postAPI.getPostsByType(
        currentPageType.value,
        currentPage.value - 1,
        pagination.value.size,
        sortValue
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
      pagination.value.totalElements = 0;
    }
  } catch (err) {
    error.value = getErrorMessage(err);
    posts.value = [];
    pagination.value.totalPages = 0;
    pagination.value.totalElements = 0;
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

const handleSearch = () => {
  if (loading.value) return;
  const trimmedKeyword = searchKeyword.value?.trim();
  const query = { ...route.query, page: '1' };

  if (trimmedKeyword) {
    query.keyword = trimmedKeyword;
  } else {
    delete query.keyword;
  }

  if (route.query.keyword === trimmedKeyword) return;
  router.push({ path: route.path, query });
};

const handleEnterKey = (event) => {
  if (event.isComposing) return;
  handleSearch();
};

const clearSearch = () => {
  searchKeyword.value = '';
  const query = { ...route.query, page: '1' };
  delete query.keyword;
  router.push({ path: route.path, query });
};

const changePage = (page) => {
  if (page < 1 || page > pagination.value.totalPages || page === currentPage.value || loading.value) return;
  const query = { ...route.query, page: page.toString() };
  router.push({ path: route.path, query });
};

const changeSort = (option) => {
  isDropdownOpen.value = false;
  if (sortOption.value === option || loading.value) return;
  
  const query = { ...route.query, page: '1' };
  
  if (option === 'latest') {
    delete query.sortBy;
  } else {
    query.sortBy = option;
  }
  
  router.push({ path: route.path, query });
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = (event) => {
  if (isDropdownOpen.value && !event.target.closest('.sort-dropdown')) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});

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
  () => route.fullPath,
  () => {
    sortOption.value = route.query.sortBy || 'latest';
    searchKeyword.value = route.query.keyword || '';
    currentPage.value = parseInt(route.query.page || '1', 10);
    fetchData();
  },
  { immediate: true }
);

watch(searchKeyword, (newValue) => {
  if (newValue === '' && isSearching.value) {
    clearSearch();
  }
});

</script>

<style scoped>
.post-list-container {
  min-height: 100vh;
  background: var(--color-light-3);
}

.container.section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.controls-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.sort-dropdown {
  position: relative;
  display: inline-block;
}

.sort-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--color-white);
  border: 1px solid var(--color-border);
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  transition: all 0.2s ease;
}

.sort-display:hover {
  border-color: var(--color-sub);
}

.dropdown-arrow {
  transition: transform 0.2s ease-in-out;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.sort-options-list {
  position: absolute;
  top: 110%;
  right: 0; 
  background-color: var(--color-white);
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  margin: 0;
  list-style: none;
  z-index: 10;
  width: 150px; 
  text-align: center;
}

.sort-options-list li {
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #555;
  transition: background-color 0.2s ease;
}

.sort-options-list li:hover {
  background-color: var(--color-light-2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.search-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0;
  margin-left: auto; 
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  min-width: 300px;
  padding: 0.75rem 2.8rem 0.75rem 1rem;
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

.search-icon-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #888;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-icon-btn:hover {
  color: var(--color-sub);
}

.search-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-light-2);
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid var(--color-sub);
}

.search-info p {
  margin: 0;
  color: var(--color-dark-2);
}

.result-count {
  color: var(--color-sub);
  font-weight: 600;
}

.clear-search-btn {
  background: var(--color-white);
  color: var(--color-sub);
  border: 1px solid var(--color-sub);
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.clear-search-btn:hover {
  background: var(--color-sub);
  color: var(--color-white);
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

.empty-container {
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-container h3 {
  margin-bottom: 0.5rem;
  color: var(--color-dark-2);
}

.empty-container p {
  font-size: 1rem;
  opacity: 0.7;
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
  gap: 1rem;
  margin-top: 2rem;
}

.pagination-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
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

@media (max-width: 768px) {
  .controls-container {
    flex-direction: column-reverse; /* 화면이 작아지면 검색창이 위로 오도록 변경 */
    align-items: stretch;
  }
  
  .search-container {
    justify-content: stretch;
    margin-left: 0;
  }
  
  .search-input {
    min-width: unset;
  }
  
  .post-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .pagination-buttons {
    gap: 0.25rem;
  }
  
  .pagination-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    min-width: 35px;
  }
}
</style>