import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authAPI } from '@/api/auth';
import { mailAPI } from '@/api/mail';
import { useToastStore } from '@/stores/useToastStore';

export const useAuthStore = defineStore('auth', () => {
  // 상태 정의
  const user = ref(null);
  const accessToken = ref(null);
  const refreshToken = ref(null);
  const isLoading = ref(false);
  const toastStore = useToastStore();

  // Computed
  const isAuthenticated = computed(() => !!accessToken.value);
  const userInfo = computed(() => user.value);
  const userName = computed(() => user.value?.name || '');
  const userEmail = computed(() => user.value?.email || '');

  // 로그인
  const login = async (email, password, rememberMe = false) => {
    isLoading.value = true;

    try {
      const result = await authAPI.login(email, password, rememberMe);

      if (result.success) {
        const loginData = result.data;

        // 사용자 정보 설정
        user.value = loginData.user || { email };

        // 토큰 저장 (rememberMe에 따라 localStorage 또는 sessionStorage)
        setTokens(loginData.accessToken, loginData.refreshToken, rememberMe);

        toastStore.success('로그인되었습니다');
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
        const email = result.data;
        const emailData = email
          ? [
              {
                id: 1,
                maskedEmail: maskEmail(email),
                joinDate: new Date().toISOString(),
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

  // 이메일 마스킹
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

  // 토큰 설정 (rememberMe에 따라 localStorage 또는 sessionStorage 사용)
  const setTokens = (newAccessToken, newRefreshToken, rememberMe = false) => {
    if (newAccessToken) {
      accessToken.value = newAccessToken;

      if (rememberMe) {
        localStorage.setItem('accessToken', newAccessToken);
        sessionStorage.removeItem('accessToken');
      } else {
        sessionStorage.setItem('accessToken', newAccessToken);
        localStorage.removeItem('accessToken');
      }
    }

    if (newRefreshToken) {
      refreshToken.value = newRefreshToken;

      if (rememberMe) {
        localStorage.setItem('refreshToken', newRefreshToken);
        sessionStorage.removeItem('refreshToken');
      } else {
        sessionStorage.setItem('refreshToken', newRefreshToken);
        localStorage.removeItem('refreshToken');
      }
    }

    // 사용자 정보도 같은 방식으로 저장
    if (user.value) {
      const userInfoStr = JSON.stringify(user.value);
      if (rememberMe) {
        localStorage.setItem('userInfo', userInfoStr);
        sessionStorage.removeItem('userInfo');
      } else {
        sessionStorage.setItem('userInfo', userInfoStr);
        localStorage.removeItem('userInfo');
      }
    }
  };

  // 비밀번호 재설정
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

  // 로그아웃
  const logout = () => {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;

    localStorage.clear();
    sessionStorage.clear();
    toastStore.success('로그아웃되었습니다.');
  };

  // 인증 초기화 (localStorage와 sessionStorage 모두 확인)
  const initializeAuth = () => {
    let savedUserInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    let savedAccessToken =
      localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    let savedRefreshToken =
      localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');

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
      localStorage.clear();
      sessionStorage.clear();
      user.value = null;
      accessToken.value = null;
      refreshToken.value = null;
    }
  };

  // 프로필 업데이트
  const updateProfile = async (profileData) => {
    isLoading.value = true;

    try {
      const result = await authAPI.updateProfile(profileData);

      if (result.success) {
        user.value = { ...user.value, ...result.data };

        // 현재 저장 위치 확인 후 업데이트
        if (localStorage.getItem('userInfo')) {
          localStorage.setItem('userInfo', JSON.stringify(user.value));
        } else {
          sessionStorage.setItem('userInfo', JSON.stringify(user.value));
        }

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

  // 스토어 생성 시 자동 초기화
  initializeAuth();

  return {
    // 상태
    user,
    accessToken,
    refreshToken,
    isLoading,

    // Computed
    isAuthenticated,
    userInfo,
    userName,
    userEmail,

    // 메서드
    login,
    signup,
    forgotPassword,
    findIdByPhone,
    logout,
    initializeAuth,
    updateProfile,
    setTokens,
    resetPasswordByEmail,
  };
});

