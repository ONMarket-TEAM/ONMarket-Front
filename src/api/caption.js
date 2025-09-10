export async function getImageViewUrl(s3Key, onError, ttlSec = 180) {
  try {
    const response = await fetch(`/api/captions/presign-view?key=${encodeURIComponent(s3Key)}&ttl=${ttlSec}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    const json = await response.json();
    if (!response.ok || !json.body?.data) {
      throw new Error('View URL 요청 실패');
    }
    return json.body.data.url;
  } catch (error) {
    onError?.('이미지 미리보기를 불러오는 데 실패했습니다.');
    return null;
  }
}

// 단일 파일 업로드
export async function uploadSingleFile(file, onError) {
  try {
    if (!/image\/(jpeg|png)/.test(file.type)) {
      throw new Error('JPG, PNG만 업로드할 수 있어요.');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('최대 10MB까지 업로드할 수 있어요.');
    }

    const sanitizeFilename = (name) => name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100);
    const normalizeContentType = (type) =>
      type.includes('jpeg') || type.includes('jpg')
        ? 'image/jpeg'
        : type.includes('png')
        ? 'image/png'
        : 'image/jpeg';

    const filename = sanitizeFilename(file.name);
    const contentType = normalizeContentType(file.type);

    const response = await fetch('/api/captions/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ filename, contentType }),
    });

    const presignJson = await response.json();
    if (!response.ok || !presignJson.body?.data) {
      throw new Error('presigned URL 요청 실패');
    }

    const presignData = presignJson.body.data;

    const uploadResponse = await fetch(presignData.url, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: file,
    });
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`S3 업로드 실패: ${uploadResponse.status} - ${errorText}`);
    }

    return presignData.key;
  } catch (error) {
    onError?.(error.message || '파일 업로드 중 오류가 발생했습니다.');
    return null;
  }
}

// S3 이미지 삭제
export async function deleteImageFromS3(s3Key, onError, onInfo) {
  try {
    const response = await fetch(`/api/captions/delete?key=${encodeURIComponent(s3Key)}`, {
      method: 'DELETE',
    });
    const json = await response.json();
    if (!response.ok || json.header?.status !== 200) {
      throw new Error('S3 파일 삭제 실패');
    }
    onInfo?.('S3에서 이미지가 성공적으로 삭제되었습니다.');
  } catch (error) {
    onError?.('S3 이미지 삭제 중 오류가 발생했어요.');
  }
}

// AI 캡션 생성
export async function generateCaptionFromS3(s3Keys, prompt, onError) {
  try {
    const response = await fetch('/api/captions/generate-from-multiple-s3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ s3Keys, prompt }),
    });

    const json = await response.json();
    if (!response.ok || !json.body?.data) {
      throw new Error(json.header?.message || '캡션 생성 요청 실패');
    }
    return json.body.data;
  } catch (error) {
    onError?.(error.message || '캡션 생성 중 문제가 발생했어요.');
    return {};
  }
}
