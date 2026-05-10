
// ── Roaster.ph DS — Patterns Section ─────────────────────────────────────────
// Navigation · Feed Card · Dashboard Layout · Toasts

const PatSectionTitle = ({ id, label, sub }) => (
  <div id={id} style={{ marginBottom: 40, paddingTop: 8 }}>
    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--acid-lime)', marginBottom: 8, textTransform: 'uppercase' }}>Patterns</div>
    <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: 18, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 8 }}>{label}</h2>
    {sub && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{sub}</p>}
    <div style={{ marginTop: 16, height: 3, background: 'var(--acid-lime)', width: 48 }}></div>
  </div>
);

// ── NAVIGATION ────────────────────────────────────────────────────────────────
function PatternNavigation() {
  const [active, setActive] = React.useState('feed');
  const navItems = [
    { id: 'feed', label: 'Feed', icon: '⚡' },
    { id: 'submit', label: 'Submit', icon: '🔥' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'community', label: 'Community', icon: '💬' },
  ];
  return (
    <section style={{ marginBottom: 80 }}>
      <PatSectionTitle id="navigation" label="Navigation" sub="Sticky topbar, 56px height. Pixel logo left, nav center, actions right. Hard border-bottom." />

      <div style={{ border: 'var(--border)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', marginBottom: 32 }}>
        {/* Topbar */}
        <div style={{
          height: 56, background: 'var(--bg-card)',
          borderBottom: 'var(--border)',
          display: 'flex', alignItems: 'center',
          padding: '0 20px', gap: 32,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="assets/roaster-logo.png" alt="Roaster.ph" style={{ height: 32, imageRendering: 'pixelated' }} />
          </div>
          {/* Nav */}
          <div style={{ display: 'flex', gap: 4, flex: 1, justifyContent: 'center' }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                style={{
                  fontFamily: 'var(--font-pixel)', fontSize: 8, letterSpacing: '0.06em',
                  padding: '8px 14px', border: 'none', background: active === item.id ? 'var(--fire-red)' : 'transparent',
                  color: active === item.id ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer', outline: active === item.id ? '2px solid var(--black)' : 'none',
                  outlineOffset: 0,
                  transition: 'all 100ms',
                }}
              >{item.icon} {item.label.toUpperCase()}</button>
            ))}
          </div>
          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, padding: '8px 14px', background: 'var(--acid-lime)', color: 'var(--black)', border: 'var(--border)', boxShadow: 'var(--shadow-xs)', cursor: 'pointer' }}>+ SUBMIT</button>
            <div style={{ width: 32, height: 32, background: 'var(--fire-red)', border: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: '#fff' }}>R</span>
            </div>
          </div>
        </div>
        {/* Breadcrumb / sub-label */}
        <div style={{ padding: '8px 20px', background: 'var(--smoke)', borderBottom: '1px solid var(--ash)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>roaster.ph</span>
          <span style={{ color: 'var(--stone)' }}>›</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-primary)', fontWeight: 700 }}>{active}</span>
        </div>
      </div>
    </section>
  );
}

