import api from './index';

export const validationAPI = {
  /** 이메일 중복 체크 */
  checkEmail: async (email) => {
    try {
      const response = await api.get('/api/validation/check/email', {
        params: { email },
      });

      return {
        isAvailable: true,
        message: response.data.header?.message || '사용 가능한 이메일입니다.',
      };
    } catch (error) {
      if (error.response?.status === 409) {
        return {
          isAvailable: false,
          message: error.response.data?.header?.message || '이미 사용 중인 이메일입니다.',
        };
      }
      console.error('Validation API error:', error);
      return {
        isAvailable: false,
        message: '네트워크 연결을 확인해주세요.',
      };
    }
  },

  /** 닉네임 중복 체크 */
  checkNickname: async (nickname) => {
    try {
      const response = await api.get('/api/validation/check/nickname', {
        params: { nickname },
      });

      return {
        isAvailable: true,
        message: response.data.header?.message || '사용 가능한 닉네임입니다.',
      };
    } catch (error) {
      if (error.response?.status === 409) {
        return {
          isAvailable: false,
          message: error.response.data?.header?.message || '이미 사용 중인 닉네임입니다.',
        };
      }
      console.error('Validation API error:', error);
      return {
        isAvailable: false,
        message: '네트워크 연결을 확인해주세요.',
      };
    }
  },
};
