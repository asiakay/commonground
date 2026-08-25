// ── JWT helpers (Web Crypto, no dependencies) ────────────────────────────────

function b64urlEncode(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function b64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}

const enc = new TextEncoder();
const dec = new TextDecoder();

async function importHmacKey(secret) {
  return crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign', 'verify']
  );
}

async function signJWT(payload, secret) {
  const header = b64urlEncode(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body   = b64urlEncode(enc.encode(JSON.stringify(payload)));
  const key    = await importHmacKey(secret);
  const sig    = await crypto.subtle.sign('HMAC', key, enc.encode(`${header}.${body}`));
  return `${header}.${body}.${b64urlEncode(sig)}`;
}

async function verifyJWT(token, secret) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const key   = await importHmacKey(secret);
    const valid = await crypto.subtle.verify(
      'HMAC', key,
      b64urlDecode(parts[2]),
      enc.encode(`${parts[0]}.${parts[1]}`)
    );
    if (!valid) return null;
    const payload = JSON.parse(dec.decode(b64urlDecode(parts[1])));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Cookie helpers ───────────────────────────────────────────────────────────

const COOKIE_NAME = 'cg_session';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

function getCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  const m = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function sessionCookie(token) {
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}; Path=/`;
}

function clearCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/`;
}

// ── JSON response helper ─────────────────────────────────────────────────────

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

// ── Main handler ─────────────────────────────────────────────────────────────

export async function onRequest({ request, env }) {
  const url  = new URL(request.url);
  const path = url.pathname;

  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET, DB } = env;
  const REDIRECT_URI = `${url.origin}/auth/callback`;

  // GET /auth/login — redirect to Google consent screen
  if (path === '/auth/login' && request.method === 'GET') {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return new Response(
        'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Cloudflare Pages → Settings → Environment Variables.',
        { status: 503, headers: { 'Content-Type': 'text/plain' } }
      );
    }
    const params = new URLSearchParams({
      client_id:     GOOGLE_CLIENT_ID,
      redirect_uri:  REDIRECT_URI,
      response_type: 'code',
      scope:         'openid email profile',
      state:         crypto.randomUUID(),
      access_type:   'online',
    });
    return Response.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params}`, 302
    );
  }

  // GET /auth/callback — exchange code, upsert user, set cookie
  if (path === '/auth/callback' && request.method === 'GET') {
    const code = url.searchParams.get('code');
    if (!code) return new Response('Missing code', { status: 400 });

    // Exchange code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri:  REDIRECT_URI,
        grant_type:    'authorization_code',
      }),
    });
    if (!tokenRes.ok) return new Response('Token exchange failed', { status: 502 });
    const { access_token } = await tokenRes.json();

    // Fetch Google user profile
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!profileRes.ok) return new Response('Failed to fetch Google profile', { status: 502 });
    const gUser = await profileRes.json();

    // Upsert user in D1 — match on google_id first, then email
    const { results } = await DB.prepare(
      'SELECT id, email, name, role, org_name, bio, location, avatar_url, verified FROM users WHERE google_id = ? OR email = ? LIMIT 1'
    ).bind(gUser.id, gUser.email).all();

    let user;
    if (results.length > 0) {
      user = results[0];
      await DB.prepare(
        'UPDATE users SET google_id = ?, avatar_url = ? WHERE id = ?'
      ).bind(gUser.id, gUser.picture, user.id).run();
      user = { ...user, google_id: gUser.id, avatar_url: gUser.picture };
    } else {
      const newId = crypto.randomUUID();
      await DB.prepare(
        'INSERT INTO users (id, email, name, role, google_id, avatar_url) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(newId, gUser.email, gUser.name, 'resident', gUser.id, gUser.picture).run();
      user = { id: newId, email: gUser.email, name: gUser.name, role: 'resident', avatar_url: gUser.picture };
    }

    const token = await signJWT(
      { sub: user.id, email: user.email, role: user.role, exp: Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE },
      JWT_SECRET
    );

    return new Response(null, {
      status: 302,
      headers: { Location: '/', 'Set-Cookie': sessionCookie(token) },
    });
  }

  // GET /auth/me — return current user from D1
  if (path === '/auth/me' && request.method === 'GET') {
    const token   = getCookie(request, COOKIE_NAME);
    const payload = await verifyJWT(token, JWT_SECRET);
    if (!payload) return json({ user: null });

    const { results } = await DB.prepare(
      'SELECT id, email, name, role, org_name, bio, location, avatar_url, verified FROM users WHERE id = ? LIMIT 1'
    ).bind(payload.sub).all();

    return json({ user: results[0] ?? null });
  }

  // POST /auth/profile — update profile fields, reissue cookie
  if (path === '/auth/profile' && request.method === 'POST') {
    const token   = getCookie(request, COOKIE_NAME);
    const payload = await verifyJWT(token, JWT_SECRET);
    if (!payload) return json({ error: 'Unauthorized' }, 401);

    let body;
    try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

    const { name, role, org_name, bio, location } = body;
    const VALID_ROLES = ['resident', 'organizer', 'investor'];
    if (role && !VALID_ROLES.includes(role)) return json({ error: 'Invalid role' }, 400);

    await DB.prepare(
      `UPDATE users SET
         name     = COALESCE(?, name),
         role     = COALESCE(?, role),
         org_name = ?,
         bio      = ?,
         location = ?
       WHERE id = ?`
    ).bind(name ?? null, role ?? null, org_name ?? null, bio ?? null, location ?? null, payload.sub).run();

    const { results } = await DB.prepare(
      'SELECT id, email, name, role, org_name, bio, location, avatar_url, verified FROM users WHERE id = ? LIMIT 1'
    ).bind(payload.sub).all();

    const user = results[0];
    const newToken = await signJWT(
      { sub: user.id, email: user.email, role: user.role, exp: Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE },
      JWT_SECRET
    );

    return json({ user }, 200, { 'Set-Cookie': sessionCookie(newToken) });
  }

  // GET /auth/logout — clear cookie, redirect home
  if (path === '/auth/logout' && request.method === 'GET') {
    return new Response(null, {
      status: 302,
      headers: { Location: '/', 'Set-Cookie': clearCookie() },
    });
  }

  return new Response('Not Found', { status: 404 });
}
