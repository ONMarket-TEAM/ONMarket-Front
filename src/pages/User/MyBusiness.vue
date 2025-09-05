<template>
  <div class="container section">
    <h1>내 사업장</h1>
    <hr />

    <!-- 로딩 -->
    <div v-if="loading" class="state-box">불러오는 중 ...</div>

    <!-- 에러 -->
    <div v-else-if="error" class="state-box error">에러: {{ error }}</div>

    <!-- 목록 -->
    <div v-else>
      <div v-if="businesses.length" class="grid">
        <article
          v-for="b in businesses"
          :key="b.businessId"
          class="card"
          @click="goToUpdate(b.businessId)"
        >
          <div class="card-top">
            <span class="badge">{{ toBusinessType(b.businessType) }}</span>
          </div>

          <h3 class="title">
            {{ b.businessName || '사업장명 미등록' }}
          </h3>

          <div class="card-bottom">
            <span class="chip">#{{ toRegion(b.regionCodeId) }}</span>
            <span class="chip">#{{ toIndustry(b.industry) }}</span>
          </div>
        </article>
      </div>

      <!-- 등록된 사업장이 없을 때 -->
      <div v-else class="empty">
        <p>등록된 사업장이 없습니다.</p>
        <button class="add-btn" @click="goToRegister">사업장 추가하기</button>
      </div>

      <!-- 사업장 추가 버튼 -->
      <div class="footer-add">
        <button class="add-btn" @click="goToRegister">사업장 추가하기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { businessAPI } from '@/api/business';
import regionData from '@/data/region.json';
import { useToastStore } from '@/stores/useToastStore';

const router = useRouter();
const businesses = ref([]);
const loading = ref(true);
const error = ref('');
const toast = useToastStore();

/** 사업장 목록 로드 */
const load = async () => {
  loading.value = true;
  error.value = '';
  try {
    const result = await businessAPI.getMyBusinessList();

    if (result.success) {
      businesses.value = result.data;
    } else {
      // API에서 반환하는 에러 메시지 사용
      error.value = result.message || '사업장 목록을 불러오지 못했습니다.';
      toast.error(error.value);
    }
  } catch (e) {
    // 네트워크 에러 등 에러
    error.value = '사업장 목록을 불러오지 못했습니다.';
    toast.error(error.value);

    // 인증 만료 등 특정 상태 코드에 따른 처리
    if (e?.response?.status === 401) {
      // 로그인 페이지로 이동 처리
      toast.warning('인증이 만료되었습니다.');
      router.push('/login');
    }
  } finally {
    loading.value = false;
  }
};

onMounted(load);

/** 각 사업장으로 이동 */
const goToUpdate = (businessId) => {
  router.push({ name: 'UpdateBusiness', params: { businessId } });
};

/** 새 사업장 등록 */
const goToRegister = () => {
  router.push({
    path: '/business/register',
    query: { returnTo: '/user/mybusiness' },
  });
};

/** 표시용 매핑 (백엔드 enum → 한글) */
const toBusinessType = (v) => {
  const map = { INDIVIDUAL: '개인', CORPORATE: '법인' };
  return map[v] || '유형미상';
};

const toIndustry = (v) => {
  const map = {
    FNB: '음식업',
    RETAIL: '소매업',
    SERVICE: '서비스업',
    MANUFACTURING: '제조업',
    ETC: '기타',
  };
  return map[v] || '업종';
};

// 지역코드 매핑
const regionMap = regionData.reduce((map, region) => {
  map[region.지역코드] = `${region.시도명} ${region.시군구명}`;
  return map;
}, {});

const toRegion = (code) => {
  if (!code) return '지역';

  const regionName = regionMap[String(code)];

  if (regionName) {
    const parts = regionName.split(' ');
    if (parts.length === 2) {
      const sido = parts[0]
        .replace('특별시', '')
        .replace('광역시', '')
        .replace('특별자치시', '')
        .replace('특별자치도', '')
        .replace('도', '');
      return `${sido} ${parts[1]}`;
    }
    return regionName;
  }

  // 매핑되지 않은 코드는 원본 코드 반환
  return code;
};
</script>

<style scoped>
/** 싱테 표시 */
.state-box {
  padding: 1.5rem;
  text-align: center;
  color: #333;
}
.state-box.error {
  background: #fce8e8;
  color: #9b1c1c;
  border-radius: 0.75rem;
}

/** 카드 그리드 */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(21rem, 1fr));
  gap: 1.25rem;
  margin-top: 1.25rem;
}

/** 카드 */
.card {
  background: var(--color-white);
  border-radius: 0.75rem;
  border: 0.0625rem solid #f3eee8;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.1);
  padding: 1.25rem;
  cursor: pointer;
  outline: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.card:hover {
  transform: translateY(-0.125rem);
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.15);
  background: var(--color-light-2);
}

/** 상단 배지 - 개인/법인 */
.card-top {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 1rem;
}
.badge {
  display: inline-block;
  padding: 0.375rem 1rem;
  border-radius: 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-sub);
  background: var(--color-white);
  border: 1px solid var(--color-sub);
}

/** 사업장명 */
.title {
  margin: 0.625rem 0.125rem 1.125rem 0.3125rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: #333;
  letter-spacing: -0.0125rem;
  line-height: 1.35;
  min-height: 3rem; /* 두 줄도 안정적으로 */
}

/** 하단 태그 */
.card-bottom {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.chip {
  display: inline-block;
  font-size: 0.75rem;
  background: var(--color-light-3);
  color: #666;
  border-radius: 1rem;
  padding: 0.375rem 0.75rem;
}

.empty {
  text-align: center;
  padding: 2.5rem 0 1.25rem;
  color: #666;
}

.footer-add {
  display: flex;
  justify-content: center;
  margin: 1.625rem 0 0.625rem;
}

.add-btn {
  width: 15rem;
  height: 3.25rem;
  border-radius: 1.25rem;
  background: var(--color-white);
  border: 0.0625rem solid #ddd;
  font-weight: 600;
  box-shadow: 0 0.375rem 1rem rgba(0, 0, 0, 0.08);
  cursor: pointer;
}
.add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 0.625rem 1.375rem rgba(0, 0, 0, 0.12);
}
</style>

