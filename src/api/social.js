import api from './index';

export const snsAPI = {
  // Instagram 상태 조회
  getInstagramStatus: async () => {
    try {
      const response = await api.get('/api/instagram/status');

      return {
        success: true,
        data: response.data.body?.data || {},
        message: response.data.header?.message || 'Instagram 상태 조회 성공',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.header?.message || 'Instagram 상태 조회 실패',
        data: null,
      };
    }
  },

  // Instagram 로그인
  loginInstagram: async ({ username, password }) => {
    try {
      const response = await api.post('/api/instagram/login', { username, password });

      return {
        success: true,
        data: response.data.body?.data,
        message: response.data.header?.message || 'Instagram 로그인 성공',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.header?.message || 'Instagram 로그인 실패',
        data: null,
      };
    }
  },

  // Instagram 로그아웃
  logoutInstagram: async () => {
    try {
      const response = await api.post('/api/instagram/logout');

      return {
        success: true,
        message: response.data.header?.message || 'Instagram 로그아웃 성공',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.header?.message || 'Instagram 로그아웃 실패',
      };
    }
  },

  // 소셜 회원 정보 조회 (카카오/구글 등)
  getPendingMemberInfo: async (memberId) => {
    try {
      const response = await api.get(`/api/oauth/pending-member/${memberId}`);

      return {
        success: true,
        data: response.data.body?.data || {},
        message: response.data.header?.message || '회원 정보 조회 성공',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.header?.message || '회원 정보를 불러올 수 없습니다.',
        data: null,
      };
    }
  },

  // 소셜 회원가입 완료
  completeSocialSignup: async (memberId, signupData) => {
    try {
      const requestBody = {
        nickname: signupData.nickname,
        username: signupData.username,
        birthDate: signupData.birthDate,
        gender: signupData.gender,
        phone: signupData.phone,
      };

      // 프로필 이미지가 있다면 추가
      if (signupData.profileImageKey) {
        requestBody.profileImageKey = signupData.profileImageKey;
      }

      const response = await api.post(
        `/api/oauth/complete-signup?memberId=${memberId}`,
        requestBody
      );

      return {
        success: true,
        data: response.data.body?.data || {},
        message: response.data.header?.message || '회원가입이 완료되었습니다!',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.header?.message || '회원가입 완료 중 오류가 발생했습니다.',
        data: null,
      };
    }
  },
};

