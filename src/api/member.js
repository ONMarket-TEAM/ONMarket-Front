import api from '@/api';

const BASE_URL = '/api/members/me';

export default {
  // 1. 현재 회원정보 조회
  async getMemberInfo() {
    try {
      const { data } = await api.get(`${BASE_URL}`);
      return data?.body?.data ?? data?.body ?? data;
    } catch (error) {
      throw error;
    }
  },

  // 2. 현재 비밀번호 일치 여부 확인 (회원정보 변경 인증용)
  async verifyPassword(currentPassword) {
    try {
      const { data } = await api.post(`${BASE_URL}/password/verify`, { currentPassword });
      return data?.body?.data ?? data?.body ?? data;
    } catch (error) {
      throw error;
    }
  },

  // 3. 회원정보 변경 (닉네임/비밀번호)
  async updateMember(payload) {
    try {
      const { data } = await api.patch(`${BASE_URL}`, payload);
      return data?.body?.data ?? data?.body ?? data;
    } catch (error) {
      throw error;
    }
  },

  // 4. 프로필 이미지 업로드용 presigned URL 발급
  async getProfileImagePresignUrl(filename, contentType) {
    try {
      const { data } = await api.post(`${BASE_URL}/profile-image/presign`, {
        filename,
        contentType,
      });
      return data?.body?.data ?? data?.body ?? data;
    } catch (error) {
      throw error;
    }
  },

  // 5. S3에 이미지 직접 업로드
  async uploadImageToS3(presignedUrl, file, contentType) {
    try {
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': contentType,
        },
      });

      if (!response.ok) {
        throw new Error(`S3 업로드 실패: ${response.status}`);
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 6. 프로필 이미지 업로드 확정
  async confirmProfileImage(key) {
    try {
      const { data } = await api.post(`${BASE_URL}/profile-image/confirm`, { key });
      return data?.body?.data ?? data?.body ?? data;
    } catch (error) {
      throw error;
    }
  },

  // 7. 현재 프로필 이미지 조회
  async getCurrentProfileImage() {
    try {
      const { data } = await api.get(`${BASE_URL}/profile-image`);
      return data?.body?.data ?? data?.body ?? data;
    } catch (error) {
      throw error;
    }
  },

  // 8. 프로필 이미지 삭제 (기본 이미지로 변경)
  async deleteProfileImage() {
    try {
      const { data } = await api.delete(`${BASE_URL}/profile-image`);
      return data?.body?.data ?? data?.body ?? data;
    } catch (error) {
      throw error;
    }
  },
};