// ── ROAST CARD ─────────────────────────────────────────────────────────────────
const RoastCard = ({ url, title, tags, scores, overall, votes, comments, author, timeAgo, featured }) => {
  const [upvoted, setUpvoted] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);

  const getTier = (s) => {
    if (s <= 20) return { label: '💀 NUCLEAR', bg: '#FFE8E7', color: '#E8231B', border: '#E8231B' };
    if (s <= 40) return { label: '🔥 ROASTED', bg: '#FFF0E0', color: '#F47820', border: '#F47820' };
    if (s <= 60) return { label: '😬 SINGED', bg: '#FFFBE0', color: '#A07800', border: '#F5C518' };
    if (s <= 80) return { label: '👍 DECENT', bg: '#F0FFC0', color: '#5A7A00', border: '#C8F135' };
    return { label: '⭐ CRISPY', bg: '#DCFCE7', color: '#166534', border: '#22C55E' };
  };

  const tier = getTier(overall);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-card)',
        border: featured ? '3px solid var(--fire-red)' : 'var(--border)',
        boxShadow: hovered ? 'var(--shadow-xl)' : featured ? 'var(--shadow-fire)' : 'var(--shadow-md)',
        transform: hovered ? 'translate(-2px, -2px)' : 'none',
        transition: 'all 150ms',
        overflow: 'hidden',
      }}
    >
      {/* Featured banner */}
      {featured && (
        <div style={{ background: 'var(--fire-red)', padding: '4px 16px', fontFamily: 'var(--font-pixel)', fontSize: 7, color: '#fff', letterSpacing: '0.1em' }}>
          🔥 FEATURED ROAST
        </div>
      )}

      {/* Screenshot preview */}
      <div style={{
        height: 160, background: 'var(--smoke)',
        backgroundImage: 'var(--pixel-grid)', backgroundSize: '8px 8px',
        borderBottom: 'var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Score overlay */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: tier.bg, border: `3px solid ${tier.border}`,
          padding: '6px 12px', boxShadow: `3px 3px 0 ${tier.border}`,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 22, color: tier.color, lineHeight: 1 }}>{overall}</span>
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 7, color: tier.color }}>{tier.label}</span>
        </div>

        {/* Placeholder site preview */}
        <div style={{ width: 220, height: 120, background: 'var(--ash)', border: 'var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ height: 16, background: 'var(--stone)', borderBottom: '2px solid var(--black)', display: 'flex', alignItems: 'center', padding: '0 6px', gap: 4 }}>
            {['#E8231B','#F5C518','#22C55E'].map((c,i) => <div key={i} style={{ width: 5, height: 5, background: c, border: '1px solid var(--black)' }}></div>)}
            <div style={{ flex: 1, height: 4, background: 'var(--ash)', marginLeft: 4, border: '1px solid var(--black)' }}></div>
          </div>
          <div style={{ flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ height: 6, background: 'var(--stone)', width: '70%' }}></div>
            <div style={{ height: 4, background: 'var(--ash)', width: '90%' }}></div>
            <div style={{ height: 4, background: 'var(--ash)', width: '60%' }}></div>
            <div style={{ marginTop: 6, height: 16, background: 'var(--fire-red)', width: '40%', border: '2px solid var(--black)' }}></div>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '16px 20px' }}>
        {/* URL + Tags */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{title}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{url}</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {tags.map(t => (
              <span key={t.label} style={{ fontFamily: 'var(--font-pixel)', fontSize: 7, padding: '3px 7px', background: t.bg, color: t.color, border: `2px solid ${t.border}` }}>{t.label}</span>
            ))}
          </div>
        </div>

        {/* Score bars */}
        <div style={{ marginBottom: 14, background: 'var(--smoke)', padding: '10px 12px', border: '1px solid var(--ash)' }}>
          {scores.map(s => {
            const getC = (v) => v <= 20 ? '#E8231B' : v <= 40 ? '#F47820' : v <= 60 ? '#F5C518' : v <= 80 ? '#C8F135' : '#22C55E';
            return (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', width: 80, flexShrink: 0 }}>{s.label}</div>
                <div style={{ flex: 1, height: 8, background: 'var(--ash)', border: '2px solid var(--black)' }}>
                  <div style={{ height: '100%', width: `${s.val}%`, background: getC(s.val) }}></div>
                </div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 7, color: getC(s.val), width: 24, textAlign: 'right' }}>{s.val}</div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={() => setUpvoted(!upvoted)}
              style={{
                fontFamily: 'var(--font-pixel)', fontSize: 8, padding: '6px 10px',
                background: upvoted ? 'var(--fire-red)' : 'var(--bg-card)',
                color: upvoted ? '#fff' : 'var(--text-primary)',
                border: 'var(--border)', boxShadow: 'var(--shadow-xs)',
                cursor: 'pointer', transition: 'all 100ms',
              }}
            >🔥 {upvoted ? votes + 1 : votes}</button>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>💬 {comments}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>@{author}</span>
            <span>·</span>
            <span>{timeAgo}</span>
          </div>
          <button style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, padding: '7px 14px', background: 'var(--black)', color: '#fff', border: 'var(--border)', boxShadow: 'var(--shadow-xs)', cursor: 'pointer' }}>VIEW ROAST →</button>
        </div>
      </div>
    </div>
  );
};

const SAMPLE_ROASTS = [
  {
    url: 'techflow.io', title: 'TechFlow — Workflow Automation',
    tags: [{ label: 'SAAS', bg: '#F0FFC0', color: '#5A7A00', border: '#C8F135' }, { label: 'STARTUP', bg: '#FFE8E7', color: '#E8231B', border: '#E8231B' }],
    scores: [{ label: 'Design', val: 18 }, { label: 'Copy', val: 31 }, { label: 'UX/Flow', val: 22 }, { label: 'Mobile', val: 14 }],
    overall: 21, votes: 47, comments: 18, author: 'pixel_dev', timeAgo: '2h ago', featured: true,
  },
  {
    url: 'janedoe.design', title: 'Jane Doe — UX Portfolio',
    tags: [{ label: 'PORTFOLIO', bg: '#FFD6EB', color: '#FF3D8B', border: '#FF3D8B' }],
    scores: [{ label: 'Design', val: 72 }, { label: 'Copy', val: 55 }, { label: 'UX/Flow', val: 68 }, { label: 'Mobile', val: 60 }],
    overall: 64, votes: 23, comments: 9, author: 'roaster_ph', timeAgo: '5h ago', featured: false,
  },
];

function PatternFeed() {
  return (
    <section style={{ marginBottom: 80 }}>
      <PatSectionTitle id="feed" label="Feed — Roast Card" sub="The primary content unit. Screenshot preview, score overlay, sub-scores, votes, and a direct call to action." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
        {SAMPLE_ROASTS.map(r => <RoastCard key={r.url} {...r} />)}
      </div>
    </section>
  );
}

