<template>
  <section class="stepper" aria-label="progress">
    <div class="stepper__item-container">
      <div class="stepper__item" :class="{ 'is-active': currentStep >= 1 }">
        <div class="dot">1</div>
        <div class="label">사진 업로드</div>
      </div>
    </div>
    <div class="stepper__item-container">
      <div class="connector"></div>
      <div class="stepper__item" :class="{ 'is-active': currentStep >= 2 }">
        <div class="dot">2</div>
        <div class="label">문구 입력</div>
      </div>
    </div>
    <div class="stepper__item-container">
      <div class="connector"></div>
      <div class="stepper__item" :class="{ 'is-active': currentStep >= 3 }">
        <div class="dot">3</div>
        <div class="label">스타일 선택</div>
      </div>
    </div>
    <div class="stepper__item-container">
      <div class="connector"></div>
      <div class="stepper__item" :class="{ 'is-active': currentStep >= 4 }">
        <div class="dot">4</div>
        <div class="label">콘텐츠 생성</div>
      </div>
    </div>
  </section>
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
.stepper {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.stepper__item-container {
  display: flex;
  align-items: center;
}

.stepper__item {
  text-align: center;
  position: relative;
  z-index: 1;
}

.stepper__item .dot {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: #e5e7eb;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  margin: 0 auto;
}

.stepper__item .label {
  margin-top: 8px;
  font-size: 14px;
  color: #6f7275;
}

.stepper__item.is-active .dot {
  background: var(--color-sub);
  color: #fff;
}

.connector {
  width: 75px; /* 선의 길이를 고정값으로 줄임 */
  height: 2px;
  background: #d6d9dc;
  margin: 0; /* 불필요한 마진 제거 */
}

/* 활성화된 선 스타일 */
.stepper__item-container:has(.is-active) + .stepper__item-container .connector {
  background: var(--color-sub);
}
</style>
