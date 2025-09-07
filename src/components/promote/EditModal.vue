<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <strong>문구 편집</strong>
        <button class="modal-close" type="button" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="modal-images">
          <div
            v-for="(image, index) in uploadedImages.slice(0, 3)"
            :key="image.id"
            class="modal-img"
          >
            <img :src="image.previewUrl" :alt="`미리보기 ${index + 1}`" />
            <div class="img-badge">{{ index + 1 }}</div>
          </div>
          <div v-if="uploadedImages.length === 0" class="modal-img-ph">이미지 없음</div>
        </div>
        <div class="modal-form">
          <textarea
            :value="editBuffer"
            @input="$emit('update-buffer', $event.target.value)"
            class="modal-textarea"
            placeholder="문구를 편집해주세요..."
          ></textarea>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn-primary" type="button" @click="$emit('save')">저장</button>
        <button class="btn-secondary" type="button" @click="$emit('close')">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  editBuffer: {
    type: String,
    default: ''
  },
  uploadedImages: {
    type: Array,
    default: () => []
  }
});

defineEmits(['close', 'save', 'update-buffer']);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--color-white);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex; /* Flexbox로 변경 */
  flex-direction: column; /* 세로 방향으로 요소 정렬 */
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-light-1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 20px;
  display: flex; /* Flexbox로 변경 */
  flex-grow: 1; /* 남은 공간을 채우도록 설정 */
  gap: 16px;
  overflow-y: auto; /* 내용이 넘칠 경우 스크롤 */
}

.modal-images {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0; /* 공간이 부족해도 축소되지 않음 */
}

.modal-img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-light-1);
  position: relative;
}

.modal-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: var(--color-sub);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-img-ph {
  width: 80px;
  height: 80px;
  background: var(--color-light-2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
  border-radius: 8px;
}

.modal-form {
  flex-grow: 1; /* 남은 공간을 모두 차지하도록 설정 */
  display: flex;
  flex-direction: column;
}

.modal-textarea {
  width: 100%;
  height: 100%; /* 부모의 남은 공간을 채우도록 */
  min-height: 200px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
}

.modal-textarea:focus {
  outline: none;
  border-color: var(--color-sub);
}

.modal-actions {
  padding: 16px 20px;
  border-top: 1px solid var(--color-light-1);
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-shrink: 0;
}

.btn-primary {
  background: var(--color-sub);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover {
  filter: brightness(0.95);
}

.btn-secondary {
  background: var(--color-white);
  color: #666;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 10px 20px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary:hover {
  border-color: var(--color-sub);
  color: var(--color-sub);
}
</style>
