import api from './index';

export const businessAPI = {
  // 사업장 등록 (POST /api/business)
  register: async (businessData) => {
    try {
      const response = await api.post('/api/business', businessData);
      return {
        success: true,
        data: response.data.body.data,
        status: response.data.header.status,
        message: response.data.header.message,
      };
    } catch (error) {
      console.error('사업장 등록 오류:', error);
      return {
        success: false,
        data: null,
        status: error.response?.status || 500,
        message: error.response?.data?.header?.message || '사업장 등록 중 오류가 발생했습니다.',
      };
    }
  },

  // 사업장 조회 (GET /api/business)
  getAll: async () => {
    try {
      const response = await api.get('/api/business');
      return {
        success: true,
        data: response.data.body.data, // 배열
        status: response.data.header.status,
        message: response.data.header.message,
      };
    } catch (error) {
      console.error('사업장 조회 오류:', error);
      return {
        success: false,
        data: [],
        status: error.response?.status || 500,
        message: error.response?.data?.header?.message || '사업장 조회 중 오류가 발생했습니다.',
      };
    }
  },
};
