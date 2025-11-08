// Simple AES-GCM encryption helpers for storing sensitive registration data
// NOTE: For true security, server-side encryption is recommended.

async function importKeyFromSecret(secret, salt) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

function bufToBase64(buf) {
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function base64ToBuf(b64) {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

export async function encryptJSON(obj, secret) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await importKeyFromSecret(secret, salt)
  const data = new TextEncoder().encode(JSON.stringify(obj))
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)
  return {
    iv: bufToBase64(iv.buffer),
    salt: bufToBase64(salt.buffer),
    cipher: bufToBase64(cipher),
  }
}

export async function decryptJSON(payload, secret) {
  const iv = new Uint8Array(base64ToBuf(payload.iv))
  const salt = new Uint8Array(base64ToBuf(payload.salt))
  const key = await importKeyFromSecret(secret, salt)
  const cipherBuf = base64ToBuf(payload.cipher)
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBuf)
  const text = new TextDecoder().decode(plain)
  return JSON.parse(text)
}