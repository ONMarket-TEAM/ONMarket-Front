import api from '@/api';

const BASE_URL = '/api/notifications';

export default {
  // 1. 알림 목록 조회 (페이징)
  async getNotifications(page = 0, size = 20) {
    try {
      const { data } = await api.get(`${BASE_URL}?page=${page}&size=${size}`);
      return data?.body?.data ?? data?.body ?? data;
    } catch (error) {
      throw error;
    }
  },

  // 2. 알림 요약 정보 조회 (읽지 않은 개수, 구독 상태)
  async getNotificationSummary() {
    try {
      const { data } = await api.get(`${BASE_URL}/summary`);
      return data?.body?.data ?? data?.body ?? data;
    } catch (error) {
      throw error;
    }
  },

  // 3. 특정 알림 읽음 처리
  async markNotificationAsRead(notificationId) {
    try {
      const { data } = await api.patch(`${BASE_URL}/read`, { notificationId });
      return data?.body?.data ?? data?.body ?? data;
    } catch (error) {
      throw error;
    }
  },

  // 4. 모든 알림 읽음 처리
  async markAllNotificationsAsRead() {
    try {
      const { data } = await api.patch(`${BASE_URL}/read-all`);
      return data?.body?.data ?? data?.body ?? data;
    } catch (error) {
      throw error;
    }
  },

  // 5. 웹 푸시 구독
  async subscribe(subscriptionData) {
    try {
      const { data } = await api.post(`${BASE_URL}/subscribe`, subscriptionData);
      return data?.body?.data ?? data?.body ?? data;
    } catch (error) {
      throw error;
    }
  },

  // 6. 웹 푸시 구독 해제
  async unsubscribe() {
    try {
      const { data } = await api.delete(`${BASE_URL}/unsubscribe`);
      return data?.body?.data ?? data?.body ?? data;
    } catch (error) {
      throw error;
    }
  },

  // 7. 웹 푸시 구독 상태 조회
  async getSubscriptionStatus() {
    try {
      const { data } = await api.get(`${BASE_URL}/subscription-status`);
      return data?.body?.data ?? data?.body ?? data;
    } catch (error) {
      throw error;
    }
  },

  // 8. 관리자 - 마감일 알림 생성 (배치 작업)
  async createDeadlineNotifications() {
    try {
      const { data } = await api.post(`${BASE_URL}/admin/create-deadline-notifications`);
      return data?.body?.data ?? data?.body ?? data;
    } catch (error) {
      throw error;
    }
  },
};

