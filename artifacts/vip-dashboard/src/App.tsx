import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { Shield, Briefcase, Calendar, BarChart3, Settings, X, Check, Loader2, Layers, Sun, Moon, Menu, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetMcpFeed } from "@workspace/api-client-react";
import type { McpAlert } from "@workspace/api-client-react";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

/* ─── Localisation ────────────────────────────────────────────────────────── */

type Locale = "en" | "ar";

const translations = {
  en: {
    appName: "Concierge OS",
    nav: {
      cognitiveScaffold: "Cognitive Scaffold",
      portfolio: "Portfolio",
      calendar: "Calendar",
      intelligence: "Intelligence",
      settings: "Settings",
    },
    section: {
      title: "Cognitive Scaffold",
      connecting: "Connecting to MCP feed…",
      feedUnavailable: "Feed unavailable.",
      allResolved: "All items resolved. Queue is clear.",
      itemsRequired: (n: number) =>
        `${n} item${n !== 1 ? "s" : ""} requiring immediate decision.`,
      inQueue: (n: number) =>
        `${n} item${n !== 1 ? "s" : ""} in queue`,
    },
    urgency: {
      high: "HIGH",
      medium: "MEDIUM",
      low: "LOW",
    } as Record<string, string>,
    card: {
      confidence: (n: number) => `${n}% confidence`,
      triggerEvent: "Trigger Event",
      suggestedAction: "Suggested Action",
      mcpFeed: "MCP · Model Context Protocol Feed",
      feedError: "MCP feed connection failed. Check API server status.",
      allTasksResolved: "All tasks resolved.",
    },
    panel: {
      suggestedAction: "Suggested Action",
      tier: "Client Tier",
      evalLiteracy: "Eval Literacy",
      chainOfThought: "Chain of Thought · AI Reasoning Transparency",
      reasoningSteps: "Reasoning Steps",
      confidence: "Confidence",
      dataSourcesEvaluated: "Data Sources Evaluated",
      draftCommunication: "Draft Communication",
      mcpConfidence: (n: number) => `${n}% MCP confidence`,
      approveExecute: "Approve & Execute",
      executing: "Executing…",
      executed: "Executed",
      rejectModify: "Reject / Modify",
      mcpProtocol: "MCP · Model Context Protocol",
    },
    urgencyAction: {
      high: "Take Action",
      medium: "Review",
      low: "Open",
    } as Record<string, string>,
    userRole: "Director of Relations",
    toggle: { en: "EN", ar: "AR" },
  },
  ar: {
    appName: "كونسيرج أو إس",
    nav: {
      cognitiveScaffold: "الهيكل المعرفي",
      portfolio: "المحفظة",
      calendar: "التقويم",
      intelligence: "الذكاء",
      settings: "الإعدادات",
    },
    section: {
      title: "الهيكل المعرفي",
      connecting: "جارٍ الاتصال بالتغذية…",
      feedUnavailable: "التغذية غير متاحة.",
      allResolved: "تمّت معالجة جميع البنود.",
      itemsRequired: (n: number) =>
        `${n} ${n === 1 ? "بند يستلزم" : "بنود تستلزم"} قراراً فورياً.`,
      inQueue: (n: number) =>
        `${n} ${n === 1 ? "بند" : "بنود"} في قائمة الانتظار`,
    },
    urgency: {
      high: "عالٍ",
      medium: "متوسط",
      low: "منتظم",
    } as Record<string, string>,
    card: {
      confidence: (n: number) => `ثقة ${n}٪`,
      triggerEvent: "الحدث المحفِّز",
      suggestedAction: "الإجراء المقترح",
      mcpFeed: "MCP · بروتوكول سياق النموذج",
      feedError: "فشل الاتصال بالتغذية. تحقق من حالة الخادم.",
      allTasksResolved: "تمّت معالجة جميع المهام.",
    },
    panel: {
      suggestedAction: "الإجراء المقترح",
      tier: "المستوى",
      evalLiteracy: "شفافية التقييم",
      chainOfThought: "سلسلة التفكير · شفافية استدلال الذكاء الاصطناعي",
      reasoningSteps: "خطوات الاستدلال",
      confidence: "الثقة",
      dataSourcesEvaluated: "مصادر البيانات المُقيَّمة",
      draftCommunication: "مسودة التواصل",
      mcpConfidence: (n: number) => `ثقة MCP ${n}٪`,
      approveExecute: "موافقة وتنفيذ",
      executing: "جارٍ التنفيذ…",
      executed: "تمّ التنفيذ",
      rejectModify: "رفض / تعديل",
      mcpProtocol: "MCP · بروتوكول سياق النموذج",
    },
    urgencyAction: {
      high: "اتخاذ إجراء",
      medium: "مراجعة",
      low: "فتح",
    } as Record<string, string>,
    userRole: "مدير العلاقات",
    toggle: { en: "EN", ar: "AR" },
  },
} as const;

