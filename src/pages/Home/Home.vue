<template>
  <div class="home-page">
    <section class="hero" :style="activeSlide.bgStyle">
      <div class="hero-inner">
        <transition name="fade" mode="out-in">
          <div class="hero-left" :key="currentIndex">
            <span v-if="activeSlide.chip" class="chip">{{ activeSlide.chip }}</span>
            <h1 class="hero-title" v-html="activeSlide.titleHTML"></h1>
            <button class="cta" @click="goRoute(activeSlide.ctaRoute)">
              <img
                v-if="activeSlide.ctaRoute === '/promote'"
                :src="instaIcon"
                alt="Instagram Icon"
                class="cta-icon"
              />
              {{ activeSlide.ctaLabel }}
            </button>
          </div>
        </transition>

        <div class="hero-right">
          <div class="poster-stage" @mouseenter="pause" @mouseleave="play">
            <transition-group name="slide-x" tag="div" class="poster-wrap" v-if="currentIndex < 2">
              <img
                :src="activeSlide.images[1].src"
                :alt="activeSlide.images[1].alt"
                class="poster pos-1"
                :key="activeSlide.images[1].src + '1' + currentIndex"
              />
              <img
                :src="activeSlide.images[0].src"
                :alt="activeSlide.images[0].alt"
                class="poster pos-0"
                :key="activeSlide.images[0].src + '0' + currentIndex"
              />
            </transition-group>

            <transition name="fade" mode="out-in" v-else>
              <div class="illustration-wrap" :key="currentIndex">
                <img
                  :src="activeSlide.mainImage.src"
                  :alt="activeSlide.mainImage.alt"
                  class="main-illustration"
                />
                <img :src="likeIcon" alt="Like Icon" class="icon-like" />
              </div>
            </transition>
          </div>
        </div>
      </div>

      <div class="dots">
        <button
          v-for="(s, i) in slides"
          :key="i"
          class="dot"
          :class="{ active: i === currentIndex }"
          @click="go(i)"
          :aria-label="`slide ${i + 1}`"
        />
      </div>
    </section>

    <section class="hot-section">
      <h2>HOT한 정책/대출 TOP5</h2>
      <div class="hot-card-grid">
        <article
          class="data-card"
          v-for="(item, i) in hotTop5"
          :key="item.postId"
          @click="goDetail(item)"
        >
          <div class="thumb-wrapper">
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              alt="상품 이미지"
              style="width: 100%; height: 100%; object-fit: cover"
            />
            <span class="rank-badge">{{ i + 1 }}</span>
          </div>
          <div class="meta">
            <div class="meta-header">
              <span class="category-tag" :class="getCategoryClass(item.postType)">{{
                getCategoryLabel(item.postType)
              }}</span>
              <span class="card-id">{{ item.deadline || 'D-000' }}</span>
            </div>
            <h3 class="title">{{ item.productName }}</h3>
            <p class="sub">{{ item.companyName }}</p>
            <p class="period">{{ item.summary }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="recommend-section">
      <h2>사용자 맞춤 추천 상품</h2>
      <div class="card-grid">
        <article
          class="data-card"
          v-for="(item, i) in recommendProducts"
          :key="item.id"
          @click="$router.push(`/loans/${item.id}`)"
        >
          <div class="thumb-wrapper"></div>
          <div class="meta">
            <div class="meta-header">
              <span class="category-tag" :class="item.categoryClass">{{ item.category }}</span>
              <span class="card-id">R-{{ String(item.id).padStart(3, '0') }}</span>
            </div>
            <h3 class="title">{{ item.title }}</h3>
            <p class="sub">{{ item.agency }} · {{ item.region || item.type }}</p>
            <p class="period">{{ item.period || item.rate }}</p>
          </div>
        </article>
      </div>
    </section>

    <footer class="site-footer">
      <div class="footer-inner">
        <div class="left">
          <strong>ON MARKET</strong><br />
          상호: 멀티캠퍼스 | 팀장명: 강영광 | 개인정보<br />
          사업자등록번호 : 000-00-00000 | 이메일 : dys@naver.com<br />
          주소 : 서울특별시 광진구 어린이대공원역
        </div>
        <div class="right">
          <a href="#" class="sns" aria-label="instagram">Instagram</a>
          <a href="#" class="sns" aria-label="facebook">Facebook</a>
          <a href="#" class="sns" aria-label="naver">Naver</a>
        </div>
      </div>
      <div class="copy">Copyright 2025. ONMARKET All rights reserved.</div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

// 🔗 API 모듈 import
import { postAPI } from '@/api/post';

// 이미지 & 아이콘
import p1 from '@/assets/poster.png';
import p2 from '@/assets/poster2.png';
import p3 from '@/assets/poster3.png';
import p4 from '@/assets/poster4.png';
import p5Illustration from '@/assets/poster5.png';
import instaIcon from '@/assets/insta.png';
import likeIcon from '@/assets/like.png';

const router = useRouter();

// --- 슬라이드 정의 ---
const slides = ref([
  {
    bgStyle: { background: 'linear-gradient(180deg, #FDF4EE 0%, #FFE3DF 100%)' },
    titleHTML:
      '카드뉴스로<br/><span class="highlight">간편하게</span><br/><span class="highlight">맞춤형</span><br/>대출 상품 · 정부 지원금을<br/>확인해보세요',
    ctaLabel: '정부 지원금 바로가기',
    ctaRoute: '/policies',
    images: [
      { src: p1, alt: '대출 포스터 1' },
      { src: p2, alt: '대출 포스터 2' },
    ],
    mainImage: null,
  },
  {
    chip: '',
    bgStyle: { background: 'linear-gradient(180deg, #EEF9FD 0%, #DAF3FF 100%)' },
    titleHTML:
      '<span class="highlight">소상공인</span>을 위한<br/><span class="highlight">대출 상품</span><br/>지금 바로 확인하세요!',
    ctaLabel: '대출 상품 바로가기',
    ctaRoute: '/loans',
    images: [
      { src: p3, alt: '지원금 포스터 A' },
      { src: p4, alt: '지원금 포스터 B' },
    ],
    mainImage: null,
  },
  {
    chip: '',
    bgStyle: { background: 'linear-gradient(180deg, #F2EEFD 0%, #DEDAFF 100%)' },
    titleHTML:
      '가게 <span class="highlight">홍보</span>가<br/>어려우신가요?<br/><span class="highlight">사진만</span> 올려주시면<br/>도와드릴게요!',
    ctaLabel: '게시글 올리기',
    ctaRoute: '/promote',
    images: [],
    mainImage: { src: p5Illustration, alt: '사람 일러스트' },
  },
]);

const currentIndex = ref(0);
const activeSlide = computed(() => slides.value[currentIndex.value]);

const go = (i) => (currentIndex.value = i);
const goRoute = (path) => {
  if (path) router.push(path);
};

// --- 자동 슬라이드 ---
const intervalMs = 3800;
let timer = null;
const next = () => {
  currentIndex.value = (currentIndex.value + 1) % slides.value.length;
};
const play = () => {
  stop();
  timer = setInterval(next, intervalMs);
};
const pause = () => stop();
const stop = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

// --- HOT TOP5 (API 연동) ---
const hotTop5 = ref([]);

const fetchHotTop5 = async () => {
  try {
    const list = await postAPI.getTopScrapedPosts(); // ← 배열이 바로 옴
    hotTop5.value = Array.isArray(list) ? list : [];
    console.log('HOT TOP5 데이터:', hotTop5.value);
  } catch (err) {
    console.error('HOT TOP5 불러오기 실패:', err);
    hotTop5.value = [];
  }
};

const goDetail = (item) => {
  if (!item || !item.postId) return;
  router.push(`/loans/${item.postId}`);
};

// PostType에 따른 카테고리 라벨과 스타일 클래스 매핑
const getCategoryLabel = (postType) => {
  switch (postType) {
    case 'LOAN':
      return '대출';
    case 'SUPPORT':
      return '공공지원금';
    default:
      return '기타';
  }
};

const getCategoryClass = (postType) => {
  switch (postType) {
    case 'LOAN':
      return 'loan';
    case 'SUPPORT':
      return 'public';
    default:
      return 'loan';
  }
};

// --- 추천상품 (임시 하드코딩) ---
const recommendProducts = ref([
  {
    id: 201,
    title: '소상공인 경영개선자금',
    agency: '소상공인시장진흥공단',
    type: '정책자금',
    rate: '3.0%',
    category: '대출',
    categoryClass: 'loan',
  },
  {
    id: 202,
    title: '혁신성장 바우처',
    agency: '중기부',
    region: '전국',
    period: '2025.07.01 ~ 11.30',
    category: '공공지원금',
    categoryClass: 'public',
  },
  {
    id: 203,
    title: '신용보증재단 창업자금',
    agency: '서울신용보증재단',
    type: '보증대출',
    rate: '4.2%',
    category: '대출',
    categoryClass: 'loan',
  },
  {
    id: 204,
    title: '중소기업 R&D 지원사업',
    agency: '중기부',
    region: '전국',
    period: '2025.03.01 ~ 06.30',
    category: '공공지원금',
    categoryClass: 'public',
  },
  {
    id: 205,
    title: '햇살론 유스',
    agency: '서민금융진흥원',
    type: '신용대출',
    rate: '8.5%',
    category: '대출',
    categoryClass: 'loan',
  },
]);

onMounted(() => {
  play();
  fetchHotTop5();
});
onBeforeUnmount(() => stop());
</script>

<style scoped>
:root {
  --primary-color: #3461ff;
}
.home-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}
h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.hot-section > h2,
.recommend-section > h2 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 24px;
}
@media (max-width: 768px) {
  h2 {
    font-size: 20px;
  }
}

