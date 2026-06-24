export class ApiAbortError extends Error {
  readonly status = 0;

  constructor() {
    super('aborted');
    this.name = 'ApiAbortError';
  }
}

function isRequestAbortedMessage(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  return (
    normalized.includes('abort') ||
    normalized.includes('aborted') ||
    normalized.includes('请求已取消') ||
    normalized.includes('cancel')
  );
}

function readAbortCandidateMessage(error: unknown): string | null {
  if (error instanceof Error) {
    const message = error.message.trim();
    if (message) {
      const embeddedErrMsg = message.match(/"errMsg"\s*:\s*"([^"]+)"/)?.[1];
      if (embeddedErrMsg) {
        return embeddedErrMsg;
      }
      return message;
    }
  }
  if (error && typeof error === 'object' && 'errMsg' in error) {
    const errMsg = (error as { errMsg?: unknown }).errMsg;
    if (typeof errMsg === 'string') {
      return errMsg;
    }
  }
  return null;
}

export function isApiAbortError(error: unknown): boolean {
  if (error instanceof ApiAbortError) return true;
  const message = readAbortCandidateMessage(error);
  return message != null && isRequestAbortedMessage(message);
}

export function toApiAbortErrorIfNeeded(error: unknown): unknown {
  return isApiAbortError(error) ? new ApiAbortError() : error;
}
