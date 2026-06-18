import { useEffect } from 'react';
import Taro from '@tarojs/taro';
import { ROUTES } from '../../../utils/route';

/** Legacy subpackage entry — redirects to AI tab. */
export default function AiAssistantLegacyRedirect() {
  useEffect(() => {
    void Taro.switchTab({ url: ROUTES.AI });
  }, []);
  return null;
}