/* ===== HERO ===== */
.hero {
  padding: 48px 24px 24px;
  position: relative;
}
.hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 32px;
  grid-template-columns: 1.05fr 1fr;
  align-items: center;
}
@media (max-width: 960px) {
  .hero-inner {
    grid-template-columns: 1fr;
  }
}

.hero-left .chip {
  display: inline-block;
  font-size: 12px;
  padding: 6px 10px;
  background: #ff6f61;
  color: #fff;
  border-radius: 999px;
  margin-bottom: 12px;
}
.hero-title {
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.02em;
  font-size: 44px;
  margin: 0 0 24px;
}
.hero-title .highlight {
  color: #ff6f61; /* 강조 텍스트 색상 */
}
@media (max-width: 960px) {
  .hero-title {
    font-size: 32px;
  }
}
.cta {
  border: 0;
  background: #fff;
  color: #333;
  padding: 12px 24px;
  border-radius: 999px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
}
.cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}
.cta-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  margin-right: 2px;
}

.hero-right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.poster-stage {
  position: relative;
  width: min(450px, 100%);
  aspect-ratio: 1 / 0.8;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}
.poster-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}
.poster {
  position: absolute;
  inset: auto;
  transition:
    transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    opacity 0.45s ease;
  width: 50%;
  height: auto;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}
