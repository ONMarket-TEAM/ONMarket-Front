import axios from 'axios';

// Axios 인스턴스 생성
const api = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 모든 요청에 자동으로 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 에러 시 토큰 새로고침
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 토큰 갱신 API 자체에서 401이 발생한 경우 무한 루프 방지
      if (originalRequest.url?.includes('/auth/refresh')) {
        console.log('Refresh token도 만료됨 - 로그아웃 처리');
        clearAllTokens();
        redirectToLogin();
        return Promise.reject(error);
      }

      try {
        console.log('토큰 만료 - 새로고침 시도');

        const refreshToken =
          localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');

        if (!refreshToken) {
          throw new Error('Refresh token not found');
        }

        // 토큰 갱신 요청 (기존 api 인스턴스 대신 새로운 axios 인스턴스 사용)
        const response = await axios.post(
          '/api/auth/refresh',
          {
            refreshToken: refreshToken,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );

        // 응답 구조 검증
        const responseData = response.data;
        if (!responseData?.body?.data?.accessToken || !responseData?.body?.data?.refreshToken) {
          throw new Error('Invalid refresh response structure');
        }

        const newAccessToken = responseData.body.data.accessToken;
        const newRefreshToken = responseData.body.data.refreshToken;

        // 기존 토큰이 어디에 저장되어 있었는지 확인하고 같은 곳에 저장
        const isLocalStorage = localStorage.getItem('accessToken');
        if (isLocalStorage) {
          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
        } else {
          sessionStorage.setItem('accessToken', newAccessToken);
          sessionStorage.setItem('refreshToken', newRefreshToken);
        }

        console.log('토큰 새로고침 성공');

        // 원래 요청에 새 토큰을 적용하여 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('토큰 새로고침 실패:', refreshError);

        // 새로고침 실패 시 모든 토큰 클리어 및 로그인 페이지로 이동
        clearAllTokens();
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// 유틸리티 함수: 모든 토큰 클리어
function clearAllTokens() {
  // localStorage 클리어
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo');

  // sessionStorage 클리어
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('userInfo');
}

// 유틸리티 함수: 로그인 페이지로 리다이렉트
function redirectToLogin() {
  // 현재 페이지가 로그인 페이지가 아닌 경우에만 리다이렉트
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

// JWT 토큰 만료 체크 함수
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;

    // 만료 5분 전을 만료로 간주 (여유시간)
    return payload.exp < currentTime + 300;
  } catch (error) {
    console.error('Token parsing error:', error);
    return true;
  }
};

// 토큰 유효성 확인 및 필요시 갱신
export const ensureValidToken = async () => {
  const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

  if (isTokenExpired(token)) {
    const refreshToken =
      localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');

    if (!refreshToken) {
      clearAllTokens();
      redirectToLogin();
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(
        '/api/auth/refresh',
        {
          refreshToken: refreshToken,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      const responseData = response.data;
      if (!responseData?.body?.data?.accessToken || !responseData?.body?.data?.refreshToken) {
        throw new Error('Invalid refresh response structure');
      }

      const newAccessToken = responseData.body.data.accessToken;
      const newRefreshToken = responseData.body.data.refreshToken;

      // 토큰 저장
      const isLocalStorage = localStorage.getItem('accessToken');
      if (isLocalStorage) {
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
      } else {
        sessionStorage.setItem('accessToken', newAccessToken);
        sessionStorage.setItem('refreshToken', newRefreshToken);
      }

      return newAccessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAllTokens();
      redirectToLogin();
      throw error;
    }
  }

  return token;
};

// 수동 로그아웃 함수
export const logout = () => {
  clearAllTokens();
  redirectToLogin();
};

export default api;
