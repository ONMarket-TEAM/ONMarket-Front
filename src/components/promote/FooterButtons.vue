<template>
  <div class="footer">
    <button
      v-if="currentStep === 1"
      class="next-btn"
      @click="$emit('next')"
      :disabled="!canProceed"
    >
      다음
    </button>
    <button
      v-else-if="currentStep === 2"
      class="next-btn"
      @click="$emit('next')"
      :disabled="!canProceed"
    >
      다음
    </button>
    <button
      v-else-if="currentStep === 3"
      class="next-btn"
      @click="$emit('next')"
      :disabled="!canProceed"
    >
      다음
    </button>
    <button
      v-else
      class="next-btn"
      @click="$emit('start-over')"
    >
    <i class="fa-solid fa-rotate-right"></i>   처음으로
    </button>
  </div>
</template>

<script setup>
defineProps({
  currentStep: {
    type: Number,
    required: true
  },
  canProceed: {
    type: Boolean,
    default: false
  }
});

defineEmits(['next', 'start-over']);
</script>

<style scoped>
.footer {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 28px 0 60px;
}

.next-btn {
  width: 360px;
  height: 48px;
  border-radius: 999px;
  border: none;
  font-weight: 600;
  font-size: 16px;
  color: #fff;
  background: var(--color-sub);
  cursor: pointer;
  transition: all 0.2s ease;
}

.next-btn:disabled {
  background: #bfc3c7;
  cursor: not-allowed;
}

.next-btn:not(:disabled):hover {
  filter: brightness(0.95);
}
</style>