.poster.pos-0 {
  left: 5%;
  top: 2%;
  transform: rotate(4deg);
  z-index: 2;
}
.poster.pos-1 {
  right: 15%;
  top: 7%;
  transform: rotate(-5deg);
  z-index: 1;
}

.illustration-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.main-illustration {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.icon-insta {
  display: none;
}
.icon-like {
  position: absolute;
  top: 25%;
  left: 70%;
  width: 50px;
  height: auto;
  transform: rotate(15deg);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.dots {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 10;
  padding: 10px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #e0e0e0;
  border: 0;
  cursor: pointer;
  transition:
    width 0.3s ease,
    background-color 0.3s ease;
}
.dot.active {
  width: 24px;
  background: #777;
  border-radius: 999px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.28s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-x-enter-active,
.slide-x-leave-active {
  transition: all 0.4s ease-in-out;
}
.slide-x-enter-from {
  opacity: 0;
  transform: translateX(12px) !important;
}
.slide-x-leave-to {
  opacity: 0;
  transform: translateX(-12px) !important;
  position: absolute;
}
.slide-x-leave-active {
  transition-duration: 0.2s;
}

.hot-section,
.recommend-section {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 24px;
}

.hot-card-grid {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(220px, 1fr);
  gap: 20px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 20px;
}

.card-grid {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(220px, 1fr);
  gap: 20px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 20px;
}
.card-grid > * {
  scroll-snap-align: start;
}

.data-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}
.thumb-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1/1.2;
  background: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.meta {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.meta-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}
.category-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
}
.category-tag.public {
  background: #e0f7fa;
  color: #00796b;
}
.category-tag.loan {
  background: #f3e5f5;
  color: #6a1b9a;
}
.card-id {
  font-size: 12px;
  color: #bdbdbd;
  font-weight: 500;
  align-self: center;
}
.title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  color: #212121;
  height: 2.8em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.sub {
  margin: 4px 0 6px;
  font-size: 13px;
  color: #757575;
}
.period {
  margin: 0;
  font-size: 12px;
  color: #9e9e9e;
  font-weight: 400;
}

/* HOT TOP5 전용 */
.rank-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ff4d4d;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* ===== FOOTER ===== */
.site-footer {
  margin-top: auto;
  border-top: 1px solid #eee;
  background: #fafafa;
}
.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px 24px;
  display: flex;
  justify-content: space-between;
  gap: 24px;
  color: #9b9b9b;
  font-size: 14px;
  flex-wrap: wrap;
}
.footer-inner .right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.footer-inner .sns {
  text-decoration: none;
  color: #9b9b9b;
  font-weight: 600;
}
.copy {
  text-align: center;
  font-size: 12px;
  color: #b5b5b5;
  padding: 10px 0 24px;
}
</style>

