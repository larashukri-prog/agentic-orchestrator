import { useEffect, useState, useRef } from "react";
import { Shield, Briefcase, Calendar, BarChart3, Settings, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetMcpFeed } from "@workspace/api-client-react";
import type { McpAlert } from "@workspace/api-client-react";

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
      CRITICAL: "CRITICAL",
      PRIORITY: "PRIORITY",
      SCHEDULED: "SCHEDULED",
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
      draftCommunication: "Draft Communication",
      mcpConfidence: (n: number) => `${n}% MCP confidence`,
      approveExecute: "Approve & Execute",
      executing: "Executing…",
      executed: "Executed",
      rejectModify: "Reject / Modify",
      mcpProtocol: "MCP · Model Context Protocol",
    },
    userRole: "Director of Relations",
    toggle: { en: "EN", ar: "AR" },
  },
  ar: {
    appName: "كونسيرج OS",
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
      CRITICAL: "حرج",
      PRIORITY: "أولوية",
      SCHEDULED: "مجدول",
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
      draftCommunication: "مسودة التواصل",
      mcpConfidence: (n: number) => `ثقة MCP ${n}٪`,
      approveExecute: "موافقة وتنفيذ",
      executing: "جارٍ التنفيذ…",
      executed: "تمّ التنفيذ",
      rejectModify: "رفض / تعديل",
      mcpProtocol: "MCP · بروتوكول سياق النموذج",
    },
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

/* ─── Urgency styles ──────────────────────────────────────────────────────── */

const urgencyStyles: Record<string, { accent: string; badge: string; dot: string }> = {
  CRITICAL:  { accent: "bg-[#C8975A]", badge: "text-[#C8975A]", dot: "bg-[#C8975A]" },
  PRIORITY:  { accent: "bg-[#A67B48]", badge: "text-[#A67B48]", dot: "bg-[#A67B48]" },
  SCHEDULED: { accent: "bg-[#7A7570]", badge: "text-[#7A7570]", dot: "bg-[#7A7570]" },
};

/* ─── Draft content ───────────────────────────────────────────────────────── */

