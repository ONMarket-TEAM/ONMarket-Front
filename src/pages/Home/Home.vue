<template>
  <div class="home-page">
    <section class="hero" :style="activeSlide.bgStyle">
      <div class="hero-inner">
        <transition name="fade" mode="out-in">
          <div class="hero-left" :key="currentIndex">
            <span v-if="activeSlide.chip" class="chip">{{ activeSlide.chip }}</span>
            <h1 class="hero-title" v-html="activeSlide.titleHTML"></h1>
            <button class="cta" @click="goRoute(activeSlide.ctaRoute)">
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
                <img :src="activeSlide.mainImage.src" :alt="activeSlide.mainImage.alt" class="main-illustration">
                <img :src="instaIcon" alt="Instagram Icon" class="icon-insta">
                <img :src="likeIcon" alt="Like Icon" class="icon-like">
              </div>
            </transition>
          </div>
        </div>
      </div>

      <!-- 점들을 hero 섹션 하단으로 이동 -->
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
      <h2>🔥 HOT한 정책/대출 TOP5</h2>
      <div class="card-grid">
        <article
          class="data-card"
          v-for="(item, i) in hotTop5"
          :key="item.id"
          @click="$router.push(`/loans/${item.id}`)"
        >
          <div class="thumb-wrapper">
            <span class="rank-badge">{{ i + 1 }}</span>
          </div>
          <div class="meta">
            <div class="meta-header">
              <span class="category-tag" :class="item.categoryClass">{{ item.category }}</span>
              <span class="card-id">D-{{ String(item.id).padStart(3, '0') }}</span>
            </div>
            <h3 class="title">{{ item.title }}</h3>
            <p class="sub">{{ item.agency }} · {{ item.region || item.type }}</p>
            <p class="period">{{ item.period || item.rate }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="recommend-section">
      <h2>✨ 사용자 맞춤 추천 상품</h2>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 슬라이드 포스터 이미지들
import p1 from '@/assets/poster.png'
import p2 from '@/assets/poster2.png'
import p3 from '@/assets/poster3.png'
import p4 from '@/assets/poster4.png'
// 세 번째 슬라이드용 일러스트 및 아이콘
import p5Illustration from '@/assets/poster5.png' // 사람 일러스트
import instaIcon from '@/assets/insta.png'
import likeIcon from '@/assets/like.png'

const slides = ref([
  {
    bgStyle: {
      background:
        'linear-gradient(180deg, #e7f4ff 0%, #e9f7ff 30%, #ffffff 100%)'
    },
    titleHTML:
      '카드뉴스로<br/>간편하게<br/>맞춤형 정부 지원금을<br/>확인해보세요',
    ctaLabel: '정부 지원금 바로가기',
    ctaRoute: '/policies',
    images: [
      { src: p1, alt: '대출 포스터 1' }, // 이게 앞 (소상공인 지원금)
      { src: p2, alt: '대출 포스터 2' } // 이게 뒤 (우리도 소상공인입니다!)
    ],
    mainImage: null // 세 번째 슬라이드용 데이터는 null로 설정
  },
  {
    chip: '',
    bgStyle: {
      background:
        'linear-gradient(180deg, #ffe9e2 0%, #fff0ee 35%, #ffffff 100%)'
    },
    titleHTML:
      '소상공인을 위한<br/>대출 상품<br/>지금 바로 확인하세요!',
    ctaLabel: '대출 상품 바로가기',
    ctaRoute: '/loans',
    images: [
      { src: p3, alt: '지원금 포스터 A' },
      { src: p4, alt: '지원금 포스터 B' }
    ],
    mainImage: null // 세 번째 슬라이드용 데이터는 null로 설정
  },
  {
    chip: '',
    bgStyle: {
      background:
        'linear-gradient(180deg, #fff8d7 0%, #fff2b6 25%, #ffffff 100%)'
    },
    titleHTML:
      '내 가게 홍보가<br/>어려우신가요?<br/>사진만 올려주시면<br/>도와드릴게요!',
    ctaLabel: '게시글 올리기',
    ctaRoute: '/cards',
    images: [], // 이미지 배열은 비워둠
    mainImage: { src: p5Illustration, alt: '사람 일러스트' } // 단일 이미지 사용
  }
])

const currentIndex = ref(0)
const activeSlide = computed(() => slides.value[currentIndex.value])

const go = (i) => (currentIndex.value = i)
const goRoute = (path) => {
  if (path) {
    router.push(path)
  }
}

// 자동재생
const intervalMs = 3800
let timer = null

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % slides.value.length
}

const play = () => {
  stop()
  timer = setInterval(next, intervalMs)
}

const pause = () => stop()

const stop = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(() => {
  play()
})

onBeforeUnmount(() => {
  stop()
})

