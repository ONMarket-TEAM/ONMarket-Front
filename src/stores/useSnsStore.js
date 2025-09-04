// stores/userSnsStore.js
import { defineStore } from 'pinia';
import { snsAPI } from '@/api/social';

export const useSnsStore = defineStore('sns', {
  state: () => ({
    instagram: {
      connected: false,
      username: null,
    },
    kakao: {
      connected: false,
      nickname: null,
    },
  }),
  actions: {
    // Instagram
    async fetchInstagramStatus() {
      const res = await snsAPI.getInstagramStatus();
      if (res.success) {
        this.instagram.connected = res.data.connected;
        this.instagram.username = res.data.username;
      } else {
        this.instagram.connected = false;
        this.instagram.username = null;
      }
    },
    async loginInstagram({ username, password }) {
      try {
        const res = await snsAPI.loginInstagram({ username, password });
        if (res.success) {
          this.instagram.connected = true;
          this.instagram.username = res.data;
          return res;
        } else {
          return res;
        }
      } catch (error) {
        return {
          success: false,
          message: error.message || 'Instagram 로그인 실패',
        };
      }
    },
    async logoutInstagram() {
      const res = await snsAPI.logoutInstagram();
      if (res.success) {
        this.instagram.connected = false;
        this.instagram.username = null;
      } else {
        throw new Error(res.message || 'Instagram 로그아웃 실패');
      }
    },
  },
});