function getDraftContent(alert: McpAlert): string {
  const drafts: Record<number, string> = {
    1: `Subject: Revised Arrival Arrangements — ${alert.clientName}

Ambassador,

We have been notified of a 2-hour delay to your flight, with a revised ETA of 21:40. Your Presidential Suite upgrade has been confirmed and the advance team is standing by.

Actions taken:
— Motorcade brief redistributed to all ground personnel
— Suite prepared for late arrival; in-room service on standby
— Venue security briefed on revised timeline

Please advise of any further requirements.

Warm regards,
J. Doe
Director of Relations`,

    2: `Subject: Q4 Impact Report & Year-End Partnership Note

Dear ${alert.clientName},

As the Q4 engagement window draws to a close, I wanted to reach out personally with our impact report and express gratitude for your continued partnership.

Enclosed highlights:
— Programme reach expanded 34% year-over-year
— Three new initiatives fully funded through your contribution
— Full financial transparency annex attached

I would welcome the opportunity to discuss outcomes and explore alignment for the year ahead. Please let me know your availability.

With gratitude,
J. Doe
Director of Relations`,

    3: `Subject: Governance Session — Encrypted Agenda Packet

Dear Board Members,

Your confidential agenda packets for today's governance session at 3:00 PM are enclosed. Decryption credentials have been transmitted via separate secure channel.

Agenda covers:
— Q4 financial review and forward projections
— Strategic initiative approvals (3 items)
— Governance policy amendments

Please confirm receipt. The session commences at 3:00 PM.

Regards,
J. Doe
Director of Relations`,

    4: `Subject: Rescheduled — Quarterly Portfolio Review

Dear ${alert.clientName} team,

Given the principal's travel schedule, we have rescheduled the quarterly portfolio review. An updated asset summary is attached for advance review.

— Revised review call: to be confirmed
— Asset summary pre-circulated to the chief of staff
— All materials encrypted and access-controlled

Please confirm the rescheduled slot at your earliest convenience.

Best,
J. Doe
Director of Relations`,

    5: `Subject: Revised Itinerary — ${alert.clientName}

Dear Estate Manager,

We have identified a scheduling conflict at 19:00 and have resolved it as follows:

— Spa appointment moved to 09:30 (morning slot confirmed)
— Private board dinner itinerary unchanged at 19:00
— Revised itinerary attached for your records

Please confirm receipt and advise of any further adjustments required.

Regards,
J. Doe
Director of Relations`,
  };

  return (
    drafts[alert.id] ??
    `Subject: Action Required — ${alert.clientName}\n\n${alert.suggestedAction}\n\nRegards,\nJ. Doe\nDirector of Relations`
  );
}

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
  const style = urgencyStyles[card.urgency] ?? urgencyStyles["SCHEDULED"];
  const urgencyLabel = t.urgency[card.urgency] ?? card.urgency;

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
      {/* Accent strip — uses logical start so it flips in RTL */}
      <div className={`absolute inset-y-0 start-0 w-[2px] ${style.accent}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-mono text-[10px] tracking-widest uppercase ${style.badge}`}>
              {urgencyLabel} <span className="opacity-40 mx-1">·</span> {card.urgencyTime}
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
        </div>

        {!isPanelOpen && (
          <Button
            data-testid={`action-${card.id}`}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-[13px] px-5 py-4 rounded-sm transition-all shadow-none"
          >
            {card.actionLabel}
          </Button>
        )}
      </div>

      {!isPanelOpen && (
        <div className="space-y-3">
          <div className="space-y-1">
            <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/60">
              {t.card.triggerEvent}
            </span>
            <p className="text-[13px] leading-relaxed text-muted-foreground/80" data-testid={`card-trigger-${card.id}`}>
              {card.triggerEvent}
            </p>
          </div>
          <div className="h-px w-full bg-border/40" />
          <div className="space-y-1">
            <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/60">
              {t.card.suggestedAction}
            </span>
            <p className="text-[14px] leading-relaxed text-foreground/90" data-testid={`card-action-${card.id}`}>
              {card.suggestedAction}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <div className={`w-1.5 h-1.5 rounded-full ${style.dot} opacity-60`} />
            <span className="text-[10px] font-mono text-muted-foreground/50 tracking-wide uppercase">
              {t.card.mcpFeed}
            </span>
          </div>
        </div>
      )}

      {isPanelOpen && (
        <p className="text-[12px] text-muted-foreground/70 leading-relaxed line-clamp-2">
          {card.triggerEvent}
        </p>
      )}
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
  const style = urgencyStyles[alert.urgency] ?? urgencyStyles["SCHEDULED"];
  const urgencyLabel = t.urgency[alert.urgency] ?? alert.urgency;
  const [draft, setDraft] = useState(() => getDraftContent(alert));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(getDraftContent(alert));
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
            {urgencyLabel} <span className="opacity-40 mx-1">·</span> {alert.urgencyTime}
          </span>
          <h2 className="text-[16px] font-semibold text-foreground tracking-tight leading-snug">
            {alert.clientName}
          </h2>
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
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <div className="space-y-1.5">
          <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/60">
            {t.panel.suggestedAction}
          </span>
          <p className="text-[13px] text-foreground/85 leading-relaxed">
            {alert.suggestedAction}
          </p>
        </div>

        <div className="h-px bg-border/40" />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/60">
              {t.panel.draftCommunication}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground/40 tracking-wide">
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
            className="w-full bg-background border border-border/50 rounded-sm px-4 py-3 text-[13px] text-foreground/90 font-mono leading-relaxed resize-none focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
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

        <p className="text-center font-mono text-[10px] text-muted-foreground/30 tracking-wide uppercase">
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

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Apply RTL/LTR document attributes whenever locale changes
  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [locale]);

  const { data: allAlerts, isLoading, isError } = useGetMcpFeed();

  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [approvalState, setApprovalState] = useState<ApprovalState>("idle");

  const activeAlerts = (allAlerts ?? []).filter((a) => !dismissedIds.has(a.id));
  const visibleAlerts = activeAlerts.slice(0, VISIBLE_COUNT);
  const selectedAlert = visibleAlerts.find((a) => a.id === selectedId) ?? null;
  const panelOpen = selectedAlert !== null;

  function handleSelect(id: number) {
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

      {/* Sidebar — border-e uses logical end (right in LTR, left in RTL) */}
      <aside className="w-[220px] flex-shrink-0 bg-sidebar border-e border-sidebar-border flex flex-col justify-between z-10">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-sidebar-border/50">
            <h1 className="font-semibold tracking-widest text-sm uppercase text-foreground/90">
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
        <div className="p-4 border-t border-sidebar-border/50">
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

      {/* Main workspace */}
      <div className="flex-1 flex overflow-hidden">

        {/* Card list column */}
        <main
          className={`flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out ${
            panelOpen ? "w-[42%]" : "w-full"
          }`}
        >
          {/* Header with EN/AR toggle */}
          <header className="h-16 flex-shrink-0 flex items-center px-6 lg:px-10 border-b border-transparent">
            <div className="ms-auto flex items-center">
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
              <span className="text-muted-foreground/25 text-[10px] select-none">|</span>
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
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-6 lg:px-10 pb-24">
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
                <p className="mt-5 text-center font-mono text-[11px] text-muted-foreground/40 tracking-wide uppercase">
                  {t.section.inQueue(activeAlerts.length - VISIBLE_COUNT)}
                </p>
              )}
            </div>
          </div>
        </main>

        {/* Detail panel — border-s uses logical start (left in LTR, right in RTL) */}
        <div
          className={`flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
            panelOpen ? "w-[58%] opacity-100" : "w-0 opacity-0"
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