// HOT TOP5 더미 (API로 대체 가능)
const hotTop5 = ref([
  {
    id: 101,
    title: '청년 소상공인 정책자금',
    agency: '중기부',
    region: '전국',
    period: '2025.08.01 ~ 09.30',
    category: '공공지원금',
    categoryClass: 'public'
  },
  {
    id: 102,
    title: '미소금융 창업자금',
    agency: '서민금융진흥원',
    type: '신용대출',
    rate: '4.5%',
    category: '대출',
    categoryClass: 'loan'
  },
  {
    id: 103,
    title: '초기창업 마케팅 지원',
    agency: '창업진흥원',
    region: '부산',
    period: '예산 소진 시',
    category: '공공지원금',
    categoryClass: 'public'
  },
  {
    id: 104,
    title: 'IBK 소상공인 특례보증',
    agency: 'IBK기업은행',
    type: '보증대출',
    rate: '3.8%',
    category: '대출',
    categoryClass: 'loan'
  },
  {
    id: 105,
    title: '스마트공장 구축사업',
    agency: '산업부',
    region: '경기',
    period: '2025.01.15 ~ 12.31',
    category: '공공지원금',
    categoryClass: 'public'
  }
])

// 추천 상품 더미 (API로 대체 가능)
const recommendProducts = ref([
  {
    id: 201,
    title: '소상공인 경영개선자금',
    agency: '소상공인시장진흥공단',
    type: '정책자금',
    rate: '3.0%',
    category: '대출',
    categoryClass: 'loan'
  },
  {
    id: 202,
    title: '혁신성장 바우처',
    agency: '중기부',
    region: '전국',
    period: '2025.07.01 ~ 11.30',
    category: '공공지원금',
    categoryClass: 'public'
  },
  {
    id: 203,
    title: '신용보증재단 창업자금',
    agency: '서울신용보증재단',
    type: '보증대출',
    rate: '4.2%',
    category: '대출',
    categoryClass: 'loan'
  },
  {
    id: 204,
    title: '중소기업 R&D 지원사업',
    agency: '중기부',
    region: '전국',
    period: '2025.03.01 ~ 06.30',
    category: '공공지원금',
    categoryClass: 'public'
  },
  {
    id: 205,
    title: '햇살론 유스',
    agency: '서민금융진흥원',
    type: '신용대출',
    rate: '8.5%',
    category: '대출',
    categoryClass: 'loan'
  }
])
</script>

<style scoped>
:root{--primary-color:#3461ff}
.home-page{display:flex;flex-direction:column;min-height:100vh;background-color:#f8f9fa}
h2{
  font-size:2rem;font-weight:700;margin-bottom:20px;
  display:flex;align-items:center;gap:12px;
}
.hot-section>h2, .recommend-section>h2{
  font-size:24px;font-weight:800;margin-bottom:24px;
}
@media(max-width:768px){
  h2{font-size:20px}
}

/* ===== HERO ===== */
.hero{
  padding: 48px 24px 24px; /* 하단 패딩 추가하여 점들을 위한 공간 확보 */
  position: relative; /* dots 위치 잡기 위해 relative 설정 */
}
.hero-inner{
  max-width:1200px;margin:0 auto;display:grid;gap:32px;
  grid-template-columns:1.05fr 1fr;align-items:center
}
@media(max-width:960px){.hero-inner{grid-template-columns:1fr}}

.hero-left .chip{
  display:inline-block;font-size:12px;padding:6px 10px;background:#ff6f61;color:#fff;border-radius:999px;margin-bottom:12px
}
.hero-title{
  font-weight:800;line-height:1.08;letter-spacing:-.02em;font-size:44px;margin:0 0 24px
}
@media(max-width:960px){.hero-title{font-size:32px}}
.cta{
  border:0;background:#fff;color:#333;padding:12px 24px;border-radius:999px;box-shadow:0 4px 12px rgba(0,0,0,.08);
  cursor:pointer;font-weight:600;font-size:16px;transition:transform .2s ease, box-shadow .2s ease
}
.cta:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.12)}

.hero-right{
  display:flex;
  flex-direction: column;
  justify-content:center;
  align-items: center;
  height: 100%;
}
.poster-stage{
  position:relative;
  width:min(450px,100%); /* 슬라이드 전체 폭 늘림 */
  aspect-ratio: 1 / 1.0; /* 세로 비율을 정사각형에 가깝게 조정 */
  overflow:hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}
