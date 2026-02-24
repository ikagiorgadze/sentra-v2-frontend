const ACCESS_TOKEN_KEY = 'sentra_access_token';

export const getAccessToken = (): string | null =>
  window.localStorage.getItem(ACCESS_TOKEN_KEY) ?? window.sessionStorage.getItem(ACCESS_TOKEN_KEY);

export const setAccessToken = (token: string): void => {
  // Persist across reloads and browser restarts.
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  // Keep sessionStorage in sync for backward compatibility.
  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const clearAccessToken = (): void => {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
};
