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
  getMyBusinessList: async () => {
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

  // 사업장 단건 조회 (GET /api/business/{businessId})
  getMyBusiness: async (businessId) => {
    try {
      const response = await api.get(`/api/business/${businessId}`);
      return {
        success: true,
        data: response.data.body.data,
        status: response.data.header.status,
        message: response.data.header.message,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        status: error.response?.status || 500,
        message: error.response?.data?.header?.message || '사업장 조회 중 오류가 발생했습니다.',
      };
    }
  },

  // 사업장 정보 수정 (PATCH /api/business/{businessId})
  updateMyBusiness: async (businessId, updateData) => {
    try {
      const response = await api.patch(`/api/business/${businessId}`, updateData);
      return {
        success: true,
        data: response.data.body.data,
        status: response.data.header.status,
        message: response.data.header.message,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        status: error.response?.status || 500,
        message: error.response?.data?.header?.message || '사업장 수정 중 오류가 발생했습니다.',
      };
    }
  },
  delete: async (businessId) => {
    try {
      const response = await api.delete(`/api/business/${businessId}`);

      const header = response.data?.header;
      const body = response.data?.body;

      return {
        success: true,
        data: body?.data ?? null,
        status: header?.status ?? response.status,
        message: header?.message ?? '사업장이 성공적으로 삭제되었습니다.',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        status: error.response?.status || 500,
        message: error.response?.data?.header?.message || '사업장 삭제 중 오류가 발생했습니다.',
      };
    }
  },

  setMain: async (businessId) => {
    const { data } = await api.patch(`/api/business/${businessId}/main`);
    return data;
  },
};

