import { Button } from "@roaster/ui/components/button"
import { Input } from "@roaster/ui/components/input"
import { Badge, ScoreBadge } from "@roaster/ui/components/badge"
import { StatCard, UserCard } from "@roaster/ui/components/card"
import { ScoreBreakdown } from "@roaster/ui/components/score-bar"
import { RoastCard } from "@roaster/ui/components/roast-card"

export default function Page() {
  return (
    <div className="min-h-svh pixel-grid-bg p-8 flex flex-col gap-16">

      {/* Buttons */}
      <section className="flex flex-col gap-4">
        <h2 className="font-[family-name:var(--font-pixel)] text-[12px] uppercase" style={{ color: "var(--text-primary)" }}>
          Buttons
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary">Roast It</Button>
          <Button variant="secondary">View Roast</Button>
          <Button variant="accent">Submit Site</Button>
          <Button variant="orange">🔥 Launch</Button>
          <Button variant="ghost">Share</Button>
          <Button variant="danger">Delete</Button>
          <Button variant="dark">Dashboard</Button>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
          <Button variant="primary" size="xl">X-Large</Button>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="secondary" disabled>Disabled</Button>
        </div>
      </section>

      {/* Inputs */}
      <section className="flex flex-col gap-4 max-w-md">
        <h2 className="font-[family-name:var(--font-pixel)] text-[12px] uppercase" style={{ color: "var(--text-primary)" }}>
          Inputs
        </h2>
        <Input label="SITE URL" placeholder="https://yourstartup.com" prefix="🌐" helperText="Must be a public URL — we'll screenshot and roast it." />
        <Input label="SITE URL — ERROR STATE" placeholder="https://yourstartup.com" prefix="🌐" error errorText="URL is not reachable. Check the address." />
        <Input label="SEARCH ROASTS" placeholder="Search by URL, tag, or @user..." />
        <Input label="YOUR HANDLE" placeholder="@pixel_dev" prefix="@" helperText="Used as your roaster identity." />
      </section>

      {/* Badges */}
      <section className="flex flex-col gap-4">
        <h2 className="font-[family-name:var(--font-pixel)] text-[12px] uppercase" style={{ color: "var(--text-primary)" }}>
          Badges
        </h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="landing">LANDING PAGE</Badge>
          <Badge variant="portfolio">PORTFOLIO</Badge>
          <Badge variant="saas">SAAS</Badge>
          <Badge variant="startup">STARTUP</Badge>
          <Badge variant="agency">AGENCY</Badge>
          <Badge variant="ecommerce">E-COMMERCE</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="live">🔥 LIVE ROAST</Badge>
          <Badge variant="pending">⏳ PENDING</Badge>
          <Badge variant="reviewed">✅ REVIEWED</Badge>
          <Badge variant="trending">💬 TRENDING</Badge>
          <Badge variant="launched">🚀 LAUNCHED</Badge>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <ScoreBadge score={12} />
          <ScoreBadge score={34} />
          <ScoreBadge score={55} />
          <ScoreBadge score={73} />
          <ScoreBadge score={91} />
        </div>
      </section>

      {/* Score Breakdown */}
      <section className="flex flex-col gap-4 max-w-md">
        <h2 className="font-[family-name:var(--font-pixel)] text-[12px] uppercase" style={{ color: "var(--text-primary)" }}>
          Score Breakdown
        </h2>
        <ScoreBreakdown design={23} copy={41} ux={15} performance={67} mobile={30} />
      </section>

      {/* Cards */}
      <section className="flex flex-col gap-4">
        <h2 className="font-[family-name:var(--font-pixel)] text-[12px] uppercase" style={{ color: "var(--text-primary)" }}>
          Stat Cards
        </h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 max-w-2xl">
          <StatCard value="1,247" label="Total Roasts"    delta={12}  accent="var(--fire-red)" />
          <StatCard value="38.4"  label="Avg Score Given" delta={-4}  accent="var(--fire-orange)" />
          <StatCard value="94"    label="Sites Today"     delta={8}   accent="var(--electric-blue)" />
          <StatCard value="3.2k"  label="Community Votes" delta={22}  accent="var(--acid-lime)" />
        </div>
        <h2 className="font-[family-name:var(--font-pixel)] text-[12px] uppercase mt-4" style={{ color: "var(--text-primary)" }}>
          User Cards
        </h2>
        <div className="flex flex-wrap gap-4">
          <UserCard handle="pixel_dev"   roasts={47} avgScore={34} badge="TOP ROASTER" />
          <UserCard handle="jess_builds" roasts={12} avgScore={61} />
          <UserCard handle="startupkid"  roasts={3}  avgScore={78} />
        </div>
      </section>

      {/* Roast Feed */}
      <section className="flex flex-col gap-4">
        <h2 className="font-[family-name:var(--font-pixel)] text-[12px] uppercase" style={{ color: "var(--text-primary)" }}>
          Feed — Roast Cards
        </h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-6 max-w-4xl">
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
      </section>

    </div>
  )
}
