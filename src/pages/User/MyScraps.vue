<template>
  <div class="container section">
    <h1>내 스크랩북</h1>
    <hr />

    <div class="tabs">
      <button
        class="tab"
        :class="{ active: activeTab === 'SUPPORT' }"
        @click="activeTab = 'SUPPORT'"
      >
        정부 지원금 <span class="count">{{ supportList.length }}</span>
      </button>
      <div class="divider" />
      <button class="tab" :class="{ active: activeTab === 'LOAN' }" @click="activeTab = 'LOAN'">
        대출 상품 <span class="count">{{ loanList.length }}</span>
      </button>
    </div>

    <div v-if="loading" class="state">로딩 중...</div>
    <div v-else-if="error" class="state error">에러: {{ error }}</div>
    <div v-else>
      <div v-if="filtered.length === 0" class="state">스크랩한 항목이 없습니다.</div>

      <ul v-else class="grid">
        <li v-for="item in filtered" :key="item.postId" class="card" @click="goPost(item)">
          <div class="card-top">
            <div class="badge" :class="getDdayClass(item.deadline)">
              {{ item.deadline }}
            </div>
          </div>
          <h3 class="title">{{ item.productName }}</h3>
          <p class="summary">{{ item.summary }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import scrapAPI from '@/api/scrap';

const router = useRouter();

const loading = ref(false);
const error = ref('');
const scraps = ref([]);

const activeTab = ref('SUPPORT'); // 기본 탭

const loanList = computed(() => scraps.value.filter((s) => s.postType === 'LOAN'));
const supportList = computed(() => scraps.value.filter((s) => s.postType === 'SUPPORT'));
const filtered = computed(() => (activeTab.value === 'LOAN' ? loanList.value : supportList.value));

const getDdayClass = (label) => {
  if (!label) return '';
  if (label === '마감') return 'expired';
  if (label === 'D-DAY' || /^D-0$/i.test(label)) return 'dday';
  const m = /^D-(\d+)$/i.exec(label);
  if (m) {
    const n = Number(m[1]);
    return n <= 7 ? 'soon' : '';
  }
  return '';
};

const goPost = (item) => {
  if (item.postType === 'LOAN') {
    router.push(`/loans/${item.postId}`);
  } else if (item.postType === 'SUPPORT') {
    router.push(`/policies/${item.postId}`);
  } else {
    // 혹시 다른 경우를 대비한 기본 라우팅
    router.push(`/post/${item.postId}`);
  }
};

onMounted(async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await scrapAPI.getMyScraps();
    scraps.value = Array.isArray(res) ? res : [];
  } catch (e) {
    error.value = '스크랩 목록을 불러올 수 없습니다.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* 탭 영역: 좌(1fr) | 구분선(auto) | 우(1fr) */
.tabs {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  justify-items: center;
  margin: 22px auto 28px;
  max-width: 720px;
}

.tab {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 0;
  appearance: none;
  background: transparent;
  border: none;
  font-size: 22px;
  font-weight: 700;
  color: #777;
  cursor: pointer;
  text-align: center;
}
.tab.active {
  color: #111;
}
.tab .count {
  font-size: 16px;
  font-weight: 600;
  color: #999;
}

/* 가운데 구분선 더 선명하게 */
.divider {
  width: 2px; /* 더 두껍게 */
  height: 40px; /* 더 길게 */
  background: #c8c8c8; /* 진한 회색 */
  border-radius: 2px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.02); /* 약간의 또렷함 */
}

/* 상태 문구 */
.state {
  padding: 28px 6px;
  color: #666;
  text-align: center;
}
.state.error {
  color: #c21;
}

/* 그리드 & 카드 */
.grid {
  list-style: none;
  margin: 0;
  padding: 8px 0 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(21rem, 1fr));
  gap: 1.25rem;
}

.card {
  background: #fff;
  border-radius: 0.75rem;
  border: 0.0625rem solid #f3eee8;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.1);
  /* padding: 18px 18px 20px; */
  padding: 1.25rem;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  min-height: 180px;
}
.card:hover {
  transform: translateY(-0.125rem);
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.15);
  background: var(--color-light-2);
}

.badge {
  display: inline-block;
  padding: 0.375rem 1rem;
  border-radius: 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--color-sub);
  background: var(--color-white);
  border: 1px solid var(--color-sub);
}
.badge.soon {
  background: var(--color-sub, #ff6b6b);
  color: #fff;
}
.badge.dday {
  background: #e33;
  color: #fff;
}
.badge.expired {
  background: #eaeaea;
  color: #999;
}

.title {
  margin: 0.625rem 0.125rem 1.125rem 0.3125rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: #333;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
.summary {
  margin-left: 8px;
  font-size: 14px;
  color: #444;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>

