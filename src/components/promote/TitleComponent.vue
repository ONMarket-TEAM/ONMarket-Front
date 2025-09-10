<template>
  <h1 class="title" v-if="currentStep === 1">1단계: 사진을 업로드해주세요 (최대 20장)</h1>
  <h1 class="title" v-else-if="currentStep === 2">2단계: 표현하고 싶은 문구를 입력해주세요</h1>
  <h1 class="title" v-else-if="currentStep === 3">3단계: AI가 생성한 문구를 확인하고 편집해보세요</h1>
  <h1 class="title" v-else-if="currentStep === 4">4단계: 완성된 콘텐츠를 확인하세요</h1>
</template>

<script setup>
defineProps({
  currentStep: {
    type: Number,
    required: true
  }
});
</script>

<style scoped>
.title {
  margin-bottom: 25px;
  margin-top: 36px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.3px;
}
</style>
