const ACCESS_TOKEN_KEY = 'sentra_access_token';

export const getAccessToken = (): string | null =>
  window.sessionStorage.getItem(ACCESS_TOKEN_KEY);

export const setAccessToken = (token: string): void => {
  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const clearAccessToken = (): void => {
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
};
