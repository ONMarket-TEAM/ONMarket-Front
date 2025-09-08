import api from './index';

export const authAPI = {
  // 로그인
  login: async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const result = response.data.body.data;

      if (result.accessToken) {
        return {
          success: true,
          message: '로그인에 성공했습니다.',
          data: result,
        };
      } else {
        return {
          success: false,
          message: '로그인에 실패했습니다.',
          data: null,
        };
      }
    } catch (error) {
      let errorMessage = '로그인에 실패했습니다.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
      } else if (error.response?.status >= 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }

      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  },
  // 로그아웃
  logout: async (accessToken) => {
    try {
      const response = await api.post(
        '/api/auth/logout',
        {}, // body 없음
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return {
        success: true,
        data: response.data.body?.data || {},
        message: response.data.header?.message || '로그아웃 성공',
      };
    } catch (error) {
      console.error('Logout API error:', error);

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.header?.message;

        switch (status) {
          case 400:
            return { success: false, message: message || '잘못된 요청입니다.' };
          case 401:
            return { success: false, message: message || '유효하지 않거나 만료된 토큰입니다.' };
          case 404:
            return { success: false, message: message || '사용자를 찾을 수 없습니다.' };
          default:
            return { success: false, message: message || '로그아웃 중 오류가 발생했습니다.' };
        }
      }

      return { success: false, message: '네트워크 연결을 확인해주세요.' };
    }
  },

  // 회원탈퇴
  withdraw: async (accessToken) => {
    try {
      const response = await api.delete('/api/auth/withdraw', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        success: true,
        data: response.data.body?.data || {},
        message: response.data.header?.message || '회원탈퇴가 완료되었습니다.',
      };
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.header?.message;

        switch (status) {
          case 400:
            return { success: false, message: message || '잘못된 요청입니다.' };
          case 401:
            return { success: false, message: message || '유효하지 않거나 만료된 토큰입니다.' };
          case 404:
            return { success: false, message: message || '사용자를 찾을 수 없습니다.' };
          default:
            return { success: false, message: message || '회원탈퇴 중 오류가 발생했습니다.' };
        }
      }
      return { success: false, message: '네트워크 연결을 확인해주세요.' };
    }
  },

  // 아이디 찾기 (휴대폰 번호)
  findIdByPhone: async ({ name, phone }) => {
    try {
      const response = await api.post('/api/members/find-id', {
        username: name,
        phone: phone,
      });

      return {
        success: true,
        data: response.data.body?.data || {},
        message: response.data.header?.message || '계정을 찾았습니다.',
      };
    } catch (error) {
      console.error('Find ID API error:', error);

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.header?.message;

        switch (status) {
          case 400:
            return {
              success: false,
              message: message || '입력 정보를 확인해주세요.',
            };
          case 404:
            return {
              success: false,
              message: message || '일치하는 계정을 찾을 수 없습니다.',
            };
          default:
            return {
              success: false,
              message: message || '아이디 찾기 중 오류가 발생했습니다.',
            };
        }
      }

      return {
        success: false,
        message: '네트워크 연결을 확인해주세요.',
      };
    }
  },
  // 회원가입
  signup: async (formData) => {
    try {
      const response = await api.post('/api/signup', formData);

      return {
        success: true,
        data: response.data.body?.data || {},
        message: response.data.header?.message || '회원가입이 완료되었습니다.',
      };
    } catch (error) {
      console.error('Signup API error:', error);

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.header?.message;

        switch (status) {
          case 400:
            return { success: false, message: message || '잘못된 요청 데이터입니다.' };
          case 409:
            return { success: false, message: message || '이미 존재하는 회원입니다.' };
          default:
            return { success: false, message: message || '회원가입 중 오류가 발생했습니다.' };
        }
      }

      return { success: false, message: '네트워크 연결을 확인해주세요.' };
    }
  },
};

