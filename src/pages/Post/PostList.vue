<template>
  <div class="post-list-container">
    <div class="container section">
      <h1 class="page-title">{{ pageTitle }}</h1>
      <div class="post-grid">
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :id="post.id"
          :title="post.title"
          :description="post.description"
          :tags="post.tags"
          :deadline="post.deadline"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import PostCard from '@/components/post/PostCard.vue'

const route = useRoute()

const pageTitle = computed(() => {
  if (route.path === '/loans') {
    return '대출 상품 보기'
  } else if (route.path === '/policiess') {
    return '정부 지원금 보기'
  }
  return '상품 목록'
})

const posts = computed(() => {
  if (route.path === '/loans') {
    return [
      {
        id: 1,
        title: '서울시 예비 창업금 대출',
        description: '서울 소재 예비창업자에게 저금리로 운영자금 대출',
        tags: ['서울', '저금리'],
        deadline: 'D-12'
      },
      {
        id: 2,
        title: 'KB국민은행 창업대출',
        description: '청년 창업자 대상 특별금리 대출 상품',
        tags: ['청년', '특별금리'],
        deadline: 'D-5'
      },
      {
        id: 3,
        title: '신한은행 스타트업론',
        description: '기술창업 기업 대상 성장자금 지원',
        tags: ['기술창업', '성장자금'],
        deadline: 'D-20'
      }
    ]
  } else if (route.path === '/policies') {
    return [
      {
        id: 1,
        title: '청년창업사관학교 지원금',
        description: '예비창업자 대상 창업교육 및 자금 지원',
        tags: ['청년', '교육지원'],
        deadline: 'D-15'
      },
      {
        id: 2,
        title: '중소벤처기업부 R&D 지원',
        description: '기술개발 및 사업화 자금 지원',
        tags: ['R&D', '기술개발'],
        deadline: 'D-30'
      },
      {
        id: 3,
        title: '서울시 청년창업 지원금',
        description: '서울 거주 청년창업자 대상 운영자금 지원',
        tags: ['서울', '청년창업'],
        deadline: 'D-8'
      }
    ]
  }
  return []
})
</script>

<style scoped>
.post-list-container {
  background: var(--color--white);
  min-height: 100vh;
}

.page-title {
  font-size: 1.75rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1.875rem;
  text-align: center;
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18.75rem, 1fr));
  gap: 1.25rem;
  align-items: stretch;
}
</style>