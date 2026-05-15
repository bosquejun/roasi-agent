// ── Roasi DS — Components Section ───────────────────────────────────────
// Buttons · Inputs · Badges · Cards

// ── SHARED HELPERS ────────────────────────────────────────────────────────────
const CompSectionTitle = ({ id, label, sub }) => (
  <div id={id} style={{ marginBottom: 40, paddingTop: 8 }}>
    <div
      style={{
        fontFamily: "var(--font-pixel)",
        fontSize: 10,
        letterSpacing: "0.12em",
        color: "var(--electric-blue)",
        marginBottom: 8,
        textTransform: "uppercase",
      }}
    >
      Components
    </div>
    <h2
      style={{
        fontFamily: "var(--font-pixel)",
        fontSize: 18,
        color: "var(--text-primary)",
        lineHeight: 1.4,
        marginBottom: 8,
      }}
    >
      {label}
    </h2>
    {sub && (
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          color: "var(--text-muted)",
          lineHeight: 1.6,
        }}
      >
        {sub}
      </p>
    )}
    <div
      style={{
        marginTop: 16,
        height: 3,
        background: "var(--electric-blue)",
        width: 48,
      }}
    ></div>
  </div>
)

const ShowRow = ({ label, children, vertical }) => (
  <div style={{ marginBottom: 32 }}>
    <div
      style={{
        fontFamily: "var(--font-pixel)",
        fontSize: 8,
        color: "var(--text-muted)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        marginBottom: 16,
      }}
    >
      {label}
    </div>
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
        flexDirection: vertical ? "column" : "row",
        alignItems: vertical ? "flex-start" : "center",
      }}
    >
      {children}
    </div>
  </div>
)

// ── BUTTONS ───────────────────────────────────────────────────────────────────
const Btn = ({ label, variant = "primary", size = "md", disabled }) => {
  const [pressed, setPressed] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)

  const variants = {
    primary: {
      bg: "linear-gradient(120deg, #E8231B 0%, #F47820 55%, #F5C518 100%)",
      hoverBg: "linear-gradient(120deg, #C91A13 0%, #D96810 55%, #DBA800 100%)",
      color: "#fff",
      border: "var(--border)",
      shadow: "var(--shadow-md)",
    },
    secondary: {
      bg: "var(--bg-card)",
      color: "var(--black)",
      border: "var(--border)",
      shadow: "var(--shadow-md)",
    },
    accent: {
      bg: "var(--acid-lime)",
      color: "var(--black)",
      border: "var(--border)",
      shadow: "var(--shadow-md)",
    },
    orange: {
      bg: "var(--fire-orange)",
      color: "#fff",
      border: "var(--border)",
      shadow: "var(--shadow-md)",
    },
    ghost: {
      bg: "transparent",
      color: "var(--text-primary)",
      border: "var(--border)",
      shadow: "none",
    },
    danger: {
      bg: "var(--fire-red-soft)",
      color: "var(--fire-red)",
      border: `3px solid var(--fire-red)`,
      shadow: "4px 4px 0 var(--fire-red)",
    },
    dark: {
      bg: "var(--black)",
      color: "#fff",
      border: "var(--border)",
      shadow: "var(--shadow-md)",
    },
  }

  const sizes = {
    sm: { padding: "6px 12px", fontSize: 8 },
    md: { padding: "10px 20px", fontSize: 9 },
    lg: { padding: "14px 28px", fontSize: 10 },
    xl: { padding: "18px 36px", fontSize: 11 },
  }

  const v = variants[variant]
  const s = sizes[size]
  const isPressed = pressed && !disabled
  const isHovered = hovered && !disabled

  return (
    <button
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => {
        setPressed(false)
        setHovered(false)
      }}
      onMouseEnter={() => setHovered(true)}
      disabled={disabled}
      style={{
        fontFamily: "var(--font-pixel)",
        fontSize: s.fontSize,
        letterSpacing: "0.06em",
        lineHeight: 1,
        padding: s.padding,
        background: disabled
          ? "var(--smoke)"
          : isHovered && v.hoverBg
            ? v.hoverBg
            : v.bg,
        color: disabled ? "var(--stone)" : v.color,
        border: disabled ? "3px solid var(--stone)" : v.border,
        boxShadow: disabled
          ? "none"
          : isPressed
            ? "none"
            : isHovered
              ? v.shadow.replace("4px", "6px").replace("3px", "5px")
              : v.shadow,
        transform: isPressed
          ? "translate(4px, 4px)"
          : isHovered
            ? "translate(-1px, -1px)"
            : "none",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 80ms",
        borderRadius: 0,
        textTransform: "uppercase",
        opacity: disabled ? 0.5 : 1,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  )
}

