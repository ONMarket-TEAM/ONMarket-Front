import api from '@/api';

const BASE_URL = '/api/members/me';

export default {
  // 1. 현재 회원정보 조회
  async getMemberInfo() {
    try {
      const { data } = await api.get(`${BASE_URL}`);
      console.log('API 응답: ', data);

      return data?.body?.data ?? data?.body ?? data;
    } catch (error) {
      console.error('회원 정보 조회 실패: ', error);
      throw error;
    }
  },

  // 2. 현재 비밀번호 일치 여부 확인 (회원정보 변경 인증용)
  async verifyPassword(currentPassword) {
    try {
      const { data } = await api.post(`${BASE_URL}/password/verify`, { currentPassword });
      console.log('비밀번호 확인 응답: ', data);
      return data?.body?.data ?? data?.body ?? data;
    } catch (error) {
      console.error('비밀번호 확인 실패: ', error);
      throw error;
    }
  },

  // 3. 회원정보 변경 (닉네임/비밀번호)
  async updateMember(payload) {
    try {
      const { data } = await api.patch(`${BASE_URL}`, payload);
      console.log('회원정보 수정 응답: ', data);
      return data?.body?.data ?? data?.body ?? data;
    } catch (error) {
      console.error('회원정보 수정 실패: ', error);
      throw error;
    }
  },
};

