/**
 * DesignSystemPage — Full interactive Design System showcase
 *
 * Sections: Foundations / Typography / Atoms / Enterprise Patterns / Motion / Hooks
 *
 * Features:
 *  - Light / dark theme toggle (data-ds-theme scoped — rest of app unaffected)
 *  - Compact / comfortable / spacious density toggle
 *  - Both toggles persist via useLocalStorageState (demonstrating the hook)
 *  - RuleOfThreeContainer wired to useAgenticOrchestrator (live MCP feed)
 *  - ChainOfThoughtDrawer driven by orchestrator's selected alert
 *  - HitlStagingCard driven by orchestrator's approval state machine
 *  - Toast notification, spring progress bar, skeleton loading motion demos
 *
 * Cognitive Scaffold Design System v2.0
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Check, Copy, Sun, Moon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChainOfThoughtDrawer } from "@/components/patterns/ChainOfThoughtDrawer";
import { HitlStagingCard } from "@/components/patterns/HitlStagingCard";
import { RuleOfThreeContainer } from "@/components/patterns/RuleOfThreeContainer";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { useAgenticOrchestrator } from "@/lib/useAgenticOrchestrator";

/* ── Types ──────────────────────────────────────────────────────────────── */
type Density = "compact" | "comfortable" | "spacious";
type Theme   = "dark"    | "light";

/* ── Section / SubSection wrappers ─────────────────────────────────────── */
function Section({ title, subtitle, children }: {
  title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-[11px] font-mono tracking-[0.2em] uppercase text-primary mb-1">{title}</h2>
        {subtitle && <p className="text-[13px] text-muted-foreground">{subtitle}</p>}
        <div className="h-px bg-border mt-4" />
      </div>
      {children}
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground/50">{title}</h3>
      {children}
    </div>
  );
}