function ComponentButtons() {
  return (
    <section style={{ marginBottom: 80 }}>
      <CompSectionTitle
        id="buttons"
        label="Buttons"
        sub="Hard shadows shift on press. Uppercase pixel text. Zero border-radius."
      />

      <ShowRow label="Variants">
        <Btn label="Roast It" variant="primary" />
        <Btn label="View Roast" variant="secondary" />
        <Btn label="Submit Site" variant="accent" />
        <Btn label="🔥 Launch" variant="orange" />
        <Btn label="Share" variant="ghost" />
        <Btn label="Delete" variant="danger" />
        <Btn label="Dashboard" variant="dark" />
      </ShowRow>

      <ShowRow label="Sizes">
        <Btn label="Small" variant="primary" size="sm" />
        <Btn label="Medium" variant="primary" size="md" />
        <Btn label="Large" variant="primary" size="lg" />
        <Btn label="X-Large" variant="primary" size="xl" />
      </ShowRow>

      <ShowRow label="States">
        <Btn label="Default" variant="primary" />
        <Btn label="Disabled" variant="primary" disabled />
        <Btn label="Default" variant="secondary" />
        <Btn label="Disabled" variant="secondary" disabled />
      </ShowRow>
    </section>
  )
}

// ── INPUTS ────────────────────────────────────────────────────────────────────
const InputField = ({
  label,
  placeholder,
  type = "text",
  prefix,
  helper,
  error,
}) => {
  const [focused, setFocused] = React.useState(false)
  const [val, setVal] = React.useState("")
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        flex: "1 1 280px",
        maxWidth: 400,
      }}
    >
      {label && (
        <label
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 8,
            color: "var(--text-primary)",
            letterSpacing: "0.08em",
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          display: "flex",
          border: error
            ? "3px solid var(--fire-red)"
            : focused
              ? "3px solid var(--fire-orange)"
              : "var(--border)",
          boxShadow: focused
            ? "4px 4px 0 var(--fire-orange)"
            : error
              ? "4px 4px 0 var(--fire-red)"
              : "var(--shadow-md)",
          background: "var(--bg-card)",
          transition: "all 120ms",
        }}
      >
        {prefix && (
          <div
            style={{
              padding: "10px 12px",
              background: "var(--smoke)",
              borderRight: "var(--border)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text-muted)",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
            }}
          >
            {prefix}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            padding: "10px 14px",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--text-primary)",
          }}
        />
      </div>
      {helper && !error && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-muted)",
          }}
        >
          {helper}
        </div>
      )}
      {error && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--fire-red)",
          }}
        >
          ⚠ {error}
        </div>
      )}
    </div>
  )
}

function ComponentInputs() {
  return (
    <section style={{ marginBottom: 80 }}>
      <CompSectionTitle
        id="inputs"
        label="Inputs"
        sub="Focused state shifts to orange border + shadow. Error state burns red."
      />
      <ShowRow label="URL Input (primary use case)" vertical>
        <InputField
          label="SITE URL"
          placeholder="https://yourstartup.com"
          prefix="🌐"
          helper="Must be a public URL — we'll screenshot and roast it."
        />
        <InputField
          label="SITE URL — ERROR STATE"
          placeholder="https://yourstartup.com"
          prefix="🌐"
          error="URL is not reachable. Check the address."
        />
      </ShowRow>
      <ShowRow label="Other Inputs" vertical>
        <InputField
          label="SEARCH ROASTS"
          placeholder="Search by URL, tag, or @user..."
        />
        <InputField
          label="YOUR HANDLE"
          placeholder="@pixel_dev"
          prefix="@"
          helper="Used as your roaster identity."
        />
      </ShowRow>
    </section>
  )
}