type T = (typeof translations)[Locale];

/* ─── Nav item definitions ────────────────────────────────────────────────── */

const navItemDefs = [
  { key: "cognitiveScaffold" as const, icon: Shield, active: true },
  { key: "portfolio" as const, icon: Briefcase },
  { key: "calendar" as const, icon: Calendar },
  { key: "intelligence" as const, icon: BarChart3 },
  { key: "settings" as const, icon: Settings },
];

/* ─── Urgency styles — token-based classes so light/dark mode inherits ────────
   Token values are defined in index.css and automatically invert in
   [data-theme="light"]. No hardcoded hex anywhere so both modes comply.
────────────────────────────────────────────────────────────────────────────── */

const urgencyStyles: Record<string, { accent: string; badge: string; dot: string; gauge: string }> = {
  high:   { accent: "bg-urgency-high",   badge: "text-urgency-high",   dot: "bg-urgency-high",   gauge: "text-urgency-high"   },
  medium: { accent: "bg-urgency-medium", badge: "text-urgency-medium", dot: "bg-urgency-medium", gauge: "text-urgency-medium" },
  low:    { accent: "bg-urgency-low",    badge: "text-urgency-low",    dot: "bg-urgency-low",    gauge: "text-urgency-low"    },
};

/* ─── AlertCard ───────────────────────────────────────────────────────────── */

type ApprovalState = "idle" | "loading" | "done";

