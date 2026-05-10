
// ── Roaster.ph DS — Foundations Section ─────────────────────────────────────
// Colors · Typography · Spacing · Effects

const SectionTitle = ({ id, label, sub }) => (
  <div id={id} style={{ marginBottom: 40, paddingTop: 8 }}>
    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--fire-orange)', marginBottom: 8, textTransform: 'uppercase' }}>Foundation</div>
    <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: 18, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 8 }}>{label}</h2>
    {sub && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{sub}</p>}
    <div style={{ marginTop: 16, height: 3, background: 'var(--black)', width: 48 }}></div>
  </div>
);

const Token = ({ name, value }) => (
  <code style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
    <span style={{ color: 'var(--fire-orange)' }}>--{name}:</span> {value}
  </code>
);

// ── COLOR SECTION ─────────────────────────────────────────────────────────────
const ColorSwatch = ({ name, hex, token, text = '#0A0A0A', wide = false }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: wide ? '1 1 200px' : '0 0 auto' }}>
    <div style={{
      width: wide ? '100%' : 80, height: wide ? 64 : 80,
      background: hex,
      border: 'var(--border)',
      boxShadow: 'var(--shadow-sm)',
    }}></div>
    <div>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: 'var(--text-primary)', lineHeight: 1.8 }}>{name}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{hex}</div>
      <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fire-orange)' }}>--{token}</code>
    </div>
  </div>
);

const ColorGroup = ({ label, children }) => (
  <div style={{ marginBottom: 40 }}>
    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16 }}>{label}</div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>{children}</div>
  </div>
);

const ScoreRow = ({ range, emoji, label, color, token, softToken }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '12px 16px',
    border: 'var(--border)',
    borderLeft: `6px solid ${color}`,
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-xs)',
    marginBottom: 8,
  }}>
    <span style={{ fontSize: 20 }}>{emoji}</span>
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: 'var(--text-primary)' }}>{range} — {label}</div>
    </div>
    <div style={{ display: 'flex', gap: 8 }}>
      <div style={{ width: 32, height: 32, background: color, border: 'var(--border)' }}></div>
      <div style={{ width: 32, height: 32, background: `var(--${softToken})`, border: 'var(--border)' }}></div>
    </div>
    <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fire-orange)' }}>--{token}</code>
  </div>
);

function FoundationColors() {
  return (
    <section style={{ marginBottom: 80 }}>
      <SectionTitle id="colors" label="Color System" sub="Built from the brand's fire palette. Every color has a purpose — no decorative noise." />

      <ColorGroup label="🔥 Brand Fire">
        <ColorSwatch name="Fire Red" hex="#E8231B" token="fire-red" />
        <ColorSwatch name="Fire Orange" hex="#F47820" token="fire-orange" />
        <ColorSwatch name="Fire Yellow" hex="#F5C518" token="fire-yellow" text="#0A0A0A" />
        <ColorSwatch name="Red Soft" hex="#FFE8E7" token="fire-red-soft" />
        <ColorSwatch name="Orange Soft" hex="#FFF0E0" token="fire-org-soft" />
        <ColorSwatch name="Yellow Soft" hex="#FFFBE0" token="fire-yel-soft" />
      </ColorGroup>

      <ColorGroup label="⚡ Accent Pops">
        <ColorSwatch name="Acid Lime" hex="#C8F135" token="acid-lime" />
        <ColorSwatch name="Electric Blue" hex="#4D9EFF" token="electric-blue" text="#fff" />
        <ColorSwatch name="Hot Pink" hex="#FF3D8B" token="hot-pink" text="#fff" />
        <ColorSwatch name="Acid Soft" hex="#F0FFC0" token="acid-soft" />
        <ColorSwatch name="Blue Soft" hex="#D6EEFF" token="blue-soft" />
        <ColorSwatch name="Pink Soft" hex="#FFD6EB" token="pink-soft" />
      </ColorGroup>

      <ColorGroup label="🩶 Neutrals">
        <ColorSwatch name="Cream" hex="#FEFCE8" token="cream" />
        <ColorSwatch name="Cream 100" hex="#F7F4D8" token="cream-100" />
        <ColorSwatch name="Smoke" hex="#F0EDE0" token="smoke" />
        <ColorSwatch name="Ash" hex="#E2DDCC" token="ash" />
        <ColorSwatch name="Stone" hex="#C8C2B0" token="stone" />
        <ColorSwatch name="Slate" hex="#8A8478" token="slate" text="#fff" />
        <ColorSwatch name="Charcoal" hex="#2A2520" token="charcoal" text="#fff" />
        <ColorSwatch name="Black" hex="#0A0A0A" token="black" text="#fff" />
        <ColorSwatch name="White" hex="#FFFFFF" token="white" />
      </ColorGroup>

      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16 }}>🏆 Score Scale</div>
        <div>
          <ScoreRow range="0–20" emoji="💀" label="Nuclear" color="#E8231B" token="score-nuclear" softToken="score-nuclear-soft" />
          <ScoreRow range="21–40" emoji="🔥" label="Roasted" color="#F47820" token="score-roasted" softToken="score-roasted-soft" />
          <ScoreRow range="41–60" emoji="😬" label="Singed" color="#F5C518" token="score-singed" softToken="score-singed-soft" />
          <ScoreRow range="61–80" emoji="👍" label="Decent" color="#C8F135" token="score-decent" softToken="score-decent-soft" />
          <ScoreRow range="81–100" emoji="⭐" label="Crispy" color="#22C55E" token="score-crispy" softToken="score-crispy-soft" />
        </div>
      </div>
    </section>
  );
}

