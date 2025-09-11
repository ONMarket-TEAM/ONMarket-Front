<template>
  <div class="container section">
    <h1>내 사업장</h1>
    <hr />

    <!-- 로딩 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>불러오는 중...</p>
    </div>

    <!-- 에러 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>오류가 발생했습니다</h3>
      <p>{{ error }}</p>
    </div>

    <!-- 목록 -->
    <div v-else class="content-wrapper">
      <div v-if="businesses.length" class="business-grid">
        <article v-for="b in businesses" :key="b.businessId" class="business-card">
          <!-- 카드 헤더 -->
          <div class="card-header">
            <span class="business-type-badge" :class="getBadgeClass(b.businessType)">
              {{ toBusinessType(b.businessType) }}
            </span>

            <!-- 토글 메뉴 버튼 -->
            <div class="menu-container">
              <button class="menu-trigger" @click.stop="toggleMenu(b.businessId)" aria-label="메뉴">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                  />
                </svg>
              </button>

              <!-- 드롭다운 메뉴 -->
              <div v-if="activeMenuId === b.businessId" class="dropdown-menu">
                <button class="menu-item" @click.stop="goToUpdate(b.businessId)">수정하기</button>

                <button
                  v-if="b.businessId !== mainBusinessId"
                  class="menu-item"
                  @click.stop="setAsMain(b.businessId)"
                >
                  메인으로 지정
                </button>
                <button class="menu-item delete-item" @click.stop="toggleConfirm(b.businessId)">
                  삭제하기
                </button>
              </div>
            </div>
          </div>

          <!-- 사업장명 -->
          <h3 class="business-name">
            {{ b.businessName || '사업장명 미등록' }}
            <span v-if="b.businessId === mainBusinessId" class="main-badge">메인</span>
          </h3>

          <!-- 메타 정보 -->
          <div class="business-meta">
            <div class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                />
              </svg>
              <span>{{ toRegion(b.sidoName, b.sigunguName) }}</span>
            </div>
            <div class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              </svg>
              <span>{{ toIndustry(b.industry) }}</span>
            </div>
          </div>

          <!-- 삭제 확인 오버레이 -->
          <div class="delete-overlay" v-if="confirmingId === b.businessId">
            <div class="delete-content">
              <div class="delete-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                  />
                </svg>
                <h4>사업장 삭제</h4>
              </div>
              <p>정말로 이 사업장을 삭제하시겠습니까?<br />이 작업은 되돌릴 수 없습니다.</p>
              <div class="delete-actions">
                <button class="btn-cancel" @click.stop="cancelConfirm">취소</button>
                <button
                  class="btn-delete-confirm"
                  @click.stop="deleteBusiness(b.businessId)"
                  :disabled="deletingId === b.businessId"
                >
                  <span v-if="deletingId === b.businessId" class="loading-text">
                    <div class="mini-spinner"></div>
                    삭제 중...
                  </span>
                  <span v-else>삭제하기</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- 빈 상태 -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
        </div>
        <h3>등록된 사업장이 없습니다</h3>
        <p>새로운 사업장을 추가하여 시작해보세요</p>
      </div>

      <!-- 사업장 추가 버튼 -->
      <div class="add-section">
        <button class="add-button" @click="goToRegister">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          사업장 추가하기
        </button>
      </div>
    </div>

    <!-- 메뉴 외부 클릭 감지용 오버레이 -->
    <div v-if="activeMenuId" class="menu-overlay" @click="closeMenu"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { businessAPI } from '@/api/business';
import { useToastStore } from '@/stores/useToastStore';
import memberAPI from '@/api/member';

const router = useRouter();
const businesses = ref([]);
const loading = ref(true);
const error = ref('');
const toast = useToastStore();
const confirmingId = ref(null);
const deletingId = ref(null);
const mainBusinessId = ref(null);
const activeMenuId = ref(null); // 활성 메뉴 추가