// ── DASHBOARD PATTERN ─────────────────────────────────────────────────────────
function PatternDashboard() {
  const [tab, setTab] = React.useState('overview');
  const tabs = ['overview', 'my roasts', 'community'];
  return (
    <section style={{ marginBottom: 80 }}>
      <PatSectionTitle id="dashboard" label="Dashboard" sub="Minimal stats view. Tab-based navigation, stat cards grid, recent activity list." />

      <div style={{ border: 'var(--border)', boxShadow: 'var(--shadow-lg)', background: 'var(--bg-card)', overflow: 'hidden' }}>
        {/* Dashboard header */}
        <div style={{ padding: '20px 24px', borderBottom: 'var(--border)', background: 'var(--smoke)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 4 }}>WELCOME BACK</div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 14, color: 'var(--text-primary)' }}>@pixel_dev</div>
          </div>
          <button style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, padding: '10px 16px', background: 'var(--fire-red)', color: '#fff', border: 'var(--border)', boxShadow: 'var(--shadow-xs)', cursor: 'pointer' }}>+ SUBMIT SITE</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: 'var(--border)', background: 'var(--bg-card)' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              fontFamily: 'var(--font-pixel)', fontSize: 8, letterSpacing: '0.06em',
              padding: '12px 20px', border: 'none', borderRight: '1px solid var(--ash)',
              background: tab === t ? 'var(--black)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer', textTransform: 'uppercase', transition: 'all 100ms',
            }}>{t}</button>
          ))}
        </div>

        {/* Stats grid */}
        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
            {[
              { v: '47', l: 'Roasts Given', d: 12, c: 'var(--fire-red)' },
              { v: '34.2', l: 'Avg Score Given', d: -3, c: 'var(--fire-orange)' },
              { v: '3', l: 'My Sites Roasted', d: 100, c: 'var(--electric-blue)' },
              { v: '72', l: 'Reputation', d: 8, c: 'var(--acid-lime)' },
            ].map(s => (
              <div key={s.l} style={{ padding: '16px', background: 'var(--smoke)', border: 'var(--border)', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 7, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{s.l}</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 24, color: s.c, lineHeight: 1, marginBottom: 6 }}>{s.v}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: s.d >= 0 ? '#22C55E' : 'var(--fire-red)' }}>{s.d >= 0 ? '↑' : '↓'} {Math.abs(s.d)}%</div>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Recent Activity</div>
            {[
              { site: 'techflow.io', score: 21, type: 'ROASTED', time: '2h ago' },
              { site: 'janedoe.design', score: 64, type: 'REVIEWED', time: '5h ago' },
              { site: 'launchfast.xyz', score: 38, type: 'ROASTED', time: '1d ago' },
            ].map(a => {
              const getC = (s) => s <= 20 ? '#E8231B' : s <= 40 ? '#F47820' : s <= 60 ? '#F5C518' : s <= 80 ? '#C8F135' : '#22C55E';
              return (
                <div key={a.site} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--ash)', flexWrap: 'wrap' }}>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 16, color: getC(a.score), width: 32 }}>{a.score}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{a.site}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{a.time}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 7, padding: '3px 7px', background: a.type === 'ROASTED' ? 'var(--fire-red-soft)' : 'var(--acid-soft)', color: a.type === 'ROASTED' ? 'var(--fire-red)' : '#5A7A00', border: a.type === 'ROASTED' ? '2px solid var(--fire-red)' : '2px solid var(--acid-lime)' }}>{a.type}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── TOASTS ────────────────────────────────────────────────────────────────────
function PatternToasts() {
  const toasts = [
    { msg: '🔥 Your site got roasted! Score: 23/100', type: 'roast', bg: 'var(--fire-red)', color: '#fff' },
    { msg: '✅ Site submitted successfully', type: 'success', bg: 'var(--acid-lime)', color: 'var(--black)' },
    { msg: '💬 3 new comments on techflow.io', type: 'info', bg: 'var(--electric-blue)', color: '#fff' },
    { msg: '⚠ URL not reachable. Check the link.', type: 'warning', bg: 'var(--fire-yellow)', color: 'var(--black)' },
  ];
  return (
    <section style={{ marginBottom: 80 }}>
      <PatSectionTitle id="toasts" label="Notifications & Toasts" sub="Hard-edged, impossible to miss. Slide in from top-right. Auto-dismiss after 4s." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 380 }}>
        {toasts.map(t => (
          <div key={t.msg} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: t.bg, color: t.color, border: '3px solid var(--black)', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, flex: 1, fontWeight: 700 }}>{t.msg}</div>
            <button style={{ background: 'transparent', border: 'none', color: t.color, cursor: 'pointer', fontFamily: 'var(--font-pixel)', fontSize: 8 }}>✕</button>
          </div>
        ))}
      </div>
    </section>
  );
}

Object.assign(window, { PatternNavigation, PatternFeed, PatternDashboard, PatternToasts, RoastCard });
