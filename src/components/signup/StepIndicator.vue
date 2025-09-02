<template>
  <div class="step-indicator">
    <div class="step-container">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="step-item"
        :class="{
          active: index + 1 === currentStep,
          completed: index + 1 < currentStep,
        }"
      >
        <div class="step-circle">
          <span v-if="index + 1 < currentStep" class="step-check">✓</span>
          <span v-else class="step-number">{{ index + 1 }}</span>
        </div>
        <div class="step-label">{{ step.label }}</div>
      </div>
      <div class="step-connector" :style="{ width: connectorWidth }"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentStep: {
    type: Number,
    required: true,
    validator: (value) => value >= 1,
  },
  steps: {
    type: Array,
    required: true,
    validator: (steps) => steps.length > 0 && steps.every((step) => step.label),
  },
});

const totalSteps = computed(() => props.steps.length);

const connectorWidth = computed(() => {
  const progress = Math.min((props.currentStep - 1) / (totalSteps.value - 1), 1);
  return `${progress * 100}%`;
});
</script>

<style scoped>
.step-indicator {
  padding: 1rem;
  border-radius: 12px;
}

.step-container {
  position: relative;
  display: flex;
  width: 40rem;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 1rem;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
  border: 2px solid #dee2e6;
  background: white;
  color: #333;
}

.step-item.active .step-circle {
  background: var(--color-main);
  color: white;
  border-color: var(--color-main);
}

.step-item.completed .step-circle {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.step-check {
  font-size: 1rem;
}

.step-label {
  font-size: 0.85rem;
  color: #666;
  text-align: center;
  font-weight: 500;
  max-width: 80px;
  line-height: 1.2;
}

.step-item.active .step-label {
  color: var(--color-main);
  font-weight: 600;
}

.step-item.completed .step-label {
  color: #28a745;
}

.step-connector {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  height: 2px;
  background: #dee2e6;
  z-index: 1;
}

.step-connector::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--color-main);
  transition: width 0.5s ease;
  width: var(--progress-width, 0%);
}
</style>
