import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authAPI } from '@/api/auth';
import { mailAPI } from '@/api/mail';
import { useToastStore } from '@/stores/useToastStore';
// import { memberAPI } from '@/api/member';

export const useAuthStore = defineStore('auth', () => {
  // 상태 - 기존 코드 유지
  const user = ref(JSON.parse(localStorage.getItem('userInfo')) || null);
  const accessToken = ref(localStorage.getItem('accessToken') || null);
  const refreshToken = ref(localStorage.getItem('refreshToken') || null);
  const isLoading = ref(false);
  const toastStore = useToastStore();
  // Getters - 기존 코드 + 추가
  const isAuthenticated = computed(() => !!accessToken.value);
  const userInfo = computed(() => user.value);
  const userName = computed(() => user.value?.name || '');
  const userEmail = computed(() => user.value?.email || '');

  // 로그인 액션 - 기존 코드 유지
  const login = async (email, password) => {
    isLoading.value = true;

    try {
      const result = await authAPI.login(email, password);

      if (result.success) {
        const loginData = result.data;

        // 토큰 저장
        setTokens(loginData.accessToken, loginData.refreshToken);
        toastStore.success('로그인되었습니다');

        // userInfo는 응답에 없으므로 여기선 세팅 안 함
        // 필요하면 따로 API 호출해서 가져오기

        return { success: true, message: result.message };
      } else {
        toastStore.error(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      toastStore.error('네트워크 연결을 확인해주세요.');
      return { success: false, message: '네트워크 연결을 확인해주세요.' };
    } finally {
      isLoading.value = false;
    }
  };

  // 회원가입
  const signup = async (userData) => {
    isLoading.value = true;

    try {
      const result = await authAPI.signup(userData);

      if (result.success) {
        toastStore.success(result.message || '회원가입이 완료되었습니다.');
        return { success: true, message: result.message || '회원가입이 완료되었습니다.' };
      } else {
        toastStore.error(result.message || '회원가입 중 오류가 발생했습니다.');
        return { success: false, message: result.message || '회원가입 중 오류가 발생했습니다.' };
      }
    } catch (error) {
      toastStore.error('네트워크 연결을 확인해주세요.');
      return { success: false, message: '네트워크 연결을 확인해주세요.' };
    } finally {
      isLoading.value = false;
    }
  };

  // 비밀번호 찾기
  const forgotPassword = async (email) => {
    isLoading.value = true;

    try {
      const result = await authAPI.forgotPassword(email);

      if (result.success) {
        toastStore.success(result.message || '비밀번호 재설정 이메일이 발송되었습니다.');
        return {
          success: true,
          message: result.message || '비밀번호 재설정 이메일이 발송되었습니다.',
        };
      } else {
        toastStore.error(result.message || '등록되지 않은 이메일입니다.');
        return { success: false, message: result.message || '등록되지 않은 이메일입니다.' };
      }
    } catch (error) {
      toastStore.error('네트워크 연결을 확인해주세요.');
      return { success: false, message: '네트워크 연결을 확인해주세요.' };
    } finally {
      isLoading.value = false;
    }
  };

  // 아이디 찾기 (휴대폰)
  const findIdByPhone = async ({ name, phone }) => {
    isLoading.value = true;

    try {
      const result = await authAPI.findIdByPhone({ name, phone });

      if (result.success) {
        // result.data는 이메일 문자열이므로 배열로 변환
        const email = result.data;
        const emailData = email
          ? [
              {
                id: 1,
                maskedEmail: maskEmail(email),
                joinDate: new Date().toISOString(), // 또는 실제 가입일이 있다면 사용
              },
            ]
          : [];

        toastStore.success(result.message || '계정을 찾았습니다.');
        return {
          success: true,
          emails: emailData,
          message: result.message || '계정을 찾았습니다.',
        };
      } else {
        toastStore.error(result.message || '일치하는 계정을 찾을 수 없습니다.');
        return {
          success: false,
          emails: [],
          message: result.message || '일치하는 계정을 찾을 수 없습니다.',
        };
      }
    } catch (error) {
      toastStore.error('네트워크 연결을 확인해주세요.');
      return {
        success: false,
        emails: [],
        message: '네트워크 연결을 확인해주세요.',
      };
    } finally {
      isLoading.value = false;
    }
  };

  // 이메일 마스킹 함수 추가
  const maskEmail = (email) => {
    if (!email) return '';

    const [username, domain] = email.split('@');
    if (username.length <= 2) {
      return `${username[0]}***@${domain}`;
    }

    const maskedUsername =
      username[0] + '*'.repeat(username.length - 2) + username[username.length - 1];
    return `${maskedUsername}@${domain}`;
  };
  // 토큰 설정 - 기존 코드 유지
  const setTokens = (newAccessToken, newRefreshToken) => {
    if (newAccessToken) {
      accessToken.value = newAccessToken;
      localStorage.setItem('accessToken', newAccessToken);
    }

    if (newRefreshToken) {
      refreshToken.value = newRefreshToken;
      localStorage.setItem('refreshToken', newRefreshToken);
    }
  };

  // 비밀번호 재설정 (이메일 인증 후)
  const resetPasswordByEmail = async ({ email, newPassword, confirmNewPassword }) => {
    isLoading.value = true;

    try {
      const result = await mailAPI.resetPassword({
        email,
        newPassword,
        confirmNewPassword,
      });

      if (result.success) {
        toastStore.success(result.message || '비밀번호가 성공적으로 변경되었습니다.');
        return {
          success: true,
          message: result.message || '비밀번호가 성공적으로 변경되었습니다.',
        };
      } else {
        toastStore.error(result.message || '비밀번호 변경에 실패했습니다.');
        return {
          success: false,
          message: result.message || '비밀번호 변경에 실패했습니다.',
        };
      }
    } catch (error) {
      toastStore.error('네트워크 연결을 확인해주세요.');
      return { success: false, message: '네트워크 연결을 확인해주세요.' };
    } finally {
      isLoading.value = false;
    }
  };

  // 로그아웃 - 새로 추가 (기존 스타일에 맞춰서)
  const logout = () => {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;

    // 기존 방식대로 localStorage 전체 클리어
    localStorage.clear();
    toastStore.success('로그아웃되었습니다.');
  };

  // 인증 초기화 - 새로 추가 (기존 스타일에 맞춰서)
  const initializeAuth = () => {
    const savedUserInfo = localStorage.getItem('userInfo');
    const savedAccessToken = localStorage.getItem('accessToken');
    const savedRefreshToken = localStorage.getItem('refreshToken');

    try {
      if (savedUserInfo) {
        user.value = JSON.parse(savedUserInfo);
      }
      if (savedAccessToken) {
        accessToken.value = savedAccessToken;
      }
      if (savedRefreshToken) {
        refreshToken.value = savedRefreshToken;
      }
    } catch (error) {
      toastStore.error('네트워크 연결을 확인해주세요.');
      // 잘못된 데이터가 있으면 초기화
      localStorage.clear();
      user.value = null;
      accessToken.value = null;
      refreshToken.value = null;
    }
  };

  // 프로필 업데이트 - 새로 추가 (기존 API 방식으로 수정)
  const updateProfile = async (profileData) => {
    isLoading.value = true;

    try {
      const result = await authAPI.updateProfile(profileData);

      if (result.success) {
        // 사용자 정보 업데이트
        user.value = { ...user.value, ...result.data };
        localStorage.setItem('userInfo', JSON.stringify(user.value));

        toastStore.success(result.message || '프로필이 업데이트되었습니다.');
        return { success: true, message: result.message || '프로필이 업데이트되었습니다.' };
      } else {
        toastStore.error(result.message || '프로필 업데이트에 실패했습니다.');
        return { success: false, message: result.message || '프로필 업데이트에 실패했습니다.' };
      }
    } catch (error) {
      toastStore.error('네트워크 연결을 확인해주세요.');
      return { success: false, message: '네트워크 연결을 확인해주세요.' };
    } finally {
      isLoading.value = false;
    }
  };

  return {
    // 상태
    user,
    accessToken,
    refreshToken,
    isLoading,

    // Getters
    isAuthenticated,
    userInfo,
    userName,
    userEmail,

    // 액션
    login,
    signup, // 새로 추가
    forgotPassword, // 새로 추가
    findIdByPhone, // 새로 추가
    logout, // 새로 추가
    initializeAuth, // 새로 추가
    updateProfile, // 새로 추가
    setTokens,
    resetPasswordByEmail,
    // 기존 주석처리된 함수들은 필요시 추가
    // logout,
    // withdraw,
    // refreshUser,
    // clearAuthData,
    // initialize,
    // hasValidTokens,
    // shouldValidateTokenOnInit,
  };
});

