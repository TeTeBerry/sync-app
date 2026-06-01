import { LoginInterceptSheet } from './LoginInterceptSheet';

/**
 * Mount on tab/stack pages that call `requireAuth`. WeChat renders the active page
 * above App-level siblings, so a sheet only in `app.tsx` may not appear on the home tab.
 */
export function LoginInterceptHost() {
  return <LoginInterceptSheet />;
}
