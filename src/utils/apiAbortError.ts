export class ApiAbortError extends Error {
  readonly status = 0;

  constructor() {
    super('aborted');
    this.name = 'ApiAbortError';
  }
}

export function isApiAbortError(error: unknown): boolean {
  return error instanceof ApiAbortError;
}
