import api from '@/api';

const BASE_URL = '/api/s3';

export const s3API = {
  // 1. 업로드용 presigned URL 발급 (여러 방식 시도)
  async getPresignedPutUrl(dir, filename, contentType) {
    try {
      // 방법 1: application/x-www-form-urlencoded
      const { data } = await api.post(`${BASE_URL}/presign-put`, null, {
        params: { dir, filename, contentType },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return data?.body?.data ?? data?.body ?? data;
    } catch (error) {
      if (error.response?.status === 415) {
        try {
          // 방법 2: text/plain
          const { data } = await api.post(`${BASE_URL}/presign-put`, '', {
            params: { dir, filename, contentType },
            headers: {
              'Content-Type': 'text/plain',
            },
          });
          return data?.body?.data ?? data?.body ?? data;
        } catch (error2) {
          if (error2.response?.status === 415) {
            // 방법 3: Content-Type 없음
            const { data } = await api.post(`${BASE_URL}/presign-put`, null, {
              params: { dir, filename, contentType },
              headers: {},
            });
            return data?.body?.data ?? data?.body ?? data;
          }
          throw error2;
        }
      }
      throw error;
    }
  },

  // 2. 다운로드용 presigned URL 발급
  async getPresignedGetUrl(dir, filename) {
    const { data } = await api.get(`${BASE_URL}/presign-get`, {
      params: { dir, filename },
    });
    return data?.body?.data ?? data?.body ?? data;
  },

  // 3. 실제 S3 업로드 (PUT)
  async uploadToS3(uploadUrl, file, contentType) {
    const response = await fetch(uploadUrl, {
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
  },
};