.poster-wrap{position:relative;width:100%;height:100%;}
.poster{
  position:absolute;
  inset:auto;
  transition:transform .45s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity .45s ease;
  width:75%; /* 사진 크기 더 키움 */
  height:auto;
  object-fit:cover;
  border-radius:8px;
  box-shadow:0 8px 20px rgba(0,0,0,.1);
}
/* 포스터 위치 조정 - 간격을 더 넓히고 크기 키움 */
.poster.pos-0{
  left: 5%; /* 왼쪽 포스터를 더 왼쪽으로 */
  top: -5%; /* 포스터를 더 위로 올림 */
  transform: rotate(8deg); /* 회전각 약간 늘림 */
  z-index: 2;
}
.poster.pos-1{
  right: 5%; /* 오른쪽 포스터를 더 오른쪽으로 */
  top: 5%; /* 포스터를 더 위로 올림 */
  transform: rotate(-8deg); /* 회전각 약간 늘림 */
  z-index: 1;
}

/* 세 번째 슬라이드 일러스트 및 아이콘 스타일 */
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
  position: absolute;
  top: 15%;
  left: 60%;
  width: 60px;
  height: auto;
  transform: rotate(-10deg);
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
}
.icon-like {
  position: absolute;
  top: 25%;
  left: 70%;
  width: 50px;
  height: auto;
  transform: rotate(15deg);
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
}

/* Dots를 hero 섹션 하단 중앙에 고정 위치 */
.dots{
  position: absolute;
  bottom: 24px; /* hero 섹션 하단에서 24px 위 */
  left: 50%;
  transform: translateX(-50%); /* 정확한 가운데 정렬 */
  display:flex;
  justify-content: center;
  gap:8px;
  z-index:10;
  padding: 10px;
}
.dot{
  width:8px;
  height:8px;
  border-radius:999px;
  background:#e0e0e0;
  border:0;
  cursor:pointer;
  transition: width 0.3s ease, background-color 0.3s ease;
}
.dot.active{
  width: 24px;
  background:#777;
  border-radius: 999px;
}

/* 페이드(왼쪽 텍스트/배경 교체에 사용) */
.fade-enter-active,.fade-leave-active{transition:opacity .28s ease}
.fade-enter-from,.fade-leave-to{opacity:0}

/* 포스터 등장 슬라이드(오른쪽) */
.slide-x-enter-active, .slide-x-leave-active{transition:all .4s ease-in-out;}
.slide-x-enter-from{opacity:0;transform:translateX(12px) !important;}
.slide-x-leave-to{
  opacity:0;transform:translateX(-12px) !important;
  position: absolute;
}
.slide-x-leave-active{
  transition-duration: .2s;
}

/* ===== 공통 카드 스타일 ===== */
.hot-section,.recommend-section{max-width:1200px;margin:40px auto;padding:0 24px}
.card-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:20px}
@media(max-width:1200px){.card-grid{grid-template-columns:repeat(3,1fr)}}
@media(max-width:768px){.card-grid{grid-template-columns:1fr}}
.data-card{
  border-radius:12px;overflow:hidden;background:#fff;
  box-shadow:0 4px 12px rgba(0,0,0,.04);cursor:pointer;
  transition:transform 160ms ease, box-shadow 160ms ease;
  display: flex;
  flex-direction: column;
}
.data-card:hover{
  transform:translateY(-4px);box-shadow:0 8px 20px rgba(0,0,0,.08);
}
.thumb-wrapper{
  position:relative;
  width:100%;
  aspect-ratio:1/1.2;
  background: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.meta{
  padding:16px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.meta-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}
.category-tag{font-size:11px;font-weight:600;padding:4px 10px;border-radius:999px;white-space:nowrap}
.category-tag.public{background:#E0F7FA;color:#00796B;}
.category-tag.loan{background:#F3E5F5;color:#6A1B9A;}
.card-id{font-size:12px;color:#bdbdbd;font-weight:500;align-self:center}
.title{margin:0;font-size:16px;font-weight:700;line-height:1.4;color:#212121;height:2.8em;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.sub{margin:4px 0 6px;font-size:13px;color:#757575}
.period{margin:0;font-size:12px;color:#9E9E9E;font-weight:400}

/* HOT TOP5 전용 */
.rank-badge{
  position:absolute;top:10px;left:10px;
  width:24px;height:24px;border-radius:50%;background:#ff4d4d;color:#fff;
  font-weight:700;font-size:14px;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 2px 4px rgba(0,0,0,.1);
}

/* ===== FOOTER ===== */
.site-footer{margin-top:auto;border-top:1px solid #eee;background:#fafafa}
.footer-inner{max-width:1200px;margin:0 auto;padding:28px 24px;display:flex;justify-content:space-between;gap:24px;color:#9b9b9b;font-size:14px;flex-wrap:wrap}
.footer-inner .right{display:flex;align-items:center;gap:12px}
.footer-inner .sns{text-decoration:none;color:#9b9b9b;font-weight:600}
.copy{text-align:center;font-size:12px;color:#b5b5b5;padding:10px 0 24px}
</style>
