<template>
  <div class="post-card" @click="goToDetail">
    <div class="container section">
      <div class="card-header">
        <button class="loan-btn">{{ buttonText }}</button>
        <span class="deadline">{{ deadline }}</span>
      </div>
      
      <h3 class="card-title">{{ title }}</h3>
      
      <p class="card-description">{{ description }}</p>
      
      <div class="card-tags">
        <span class="tag" v-for="tag in tags" :key="tag">#{{ tag }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  },
  title: {
    type: String,
    default: '서울시 예비 창업금 대출'
  },
  description: {
    type: String,
    default: '서울 소재 예비창업자에게 저금리로 운영자금 대출'
  },
  tags: {
    type: Array,
    default: () => ['서울', '저금리']
  },
  deadline: {
    type: String,
    default: 'D-12'
  }
})

const buttonText = computed(() => {
  if (route.path === '/loans') {
    return '대출'
  } else if (route.path === '/policies') {
    return '공공 지원금'
  }
  return '대출'
})

const goToDetail = () => {
  if (route.path === '/loans') {
    router.push(`/loans/${props.id}`)
  } else if (route.path === '/policies') {
    router.push(`/policies/${props.id}`)
  }
}
</script>

<style scoped>
.post-card {
  background: var(--color-white);
  border-radius: 0.75rem;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.post-card:hover {
  transform: translateY(-0.125rem);
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.15);
}

.post-card .container.section {
  padding-block: 1.25rem;
  padding-inline: 1.25rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.loan-btn {
  background: var(--color-white);
  border: 1px solid var(--color-sub);
  color: var(--color-sub);
  padding: 0.375rem 1rem;
  border-radius: 1.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.loan-btn:hover {
  background: var(--color-sub);
  color: var(--color-white);
}

.deadline {
  color: var(--color-sub);
  font-weight: bold;
  font-size: 1rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: bold;
  color: #333;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
}

.card-description {
  color: #666;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 1.25rem 0;
  flex-grow: 1;
}

.card-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background: var(--color-light-3);
  color: #666;
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}
</style>