// ── TYPOGRAPHY SECTION ────────────────────────────────────────────────────────
const TypeSpecimen = ({ size, label, weight, family, sample, token }) => (
  <div style={{
    display: 'flex', alignItems: 'baseline', gap: 16,
    padding: '14px 0',
    borderBottom: '1px solid var(--ash)',
    flexWrap: 'wrap',
  }}>
    <div style={{ width: 120, flex: '0 0 120px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
      <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fire-orange)' }}>{token}</code>
    </div>
    <div style={{ fontFamily: family === 'pixel' ? 'var(--font-pixel)' : 'var(--font-mono)', fontSize: size, fontWeight: weight, color: 'var(--text-primary)', flex: 1, lineHeight: 1.4 }}>
      {sample}
    </div>
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--stone)', textAlign: 'right' }}>{size}px · {weight}</div>
  </div>
);

function FoundationTypography() {
  return (
    <section style={{ marginBottom: 80 }}>
      <SectionTitle id="typography" label="Typography" sub="Two fonts, zero compromise. Press Start 2P for brand moments. Space Mono for everything readable." />

      <div style={{ display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240, padding: 24, border: 'var(--border)', boxShadow: 'var(--shadow-md)', background: 'var(--bg-card)' }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: 'var(--fire-red)', letterSpacing: '0.1em', marginBottom: 12 }}>DISPLAY FONT</div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 20, color: 'var(--text-primary)', lineHeight: 1.8, marginBottom: 12 }}>Press Start 2P</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>Used for headings, labels, score numbers, and brand moments. Pixel-native. Never for long text.</div>
          <code style={{ display: 'block', marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fire-orange)' }}>--font-pixel</code>
        </div>
        <div style={{ flex: 1, minWidth: 240, padding: 24, border: 'var(--border)', boxShadow: 'var(--shadow-md)', background: 'var(--bg-card)' }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: 'var(--fire-red)', letterSpacing: '0.1em', marginBottom: 12 }}>BODY FONT</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Space Mono</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>Used for body copy, UI labels, metadata, code. Monospace grid reinforces the pixel aesthetic while staying readable.</div>
          <code style={{ display: 'block', marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fire-orange)' }}>--font-mono</code>
        </div>
      </div>

      <div style={{ border: 'var(--border)', boxShadow: 'var(--shadow-md)', background: 'var(--bg-card)', padding: '0 24px' }}>
        <TypeSpecimen size={32} label="Display" weight={400} family="pixel" sample="GET ROASTED." token="--text-3xl / pixel" />
        <TypeSpecimen size={24} label="Heading 1" weight={400} family="pixel" sample="Your Score: 23/100" token="--text-2xl / pixel" />
        <TypeSpecimen size={16} label="Heading 2" weight={400} family="pixel" sample="Design Issues" token="--text-md / pixel" />
        <TypeSpecimen size={12} label="Heading 3" weight={400} family="pixel" sample="Copy & Messaging" token="--text-sm / pixel" />
        <TypeSpecimen size={10} label="Label / Tag" weight={400} family="pixel" sample="LANDING PAGE · SaaS" token="--text-xs / pixel" />
        <TypeSpecimen size={8} label="Micro Label" weight={400} family="pixel" sample="SUBMITTED 2H AGO" token="--text-2xs / pixel" />
        <TypeSpecimen size={14} label="Body" weight={400} family="mono" sample="Your hero headline is too vague. Users can't tell what you do in 5 seconds." token="--text-base / mono 400" />
        <TypeSpecimen size={14} label="Body Bold" weight={700} family="mono" sample="Navigation is broken on mobile. Immediate fix needed." token="--text-base / mono 700" />
        <TypeSpecimen size={12} label="Caption" weight={400} family="mono" sample="3 community votes · @pixel_dev · submitted via roaster.ph" token="--text-sm / mono 400" />
      </div>
    </section>
  );
}

