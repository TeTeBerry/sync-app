const PBKDF2_ITERATIONS = 100_000;
const SALT = 'sync-profile-v1';

function getSubtleCrypto(): SubtleCrypto | null {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    return crypto.subtle;
  }
  return null;
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function deriveKey(secret: string): Promise<CryptoKey | null> {
  const subtle = getSubtleCrypto();
  if (!subtle) return null;

  const encoder = new TextEncoder();
  const keyMaterial = await subtle.importKey(
    'raw',
    encoder.encode(secret),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(SALT),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptJson<T>(
  secret: string,
  payload: T,
): Promise<string | null> {
  const subtle = getSubtleCrypto();
  const key = await deriveKey(secret);
  if (!subtle || !key) return null;

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const cipher = await subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

  return JSON.stringify({
    iv: toBase64(iv),
    data: toBase64(new Uint8Array(cipher)),
  });
}

export async function decryptJson<T>(
  secret: string,
  encrypted: string,
): Promise<T | null> {
  const subtle = getSubtleCrypto();
  const key = await deriveKey(secret);
  if (!subtle || !key || !encrypted.trim()) return null;

  try {
    const parsed = JSON.parse(encrypted) as { iv?: string; data?: string };
    if (!parsed.iv || !parsed.data) return null;

    const iv = fromBase64(parsed.iv);
    const data = fromBase64(parsed.data);
    const plain = await subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      data as BufferSource,
    );
    return JSON.parse(new TextDecoder().decode(plain)) as T;
  } catch {
    return null;
  }
}
