import api from './index'

// Post API
export const postAPI = {
  getPostsByType: async (type, page = 0, size = 9, sort = 'createdAt,desc') => {
    try {
      const normalizedType = {
        loans: 'LOAN',
        loan: 'LOAN',
        policies: 'SUPPORT',
        support: 'SUPPORT'
      }[type.toLowerCase()] || type.toUpperCase();

      const params = new URLSearchParams({
        page,
        size,
        sort
      });

      const url = `/api/posts/type/${normalizedType}?${params.toString()}`;
      const { data } = await api.get(url);
      return data;
    } catch (error) {
      console.error(`게시물 목록 조회 실패 (${type}):`, error);
      throw error;
    }
  },

  // [수정됨] 상품 검색 API 호출 함수에서 available 관련 로직 모두 삭제
  searchPosts: async (searchParams) => {
    try {
      const { type, keyword, company, page, size, sort } = searchParams;
      
      const normalizedType = {
        loans: 'LOAN',
        loan: 'LOAN',
        policies: 'SUPPORT',
        support: 'SUPPORT'
      }[type.toLowerCase()] || type.toUpperCase();

      const params = new URLSearchParams({
        page: page || 0,
        size: size || 9,
        sort: sort || 'createdAt,desc'
      });

      if (keyword) params.append('keyword', keyword);
      if (company) params.append('company', company);
      
      const url = `/api/posts/type/${normalizedType}/search?${params.toString()}`;
      const { data } = await api.get(url);
      return data;
    } catch (error) {
      console.error(`게시물 검색 실패:`, error);
      throw error;
    }
  },

  getPostById: async (postId) => {
    try {
      const { data } = await api.get(`/api/posts/${postId}`);
      return data;
    } catch (error) {
      console.error('게시물 조회 실패:', error);
      throw error;
    }
  }
}

// 스크랩 API
export const scrapAPI = {
  toggleScrap: async (postId) => {
    try {
      const { data } = await api.post(`/api/scraps/toggle?postId=${postId}`);
      return data;
    } catch (error) {
      console.error('스크랩 토글 실패:', error);
      throw error;
    }
  }
}

// 댓글 API
export const commentAPI = {
  getCommentsByPostId: async (postId) => {
    try {
      const { data } = await api.get(`/api/comments/post/${postId}`);
      return data;
    } catch (error) {
      console.error('게시물 댓글 조회 실패:', error);
      throw error;
    }
  },

  createComment: async (commentData) => {
    try {
      const { data } = await api.post('/api/comments', commentData);
      return data;
    } catch (error) {
      console.error('댓글 생성 실패:', error);
      throw error;
    }
  },

  getCommentById: async (commentId) => {
    try {
      const { data } = await api.get(`/api/comments/${commentId}`);
      return data;
    } catch (error) {
      console.error('댓글 조회 실패:', error);
      throw error;
    }
  },

  updateComment: async (commentId, commentData) => {
    try {
      const { data } = await api.put(`/api/comments/${commentId}`, commentData);
      return data;
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      throw error;
    }
  },

  deleteComment: async (commentId) => {
    try {
      const { data } = await api.delete(`/api/comments/${commentId}`);
      return data;
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      throw error;
    }
  }
}

// 에러 메시지 유틸
export const getErrorMessage = (error) => {
  if (error.response) {
    const status = error.response.status;
    const message =
      error.response.data?.message ||
      error.response.data?.body?.message ||
      error.response.statusText;

    switch (status) {
      case 400: return `잘못된 요청입니다: ${message}`;
      case 401: return '로그인이 필요하거나 인증이 만료되었습니다.';
      case 403: return '접근 권한이 없습니다.';
      case 404: return '요청한 데이터를 찾을 수 없습니다.';
      case 422: return `입력 데이터가 올바르지 않습니다: ${message}`;
      case 500: return '서버 내부 오류가 발생했습니다.';
      default: return `서버 오류 (${status}): ${message}`;
    }
  } else if (error.request) {
    return '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
  } else {
    return error.message || '알 수 없는 오류가 발생했습니다.';
  }
}

export default { postAPI, scrapAPI, commentAPI, getErrorMessage };