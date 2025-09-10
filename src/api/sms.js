import api from './index';

export const smsAPI = {
  // 인증번호 발송
  sendVerificationCode: async (phoneNumber) => {
    try {
      const response = await api.post('/api/sms/verify-code', {
        phoneNumber: phoneNumber,
      });

      return {
        success: true,
        data: response.data.body?.data || {},
        message: response.data.header?.message || '인증번호가 발송되었습니다.',
      };
    } catch (error) {
      console.error('SMS send error:', error);

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.header?.message;

        switch (status) {
          case 400:
            return {
              success: false,
              message: message || '잘못된 휴대폰 번호 형식입니다.',
            };
          case 500:
            return {
              success: false,
              message: message || 'SMS 발송에 실패했습니다.',
            };
          default:
            return {
              success: false,
              message: message || 'SMS 발송 중 오류가 발생했습니다.',
            };
        }
      }

      return {
        success: false,
        message: '네트워크 연결을 확인해주세요.',
      };
    }
  },

  // 인증번호 확인
  confirmVerificationCode: async (phoneNumber, code) => {
    try {
      const response = await api.post('/api/sms/confirm-code', {
        phoneNumber: phoneNumber,
        code: code,
      });

      return {
        success: true,
        data: response.data.body?.data || {},
        message: response.data.header?.message || '인증이 완료되었습니다.',
      };
    } catch (error) {
      console.error('SMS verification error:', error);

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.header?.message;

        switch (status) {
          case 400:
            return {
              success: false,
              message: message || '인증번호가 일치하지 않습니다.',
            };
          case 403:
            return {
              success: false,
              message: message || '인증번호가 만료되었거나 존재하지 않습니다.',
            };
          default:
            return {
              success: false,
              message: message || '인증번호 확인 중 오류가 발생했습니다.',
            };
        }
      }

      return {
        success: false,
        message: '네트워크 연결을 확인해주세요.',
      };
    }
  },

  // 휴대폰 번호 유효성 검사 헬퍼 함수
  validatePhoneNumber: (phoneNumber) => {
    // 숫자만 추출
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');

    // 11자리이고 010으로 시작하는지 확인
    const isValid = cleanNumber.length === 11 && cleanNumber.startsWith('010');

    return {
      isValid,
      cleanNumber,
      formattedNumber: isValid
        ? `${cleanNumber.slice(0, 3)}-${cleanNumber.slice(3, 7)}-${cleanNumber.slice(7)}`
        : phoneNumber,
    };
  },
};
