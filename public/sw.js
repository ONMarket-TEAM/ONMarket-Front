// 서비스 워커 버전 (캐시 무효화용)
const SW_VERSION = 'notification-sw-v5';

// 설치
self.addEventListener('install', (event) => {
  console.log('[SW] 설치됨');
  self.skipWaiting(); // 즉시 활성화
});

// 활성화
self.addEventListener('activate', (event) => {
  console.log('[SW] 활성화됨');
  event.waitUntil(self.clients.claim()); // 모든 클라이언트 제어
});

/**
 * 푸시 수신
 * 백엔드 PushNotificationService에서 보내는 payload:
 * {
 *   "title": "알림 제목",
 *   "body": "알림 내용",
 *   "icon": "/icons/notification-icon.png",
 *   "url": "/"
 * }
 */
self.addEventListener('push', (event) => {
  console.log('=== [SW] 푸시 수신 ===', { hasData: !!event.data });

  let data = {};

  if (event.data) {
    try {
      // 백엔드에서 JSON으로 전송하므로 직접 파싱 시도
      data = event.data.json();
      console.log('[SW] JSON 직접 파싱 성공:', data);
    } catch (jsonError) {
      console.log('[SW] JSON 직접 파싱 실패:', jsonError.message);

      try {
        // 방법 2: text()로 시도
        const textData = event.data.text();
        console.log('[SW] 텍스트 데이터:', textData);

        if (textData) {
          try {
            data = JSON.parse(textData);
            console.log('[SW] 텍스트→JSON 파싱 성공:', data);
          } catch (textJsonError) {
            console.log('[SW] 텍스트→JSON 파싱 실패:', textJsonError.message);
            data = { title: '새 알림', body: textData };
          }
        }
      } catch (textError) {
        console.log('[SW] 텍스트 파싱도 실패:', textError.message);

        try {
          // 방법 3: arrayBuffer() 시도 (암호화 데이터인 경우)
          const buffer = event.data.arrayBuffer();
          console.log('[SW] ArrayBuffer 길이:', buffer.byteLength);

          // UTF-8 디코딩 시도
          const decoder = new TextDecoder('utf-8');
          const decodedText = decoder.decode(buffer);
          console.log('[SW] 디코딩된 텍스트:', decodedText);

          if (decodedText) {
            try {
              data = JSON.parse(decodedText);
            } catch {
              data = { title: '새 알림', body: decodedText };
            }
          }
        } catch (bufferError) {
          console.error('[SW] 모든 파싱 방법 실패:', bufferError);
          data = { title: '새 알림', body: '새로운 메시지가 있습니다.' };
        }
      }
    }
  } else {
    data = { title: '새 알림', body: '새로운 메시지가 있습니다.' };
  }

  console.log('[SW] 최종 파싱된 데이터:', data);

  // 백엔드 payload 구조에 맞춘 알림 표시
  const title = data.title || '새로운 알림';
  const options = {
    body: data.body || '새로운 메시지가 있습니다.',
    icon: data.icon || '/favicon.ico',
    badge: '/favicon.ico',
    image: data.image,
    tag: data.tag || `onmarket-${Date.now()}`,
    renotify: true,
    requireInteraction: false,
    silent: false,
    data: {
      url: data.url || '/notifications', // Vue 라우터 경로로 수정
      timestamp: Date.now(),
      // 백엔드에서 추가 데이터가 있다면 포함
      ...(data.data || {}),
    },
  };

  event.waitUntil(
    self.registration
      .showNotification(title, options)
      .then(() => console.log('✅ [SW] 알림 표시 성공'))
      .catch((error) => console.error('❌ [SW] 알림 표시 실패:', error))
  );
});

/**
 * 알림 클릭
 */
self.addEventListener('notificationclick', (event) => {
  console.log('=== [SW] 알림 클릭됨 ===', { action: event.action });
  event.notification.close();

  const clickAction = event.action || 'default';
  const ndata = event.notification.data || {};
  if (clickAction === 'close') return;

  // Vue 라우터를 고려한 URL 처리
  const targetUrl = ndata.url || '/notifications';
  const fullUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    (async () => {
      try {
        const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true });

        // 이미 열린 동일 URL 창이 있으면 포커스
        for (const w of windows) {
          if (w.url === fullUrl && 'focus' in w) {
            await w.focus();
            w.postMessage({ type: 'NOTIFICATION_CLICKED', action: clickAction, data: ndata });
            return;
          }
        }

        // 첫 창이 있으면 그 창을 포커스 후 필요 시 navigate
        if (windows.length > 0) {
          const w = windows[0];
          if ('focus' in w) await w.focus();
          if ('navigate' in w && w.url !== fullUrl) {
            await w.navigate(fullUrl);
          }
          w.postMessage({ type: 'NOTIFICATION_CLICKED', action: clickAction, data: ndata });
          return;
        }

        // 창이 없으면 새 창
        if (clients.openWindow) {
          await clients.openWindow(fullUrl);
        }
      } catch (err) {
        console.error('[SW] 알림 클릭 처리 실패:', err);
      }
    })()
  );
});

/**
 * 알림 닫힘
 */
self.addEventListener('notificationclose', async (event) => {
  console.log('=== [SW] 알림 닫힘 ===');
  const ndata = event.notification && event.notification.data ? event.notification.data : {};
  const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  clientList.forEach((c) => c.postMessage({ type: 'NOTIFICATION_CLOSED', data: ndata }));
});

/**
 * 백그라운드 동기화 (선택)
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] 백그라운드 동기화:', event.tag);
  if (event.tag === 'background-sync') {
    event.waitUntil(
      fetch('/api/sync')
        .then((r) => r.json())
        .then((d) => console.log('[SW] 동기화 완료:', d))
        .catch((e) => console.error('[SW] 동기화 실패:', e))
    );
  }
});

/**
 * 메인 스레드 → SW 메시지
 */
self.addEventListener('message', (event) => {
  console.log('[SW] 메시지 수신:', event.data);
  switch (event.data && event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'GET_VERSION':
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ version: SW_VERSION });
      }
      break;

    case 'TEST_NOTIFICATION':
      event.waitUntil(
        self.registration.showNotification('서비스 워커 테스트', {
          body: '백엔드 연동 테스트 알림입니다.',
          icon: '/favicon.ico',
          tag: `test-sw-${Date.now()}`,
          data: { url: '/notifications', test: true, timestamp: Date.now() },
          renotify: true,
        })
      );
      break;

    default:
      console.log('[SW] 알 수 없는 메시지 타입');
  }
});

/**
 * 구독 변경 (브라우저가 토큰을 바꿨을 때)
 */
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] pushsubscriptionchange 발생', event);
  event.waitUntil(
    (async () => {
      const clis = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      clis.forEach((c) => c.postMessage({ type: 'PUSH_SUBSCRIPTION_CHANGE' }));
    })()
  );
});

/** 에러 로깅 */
self.addEventListener('error', (event) => {
  console.error('[SW] 에러:', event.error);
});
self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled rejection:', event.reason);
});

console.log('[SW] 스크립트 로드됨 - 버전:', SW_VERSION);

