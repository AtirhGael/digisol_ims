/**
 * NavigationService
 * =================
 * Provides a module-level navigate function that can be used OUTSIDE of React
 * components (e.g. in Axios interceptors or plain utility functions).
 *
 * Usage:
 *   1. In App.tsx (or the root component), call `setNavigate(navigate)` once
 *      inside a useEffect so the service has access to React Router's navigate.
 *   2. In any non-React context (axios interceptors, etc.), call
 *      `navigationService.navigateTo('/some/path')` instead of
 *      `window.location.href = '/some/path'`.
 *
 * This ensures all navigations stay within the SPA — no full-page reloads.
 */

type NavigateFn = (path: string, options?: { replace?: boolean }) => void;

let _navigate: NavigateFn | null = null;

export const setNavigate = (fn: NavigateFn): void => {
  _navigate = fn;
};

export const navigationService = {
  navigateTo(path: string, replace = false): void {
    if (_navigate) {
      _navigate(path, { replace });
    } else {
      // Fallback only if React Router hasn't been initialised yet
      // (e.g. during SSR or very early boot). Uses assign() so the
      // history entry is kept rather than silently replacing it.
      window.location.assign(path);
    }
  },
};
