import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'zeric-owner-portal-secret-key-2026';
const secretKey = new TextEncoder().encode(JWT_SECRET);
export const SESSION_COOKIE_NAME = 'zeric_session';

/**
 * Sign session JWT token (valid for 7 days)
 */
export async function signSession(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

/**
 * Verify session JWT token
 */
export async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Attach secure HTTP-only session cookie to NextResponse
 */
export function setSessionCookie(response, token) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });
  return response;
}

/**
 * Clear session cookie on NextResponse (Logout)
 */
export function clearSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}

/**
 * Read and verify session from request cookies
 */
export async function getSessionFromRequest(request) {
  let token = null;
  if (request.cookies?.get) {
    token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  }
  if (!token && request.headers?.get) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  if (!token) return null;
  return await verifySession(token);
}