// ── SPACING SECTION ───────────────────────────────────────────────────────────
function FoundationSpacing() {
  const steps = [
    { name: 'sp-1', px: 4 }, { name: 'sp-2', px: 8 }, { name: 'sp-3', px: 12 },
    { name: 'sp-4', px: 16 }, { name: 'sp-5', px: 20 }, { name: 'sp-6', px: 24 },
    { name: 'sp-8', px: 32 }, { name: 'sp-10', px: 40 }, { name: 'sp-12', px: 48 },
    { name: 'sp-16', px: 64 }, { name: 'sp-20', px: 80 }, { name: 'sp-24', px: 96 },
  ];
  return (
    <section style={{ marginBottom: 80 }}>
      <SectionTitle id="spacing" label="Spacing" sub="8px base grid. All layout spacing is a multiple of 4px." />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
        {steps.map(s => (
          <div key={s.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
            <div style={{ width: s.px, height: s.px, background: 'var(--fire-red)', border: 'var(--border)', minWidth: 4, minHeight: 4 }}></div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{s.px}px</div>
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fire-orange)' }}>--{s.name}</code>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── EFFECTS SECTION ───────────────────────────────────────────────────────────
function FoundationEffects() {
  const shadows = [
    { name: 'shadow-xs', val: '2px 2px 0 #0A0A0A', size: 2 },
    { name: 'shadow-sm', val: '3px 3px 0 #0A0A0A', size: 3 },
    { name: 'shadow-md', val: '4px 4px 0 #0A0A0A', size: 4 },
    { name: 'shadow-lg', val: '6px 6px 0 #0A0A0A', size: 6 },
    { name: 'shadow-xl', val: '8px 8px 0 #0A0A0A', size: 8 },
    { name: 'shadow-2xl', val: '12px 12px 0 #0A0A0A', size: 12 },
  ];
  const colorShadows = [
    { name: 'shadow-fire', val: '4px 4px 0 #E8231B', color: '#E8231B' },
    { name: 'shadow-orange', val: '4px 4px 0 #F47820', color: '#F47820' },
    { name: 'shadow-acid', val: '4px 4px 0 #C8F135', color: '#C8F135' },
    { name: 'shadow-blue', val: '4px 4px 0 #4D9EFF', color: '#4D9EFF' },
  ];
  return (
    <section style={{ marginBottom: 80 }}>
      <SectionTitle id="effects" label="Borders & Shadows" sub="Hard offset shadows — the neo-brutal signature. No blur radius. No softness. Just weight." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 24, marginBottom: 48 }}>
        {shadows.map(s => (
          <div key={s.name} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              width: '100%', height: 64, background: 'var(--bg-card)',
              border: '3px solid var(--black)',
              boxShadow: s.val,
              marginBottom: s.size,
            }}></div>
            <div>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fire-orange)' }}>--{s.name}</code>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.val}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16 }}>Colored Shadows</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {colorShadows.map(s => (
          <div key={s.name} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 120, height: 56, background: 'var(--bg-card)', border: '3px solid var(--black)', boxShadow: s.val, marginBottom: 4 }}></div>
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fire-orange)' }}>--{s.name}</code>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 48 }}>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16 }}>Border Scale</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[{ name: 'border', val: '3px solid #0A0A0A' }, { name: 'border-thick', val: '4px solid #0A0A0A' }, { name: 'border-xl', val: '5px solid #0A0A0A' }].map(b => (
            <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 120, height: 32, background: 'var(--bg-card)', border: b.val }}></div>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fire-orange)' }}>--{b.name}</code>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{b.val}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── EXPORT ────────────────────────────────────────────────────────────────────
Object.assign(window, { FoundationColors, FoundationTypography, FoundationSpacing, FoundationEffects });
