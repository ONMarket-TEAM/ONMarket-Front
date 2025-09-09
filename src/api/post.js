import api from './index'

// Post API
export const postAPI = {
  // 타입별 게시물 목록 조회
  getPostsByType: async (type) => {
    try {
      // type 변환 (백엔드 ENUM 기준)
      const normalizedType = {
        loans: 'LOAN',
        loan: 'LOAN',
        policies: 'SUPPORT',
        support: 'SUPPORT'
      }[type.toLowerCase()] || type.toUpperCase()

      const { data } = await api.get(`/api/posts/type/${normalizedType}`)
      return data
    } catch (error) {
      console.error(`게시물 목록 조회 실패 (${type}):`, error)
      throw error
    }
  },

  // 특정 게시물 조회
  getPostById: async (postId) => {
    try {
      const { data } = await api.get(`/api/posts/${postId}`)
      return data
    } catch (error) {
      console.error('게시물 조회 실패:', error)
      throw error
    }
  }
}

// 스크랩 API
export const scrapAPI = {
  toggleScrap: async (postId) => {
    try {
      // 백엔드가 @RequestParam을 사용하므로 쿼리 파라미터로 전송
      const { data } = await api.post(`/api/scraps/toggle?postId=${postId}`)
      return data
    } catch (error) {
      console.error('스크랩 토글 실패:', error)
      throw error
    }
  }
}

// 댓글 API
export const commentAPI = {
  // 게시물별 댓글 목록 조회
  getCommentsByPostId: async (postId) => {
    try {
      const { data } = await api.get(`/api/comments/post/${postId}`)
      return data
    } catch (error) {
      console.error('게시물 댓글 조회 실패:', error)
      throw error
    }
  },

  createComment: async (commentData) => {
    try {
      const { data } = await api.post('/api/comments', commentData)
      return data
    } catch (error) {
      console.error('댓글 생성 실패:', error)
      throw error
    }
  },

  getCommentById: async (commentId) => {
    try {
      const { data } = await api.get(`/api/comments/${commentId}`)
      return data
    } catch (error) {
      console.error('댓글 조회 실패:', error)
      throw error
    }
  },

  updateComment: async (commentId, commentData) => {
    try {
      const { data } = await api.put(`/api/comments/${commentId}`, commentData)
      return data
    } catch (error) {
      console.error('댓글 수정 실패:', error)
      throw error
    }
  },

  deleteComment: async (commentId) => {
    try {
      const { data } = await api.delete(`/api/comments/${commentId}`)
      return data
    } catch (error) {
      console.error('댓글 삭제 실패:', error)
      throw error
    }
  }
}

// 에러 메시지 유틸
export const getErrorMessage = (error) => {
  if (error.response) {
    const status = error.response.status
    const message =
      error.response.data?.message ||
      error.response.data?.body?.message ||
      error.response.statusText

    switch (status) {
      case 400: return `잘못된 요청입니다: ${message}`
      case 401: return '로그인이 필요합니다.'
      case 403: return '접근 권한이 없습니다.'
      case 404: return '요청한 데이터를 찾을 수 없습니다.'
      case 422: return `입력 데이터가 올바르지 않습니다: ${message}`
      case 500: return '서버 내부 오류가 발생했습니다.'
      default: return `서버 오류 (${status}): ${message}`
    }
  } else if (error.request) {
    return '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.'
  } else {
    return error.message || '알 수 없는 오류가 발생했습니다.'
  }
}

export default { postAPI, scrapAPI, commentAPI, getErrorMessage }
