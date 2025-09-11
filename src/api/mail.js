import api from './index';

export const mailAPI = {
  // 이메일 유효성 검증
  validateEmail: (email) => {
    if (!email || typeof email !== 'string') {
      return { isValid: false, cleanEmail: '' };
    }

    const cleanEmail = email.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return { isValid: regex.test(cleanEmail), cleanEmail };
  },

  // 이메일 인증코드 발송
  sendVerificationCode: async (email) => {
    try {
      const response = await api.get('/api/auth/email/sendCode', {
        params: { email },
      });

      return {
        success: true,
        message: response.data.header?.message || '인증코드가 발송되었습니다.',
        data: response.data.body?.data,
      };
    } catch (error) {
      console.error('Email code send error:', error);

      const status = error.response?.status;
      const message = error.response?.data?.header?.message;

      switch (status) {
        case 400:
          return {
            success: false,
            message: message || '올바른 이메일 형식이 아닙니다.',
            error: 'INVALID_EMAIL_FORMAT',
          };
        case 404:
          return {
            success: false,
            message: message || '등록되지 않은 이메일입니다.',
            error: 'USER_NOT_FOUND',
          };
        case 429: // 추가: 너무 많은 요청
          return {
            success: false,
            message: message || '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
            error: 'TOO_MANY_REQUESTS',
          };
        case 500:
          return {
            success: false,
            message: message || '메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.',
            error: 'MAIL_SEND_FAILED',
          };
        default:
          return {
            success: false,
            message: message || '인증코드 발송 중 오류가 발생했습니다.',
            error: 'UNKNOWN_ERROR',
          };
      }
    }
  },

  // 이메일 인증코드 검증
  confirmVerificationCode: async ({ email, code }) => {
    // 입력값 검증 추가
    if (!email || !code) {
      return {
        success: false,
        message: '이메일과 인증코드를 모두 입력해주세요.',
        error: 'MISSING_REQUIRED_FIELDS',
      };
    }

    // 인증코드 형식 검증 (6자리 숫자)
    if (!/^\d{6}$/.test(code.toString())) {
      return {
        success: false,
        message: '인증코드는 6자리 숫자여야 합니다.',
        error: 'INVALID_CODE_FORMAT',
      };
    }

    try {
      const response = await api.post('/api/auth/email/verifyCode', {
        email,
        code: code.toString(), // 문자열로 변환
      });

      return {
        success: true,
        message: response.data.header?.message || '인증이 완료되었습니다.',
        data: response.data.body?.data,
      };
    } catch (error) {
      console.error('Email code verify error:', error);

      const status = error.response?.status;
      const message = error.response?.data?.header?.message;

      switch (status) {
        case 400:
          return {
            success: false,
            message: message || '잘못된 요청입니다.',
            error: 'BAD_REQUEST',
          };
        case 404:
          return {
            success: false,
            message: message || '인증코드가 만료되었거나 존재하지 않습니다.',
            error: 'CODE_NOT_FOUND_OR_EXPIRED',
          };
        case 403:
          return {
            success: false,
            message: message || '인증코드 검증 권한이 없습니다. 인증코드를 다시 발송받아주세요.',
            error: 'FORBIDDEN',
          };
        case 409:
          return {
            success: false,
            message: message || '인증코드가 일치하지 않습니다.',
            error: 'CODE_MISMATCH',
          };
        case 429: // 추가: 너무 많은 시도
          return {
            success: false,
            message: message || '너무 많은 인증 시도입니다. 잠시 후 다시 시도해주세요.',
            error: 'TOO_MANY_ATTEMPTS',
          };
        default:
          return {
            success: false,
            message: message || '인증코드 확인 중 오류가 발생했습니다.',
            error: 'UNKNOWN_ERROR',
          };
      }
    }
  },

  // 비밀번호 재설정
  resetPassword: async ({ email, newPassword, confirmNewPassword, name }) => {
    // 입력값 검증 추가
    if (!email || !newPassword || !confirmNewPassword) {
      return {
        success: false,
        message: '필수 정보를 모두 입력해주세요.',
        error: 'MISSING_REQUIRED_FIELDS',
      };
    }

    // 비밀번호 일치 확인
    if (newPassword !== confirmNewPassword) {
      return {
        success: false,
        message: '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
        error: 'PASSWORD_MISMATCH',
      };
    }

    // 비밀번호 형식 검증
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return {
        success: false,
        message: '비밀번호는 최소 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.',
        error: 'INVALID_PASSWORD_FORMAT',
      };
    }

    try {
      const requestData = {
        email,
        newPassword,
        confirmNewPassword,
      };

      // name이 있으면 추가
      if (name) {
        requestData.name = name;
      }

      const response = await api.post('/api/auth/email/resetPassword', requestData);

      return {
        success: true,
        message: response.data.header?.message || '비밀번호가 성공적으로 변경되었습니다.',
        data: response.data.body?.data,
      };
    } catch (error) {
      console.error('Password reset error:', error);

      const status = error.response?.status;
      const message = error.response?.data?.header?.message;

      switch (status) {
        case 400:
          return {
            success: false,
            message: message || '비밀번호 형식이 올바르지 않습니다.',
            error: 'INVALID_PASSWORD_FORMAT',
          };
        case 404:
          return {
            success: false,
            message: message || '존재하지 않는 회원입니다.',
            error: 'USER_NOT_FOUND',
          };
        case 409:
          return {
            success: false,
            message: message || '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
            error: 'PASSWORD_MISMATCH',
          };
        case 422: // 추가: 비밀번호 정책 위반
          return {
            success: false,
            message: message || '비밀번호가 보안 정책에 맞지 않습니다.',
            error: 'PASSWORD_POLICY_VIOLATION',
          };
        case 429: // 추가: 너무 많은 시도
          return {
            success: false,
            message: message || '너무 많은 시도입니다. 잠시 후 다시 시도해주세요.',
            error: 'TOO_MANY_ATTEMPTS',
          };
        default:
          return {
            success: false,
            message: message || '비밀번호 변경 중 오류가 발생했습니다.',
            error: 'UNKNOWN_ERROR',
          };
      }
    }
  },
};
