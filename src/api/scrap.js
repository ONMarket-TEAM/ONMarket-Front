import api from '@/api';

const BASE_URL = '/api/scraps';

export default {
  // 1. 스크랩 토글 (하트 버튼 클릭)
  async toggleScrap(postId) {
    try {
      const { data } = await api.post(`${BASE_URL}/toggle`, null, {
        params: { postId },
      });
      return data?.body?.data ?? data?.body ?? data;
    } catch (error) {
      throw error;
    }
  },

  // 2. 내 스크랩 목록 조회
  async getMyScraps() {
    try {
      const { data } = await api.get(`${BASE_URL}/my`);
      return data?.body?.data ?? data?.body ?? data;
    } catch (error) {
      throw error;
    }
  },
};
