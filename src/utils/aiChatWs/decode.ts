/** WeChat miniprogram often delivers WebSocket frames as ArrayBuffer, not string. */
export function decodeWsMessageData(raw: unknown): string | null {
  if (typeof raw === 'string') return raw;
  if (ArrayBuffer.isView(raw)) {
    return decodeWsMessageData(
      raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength),
    );
  }
  if (raw instanceof ArrayBuffer) {
    try {
      return new TextDecoder('utf-8').decode(raw);
    } catch {
      const bytes = new Uint8Array(raw);
      let latin1 = '';
      for (let i = 0; i < bytes.length; i += 1) {
        latin1 += String.fromCharCode(bytes[i]);
      }
      try {
        return decodeURIComponent(escape(latin1));
      } catch {
        return latin1;
      }
    }
  }
  if (raw !== null && typeof raw === 'object') {
    try {
      return JSON.stringify(raw);
    } catch {
      return null;
    }
  }
  return null;
}