function AlertCard({
  card,
  isSelected,
  onSelect,
  isPanelOpen,
  t,
}: {
  card: McpAlert;
  isSelected: boolean;
  onSelect: () => void;
  isPanelOpen: boolean;
  t: T;
}) {
  const style = urgencyStyles[card.urgency] ?? urgencyStyles["low"];
  const urgencyLabel = t.urgency[card.urgency] ?? card.urgency.toUpperCase();
  const ctaLabel = t.urgencyAction[card.urgency] ?? "Review";

  return (
    <div
      data-testid={`alert-card-${card.id}`}
      onClick={onSelect}
      className={`bg-card rounded-sm border transition-all duration-200 cursor-pointer flex flex-col gap-4 relative overflow-hidden
        ${isSelected
          ? "border-primary/60 shadow-[0_0_0_1px_hsl(var(--primary)/0.3)]"
          : "border-card-border hover:border-border/70"
        }
        ${isPanelOpen ? "p-4" : "p-6"}
      `}
    >
      {/* Accent strip — logical start flips automatically in RTL */}
      <div className={`absolute inset-y-0 start-0 w-[2px] ${style.accent}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* WCAG: badge uses token class — ~6.5:1 dark, ~6:1 light ✓ */}
            <span className={`font-mono text-[10px] tracking-widest uppercase ${style.badge}`}>
              {urgencyLabel}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground ms-auto">
              {t.card.confidence(card.confidenceScore)}
            </span>
          </div>
          <h3
            className={`font-semibold text-foreground tracking-tight leading-snug ${isPanelOpen ? "text-[15px]" : "text-[18px]"}`}
            data-testid={`card-title-${card.id}`}
          >
            {card.clientName}
          </h3>
          {/* Tier label: raised from /45 → full muted-foreground (~7:1) ✓ */}
          <p className="font-mono text-[10px] text-muted-foreground tracking-wide truncate">
            {card.tier}
          </p>
        </div>

        {!isPanelOpen && (
          <Button
            data-testid={`action-${card.id}`}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-[13px] px-5 py-4 rounded-sm transition-all shadow-none"
          >
            {ctaLabel}
          </Button>
        )}
      </div>

      {!isPanelOpen && (
        <div className="space-y-3">
          <div className="space-y-1">
            {/* Section labels: raised from /60 → full muted-foreground ✓ */}
            <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
              {t.card.triggerEvent}
            </span>
            <p className="text-[13px] leading-relaxed text-muted-foreground" data-testid={`card-trigger-${card.id}`}>
              {card.triggerEvent}
            </p>
          </div>
          <div className="h-px w-full bg-border/40" />
          <div className="space-y-1">
            <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
              {t.card.suggestedAction}
            </span>
            <p className="text-[14px] leading-relaxed text-foreground" data-testid={`card-action-${card.id}`}>
              {card.suggestedAction}
            </p>
          </div>
          {/* MCP footer: raised from /50 → /80 ✓ */}
          <div className="flex items-center gap-2 pt-1">
            <div className={`w-1.5 h-1.5 rounded-full ${style.dot} opacity-70`} />
            <span className="text-[10px] font-mono text-muted-foreground/80 tracking-wide uppercase">
              {t.card.mcpFeed}
            </span>
          </div>
        </div>
      )}

      {isPanelOpen && (
        <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">
          {card.triggerEvent}
        </p>
      )}
    </div>
  );
}

/* ─── Confidence gauge SVG ────────────────────────────────────────────────── */

function ConfidenceGauge({ score, gaugeColor }: { score: number; gaugeColor: string }) {
  // Full circular progress ring — score centered inside.
  // stroke="currentColor" inherits from gaugeColor (text-urgency-*) Tailwind class.
  const size = 58;
  const strokeW = 4;
  const r = (size - strokeW * 2) / 2;        // 25
  const circumference = 2 * Math.PI * r;      // ~157
  const filled = (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Rotate −90° so the fill starts at 12 o'clock */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Track ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={strokeW}
          stroke="currentColor"
          className="text-foreground/10"
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={strokeW}
          stroke="currentColor"
          className={gaugeColor}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - filled}
        />
      </svg>
      {/* Score centered over the ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-[13px] font-bold text-foreground leading-none tabular-nums">
          {score}<span className="text-[9px] font-normal opacity-50 ms-0.5">%</span>
        </span>
      </div>
    </div>
  );
}

/* ─── DetailPanel ─────────────────────────────────────────────────────────── */

function DetailPanel({
  alert,
  onClose,
  onApprove,
  approvalState,
  t,
}: {
  alert: McpAlert;
  onClose: () => void;
  onApprove: () => void;
  approvalState: ApprovalState;
  t: T;
}) {
  const style = urgencyStyles[alert.urgency] ?? urgencyStyles["low"];
  const urgencyLabel = t.urgency[alert.urgency] ?? alert.urgency.toUpperCase();
  const [draft, setDraft] = useState(() => alert.actionPayload);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(alert.actionPayload);
  }, [alert.id]);

  return (
    <div
      data-testid="detail-panel"
      className="flex flex-col h-full bg-sidebar border-s border-sidebar-border overflow-hidden"
    >
      {/* Panel Header */}
      <div className="flex-shrink-0 flex items-start justify-between px-6 pt-6 pb-4 border-b border-sidebar-border/50">
        <div className="space-y-1 flex-1 min-w-0 pe-4">
          <span className={`font-mono text-[10px] tracking-widest uppercase ${style.badge}`}>
            {urgencyLabel}
          </span>
          <h2 className="text-[16px] font-semibold text-foreground tracking-tight leading-snug">
            {alert.clientName}
          </h2>
          {/* Tier: raised from /45 → full muted-foreground ✓ */}
          <p className="font-mono text-[10px] text-muted-foreground tracking-wide">
            {alert.tier}
          </p>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            {alert.triggerEvent}
          </p>
        </div>
        <button
          data-testid="panel-close"
          onClick={onClose}
          className="flex-shrink-0 w-7 h-7 rounded-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors mt-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto detail-panel-scroll px-6 py-5 space-y-5">
        <div className="space-y-1.5">
          {/* Labels: raised from /60 → full muted-foreground ✓ */}
          <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
            {t.panel.suggestedAction}
          </span>
          <p className="text-[13px] text-foreground leading-relaxed">
            {alert.suggestedAction}
          </p>
        </div>

        {/* ── Eval Literacy trust block ─────────────────── */}
        <div className="rounded-sm border border-border/40 bg-background/40 overflow-hidden">
          {/* Header row */}
          <div className="flex items-end justify-between gap-2 px-4 pe-3 pt-4 pb-3 border-b border-border/25">
            <div className="space-y-1 min-w-0 flex-1">
              {/* Raised from /60 → full muted-foreground ✓ */}
              <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
                {t.panel.evalLiteracy}
              </span>
              {/* Raised from /35 → muted-foreground ✓ */}
              <p className="text-[10px] text-muted-foreground leading-snug">
                {t.panel.chainOfThought}
              </p>
            </div>
            {/* min-w-[90px] prevents the CONFIDENCE label from overflowing the
                overflow-hidden parent block on narrow mobile screens */}
            <div className="flex-shrink-0 flex flex-col items-center gap-1 min-w-[90px]">
              <ConfidenceGauge score={alert.confidenceScore} gaugeColor={style.gauge} />
              {/* tracking-wide (not widest) keeps the label within the 90px column */}
              <span className="font-mono text-[9px] tracking-wide uppercase text-muted-foreground">
                {t.panel.confidence}
              </span>
            </div>
          </div>

          {/* Reasoning steps */}
          <div className="px-4 pt-3 pb-2 border-b border-border/25">
            {/* Raised from /35 → muted-foreground ✓ */}
            <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground block mb-2.5">
              {t.panel.reasoningSteps}
            </span>
            <ol className="space-y-2">
              {(alert.chainOfThought ?? []).map((step, i) => (
                <li key={i} className="flex gap-2.5 items-start">
                  <span className={`font-mono text-[9px] font-bold leading-none mt-[3px] flex-shrink-0 tabular-nums ${style.badge}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {/* CoT step text: raised from /65 → /90 ✓ */}
                  <span className="text-[11px] text-foreground/90 leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Data sources list */}
          <div className="px-4 pt-3 pb-3">
            {/* Raised from /35 → muted-foreground ✓ */}
            <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground block mb-2.5">
              {t.panel.dataSourcesEvaluated}
            </span>
            <div className="divide-y divide-border/20">
              {(alert.dataSourcesEvaluated ?? []).map((src, i) => (
                <div key={i} className="flex items-center gap-2.5 py-2">
                  <div className={`w-1 h-1 rounded-full flex-shrink-0 ${style.dot} opacity-60`} />
                  {/* Raised from /60 → /85 ✓ */}
                  <span className="text-[11px] text-foreground/85 leading-snug">{src}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            {/* Raised from /60 → muted-foreground ✓ */}
            <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
              {t.panel.draftCommunication}
            </span>
            {/* Raised from /40 → muted-foreground ✓ */}
            <span className="font-mono text-[10px] text-muted-foreground tracking-wide">
              {t.panel.mcpConfidence(alert.confidenceScore)}
            </span>
          </div>
          <textarea
            ref={textareaRef}
            data-testid="draft-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={approvalState !== "idle"}
            rows={14}
            className="w-full bg-background border border-border/50 rounded-sm px-4 py-3 text-[13px] text-foreground font-mono leading-relaxed resize-none focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Approval buttons */}
      <div className="flex-shrink-0 px-6 py-5 border-t border-sidebar-border/50 space-y-3">
        <Button
          data-testid="approve-button"
          onClick={onApprove}
          disabled={approvalState !== "idle"}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-[13px] py-5 rounded-sm transition-all shadow-none flex items-center justify-center gap-2 disabled:opacity-100"
        >
          {approvalState === "idle" && t.panel.approveExecute}
          {approvalState === "loading" && (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t.panel.executing}</span>
            </>
          )}
          {approvalState === "done" && (
            <>
              <Check className="w-4 h-4" />
              <span>{t.panel.executed}</span>
            </>
          )}
        </Button>

        <Button
          data-testid="reject-button"
          onClick={onClose}
          disabled={approvalState !== "idle"}
          variant="outline"
          className="w-full bg-transparent border-border/50 text-muted-foreground hover:text-foreground hover:bg-white/5 font-medium text-[13px] py-5 rounded-sm transition-all shadow-none disabled:opacity-40"
        >
          {t.panel.rejectModify}
        </Button>

        {/* MCP footer: raised from /30 → /70 ✓ */}
        <p className="text-center font-mono text-[10px] text-muted-foreground/70 tracking-wide uppercase">
          {t.panel.mcpProtocol}
        </p>
      </div>
    </div>
  );
}

/* ─── SkeletonCard ────────────────────────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div className="bg-card rounded-sm border border-card-border p-6 relative overflow-hidden flex flex-col gap-4 animate-pulse">
      <div className="absolute inset-y-0 start-0 w-[2px] bg-border" />
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="h-3 w-32 rounded bg-border/60" />
          <div className="h-5 w-48 rounded bg-border/40" />
        </div>
        <div className="h-9 w-28 rounded-sm bg-border/40 flex-shrink-0" />
      </div>
      <div className="space-y-3">
        <div className="h-3 w-20 rounded bg-border/40" />
        <div className="h-4 w-full rounded bg-border/30" />
        <div className="h-px bg-border/40" />
        <div className="h-3 w-20 rounded bg-border/40" />
        <div className="h-4 w-3/4 rounded bg-border/30" />
      </div>
    </div>
  );
}

/* ─── App ─────────────────────────────────────────────────────────────────── */

const VISIBLE_COUNT = 3;

export default function App() {
  const [locale, setLocale] = useState<Locale>("en");
  const t = translations[locale];

  /* ── Theme (light / dark) — persisted, applied to <html> ──────────────── */
  const [theme, setTheme] = useLocalStorageState<"dark" | "light">("app:theme", "dark");

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.classList.add("dark");
    }
  }, [theme]);

  /* ── RTL/LTR ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [locale]);

  const { data: allAlerts, isLoading, isError } = useGetMcpFeed();

  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [approvalState, setApprovalState] = useState<ApprovalState>("idle");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeAlerts = (allAlerts ?? []).filter((a) => !dismissedIds.has(a.id));
  const visibleAlerts = activeAlerts.slice(0, VISIBLE_COUNT);
  const selectedAlert = visibleAlerts.find((a) => a.id === selectedId) ?? null;
  const panelOpen = selectedAlert !== null;

  function handleSelect(id: string) {
    if (approvalState !== "idle") return;
    setSelectedId((prev) => (prev === id ? null : id));
    setApprovalState("idle");
  }

  function handleClose() {
    setSelectedId(null);
    setApprovalState("idle");
  }

  function handleApprove() {
    if (!selectedAlert || approvalState !== "idle") return;
    const idToRemove = selectedAlert.id;
    setApprovalState("loading");
    setTimeout(() => {
      setApprovalState("done");
      setTimeout(() => {
        setDismissedIds((prev) => new Set([...prev, idToRemove]));
        setSelectedId(null);
        setApprovalState("idle");
      }, 900);
    }, 1100);
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground selection:bg-primary selection:text-primary-foreground">

      {/* ── Desktop sidebar — hidden on mobile ─────────────────────────────── */}
      <aside className="hidden md:flex md:w-[220px] flex-shrink-0 bg-sidebar border-e border-sidebar-border flex-col justify-between z-10">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-sidebar-border/50">
            <h1 className="font-semibold tracking-widest text-sm uppercase text-foreground">
              {t.appName}
            </h1>
          </div>
          <nav className="p-4 space-y-1">
            {navItemDefs.map((item) => (
              <a
                key={item.key}
                href="#"
                data-testid={`nav-${item.key}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-[13px] font-medium transition-colors ${
                  item.active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {t.nav[item.key]}
              </a>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-sidebar-border/50 space-y-1">
          <Link
            href="/design-system"
            className="flex items-center gap-3 px-3 py-2 rounded-sm text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors w-full"
          >
            <Layers className="w-4 h-4 flex-shrink-0" />
            <span>Design System</span>
          </Link>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center overflow-hidden flex-shrink-0">
              <span className="text-xs font-semibold text-muted-foreground">JD</span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-medium text-foreground truncate">J. Doe</span>
              <span className="text-[10px] text-muted-foreground truncate">{t.userRole}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile sidebar overlay ──────────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Drawer panel */}
          <aside className="w-[260px] flex-shrink-0 bg-sidebar border-e border-sidebar-border flex flex-col justify-between">
            <div>
              <div className="h-16 flex items-center justify-between px-5 border-b border-sidebar-border/50">
                <h1 className="font-semibold tracking-widest text-sm uppercase text-foreground">
                  {t.appName}
                </h1>
                <button
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close navigation"
                  className="w-8 h-8 flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {navItemDefs.map((item) => (
                  <a
                    key={item.key}
                    href="#"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-sm text-[14px] font-medium transition-colors ${
                      item.active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {t.nav[item.key]}
                  </a>
                ))}
              </nav>
            </div>
            <div className="p-4 border-t border-sidebar-border/50 space-y-1">
              <Link
                href="/design-system"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-sm text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors w-full"
              >
                <Layers className="w-4 h-4 flex-shrink-0" />
                <span>Design System</span>
              </Link>
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center overflow-hidden flex-shrink-0">
                  <span className="text-xs font-semibold text-muted-foreground">JD</span>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-medium text-foreground truncate">J. Doe</span>
                  <span className="text-[10px] text-muted-foreground truncate">{t.userRole}</span>
                </div>
              </div>
            </div>
          </aside>
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main workspace */}
      <div className="flex-1 flex overflow-hidden">

        {/* Card list column */}
        <main
          className={`flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out w-full ${
            panelOpen ? "md:w-[42%]" : ""
          }`}
        >
          {/* Header — hamburger (mobile) + locale + theme toggles */}
          <header className="h-16 flex-shrink-0 flex items-center px-4 md:px-6 lg:px-10 border-b border-transparent">
            {/* Mobile: hamburger + brand */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-sm text-muted-foreground hover:text-foreground transition-colors me-2"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="md:hidden font-semibold tracking-widest text-sm uppercase text-foreground flex-1 truncate">
              {t.appName}
            </span>
            <div className="ms-auto flex items-center gap-1">
              {/* Locale toggle */}
              <button
                data-testid="locale-toggle-en"
                onClick={() => setLocale("en")}
                className={`font-mono text-[11px] tracking-widest px-2.5 py-1 transition-colors ${
                  locale === "en"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.toggle.en}
              </button>
              <span className="text-muted-foreground/40 text-[10px] select-none">|</span>
              <button
                data-testid="locale-toggle-ar"
                onClick={() => setLocale("ar")}
                className={`font-mono text-[11px] tracking-widest px-2.5 py-1 transition-colors ${
                  locale === "ar"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.toggle.ar}
              </button>

              {/* Theme toggle */}
              <span className="text-muted-foreground/40 text-[10px] select-none ms-1">|</span>
              <button
                data-testid="theme-toggle"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                className="flex items-center justify-center w-8 h-8 rounded-sm text-muted-foreground hover:text-foreground transition-colors ms-1"
              >
                {theme === "dark"
                  ? <Sun  className="w-3.5 h-3.5" />
                  : <Moon className="w-3.5 h-3.5" />}
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-10 pb-24">
            <div
              className={`mx-auto pt-8 transition-all duration-300 ${panelOpen ? "max-w-none" : "max-w-3xl"}`}
            >
              <div className="mb-8">
                <h2
                  className="text-xs font-bold tracking-[0.15em] uppercase text-foreground mb-2"
                  data-testid="section-title"
                >
                  {t.section.title}
                </h2>
                <p className="text-[13px] text-muted-foreground">
                  {isLoading
                    ? t.section.connecting
                    : isError
                    ? t.section.feedUnavailable
                    : visibleAlerts.length === 0
                    ? t.section.allResolved
                    : t.section.itemsRequired(visibleAlerts.length)}
                </p>
                <div className="h-px w-full bg-border mt-6" />
              </div>

              {isError && (
                <div
                  data-testid="feed-error"
                  className="border border-card-border rounded-sm px-6 py-5 text-[13px] text-muted-foreground font-mono tracking-wide"
                >
                  {t.card.feedError}
                </div>
              )}

              <div className="space-y-3">
                {isLoading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : visibleAlerts.length === 0 ? (
                  <div
                    data-testid="queue-empty"
                    className="border border-card-border rounded-sm px-6 py-10 text-center"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-[13px] text-muted-foreground">
                      {t.card.allTasksResolved}
                    </p>
                  </div>
                ) : (
                  visibleAlerts.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      card={alert}
                      isSelected={alert.id === selectedId}
                      onSelect={() => handleSelect(alert.id)}
                      isPanelOpen={panelOpen}
                      t={t}
                    />
                  ))
                )}
              </div>

              {!isLoading && activeAlerts.length > VISIBLE_COUNT && (
                <p className="mt-5 text-center font-mono text-[11px] text-muted-foreground/70 tracking-wide uppercase">
                  {t.section.inQueue(activeAlerts.length - VISIBLE_COUNT)}
                </p>
              )}
            </div>
          </div>
        </main>

        {/* ── Mobile detail panel — full-screen overlay ──────────────────── */}
        {panelOpen && selectedAlert && (
          <div className="md:hidden fixed inset-0 z-40 flex flex-col bg-sidebar">
            {/* Mobile back bar */}
            <div className="flex-shrink-0 h-14 flex items-center px-4 border-b border-sidebar-border/50">
              <button
                onClick={handleClose}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-[13px] font-medium">Back</span>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <DetailPanel
                alert={selectedAlert}
                onClose={handleClose}
                onApprove={handleApprove}
                approvalState={approvalState}
                t={t}
              />
            </div>
          </div>
        )}

        {/* ── Desktop detail panel — inline side panel with width animation ── */}
        <div
          className={`hidden md:block flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
            panelOpen ? "md:w-[58%] md:opacity-100" : "md:w-0 md:opacity-0"
          }`}
        >
          {selectedAlert && (
            <div className="h-full">
              <DetailPanel
                alert={selectedAlert}
                onClose={handleClose}
                onApprove={handleApprove}
                approvalState={approvalState}
                t={t}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
