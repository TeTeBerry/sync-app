import { LoginInterceptSheet } from './LoginInterceptSheet';
import { PhoneLoginModal } from '../PhoneLoginModal';

/**
 * Mount on tab/stack pages that call `requireAuth`.
 * H5 renders PhoneLoginModal; WeChat renders LoginInterceptSheet.
 */
export function LoginInterceptHost() {
  if (process.env.TARO_ENV === 'h5') {
    return <PhoneLoginModal />;
  }
  return <LoginInterceptSheet />;
}
