"use client"

import { useState } from "react"
import { Button } from "@roaster/ui/components/button"
import { Input } from "@roaster/ui/components/input"
import { Badge, ScoreBadge } from "@roaster/ui/components/badge"
import { StatCard, UserCard } from "@roaster/ui/components/card"
import { ScoreBreakdown } from "@roaster/ui/components/score-bar"
import { RoastCard } from "@roaster/ui/components/roast-card"

/* ── Section wrapper ──────────────────────────────────────── */
function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} style={{ marginBottom: "var(--sp-20)" }}>
      <div
        style={{
          fontFamily: "var(--font-pixel)",
          fontSize: 10,
          letterSpacing: "0.12em",
          color: "var(--electric-blue)",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        Design System
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
        {title}
      </h2>
      <div
        style={{
          height: 3,
          background: "var(--electric-blue)",
          width: 48,
          marginBottom: 40,
        }}
      />
      {children}
    </section>
  )
}

function Row({
  label,
  children,
  vertical = false,
}: {
  label: string
  children: React.ReactNode
  vertical?: boolean
}) {
  return (
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
}

/* ── Nav sections ─────────────────────────────────────────── */
const NAV = [
  { id: "foundations", label: "Foundations" },
  { id: "buttons", label: "Buttons" },
  { id: "inputs", label: "Inputs" },
  { id: "badges", label: "Badges" },
  { id: "cards", label: "Cards" },
  { id: "patterns", label: "Patterns" },
]

/* ── Swatch ───────────────────────────────────────────────── */
function Swatch({ token, hex, label }: { token: string; hex: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 80 }}>
      <div
        style={{
          width: 64,
          height: 64,
          background: hex,
          border: "var(--border-rule)",
          boxShadow: "var(--shadow-sm)",
        }}
      />
      <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "var(--text-primary)", lineHeight: 1.6 }}>
        {label}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
        {hex}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--slate)" }}>
        {token}
      </div>
    </div>
  )
}