// ── BADGES & TAGS ─────────────────────────────────────────────────────────────
const Badge = ({ label, color, bg, border }) => (
  <span
    style={{
      fontFamily: "var(--font-pixel)",
      fontSize: 8,
      letterSpacing: "0.06em",
      padding: "4px 8px",
      lineHeight: 1,
      background: bg || "var(--bg-card)",
      color: color || "var(--text-primary)",
      border: border || "var(--border)",
      display: "inline-block",
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </span>
)

const ScoreBadge = ({ score }) => {
  const tiers = [
    {
      max: 20,
      label: "💀 NUCLEAR",
      bg: "#FFE8E7",
      color: "#E8231B",
      border: "3px solid #E8231B",
    },
    {
      max: 40,
      label: "🔥 ROASTED",
      bg: "#FFF0E0",
      color: "#F47820",
      border: "3px solid #F47820",
    },
    {
      max: 60,
      label: "😬 SINGED",
      bg: "#FFFBE0",
      color: "#A07800",
      border: "3px solid #F5C518",
    },
    {
      max: 80,
      label: "👍 DECENT",
      bg: "#F0FFC0",
      color: "#5A7A00",
      border: "3px solid #C8F135",
    },
    {
      max: 100,
      label: "⭐ CRISPY",
      bg: "#DCFCE7",
      color: "#166534",
      border: "3px solid #22C55E",
    },
  ]
  const tier = tiers.find((t) => score <= t.max) || tiers[4]
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        border: tier.border,
        background: tier.bg,
        padding: "8px 14px",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-pixel)",
          fontSize: 20,
          color: tier.color,
          lineHeight: 1,
        }}
      >
        {score}
      </span>
      <div>
        <div
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 7,
            color: tier.color,
          }}
        >
          {tier.label}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-muted)",
          }}
        >
          / 100
        </div>
      </div>
    </div>
  )
}

const FireBar = ({ score, label, color }) => {
  const getColor = (s) => {
    if (s <= 20) return "#E8231B"
    if (s <= 40) return "#F47820"
    if (s <= 60) return "#F5C518"
    if (s <= 80) return "#C8F135"
    return "#22C55E"
  }
  const c = color || getColor(score)
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 8,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--text-muted)",
          width: 80,
          flexShrink: 0,
        }}
      >
        {label}
      </div>
      <div
        style={{
          flex: 1,
          height: 12,
          background: "var(--ash)",
          border: "2px solid var(--black)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: `${score}%`,
            background: c,
            transition: "width 600ms var(--ease-out)",
          }}
        ></div>
      </div>
      <div
        style={{
          fontFamily: "var(--font-pixel)",
          fontSize: 8,
          color: c,
          width: 32,
          textAlign: "right",
        }}
      >
        {score}
      </div>
    </div>
  )
}

function ComponentBadges() {
  return (
    <section style={{ marginBottom: 80 }}>
      <CompSectionTitle
        id="badges"
        label="Badges & Tags"
        sub="Hard-bordered chips. The score badge is the most important UI element in the product."
      />

      <ShowRow label="Category Tags">
        <Badge
          label="LANDING PAGE"
          bg="var(--blue-soft)"
          color="var(--electric-blue)"
          border="3px solid var(--electric-blue)"
        />
        <Badge
          label="PORTFOLIO"
          bg="var(--pink-soft)"
          color="var(--hot-pink)"
          border="3px solid var(--hot-pink)"
        />
        <Badge
          label="SAAS"
          bg="var(--acid-soft)"
          color="#5A7A00"
          border="3px solid var(--acid-lime)"
        />
        <Badge
          label="STARTUP"
          bg="var(--fire-red-soft)"
          color="var(--fire-red)"
          border="3px solid var(--fire-red)"
        />
        <Badge
          label="AGENCY"
          bg="var(--fire-org-soft)"
          color="var(--fire-orange)"
          border="3px solid var(--fire-orange)"
        />
        <Badge
          label="E-COMMERCE"
          bg="var(--fire-yel-soft)"
          color="#A07800"
          border="3px solid var(--fire-yellow)"
        />
      </ShowRow>

      <ShowRow label="Status Badges">
        <Badge label="🔥 LIVE ROAST" bg="var(--fire-red)" color="#fff" />
        <Badge label="⏳ PENDING" bg="var(--smoke)" color="var(--slate)" />
        <Badge
          label="✅ REVIEWED"
          bg="var(--acid-soft)"
          color="#5A7A00"
          border="3px solid var(--acid-lime)"
        />
        <Badge label="💬 TRENDING" bg="var(--electric-blue)" color="#fff" />
        <Badge label="🚀 LAUNCHED" bg="var(--acid-lime)" color="var(--black)" />
      </ShowRow>

      <ShowRow label="Score Badges" vertical={false}>
        <ScoreBadge score={12} />
        <ScoreBadge score={34} />
        <ScoreBadge score={55} />
        <ScoreBadge score={73} />
        <ScoreBadge score={91} />
      </ShowRow>

      <ShowRow label="Score Breakdown Bars" vertical>
        <div
          style={{
            width: "100%",
            maxWidth: 480,
            border: "var(--border)",
            padding: 20,
            background: "var(--bg-card)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 9,
              color: "var(--text-muted)",
              marginBottom: 16,
            }}
          >
            SCORE BREAKDOWN
          </div>
          <FireBar score={23} label="Design" />
          <FireBar score={41} label="Copy" />
          <FireBar score={15} label="UX/Flow" />
          <FireBar score={67} label="Performance" />
          <FireBar score={30} label="Mobile" />
        </div>
      </ShowRow>
    </section>
  )
}

