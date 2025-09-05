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
      console.error('Instagram login API error:', error);
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
      console.error('Instagram logout API error:', error);
      return {
        success: false,
        message: error.response?.data?.header?.message || 'Instagram 로그아웃 실패',
      };
    }
  },
};