/* ── App ──────────────────────────────────────────────────── */
export function App() {
  const [activeNav, setActiveNav] = useState("foundations")

  const scrollTo = (id: string) => {
    setActiveNav(id)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>

      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
          background: "var(--bg-card)",
          borderRight: "var(--border-rule)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "var(--border-rule)",
          }}
        >
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: "var(--fire-red)", lineHeight: 1.6 }}>
            ROASTER
          </div>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "var(--text-muted)", marginTop: 4 }}>
            Design System
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "12px 0", flex: 1 }}>
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollTo(item.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "10px 20px",
                fontFamily: "var(--font-pixel)",
                fontSize: 8,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                background: activeNav === item.id ? "var(--fire-red)" : "transparent",
                color: activeNav === item.id ? "#fff" : "var(--text-muted)",
                border: "none",
                cursor: "pointer",
                transition: "all 100ms",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Theme toggle placeholder */}
        <div style={{ padding: "16px 20px", borderTop: "var(--border-rule)" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
            v0.1.0
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: "48px 64px", maxWidth: 960, overflowX: "hidden" }}>

        {/* ── Foundations ───────────────────────────────────── */}
        <Section id="foundations" title="Foundations">
          <Row label="Brand Fire">
            <Swatch token="--fire-red"    hex="#E8231B" label="Fire Red" />
            <Swatch token="--fire-orange" hex="#F47820" label="Fire Orange" />
            <Swatch token="--fire-yellow" hex="#F5C518" label="Fire Yellow" />
          </Row>
          <Row label="Accent Pops">
            <Swatch token="--acid-lime"     hex="#C8F135" label="Acid Lime" />
            <Swatch token="--electric-blue" hex="#4D9EFF" label="Electric Blue" />
            <Swatch token="--hot-pink"      hex="#FF3D8B" label="Hot Pink" />
          </Row>
          <Row label="Neutrals">
            <Swatch token="--cream"    hex="#F0F0EC" label="Cream" />
            <Swatch token="--smoke"    hex="#E4E4DF" label="Smoke" />
            <Swatch token="--ash"      hex="#D8D8D2" label="Ash" />
            <Swatch token="--stone"    hex="#C8C2B0" label="Stone" />
            <Swatch token="--slate"    hex="#8A8478" label="Slate" />
            <Swatch token="--charcoal" hex="#2A2520" label="Charcoal" />
            <Swatch token="--black"    hex="#0A0A0A" label="Black" />
          </Row>
          <Row label="Score Scale">
            <Swatch token="--score-nuclear" hex="#E8231B" label="Nuclear 0–20" />
            <Swatch token="--score-roasted" hex="#F47820" label="Roasted 21–40" />
            <Swatch token="--score-singed"  hex="#F5C518" label="Singed 41–60" />
            <Swatch token="--score-decent"  hex="#C8F135" label="Decent 61–80" />
            <Swatch token="--score-crispy"  hex="#22C55E" label="Crispy 81–100" />
          </Row>
          <Row label="Typography">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { size: 32, label: "Display / 32px" },
                { size: 24, label: "Score / 24px" },
                { size: 16, label: "Heading / 16px" },
                { size: 12, label: "Label / 12px" },
                { size: 8,  label: "Tag / 8px" },
              ].map(({ size, label }) => (
                <div key={size} style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
                  <span style={{ fontFamily: "var(--font-pixel)", fontSize: size, color: "var(--text-primary)", lineHeight: 1.4 }}>
                    Aa
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                    Press Start 2P · {label}
                  </span>
                </div>
              ))}
              <div style={{ height: 1, background: "var(--ash)", margin: "8px 0" }} />
              <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text-primary)" }}>
                  The quick brown fox
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                  Space Mono · Body / 14px
                </span>
              </div>
            </div>
          </Row>
        </Section>

        {/* ── Buttons ───────────────────────────────────────── */}
        <Section id="buttons" title="Buttons">
          <Row label="Variants">
            <Button variant="primary">Roast It</Button>
            <Button variant="secondary">View Roast</Button>
            <Button variant="accent">Submit Site</Button>
            <Button variant="orange">🔥 Launch</Button>
            <Button variant="ghost">Share</Button>
            <Button variant="danger">Delete</Button>
            <Button variant="dark">Dashboard</Button>
          </Row>
          <Row label="Sizes">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" size="xl">X-Large</Button>
          </Row>
          <Row label="States">
            <Button variant="primary">Default</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="secondary">Default</Button>
            <Button variant="secondary" disabled>Disabled</Button>
          </Row>
        </Section>

        {/* ── Inputs ────────────────────────────────────────── */}
        <Section id="inputs" title="Inputs">
          <Row label="URL Input (primary use case)" vertical>
            <div style={{ width: "100%", maxWidth: 480 }}>
              <Input
                label="SITE URL"
                placeholder="https://yourstartup.com"
                prefix="🌐"
                helperText="Must be a public URL — we'll screenshot and roast it."
              />
            </div>
            <div style={{ width: "100%", maxWidth: 480 }}>
              <Input
                label="SITE URL — WITH ACTION"
                placeholder="https://yourstartup.com"
                prefix="🌐"
                suffix={<Button variant="primary" size="md">ROAST IT</Button>}
              />
            </div>
            <div style={{ width: "100%", maxWidth: 480 }}>
              <Input
                label="SITE URL — ERROR STATE"
                placeholder="https://yourstartup.com"
                prefix="🌐"
                error
                errorText="URL is not reachable. Check the address."
              />
            </div>
          </Row>
          <Row label="Other Inputs" vertical>
            <div style={{ width: "100%", maxWidth: 480 }}>
              <Input label="SEARCH ROASTS" placeholder="Search by URL, tag, or @user..." />
            </div>
            <div style={{ width: "100%", maxWidth: 480 }}>
              <Input
                label="YOUR HANDLE"
                placeholder="pixel_dev"
                prefix="@"
                helperText="Used as your roaster identity."
                suffix={<Button variant="dark" size="md">SAVE</Button>}
              />
            </div>
          </Row>
        </Section>

        {/* ── Badges ────────────────────────────────────────── */}
        <Section id="badges" title="Badges & Tags">
          <Row label="Category Tags">
            <Badge variant="landing">LANDING PAGE</Badge>
            <Badge variant="portfolio">PORTFOLIO</Badge>
            <Badge variant="saas">SAAS</Badge>
            <Badge variant="startup">STARTUP</Badge>
            <Badge variant="agency">AGENCY</Badge>
            <Badge variant="ecommerce">E-COMMERCE</Badge>
          </Row>
          <Row label="Status Badges">
            <Badge variant="live">🔥 LIVE ROAST</Badge>
            <Badge variant="pending">⏳ PENDING</Badge>
            <Badge variant="reviewed">✅ REVIEWED</Badge>
            <Badge variant="trending">💬 TRENDING</Badge>
            <Badge variant="launched">🚀 LAUNCHED</Badge>
          </Row>
          <Row label="Score Badges">
            <ScoreBadge score={12} />
            <ScoreBadge score={34} />
            <ScoreBadge score={55} />
            <ScoreBadge score={73} />
            <ScoreBadge score={91} />
          </Row>
          <Row label="Score Breakdown" vertical>
            <div style={{ width: "100%", maxWidth: 480 }}>
              <ScoreBreakdown design={23} copy={41} ux={15} performance={67} mobile={30} />
            </div>
          </Row>
        </Section>

        {/* ── Cards ─────────────────────────────────────────── */}
        <Section id="cards" title="Cards">
          <Row label="Dashboard Stat Cards">
            <StatCard value="1,247" label="Total Roasts"    delta={12}  accent="var(--fire-red)" />
            <StatCard value="38.4"  label="Avg Score Given" delta={-4}  accent="var(--fire-orange)" />
            <StatCard value="94"    label="Sites Today"     delta={8}   accent="var(--electric-blue)" />
            <StatCard value="3.2k"  label="Community Votes" delta={22}  accent="var(--acid-lime)" />
          </Row>
          <Row label="User Cards">
            <UserCard handle="pixel_dev"   roasts={47} avgScore={34} badge="TOP ROASTER" />
            <UserCard handle="jess_builds" roasts={12} avgScore={61} />
            <UserCard handle="startupkid"  roasts={3}  avgScore={78} />
          </Row>
        </Section>

        {/* ── Patterns ──────────────────────────────────────── */}
        <Section id="patterns" title="Feed — Roast Cards">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
              gap: 24,
            }}
          >
            <RoastCard
              url="techflow.io"
              title="TechFlow — Workflow Automation"
              tags={["saas", "startup"]}
              scores={{ design: 18, copy: 31, ux: 22, performance: 24, mobile: 14 }}
              overall={21}
              votes={47}
              comments={18}
              author="pixel_dev"
              timeAgo="2h ago"
              featured
            />
            <RoastCard
              url="janedoe.design"
              title="Jane Doe — UX Portfolio"
              tags={["portfolio"]}
              scores={{ design: 72, copy: 55, ux: 68, performance: 60, mobile: 60 }}
              overall={64}
              votes={23}
              comments={9}
              author="roaster_ph"
              timeAgo="5h ago"
            />
          </div>
        </Section>

      </main>
    </div>
  )
}
