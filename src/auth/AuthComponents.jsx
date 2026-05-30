import { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';

// ── Styles ───────────────────────────────────────────────────────────────────

const authStyle = `
  /* Login button */
  .login-btn {
    display: flex; align-items: center; gap: 0.6rem;
    background: var(--cream); color: var(--earth);
    border: none; cursor: pointer;
    font-family: var(--s); font-size: 0.85rem; font-weight: 600;
    padding: 0.45rem 1rem; border-radius: 6px;
    transition: all 0.15s; margin-left: 0.5rem;
    white-space: nowrap;
  }
  .login-btn:hover { background: var(--sand); transform: translateY(-1px); }
  .login-btn svg { flex-shrink: 0; }

  /* User menu */
  .user-menu { position: relative; margin-left: 0.5rem; }
  .user-trigger {
    display: flex; align-items: center; gap: 0.5rem;
    background: none; border: 1px solid rgba(255,255,255,0.15);
    cursor: pointer; border-radius: 6px; padding: 0.3rem 0.75rem 0.3rem 0.4rem;
    font-family: var(--s); font-size: 0.85rem; font-weight: 500;
    color: var(--cream); transition: all 0.15s;
  }
  .user-trigger:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.3); }
  .user-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    object-fit: cover; background: var(--bark);
  }
  .user-avatar-placeholder {
    width: 28px; height: 28px; border-radius: 50%;
    background: var(--bark); display: flex; align-items: center; justify-content: center;
    font-size: 0.75rem; font-weight: 600; color: var(--cream); flex-shrink: 0;
  }
  .user-dropdown {
    position: absolute; top: calc(100% + 8px); right: 0;
    background: var(--soil); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; min-width: 220px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    z-index: 200; overflow: hidden;
  }
  .user-dropdown-header {
    padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .user-dropdown-name {
    font-family: var(--r); font-size: 1rem; color: var(--white);
    margin-bottom: 0.2rem;
  }
  .user-dropdown-email { font-size: 0.75rem; color: var(--sage); }
  .user-dropdown-role {
    display: inline-block; margin-top: 0.5rem;
    font-size: 0.7rem; font-weight: 600; letter-spacing: 0.06em;
    text-transform: uppercase; color: var(--sun);
    background: rgba(232,184,75,0.12); border-radius: 4px; padding: 0.2rem 0.5rem;
  }
  .user-dropdown-action {
    display: block; width: 100%; text-align: left;
    background: none; border: none; cursor: pointer;
    font-family: var(--s); font-size: 0.85rem; font-weight: 500;
    color: var(--sand); padding: 0.75rem 1rem;
    transition: background 0.12s;
  }
  .user-dropdown-action:hover { background: rgba(255,255,255,0.06); color: var(--white); }
  .user-dropdown-action.danger { color: var(--red); }
  .user-dropdown-action.danger:hover { background: rgba(196,75,43,0.1); }
  .user-dropdown-divider { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 0; }

  /* Profile modal */
  .profile-overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 1rem;
  }
  .profile-modal {
    background: var(--soil); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px; padding: 2rem; width: 100%; max-width: 520px;
    max-height: 90vh; overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  }
  .profile-modal h2 {
    font-family: var(--r); font-size: 1.5rem; color: var(--white);
    margin-bottom: 1.75rem; letter-spacing: -0.02em;
  }
  .profile-avatar-row {
    display: flex; align-items: center; gap: 1rem; margin-bottom: 1.75rem;
  }
  .profile-avatar-lg {
    width: 56px; height: 56px; border-radius: 50%;
    object-fit: cover; background: var(--bark);
  }
  .profile-avatar-placeholder-lg {
    width: 56px; height: 56px; border-radius: 50%;
    background: var(--bark); display: flex; align-items: center; justify-content: center;
    font-size: 1.25rem; font-weight: 600; color: var(--cream);
  }
  .profile-email { font-size: 0.85rem; color: var(--sage); }

  /* Role cards */
  .role-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1.25rem; }
  .role-card {
    border: 2px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 0.875rem 0.75rem;
    cursor: pointer; text-align: center; transition: all 0.15s; background: none;
    font-family: var(--s);
  }
  .role-card:hover { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.04); }
  .role-card.selected { border-color: var(--sun); background: rgba(232,184,75,0.1); }
  .role-card-icon { font-size: 1.35rem; margin-bottom: 0.4rem; }
  .role-card-label {
    font-size: 0.78rem; font-weight: 600; color: var(--cream);
    text-transform: capitalize; letter-spacing: 0.02em;
  }
  .role-card-desc { font-size: 0.7rem; color: var(--sage); margin-top: 0.2rem; line-height: 1.4; }

  /* Profile form fields */
  .profile-field { margin-bottom: 1.1rem; }
  .profile-label {
    display: block; font-size: 0.78rem; font-weight: 600;
    color: var(--sage); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 0.4rem;
  }
  .profile-input, .profile-textarea {
    width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px; padding: 0.65rem 0.875rem; color: var(--cream);
    font-family: var(--s); font-size: 0.9rem; transition: border-color 0.15s;
  }
  .profile-input:focus, .profile-textarea:focus {
    outline: none; border-color: var(--sun);
  }
  .profile-input::placeholder, .profile-textarea::placeholder { color: var(--bark); }
  .profile-textarea { resize: vertical; min-height: 80px; }
  .profile-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
  .profile-save {
    flex: 1; background: var(--sun); color: var(--earth);
    border: none; cursor: pointer; font-family: var(--s);
    font-size: 0.9rem; font-weight: 600; padding: 0.75rem;
    border-radius: 8px; transition: all 0.15s;
  }
  .profile-save:hover:not(:disabled) { background: var(--gold); }
  .profile-save:disabled { opacity: 0.5; cursor: not-allowed; }
  .profile-cancel {
    background: none; border: 1px solid rgba(255,255,255,0.15); cursor: pointer;
    font-family: var(--s); font-size: 0.9rem; font-weight: 500; color: var(--sand);
    padding: 0.75rem 1.25rem; border-radius: 8px; transition: all 0.15s;
  }
  .profile-cancel:hover { border-color: rgba(255,255,255,0.3); color: var(--white); }
  .profile-error { color: var(--red); font-size: 0.82rem; margin-top: 0.75rem; }
`;

// ── Google "G" logo SVG ──────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

// ── LoginButton ──────────────────────────────────────────────────────────────

export function LoginButton() {
  const { login } = useAuth();
  return (
    <>
      <style>{authStyle}</style>
      <button className="login-btn" onClick={login} aria-label="Sign in with Google">
        <GoogleIcon />
        Sign in with Google
      </button>
    </>
  );
}

// ── UserMenu ─────────────────────────────────────────────────────────────────

export function UserMenu({ onEditProfile }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;
  const firstName = user.name?.split(' ')[0] ?? 'You';
  const initials  = (user.name ?? 'U').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      <style>{authStyle}</style>
      <div className="user-menu" ref={ref}>
        <button className="user-trigger" onClick={() => setOpen(v => !v)} aria-expanded={open}>
          {user.avatar_url
            ? <img className="user-avatar" src={user.avatar_url} alt={user.name} referrerPolicy="no-referrer" />
            : <div className="user-avatar-placeholder">{initials}</div>
          }
          {firstName}
        </button>

        {open && (
          <div className="user-dropdown" role="menu">
            <div className="user-dropdown-header">
              <div className="user-dropdown-name">{user.name}</div>
              <div className="user-dropdown-email">{user.email}</div>
              <span className="user-dropdown-role">{user.role}</span>
            </div>
            <button
              className="user-dropdown-action"
              role="menuitem"
              onClick={() => { setOpen(false); onEditProfile?.(); }}
            >
              Edit profile
            </button>
            <hr className="user-dropdown-divider" />
            <button
              className="user-dropdown-action danger"
              role="menuitem"
              onClick={logout}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── ProfileModal ─────────────────────────────────────────────────────────────

const ROLES = [
  { value: 'resident',   icon: '🏘️', label: 'Resident',   desc: 'Community member' },
  { value: 'organizer',  icon: '✊',  label: 'Organizer',  desc: 'Project leader' },
  { value: 'investor',   icon: '🌱',  label: 'Investor',   desc: 'Capital provider' },
];

export function ProfileModal({ onClose }) {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name:     user?.name     ?? '',
    role:     user?.role     ?? 'resident',
    org_name: user?.org_name ?? '',
    bio:      user?.bio      ?? '',
    location: user?.location ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const initials = (user?.name ?? 'U').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await updateProfile(form);
      onClose();
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{authStyle}</style>
      <div className="profile-overlay" onClick={onClose}>
        <div className="profile-modal" onClick={e => e.stopPropagation()}>
          <h2>Edit profile</h2>

          <div className="profile-avatar-row">
            {user?.avatar_url
              ? <img className="profile-avatar-lg" src={user.avatar_url} alt={user.name} referrerPolicy="no-referrer" />
              : <div className="profile-avatar-placeholder-lg">{initials}</div>
            }
            <div className="profile-email">{user?.email}</div>
          </div>

          {/* Role selector */}
          <label className="profile-label">Role</label>
          <div className="role-cards">
            {ROLES.map(r => (
              <button
                key={r.value}
                type="button"
                className={`role-card ${form.role === r.value ? 'selected' : ''}`}
                onClick={() => set('role', r.value)}
              >
                <div className="role-card-icon">{r.icon}</div>
                <div className="role-card-label">{r.label}</div>
                <div className="role-card-desc">{r.desc}</div>
              </button>
            ))}
          </div>

          <div className="profile-field">
            <label className="profile-label">Full name</label>
            <input
              className="profile-input"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="profile-field">
            <label className="profile-label">Organization</label>
            <input
              className="profile-input"
              value={form.org_name}
              onChange={e => set('org_name', e.target.value)}
              placeholder="Co-op, nonprofit, fund…"
            />
          </div>

          <div className="profile-field">
            <label className="profile-label">Bio</label>
            <textarea
              className="profile-textarea"
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              placeholder="What brings you to CommonGround?"
            />
          </div>

          <div className="profile-field">
            <label className="profile-label">Location</label>
            <input
              className="profile-input"
              value={form.location}
              onChange={e => set('location', e.target.value)}
              placeholder="e.g. Jamaica Plain, Boston"
            />
          </div>

          {error && <div className="profile-error">{error}</div>}

          <div className="profile-actions">
            <button className="profile-cancel" onClick={onClose}>Cancel</button>
            <button className="profile-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