// ── CARDS ─────────────────────────────────────────────────────────────────────
const StatCard = ({ value, label, delta, color }) => {
  const isPositive = delta >= 0
  return (
    <div
      style={{
        padding: "20px 24px",
        background: "var(--bg-card)",
        border: "var(--border)",
        boxShadow: "var(--shadow-md)",
        flex: "1 1 160px",
        minWidth: 160,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-pixel)",
          fontSize: 8,
          color: "var(--text-muted)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-pixel)",
          fontSize: 28,
          color: color || "var(--text-primary)",
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: isPositive ? "#22C55E" : "var(--fire-red)",
        }}
      >
        {isPositive ? "↑" : "↓"} {Math.abs(delta)}% vs last week
      </div>
    </div>
  )
}

const UserCard = ({ handle, roasts, avgScore, badge }) => (
  <div
    style={{
      padding: 20,
      background: "var(--bg-card)",
      border: "var(--border)",
      boxShadow: "var(--shadow-md)",
      display: "flex",
      gap: 16,
      alignItems: "flex-start",
      flex: "1 1 280px",
      minWidth: 280,
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        background: "var(--fire-red)",
        border: "var(--border)",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{ fontFamily: "var(--font-pixel)", fontSize: 14, color: "#fff" }}
      >
        {handle[0].toUpperCase()}
      </span>
    </div>
    <div style={{ flex: 1 }}>
      <div
        style={{
          fontFamily: "var(--font-pixel)",
          fontSize: 9,
          color: "var(--text-primary)",
          marginBottom: 4,
        }}
      >
        @{handle}
      </div>
      {badge && (
        <span
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 7,
            padding: "3px 6px",
            background: "var(--fire-red)",
            color: "#fff",
            border: "var(--border)",
            marginBottom: 8,
            display: "inline-block",
          }}
        >
          {badge}
        </span>
      )}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--text-muted)",
          marginTop: 8,
        }}
      >
        {roasts} roasts · avg score {avgScore}
      </div>
    </div>
  </div>
)

function ComponentCards() {
  return (
    <section style={{ marginBottom: 80 }}>
      <CompSectionTitle
        id="cards"
        label="Cards"
        sub="All cards: white fill, 3px border, hard shadow. Elevation = larger shadow."
      />

      <ShowRow label="Dashboard Stat Cards">
        <StatCard
          value="1,247"
          label="Total Roasts"
          delta={12}
          color="var(--fire-red)"
        />
        <StatCard
          value="38.4"
          label="Avg Score"
          delta={-4}
          color="var(--fire-orange)"
        />
        <StatCard
          value="94"
          label="Sites Today"
          delta={8}
          color="var(--electric-blue)"
        />
        <StatCard
          value="3.2k"
          label="Community Votes"
          delta={22}
          color="var(--acid-lime)"
        />
      </ShowRow>

      <ShowRow label="User Cards">
        <UserCard
          handle="pixel_dev"
          roasts={47}
          avgScore={34}
          badge="TOP ROASTER"
        />
        <UserCard handle="jess_builds" roasts={12} avgScore={61} />
        <UserCard handle="startupkid" roasts={3} avgScore={78} />
      </ShowRow>
    </section>
  )
}

// ── EXPORT ────────────────────────────────────────────────────────────────────
Object.assign(window, {
  ComponentButtons,
  ComponentInputs,
  ComponentBadges,
  ComponentCards,
  ScoreBadge,
  FireBar,
  Badge,
  Btn,
  StatCard,
})