/** 사업장 목록 로드 */
const load = async () => {
  loading.value = true;
  error.value = '';
  try {
    const [bizResult, member] = await Promise.all([
      businessAPI.getMyBusinessList(),
      memberAPI.getMemberInfo(),
    ]);

    if (bizResult.success) {
      businesses.value = bizResult.data;
      mainBusinessId.value = member.mainBusinessId;
    } else {
      error.value = bizResult.message || '사업장 목록을 불러오지 못했습니다.';
      toast.error(error.value);
    }
  } catch (e) {
    console.error('사업장 목록 로드 에러:', e);
    error.value = '사업장 목록을 불러오지 못했습니다.';
    toast.error(error.value);

    if (e?.response?.status === 401) {
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

/** 메뉴 토글 */
const toggleMenu = (businessId) => {
  activeMenuId.value = activeMenuId.value === businessId ? null : businessId;
};

const closeMenu = () => {
  console.log('closeMenu 호출됨');
  activeMenuId.value = null;
};

const setAsMain = async (businessId) => {
  try {
    const res = await businessAPI.setMain(businessId);
    console.log(res);
    if (res?.header?.status === 'OK') {
      mainBusinessId.value = businessId;
      toast.success(res.header.message || '메인 사업장이 변경되었습니다.');
      closeMenu();
    } else {
      toast.error(res?.header?.message || '메인 사업장 변경 실패');
    }
  } catch (e) {
    console.error('메인 변경 에러:', e);
    toast.error('메인 사업장 변경 중 오류가 발생했습니다.');
  }
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

const getBadgeClass = (v) => {
  const map = { INDIVIDUAL: 'badge-individual', CORPORATE: 'badge-corporate' };
  return map[v] || 'badge-default';
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

const toRegion = (sidoName, sigunguName) => {
  if (!sidoName || !sigunguName) return '지역';
  return `${sidoName} ${sigunguName}`;
};

const toggleConfirm = (businessId) => {
  confirmingId.value = confirmingId.value === businessId ? null : businessId;
  closeMenu(); // 메뉴 닫기
};

const cancelConfirm = () => {
  confirmingId.value = null;
};

/** 삭제 실행 */
const deleteBusiness = async (businessId) => {
  try {
    deletingId.value = businessId;
    const res = await businessAPI.delete(businessId);

    if (!res || res.success === false) {
      const msg = res?.message || '삭제에 실패했습니다. 잠시 후 다시 시도해주세요.';
      toast.error(msg);
      return;
    }

    businesses.value = businesses.value.filter((b) => b.businessId !== businessId);
    toast.success('사업장을 삭제했습니다.');
  } catch (e) {
    console.error('사업장 삭제 에러:', e);

    if (e?.response?.status === 403) {
      toast.error('내 소유의 사업장이 아닙니다.');
    } else if (e?.response?.status === 404) {
      toast.error('사업장을 찾을 수 없습니다.');
    } else if (e?.response?.status === 401) {
      toast.warning('인증이 만료되었습니다.');
      router.push('/login');
    } else {
      toast.error('삭제 처리 중 오류가 발생했습니다.');
    }
  } finally {
    deletingId.value = null;
    confirmingId.value = null;
  }
};
</script>

<style scoped>
/* 로딩 상태 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid var(--color-light-1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

/* 에러 상태 */
.error-state {
  text-align: center;
  padding: 3rem 2rem;
  border-radius: 1rem;
  border: 1px solid #fca5a5;
  background: #fef2f2;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state h3 {
  color: #dc2626;
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.error-state p {
  color: #991b1b;
  margin: 0;
}

/* 콘텐츠 래퍼 */
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

/* 사업장 그리드 */
.business-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

/* 사업장 카드 */
.business-card {
  position: relative;
  background: #ffffff;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.06);
}

.business-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--color-light-1);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.business-card:hover::before {
  transform: scaleX(1);
}

/* 카드 헤더 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

/* 사업장 유형 배지 */
.business-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-individual {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
  border: 1px solid #93c5fd;
}

.badge-corporate {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #059669;
  border: 1px solid #6ee7b7;
}

.badge-default {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #374151;
  border: 1px solid #d1d5db;
}

/* 메뉴 컨테이너 */
.menu-container {
  position: relative;
}

/* 메뉴 트리거 버튼 */
.menu-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu-trigger:hover {
  background: #f3f4f6;
  color: #374151;
  transform: scale(1.05);
}

/* 드롭다운 메뉴 */
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 9999 !important; /* 매우 높은 z-index */
  min-width: 140px;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 0.5rem 0;
  display: block !important; /* 강제로 표시 */

  animation: dropdownSlideIn 0.15s ease-out;
  margin-top: 0.25rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.menu-item:hover {
  background: #f9fafb;
  color: #111827;
}

.menu-item.delete-item {
  color: #dc2626;
}

.menu-item.delete-item:hover {
  background: #fee2e2;
  color: #991b1b;
}

/* 메뉴 오버레이 */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  background: transparent;
}

/* 사업장명 */
.business-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.main-badge {
  display: inline-block;
  margin-left: 0.5rem;
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, var(--color-sub) 0%, var(--color-sub) 100%);
  border-radius: 0.375rem;
}

/* 메타 정보 */
.business-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.meta-item svg {
  opacity: 0.7;
}

/* 삭제 확인 오버레이 */
.delete-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(8px);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
  z-index: 60;
}

.delete-content {
  text-align: center;
  padding: 1.5rem;
  max-width: 280px;
}

.delete-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #dc2626;
}

.delete-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.delete-content p {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 1.5rem 0;
}

.delete-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn-cancel {
  padding: 0.5rem 1rem;
  background: var(--color-light-1);
  border: 1px solid var(--color-light-1);
  border-radius: 0.5rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  color: #374151;
}

.btn-delete-confirm {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
}

.btn-delete-confirm:hover:not(:disabled) {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  transform: translateY(-1px);
}

.btn-delete-confirm:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
}

.mini-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.empty-icon {
  margin-bottom: 1.5rem;
  opacity: 0.4;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  font-size: 1rem;
  margin: 0;
}

/* 추가 버튼 섹션 */
.add-section {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.add-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: var(--color-light-1);
  border: none;
  border-radius: 9999px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 14px 0 rgba(var(--color-light-1-rgb), 0.39);
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px 0 rgba(var(--color-light-1-rgb), 0.39);
}

.add-button:active {
  transform: translateY(0);
}

/* 애니메이션 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes dropdownSlideIn {
  0% {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .business-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .business-card {
    padding: 1.25rem;
  }

  .page-header {
    margin-bottom: 2rem;
    padding: 1rem 0;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 1rem;
  }

  .delete-content {
    padding: 1rem;
  }

  .add-button {
    padding: 0.875rem 1.5rem;
    font-size: 0.925rem;
  }

  .dropdown-menu {
    right: -0.5rem;
    min-width: 120px;
  }
}
</style>

