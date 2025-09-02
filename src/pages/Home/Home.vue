<template>
  <div class="container section">
    <h1>Home</h1>
    <div>
      <button @click="toastStore.success('성공했습니다!')">성공 토스트</button>
    </div>
    <div>
      <button @click="toastStore.error('에러가 발생했습니다!')">에러 토스트</button>
    </div>
    <div>
      <button @click="toastStore.warning('경고 알림입니다!')">경고 토스트</button>
    </div>
    <div>
      <button @click="toastStore.info('정보 메시지입니다!')">정보 토스트</button>
    </div>
  </div>
</template>

<script setup>
import { useToastStore } from '@/stores/useToastStore';
const toastStore = useToastStore();
</script>
