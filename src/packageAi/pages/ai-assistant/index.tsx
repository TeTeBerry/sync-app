import { useEffect } from 'react';
import { ROUTES, switchTabTo } from '../../../utils/route';

/** Legacy subpackage route — forwards to the AI tab. */
export default function AiAssistantRedirect() {
  useEffect(() => {
    switchTabTo(ROUTES.AI);
  }, []);

  return null;
}
