const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function err(msg, status = 400) {
  return json({ error: msg }, status);
}

function uid() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 12);
}

async function verifySession(request, env) {
  if (!env.JWT_SECRET) return null;
  const header = request.headers.get('Cookie') || '';
  const m = header.match(/(?:^|;\s*)cg_session=([^;]*)/);
  if (!m) return null;
  const token = decodeURIComponent(m[1]);
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const enc = new TextEncoder();
    const dec = new TextDecoder();
    const b64d = s => {
      s = s.replace(/-/g, '+').replace(/_/g, '/');
      while (s.length % 4) s += '=';
      return Uint8Array.from(atob(s), c => c.charCodeAt(0));
    };
    const key = await crypto.subtle.importKey('raw', enc.encode(env.JWT_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify('HMAC', key, b64d(parts[2]), enc.encode(`${parts[0]}.${parts[1]}`));
    if (!ok) return null;
    const payload = JSON.parse(dec.decode(b64d(parts[1])));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch { return null; }
}

async function router(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '');
  const method = request.method;

  if (method === 'OPTIONS') return new Response(null, { headers: CORS });

  if (method === 'GET' && path === '/api/stats') {
    const [projects, raised, contributors, users, resources] = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) as n FROM projects WHERE status = ?').bind('active').first(),
      env.DB.prepare('SELECT SUM(funding_raised) as n FROM projects').first(),
      env.DB.prepare('SELECT SUM(contributor_count) as n FROM projects').first(),
      env.DB.prepare('SELECT COUNT(*) as n FROM users').first(),
      env.DB.prepare('SELECT COUNT(*) as n FROM resources WHERE available = 1').first(),
    ]);
    return json({
      active_projects: projects.n,
      total_raised: raised.n || 0,
      total_contributors: contributors.n || 0,
      registered_users: users.n,
      available_resources: resources.n,
    });
  }

  if (method === 'GET' && path === '/api/projects') {
    const category = url.searchParams.get('category');
    const query = category
      ? 'SELECT p.*, u.name as owner_name, u.org_name as owner_org FROM projects p JOIN users u ON p.owner_id = u.id WHERE p.category = ? ORDER BY p.created_at DESC'
      : 'SELECT p.*, u.name as owner_name, u.org_name as owner_org FROM projects p JOIN users u ON p.owner_id = u.id ORDER BY p.created_at DESC';
    const { results } = category
      ? await env.DB.prepare(query).bind(category).all()
      : await env.DB.prepare(query).all();
    results.forEach(p => { try { p.tags = JSON.parse(p.tags); } catch { p.tags = []; } });
    return json(results);
  }

  if (method === 'POST' && path === '/api/projects') {
    const body = await request.json();
    const { title, description, category, funding_goal, location, owner_id } = body;
    if (!title || !description || !category || !owner_id) return err('Missing required fields');
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + uid();
    const id = uid();
    await env.DB.prepare(
      'INSERT INTO projects (id, owner_id, title, slug, description, category, funding_goal, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, owner_id, title, slug, description, category, funding_goal || 0, location || null).run();
    const project = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();
    return json(project, 201);
  }

  const projectMatch = path.match(/^\/api\/projects\/([^/]+)$/);
  if (method === 'GET' && projectMatch) {
    const id = projectMatch[1];
    const project = await env.DB.prepare(
      'SELECT p.*, u.name as owner_name, u.org_name as owner_org FROM projects p JOIN users u ON p.owner_id = u.id WHERE p.id = ? OR p.slug = ?'
    ).bind(id, id).first();
    if (!project) return err('Not found', 404);
    try { project.tags = JSON.parse(project.tags); } catch { project.tags = []; }
    const { results: needs } = await env.DB.prepare('SELECT * FROM needs WHERE project_id = ?').bind(project.id).all();
    project.needs = needs;
    return json(project);
  }

  const needsMatch = path.match(/^\/api\/projects\/([^/]+)\/needs$/);
  if (method === 'GET' && needsMatch) {
    const { results } = await env.DB.prepare('SELECT * FROM needs WHERE project_id = ?').bind(needsMatch[1]).all();
    return json(results);
  }
  if (method === 'POST' && needsMatch) {
    const project_id = needsMatch[1];
    const body = await request.json();
    const { type, description, urgency } = body;
    if (!type || !description) return err('Missing required fields');
    const id = uid();
    await env.DB.prepare(
      'INSERT INTO needs (id, project_id, type, description, urgency) VALUES (?, ?, ?, ?, ?)'
    ).bind(id, project_id, type, description, urgency || 'normal').run();
    const need = await env.DB.prepare('SELECT * FROM needs WHERE id = ?').bind(id).first();
    return json(need, 201);
  }

  const contributeMatch = path.match(/^\/api\/projects\/([^/]+)\/contribute$/);
  if (method === 'POST' && contributeMatch) {
    const session = await verifySession(request, env);
    if (!session) return err('Unauthorized', 401);
    const project_id = contributeMatch[1];
    const body = await request.json();
    const { amount, note } = body;
    if (!amount || amount <= 0) return err('Missing required fields');
    const contributor_id = session.sub;
    const id = uid();
    await env.DB.prepare(
      'INSERT INTO contributions (id, project_id, contributor_id, amount, note) VALUES (?, ?, ?, ?, ?)'
    ).bind(id, project_id, contributor_id, amount, note || null).run();
    await env.DB.prepare(
      'UPDATE projects SET funding_raised = funding_raised + ?, contributor_count = contributor_count + 1, updated_at = datetime(\'now\') WHERE id = ?'
    ).bind(amount, project_id).run();
    return json({ id, project_id, contributor_id, amount, note }, 201);
  }

  if (method === 'GET' && path === '/api/resources') {
    const type = url.searchParams.get('type');
    const query = type
      ? 'SELECT r.*, u.name as owner_name, u.org_name as owner_org FROM resources r JOIN users u ON r.owner_id = u.id WHERE r.type = ? AND r.available = 1 ORDER BY r.created_at DESC'
      : 'SELECT r.*, u.name as owner_name, u.org_name as owner_org FROM resources r JOIN users u ON r.owner_id = u.id WHERE r.available = 1 ORDER BY r.created_at DESC';
    const { results } = type
      ? await env.DB.prepare(query).bind(type).all()
      : await env.DB.prepare(query).all();
    return json(results);
  }

  if (method === 'POST' && path === '/api/resources') {
    const body = await request.json();
    const { owner_id, type, title, description, quantity, value, project_id } = body;
    if (!owner_id || !type || !title || !description) return err('Missing required fields');
    const id = uid();
    await env.DB.prepare(
      'INSERT INTO resources (id, project_id, owner_id, type, title, description, quantity, value) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, project_id || null, owner_id, type, title, description, quantity || null, value || null).run();
    const resource = await env.DB.prepare('SELECT * FROM resources WHERE id = ?').bind(id).first();
    return json(resource, 201);
  }

  const userMatch = path.match(/^\/api\/users\/([^/]+)$/);
  if (method === 'GET' && userMatch) {
    const user = await env.DB.prepare(
      'SELECT id, email, name, role, org_name, bio, location, verified, created_at FROM users WHERE id = ?'
    ).bind(userMatch[1]).first();
    if (!user) return err('Not found', 404);
    return json(user);
  }

  if (method === 'POST' && path === '/api/users') {
    const body = await request.json();
    const { email, name, role, org_name, bio, location } = body;
    if (!email || !name || !role) return err('Missing required fields');
    const id = uid();
    await env.DB.prepare(
      'INSERT INTO users (id, email, name, role, org_name, bio, location) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, email, name, role, org_name || null, bio || null, location || null).run();
    const user = await env.DB.prepare(
      'SELECT id, email, name, role, org_name, bio, location, verified, created_at FROM users WHERE id = ?'
    ).bind(id).first();
    return json(user, 201);
  }

  return err('Not found', 404);
}

export async function onRequest(context) {
  try {
    return await router(context.request, context.env);
  } catch (e) {
    return json({ error: 'Internal server error', detail: e.message }, 500);
  }
}