/* ── Token swatch with copy-to-clipboard ───────────────────────────────── */
function TokenSwatch({ name, cssVar, value }: { name: string; cssVar: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard?.writeText(cssVar); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
      className="flex items-center gap-3 text-start group w-full hover:bg-white/5 rounded-sm px-2 py-1.5 transition-colors"
    >
      <div className="w-8 h-8 rounded-sm border border-border/30 flex-shrink-0"
           style={{ background: `var(${cssVar})` }} />
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-mono text-foreground/80 truncate">{name}</div>
        <div className="text-[10px] font-mono text-muted-foreground/50 truncate">{value}</div>
      </div>
      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/50">
        {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
      </span>
    </button>
  );
}

/* ── Spring progress bar ─────────────────────────────────────────────────── */
function SpringProgressBar({ target }: { target: number }) {
  const spring = useSpring(0, { stiffness: 60, damping: 18 });
  const width  = useTransform(spring, (v) => `${v}%`);

  useEffect(() => { spring.set(target); }, [target, spring]);

  return (
    <div className="h-2 w-full bg-border/40 rounded-full overflow-hidden">
      <motion.div className="h-full bg-primary rounded-full" style={{ width }} />
    </div>
  );
}

/* ── Skeleton card ──────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-card border border-card-border rounded-sm p-5 relative overflow-hidden flex flex-col gap-4 animate-pulse">
      <div className="absolute inset-y-0 start-0 w-[2px] bg-border" />
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="h-2.5 w-20 rounded bg-border/60" />
          <div className="h-5 w-44 rounded bg-border/40" />
          <div className="h-2 w-28 rounded bg-border/30" />
        </div>
        <div className="h-8 w-24 rounded-sm bg-border/40 flex-shrink-0" />
      </div>
      <div className="space-y-2">
        <div className="h-2.5 w-16 rounded bg-border/40" />
        <div className="h-3.5 w-full rounded bg-border/30" />
        <div className="h-px bg-border/30" />
        <div className="h-2.5 w-16 rounded bg-border/40" />
        <div className="h-3.5 w-3/4 rounded bg-border/25" />
      </div>
    </div>
  );
}

/* ── Toast notification ─────────────────────────────────────────────────── */
interface Toast { id: number; message: string; type: "approve" | "reject" | "info" }

const toastColors: Record<Toast["type"], string> = {
  approve: "border-l-hitl-approve bg-card",
  reject:  "border-l-hitl-reject  bg-card",
  info:    "border-l-primary      bg-card",
};

function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="relative h-24 overflow-visible">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0,  scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className={`absolute top-0 start-0 end-0 flex items-center justify-between gap-3 border border-border/30 border-l-4 rounded-sm px-4 py-3 ${toastColors[t.type]}`}
          >
            <span className="text-[13px] text-foreground/80">{t.message}</span>
            <button onClick={() => onDismiss(t.id)} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ── Density gap map ─────────────────────────────────────────────────────── */
const densityGap: Record<Density, string> = {
  compact:     "gap-4",
  comfortable: "gap-10",
  spacious:    "gap-16",
};

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function DesignSystemPage() {
  /* Persistent controls — useLocalStorageState demonstration */
  const [density, setDensity] = useLocalStorageState<Density>("ds:density", "comfortable");
  const [theme,   setTheme]   = useLocalStorageState<Theme>("ds:theme", "dark");

  /* Live agentic state — useAgenticOrchestrator demonstration */
  const orchestrator = useAgenticOrchestrator(3);

  /* Local demo state */
  const [cotOpen,  setCotOpen]  = useState(false);
  const [progressTarget, setProgressTarget] = useState(42);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);

  function addToast(message: string, type: Toast["type"] = "info") {
    const id = toastCounter + 1;
    setToastCounter(id);
    setToasts((prev) => [{ id, message, type }, ...prev].slice(0, 2));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  /* Translate labels for pattern components */
  const urgencyLabels: Record<string, string> = { high: "HIGH", medium: "MEDIUM", low: "LOW" };
  const urgencyActions: Record<string, string> = { high: "Take Action", medium: "Review", low: "Open" };

  /* CoT steps from selected alert or demo fallback */
  const cotSteps = orchestrator.selectedAlert?.chainOfThought ?? [
    "Analysed client portfolio volatility over trailing 90 days.",
    "Cross-referenced risk tolerance profile against current exposure.",
    "Evaluated regulatory threshold triggers for discretionary rebalancing.",
    "Identified optimal rebalancing window using liquidity model.",
    "Drafted compliant communication aligned to client mandate.",
  ];
  const cotSources = orchestrator.selectedAlert?.dataSourcesEvaluated ?? [
    "Bloomberg Market Data — real-time feed",
    "CRM Client Profile v4.2",
    "Regulatory Compliance Engine 3.1",
  ];
  const cotScore = orchestrator.selectedAlert?.confidenceScore ?? 78;

  return (
    <div data-ds-theme={theme} className="min-h-screen bg-background text-foreground transition-colors duration-300">

      {/* ── Sticky top bar ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b border-border/50 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-[13px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <span className="text-border/60">/</span>
            <span className="font-mono text-[12px] text-primary tracking-wide">Design System</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Density toggle */}
            <div className="flex items-center gap-0.5 bg-card border border-border/40 rounded-sm p-0.5">
              {(["compact", "comfortable", "spacious"] as Density[]).map((d) => (
                <button key={d} onClick={() => setDensity(d)}
                  title={d}
                  className={`font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 rounded-[2px] transition-colors ${
                    density === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {d[0].toUpperCase()}
                </button>
              ))}
            </div>

            {/* Light / dark theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="flex items-center gap-1.5 bg-card border border-border/40 rounded-sm px-2.5 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === "dark"
                ? <Sun  className="w-3.5 h-3.5" />
                : <Moon className="w-3.5 h-3.5" />}
              <span className="font-mono text-[9px] tracking-widest uppercase">
                {theme === "dark" ? "Light" : "Dark"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 pt-14 pb-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h1 className="text-[28px] font-semibold tracking-tight leading-none mb-2">Cognitive Scaffold</h1>
              <p className="text-[13px] text-muted-foreground max-w-xl">
                Production-grade, token-driven design system for enterprise agentic interfaces.
                OKLCH primitives → semantic aliases → enterprise patterns → motion.
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-col items-end gap-1">
              <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/40">version</span>
              <span className="font-mono text-[13px] text-primary">v2.0.0</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            {["OKLCH Color Space", "W3C DTCG tokens.json", "Tailwind v4", "framer-motion", "wouter", "Enterprise Patterns"].map((tag) => (
              <span key={tag} className="font-mono text-[10px] tracking-wide border border-border/40 rounded-sm px-2.5 py-1 text-muted-foreground/60">
                {tag}
              </span>
            ))}
          </div>
          {/* Persistent-state proof */}
          <p className="mt-4 text-[11px] font-mono text-muted-foreground/40">
            Density &amp; theme toggles persist via <span className="text-primary">useLocalStorageState</span> — try refreshing.
          </p>
        </motion.div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className={`max-w-4xl mx-auto px-6 pb-24 flex flex-col ${densityGap[density]}`}>

        {/* ── 01 FOUNDATIONS ──────────────────────────────────────────────── */}
        <Section title="01 · Foundations" subtitle="OKLCH primitive scale → semantic aliases → agentic tokens">
          <SubSection title="Primitive Neutrals (OKLCH)">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
              {[
                { name: "neutral-50",  css: "--primitive-neutral-50",  val: "oklch(6.7% 0 0)" },
                { name: "neutral-100", css: "--primitive-neutral-100", val: "oklch(10% 0 0)" },
                { name: "neutral-150", css: "--primitive-neutral-150", val: "oklch(13% 0 0)" },
                { name: "neutral-200", css: "--primitive-neutral-200", val: "oklch(20% 0 0)" },
                { name: "neutral-400", css: "--primitive-neutral-400", val: "oklch(49% 0.004 60)" },
                { name: "neutral-900", css: "--primitive-neutral-900", val: "oklch(93% 0.007 75)" },
              ].map((t) => <TokenSwatch key={t.name} name={t.name} cssVar={t.css} value={t.val} />)}
            </div>
          </SubSection>

          <SubSection title="Brand / Amber (OKLCH)">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
              {[
                { name: "amber-400", css: "--primitive-amber-400", val: "oklch(74% 0.12 60)" },
                { name: "amber-500", css: "--primitive-amber-500", val: "oklch(67% 0.099 55)" },
                { name: "amber-600", css: "--primitive-amber-600", val: "oklch(57% 0.09 55)" },
                { name: "amber-700", css: "--primitive-amber-700", val: "oklch(51% 0.006 60)" },
              ].map((t) => <TokenSwatch key={t.name} name={t.name} cssVar={t.css} value={t.val} />)}
            </div>
          </SubSection>

          <SubSection title="Semantic → Agentic Token Chain">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {[
                { name: "urgency-high",   css: "--token-urgency-high",   val: "{primitive.amber.500}" },
                { name: "urgency-medium", css: "--token-urgency-medium", val: "{primitive.amber.600}" },
                { name: "urgency-low",    css: "--token-urgency-low",    val: "{primitive.amber.700}" },
                { name: "hitl-approve",   css: "--token-hitl-approve",   val: "{primitive.green.500}" },
                { name: "hitl-reject",    css: "--token-hitl-reject",    val: "{primitive.red.500}" },
                { name: "hitl-stage",     css: "--token-hitl-stage",     val: "{primitive.blue.400}" },
                { name: "cot-step",       css: "--token-cot-step",       val: "{primitive.amber.500}" },
                { name: "rot-primary",    css: "--token-rot-primary",    val: "{primitive.amber.500}" },
              ].map((t) => <TokenSwatch key={t.name} name={t.name} cssVar={t.css} value={t.val} />)}
            </div>
          </SubSection>

          <SubSection title="Light / Dark Theme Switch">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-card-border rounded-sm p-4 space-y-2">
                <p className="text-[12px] font-mono text-primary">Current mode: {theme}</p>
                <p className="text-[11px] text-muted-foreground">
                  <code className="text-[10px] bg-background/50 px-1 py-0.5 rounded">data-ds-theme=&quot;{theme}&quot;</code> is scoped to this page container — the dashboard stays dark.
                </p>
              </div>
              <div className="rounded-sm border border-border/40 px-4 py-3 text-[11px] font-mono text-muted-foreground/60 leading-relaxed">
                <p className="text-primary mb-1">[data-ds-theme="light"]</p>
                <p>--background: 0 0% 98%</p>
                <p>--foreground: 0 0% 10%</p>
                <p>--primary:    33 49.3% 42%</p>
              </div>
            </div>
          </SubSection>

          <SubSection title="tokens.json — W3C DTCG machine-legible manifest">
            <div className="rounded-sm border border-border/40 bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
                <span className="font-mono text-[10px] text-muted-foreground/50 tracking-wide">src/tokens.json</span>
                <span className="font-mono text-[9px] text-primary tracking-widest uppercase">W3C DTCG</span>
              </div>
              <pre className="px-4 py-3 overflow-x-auto text-[11px] font-mono text-foreground/70 leading-relaxed">{`{
  "primitive": { "amber": { "500": { "$value": "oklch(67% 0.099 55)", "$type": "color" } } },
  "semantic":  { "brand": { "$value": "{primitive.amber.500}", "$type": "color" } },
  "agentic":   { "urgency": { "high": { "$value": "{primitive.amber.500}", "$type": "color" } } },
  "motion":    { "duration": { "approval": { "$value": "1100ms", "$type": "duration" } } }
}`}</pre>
            </div>
          </SubSection>
        </Section>

        {/* ── 02 TYPOGRAPHY ───────────────────────────────────────────────── */}
        <Section title="02 · Typography" subtitle="Inter (Latin) · Noto Sans Arabic (RTL) — fluid scale">
          <SubSection title="Type Scale">
            <div className="bg-card border border-border/40 rounded-sm divide-y divide-border/30">
              {[
                { px: "9px",  label: "9",  w: "font-normal" },
                { px: "11px", label: "11", w: "font-normal" },
                { px: "13px", label: "13", w: "font-normal" },
                { px: "14px", label: "14", w: "font-normal" },
                { px: "16px", label: "16", w: "font-normal" },
                { px: "18px", label: "18", w: "font-semibold" },
                { px: "24px", label: "24", w: "font-semibold" },
                { px: "28px", label: "28", w: "font-bold" },
              ].map(({ px, label, w }) => (
                <div key={px} className="flex items-baseline gap-4 px-4 py-2">
                  <span className="font-mono text-[10px] text-muted-foreground/40 w-8 flex-shrink-0">{label}</span>
                  <span className={`${w} leading-none text-foreground/80`} style={{ fontSize: px }}>Concierge OS</span>
                </div>
              ))}
            </div>
          </SubSection>

          <SubSection title="Mono Specimens">
            <div className="bg-card border border-border/40 rounded-sm px-4 py-3 space-y-2">
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-primary">HIGH · MCP FEED CONNECTED</p>
              <p className="font-mono text-[11px] text-muted-foreground/50 tracking-widest">P1 · URGENCY · CHAIN-OF-THOUGHT</p>
              <p className="font-mono text-[13px] text-muted-foreground">78% confidence · 4 sources evaluated</p>
            </div>
          </SubSection>
        </Section>

        {/* ── 03 ATOMS ────────────────────────────────────────────────────── */}
        <Section title="03 · Atoms" subtitle="Base interactive components with token-driven states">
          <SubSection title="Buttons">
            <div className="flex flex-wrap gap-3">
              <Button className="bg-primary text-primary-foreground rounded-sm shadow-none">Primary Action</Button>
              <Button variant="outline" className="rounded-sm shadow-none border-border/50">Secondary</Button>
              <Button variant="outline" className="rounded-sm shadow-none border-border/50 text-muted-foreground" disabled>Disabled</Button>
              <Button
                className="rounded-sm shadow-none text-hitl-approve-fg border border-hitl-approve/60 bg-hitl-approve/10 hover:bg-hitl-approve/20"
                onClick={() => addToast("Action approved and queued for execution.", "approve")}
              >
                Approve (fires toast)
              </Button>
              <Button
                className="rounded-sm shadow-none text-hitl-reject-fg border border-hitl-reject/60 bg-hitl-reject/10 hover:bg-hitl-reject/20"
                onClick={() => addToast("Action rejected. Returning to queue.", "reject")}
              >
                Reject (fires toast)
              </Button>
            </div>
          </SubSection>

          <SubSection title="Urgency Badges">
            <div className="flex flex-wrap gap-3 items-center">
              {[
                { label: "HIGH",   cls: "text-urgency-high   border-urgency-high/30" },
                { label: "MEDIUM", cls: "text-urgency-medium border-urgency-medium/30" },
                { label: "LOW",    cls: "text-urgency-low    border-urgency-low/30" },
              ].map(({ label, cls }) => (
                <span key={label} className={`font-mono text-[10px] tracking-widest border rounded-sm px-2.5 py-1 ${cls}`}>{label}</span>
              ))}
            </div>
          </SubSection>

          <SubSection title="Input / Textarea">
            <div className="space-y-2 max-w-md">
              <input placeholder="Search client portfolio…"
                className="w-full bg-background border border-border/50 rounded-sm px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors" />
              <textarea placeholder="Draft communication…" rows={3}
                className="w-full bg-background border border-border/50 rounded-sm px-4 py-2.5 text-[13px] text-foreground font-mono placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors" />
            </div>
          </SubSection>
        </Section>

        {/* ── 04 ENTERPRISE AGENTIC PATTERNS ──────────────────────────────── */}
        <Section title="04 · Enterprise Agentic Patterns"
          subtitle="Live patterns wired to useAgenticOrchestrator — same state machine used in the dashboard">

          {/* RuleOfThreeContainer — wired to live MCP feed via orchestrator */}
          <SubSection title="Rule-of-Three Container (live MCP feed)">
            <p className="text-[12px] text-muted-foreground/60 -mt-1 mb-3">
              Driven by <code className="font-mono text-[11px] text-primary">useAgenticOrchestrator</code>.
              Click a card to select it — the CoT drawer and HITL card below respond to the same selection.
            </p>
            {orchestrator.isLoading ? (
              <div className="space-y-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
            ) : orchestrator.isError ? (
              <div className="border border-card-border rounded-sm px-5 py-4 text-[13px] text-muted-foreground font-mono">
                MCP feed unavailable — check API server.
              </div>
            ) : orchestrator.visibleAlerts.length === 0 ? (
              <div className="border border-card-border rounded-sm px-5 py-8 text-center">
                <Check className="w-4 h-4 text-primary mx-auto mb-2" />
                <p className="text-[13px] text-muted-foreground">All items resolved.</p>
              </div>
            ) : (
              <RuleOfThreeContainer
                alerts={orchestrator.visibleAlerts}
                selectedId={orchestrator.selectedAlert?.id ?? null}
                onSelect={orchestrator.handleSelect}
                isPanelOpen={false}
                urgencyLabels={urgencyLabels}
                urgencyActions={urgencyActions}
                confidenceLabel={(n) => `${n}% confidence`}
                triggerEventLabel="Trigger Event"
                suggestedActionLabel="Suggested Action"
                mcpFeedLabel="MCP · Model Context Protocol"
              />
            )}
          </SubSection>

          {/* ChainOfThoughtDrawer — driven by selected alert */}
          <SubSection title="Chain-of-Thought Drawer (driven by selected alert)">
            <p className="text-[12px] text-muted-foreground/60 -mt-1 mb-2">
              {orchestrator.selectedAlert
                ? `Showing CoT for: ${orchestrator.selectedAlert.clientName}`
                : "Select a card above to load its reasoning — or view the demo fallback below."}
            </p>
            <ChainOfThoughtDrawer
              steps={cotSteps}
              confidenceScore={cotScore}
              dataSources={cotSources}
              isOpen={cotOpen}
              onToggle={() => setCotOpen((v) => !v)}
            />
          </SubSection>

          {/* HitlStagingCard — driven by orchestrator's approval state machine */}
          <SubSection title="HITL Staging Card (staged approval state machine)">
            <p className="text-[12px] text-muted-foreground/60 -mt-1 mb-3">
              {orchestrator.selectedAlert
                ? `Ready to approve: ${orchestrator.selectedAlert.clientName}`
                : "Select a card in the Rule-of-Three above, then approve here."}
              &nbsp;State: <code className="font-mono text-[11px] text-primary">{orchestrator.approvalState}</code>
            </p>
            <div className="max-w-sm">
              <HitlStagingCard
                approvalState={orchestrator.approvalState}
                confidenceScore={orchestrator.selectedAlert?.confidenceScore ?? 78}
                onApprove={() => {
                  orchestrator.handleApprove();
                  addToast("Executing approved action via MCP…", "approve");
                }}
                onReject={() => {
                  orchestrator.handleReject();
                  addToast("Action rejected. Returned to queue.", "reject");
                }}
              />
            </div>
          </SubSection>
        </Section>

        {/* ── 05 MOTION ────────────────────────────────────────────────────── */}
        <Section title="05 · Motion" subtitle="framer-motion — duration tokens, spring physics, reduced-motion safe">

          {/* Toast stack demo */}
          <SubSection title="Toast Notifications (spring entrance/exit)">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="rounded-sm shadow-none border-border/50 text-[13px]"
                  onClick={() => addToast("MCP feed connection established.", "info")}>
                  Info toast
                </Button>
                <Button variant="outline" className="rounded-sm shadow-none border-border/50 text-[13px]"
                  onClick={() => addToast("Portfolio rebalancing approved and queued.", "approve")}>
                  Approve toast
                </Button>
                <Button variant="outline" className="rounded-sm shadow-none border-border/50 text-[13px]"
                  onClick={() => addToast("Action rejected — returned to queue.", "reject")}>
                  Reject toast
                </Button>
              </div>
              <ToastStack toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
            </div>
          </SubSection>

          {/* Spring progress bar */}
          <SubSection title="Spring Progress Bar (physics-based interpolation)">
            <div className="space-y-4 max-w-md">
              <SpringProgressBar target={progressTarget} />
              <div className="flex flex-wrap gap-2">
                {[0, 25, 50, 78, 100].map((v) => (
                  <Button key={v} variant="outline"
                    className={`rounded-sm shadow-none border-border/50 text-[12px] font-mono px-3 py-1.5 ${progressTarget === v ? "border-primary text-primary" : ""}`}
                    onClick={() => setProgressTarget(v)}>
                    {v}%
                  </Button>
                ))}
              </div>
              <p className="font-mono text-[10px] text-muted-foreground/40">
                stiffness: 60 · damping: 18 · easing: spring
              </p>
            </div>
          </SubSection>

          {/* Skeleton loading state */}
          <SubSection title="Skeleton Loading State (pulse animation)">
            <div className="space-y-3">
              <Button variant="outline" className="rounded-sm shadow-none border-border/50 text-[13px]"
                onClick={() => { setShowSkeleton(true); setTimeout(() => setShowSkeleton(false), 2200); }}>
                Simulate feed loading (2.2 s)
              </Button>
              <AnimatePresence mode="wait">
                {showSkeleton ? (
                  <motion.div key="skel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="space-y-3">
                    <SkeletonCard /><SkeletonCard />
                  </motion.div>
                ) : (
                  <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="bg-card border border-card-border rounded-sm p-4 text-[13px] text-muted-foreground">
                    Content loaded — skeleton replaced.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </SubSection>

          {/* Stagger fade-up */}
          <SubSection title="Stagger Entrance (fade-up with children delay)">
            <motion.div
              key={density}
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.07 } } }}
              className="grid grid-cols-3 gap-3"
            >
              {["instant · 100ms", "fast · 200ms", "default · 300ms", "slow · 500ms", "approval · 1100ms", "spring easing"].map((label) => (
                <motion.div key={label}
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } }}
                  className="bg-card border border-card-border rounded-sm px-3 py-2.5 text-center">
                  <span className="font-mono text-[10px] text-muted-foreground/60">{label}</span>
                </motion.div>
              ))}
            </motion.div>
          </SubSection>

          <SubSection title="Reduced-motion safe">
            <div className="bg-card border border-border/40 rounded-sm px-4 py-3 font-mono text-[12px] text-muted-foreground/60">
              @media (prefers-reduced-motion: reduce) — all durations collapse to 0.01ms
            </div>
          </SubSection>
        </Section>

        {/* ── 06 MIDDLE-LAYER HOOKS ────────────────────────────────────────── */}
        <Section title="06 · Middle-Layer Hooks"
          subtitle="Reusable state primitives — both are live on this page right now">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                name: "useLocalStorageState",
                sig: "useLocalStorageState<T>(key, initial)",
                desc: "localStorage-backed useState with cross-tab sync and private-browsing fallback. Drives the density & theme toggles above — try refreshing.",
                live: `ds:density = "${density}" · ds:theme = "${theme}"`,
                tags: ["storage", "cross-tab", "resilient"],
              },
              {
                name: "useAgenticOrchestrator",
                sig: "useAgenticOrchestrator(visibleCount?)",
                desc: "Central agentic state: MCP feed, dismissal queue, selection, CoT visibility, staged HITL approval. Drives the Rule-of-Three, CoT drawer, and HITL card above.",
                live: `${orchestrator.activeAlerts.length} active · selected: ${orchestrator.selectedAlert?.clientName ?? "none"} · approval: ${orchestrator.approvalState}`,
                tags: ["MCP", "HITL", "CoT", "RoT", "dismissal"],
              },
            ].map(({ name, sig, desc, live, tags }) => (
              <div key={name} className="bg-card border border-card-border rounded-sm p-4 space-y-2">
                <div className="font-mono text-[13px] text-primary">{name}</div>
                <div className="font-mono text-[11px] text-muted-foreground/50 bg-background/50 rounded-sm px-2 py-1">{sig}</div>
                <p className="text-[12px] text-muted-foreground/70">{desc}</p>
                <div className="font-mono text-[10px] text-primary/70 bg-primary/5 border border-primary/15 rounded-sm px-2 py-1">
                  live: {live}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((t) => (
                    <span key={t} className="font-mono text-[9px] tracking-wide border border-border/30 rounded-sm px-1.5 py-0.5 text-muted-foreground/50">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  );
}
