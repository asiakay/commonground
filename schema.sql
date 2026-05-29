-- CommonGround Platform Schema
-- A two-sided marketplace for community resource acquisition

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('organizer', 'investor', 'resident', 'admin')),
  org_name TEXT,
  bio TEXT,
  location TEXT,
  verified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('land', 'funding', 'tools', 'power', 'housing', 'energy', 'food')),
  status TEXT DEFAULT 'active' CHECK(status IN ('draft', 'active', 'funded', 'closed')),
  funding_goal REAL DEFAULT 0,
  funding_raised REAL DEFAULT 0,
  contributor_count INTEGER DEFAULT 0,
  qf_match_pool REAL DEFAULT 0,
  location TEXT,
  image_url TEXT,
  tags TEXT, -- JSON array as string
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id),
  owner_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK(type IN ('funding', 'land', 'tools', 'expertise', 'space', 'technology')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity TEXT,
  value REAL,
  available INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contributions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  contributor_id TEXT NOT NULL REFERENCES users(id),
  amount REAL NOT NULL,
  resource_id TEXT REFERENCES resources(id),
  note TEXT,
  transaction_type TEXT DEFAULT 'direct' CHECK(transaction_type IN ('direct', 'qf_match', 'resource')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  investor_id TEXT NOT NULL REFERENCES users(id),
  match_type TEXT NOT NULL CHECK(match_type IN ('qf', 'direct', 'in_kind')),
  amount REAL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined', 'completed')),
  message TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS needs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT DEFAULT 'normal' CHECK(urgency IN ('low', 'normal', 'high', 'critical')),
  fulfilled INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Seed demo data
INSERT OR IGNORE INTO users VALUES
  ('u1', 'asia@solarroot.org', 'Asia Grady', 'organizer', 'Solar Roots Co-op', 'Cooperative economist and civic technologist building community-owned energy infrastructure in Boston.', 'Jamaica Plain, Boston', 1, datetime('now')),
  ('u2', 'rufus@community.org', 'Rufus Faulk', 'organizer', 'JP Community Land Trust', 'Community organizer focused on housing sovereignty and land justice in Jamaica Plain.', 'Jamaica Plain, Boston', 1, datetime('now')),
  ('u3', 'invest@impactfund.org', 'Impact Capital Fund', 'investor', 'Impact Capital Fund', 'Community-first impact investment fund focused on cooperative infrastructure in New England.', 'Boston, MA', 1, datetime('now')),
  ('u4', 'member@jp.org', 'Marcus Webb', 'resident', NULL, 'JP resident and solar workforce trainee.', 'Jamaica Plain, Boston', 0, datetime('now'));

INSERT OR IGNORE INTO projects VALUES
  ('p1', 'u1', 'Solar Roots Community Energy Hub', 'solar-roots-energy-hub', 'Building a community-owned solar installation and workforce training center in Jamaica Plain. This project will train 40 residents in solar installation, create cooperative ownership of energy assets, and reduce energy burden for 200 households.', 'energy', 'active', 85000, 34200, 47, 12400, 'Jamaica Plain, Boston', NULL, '["solar","cooperative","workforce","energy justice"]', datetime('now'), datetime('now')),
  ('p2', 'u2', 'JP Community Land Trust Expansion', 'jp-land-trust-expansion', 'Acquiring and converting 3 vacant parcels in Jamaica Plain into permanently affordable cooperative housing. Community land trust model ensures these homes stay affordable for generations.', 'land', 'active', 250000, 87500, 23, 31200, 'Jamaica Plain, Boston', NULL, '["housing","land trust","cooperative","affordability"]', datetime('now'), datetime('now')),
  ('p3', 'u1', 'Front Porch Tech Commons', 'front-porch-tech-commons', 'A shared technology infrastructure cooperative for Boston-based community organizations — shared hosting, tools, and technical support owned by the orgs that use it.', 'tools', 'active', 45000, 12800, 31, 8900, 'Boston, MA', NULL, '["technology","cooperative","infrastructure","civic tech"]', datetime('now'), datetime('now'));

INSERT OR IGNORE INTO needs VALUES
  ('n1', 'p1', 'funding', 'Solar panel procurement — need $50K to reach bulk pricing threshold', 'high', 0, datetime('now')),
  ('n2', 'p1', 'expertise', 'Licensed electrician to supervise installation training sessions', 'high', 0, datetime('now')),
  ('n3', 'p2', 'funding', 'Down payment assistance for first parcel acquisition', 'critical', 0, datetime('now')),
  ('n4', 'p3', 'tools', 'Server infrastructure and managed hosting setup', 'normal', 0, datetime('now'));

INSERT OR IGNORE INTO resources VALUES
  ('r1', NULL, 'u3', 'funding', 'Impact Investment Pool Q2 2026', 'Patient capital available for cooperative infrastructure projects in Greater Boston. 0% interest, 7-year repayment.', '$25K–$150K per project', 150000, 1, datetime('now')),
  ('r2', NULL, 'u3', 'expertise', 'Legal & Compliance Support', 'Pro bono cooperative law and compliance guidance for emerging co-ops.', 'Up to 40 hrs/project', NULL, 1, datetime('now'));
