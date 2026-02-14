import ky from 'ky';

export function getShieldUrl(): string {
  return localStorage.getItem('shield_url') || 'http://192.168.4.66:8787';
}

export function createApi() {
  return ky.create({
    prefixUrl: getShieldUrl(),
    hooks: {
      beforeRequest: [
        (request) => {
          const apiKey = localStorage.getItem('shield_api_key');
          if (apiKey) {
            request.headers.set('Authorization', `Bearer ${apiKey}`);
          }
        },
      ],
    },
    timeout: 30000,
    retry: { limit: 2, methods: ['get'] },
  });
}

export let api = createApi();

export function refreshApi() {
  api = createApi();
}
