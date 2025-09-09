<!-- src/pages/MyScraps.vue -->
<template>
  <div class="container section">
    <h1>내 스크랩북</h1>
    <hr />

    <div class="tabs">
      <button class="tab" :class="{ active: activeTab === 'POLICY' }" @click="activeTab = 'POLICY'">
        정부 지원금 <span class="count">{{ policyList.length }}</span>
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
        <li v-for="item in filtered" :key="item.postId" class="card" @click="goPost(item.postId)">
          <div class="badge" :class="getDdayClass(item.deadline)">
            {{ item.deadline }}
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

const activeTab = ref('POLICY'); // 기본 탭

const loanList = computed(() => scraps.value.filter((s) => s.postType === 'LOAN'));
const policyList = computed(() => scraps.value.filter((s) => s.postType === 'POLICY'));
const filtered = computed(() => (activeTab.value === 'LOAN' ? loanList.value : policyList.value));

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

const goPost = (postId) => {
  // 상세 페이지 라우트에 맞춰 경로 수정
  router.push(`/post/${postId}`);
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
  align-items: center; /* 세로 중앙 */
  justify-items: center; /* 각 칸 가로 중앙 */
  margin: 22px auto 28px; /* 전체 가운데 배치 */
  max-width: 720px; /* 폭을 주면 중앙 정렬이 더 또렷 */
}

/* 버튼을 자신의 칸 안에서 정확히 중앙에 */
.tab {
  width: 100%; /* 각 탭이 자신 칸(1fr) 전체 사용 */
  display: inline-flex;
  align-items: center; /* 세로 중앙 */
  justify-content: center; /* 가로 중앙 */
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px 26px;
}
@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.card {
  border: 1px solid #ececec;
  border-radius: 16px;
  background: #fff;
  padding: 18px 18px 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition:
    transform 0.08s ease,
    box-shadow 0.18s ease;
  min-height: 180px;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.1);
}

.badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 800;
  border-radius: 999px;
  padding: 6px 10px;
  margin-bottom: 12px;
  color: #111;
  background: #f2f2f2;
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
  font-size: 18px;
  font-weight: 700;
  color: #111;
  margin: 2px 0 8px;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.summary {
  font-size: 14px;
  color: #444;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>

