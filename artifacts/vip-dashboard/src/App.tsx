import { useEffect } from "react";
import { Shield, Briefcase, Calendar, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetMcpFeed } from "@workspace/api-client-react";
import type { McpAlert } from "@workspace/api-client-react";

const navItems = [
  { name: "Cognitive Scaffold", icon: Shield, active: true },
  { name: "Portfolio", icon: Briefcase },
  { name: "Calendar", icon: Calendar },
  { name: "Intelligence", icon: BarChart3 },
  { name: "Settings", icon: Settings },
];

const urgencyStyles: Record<string, { border: string; badge: string; dot: string }> = {
  CRITICAL: {
    border: "border-l-[#C8975A]",
    badge: "text-[#C8975A]",
    dot: "bg-[#C8975A]",
  },
  PRIORITY: {
    border: "border-l-[#A67B48]",
    badge: "text-[#A67B48]",
    dot: "bg-[#A67B48]",
  },
  SCHEDULED: {
    border: "border-l-[#7A7570]",
    badge: "text-[#7A7570]",
    dot: "bg-[#7A7570]",
  },
};

function AlertCard({ card }: { card: McpAlert }) {
  const style = urgencyStyles[card.urgency] ?? urgencyStyles["SCHEDULED"];

  return (
    <div
      data-testid={`alert-card-${card.id}`}
      className={`bg-card rounded-sm border border-card-border p-6 relative overflow-hidden transition-all duration-200 hover:border-border/80 flex flex-col gap-4`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-[2px] ${style.border}`} />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3">
            <span className={`font-mono text-[10px] tracking-widest uppercase ${style.badge}`}>
              {card.urgency} <span className="opacity-40 mx-1">·</span> {card.urgencyTime}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground ml-auto hidden sm:block">
              {card.confidenceScore}% confidence
            </span>
          </div>
          <h3 className="text-[18px] font-semibold text-foreground tracking-tight leading-snug" data-testid={`card-title-${card.id}`}>
            {card.clientName}
          </h3>
        </div>

        <Button
          data-testid={`action-${card.id}`}
          className="flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-[13px] px-5 py-4 rounded-sm transition-all shadow-none"
        >
          {card.actionLabel}
        </Button>
      </div>

      <div className="space-y-3 pl-0">
        <div className="space-y-1">
          <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/60">
            Trigger Event
          </span>
          <p className="text-[13px] leading-relaxed text-muted-foreground/80" data-testid={`card-trigger-${card.id}`}>
            {card.triggerEvent}
          </p>
        </div>

        <div className="h-px w-full bg-border/40" />

        <div className="space-y-1">
          <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/60">
            Suggested Action
          </span>
          <p className="text-[14px] leading-relaxed text-foreground/90" data-testid={`card-action-${card.id}`}>
            {card.suggestedAction}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <div className={`w-1.5 h-1.5 rounded-full ${style.dot} opacity-60`} />
        <span className="text-[10px] font-mono text-muted-foreground/50 tracking-wide uppercase">
          MCP · Model Context Protocol Feed
        </span>
        <span className="ml-auto text-[10px] font-mono text-muted-foreground/40">
          {card.confidenceScore}% confidence
        </span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card rounded-sm border border-card-border p-6 relative overflow-hidden flex flex-col gap-4 animate-pulse">
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-border" />
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

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const { data: mcpAlerts, isLoading, isError } = useGetMcpFeed();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Sidebar */}
      <aside className="w-[220px] flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col justify-between">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-sidebar-border/50">
            <h1 className="font-semibold tracking-widest text-sm uppercase text-foreground/90">
              Concierge OS
            </h1>
          </div>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.name}
                href="#"
                data-testid={`nav-${item.name.toLowerCase().replace(/ /g, "-")}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-[13px] font-medium transition-colors ${
                  item.active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
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
              <span className="text-[10px] text-muted-foreground truncate">Director of Relations</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 flex-shrink-0 flex items-center px-8 lg:px-12 border-b border-transparent" />

        <div className="flex-1 overflow-y-auto px-8 lg:px-12 pb-24">
          <div className="max-w-3xl mx-auto pt-8">
            <div className="mb-8">
              <h2
                className="text-xs font-bold tracking-[0.15em] uppercase text-foreground mb-2"
                data-testid="section-title"
              >
                Cognitive Scaffold
              </h2>
              <p className="text-[13px] text-muted-foreground">
                {isLoading
                  ? "Connecting to MCP feed…"
                  : isError
                  ? "Feed unavailable."
                  : `${mcpAlerts?.length ?? 0} items requiring immediate decision.`}
              </p>
              <div className="h-px w-full bg-border mt-6" />
            </div>

            {isError && (
              <div
                data-testid="feed-error"
                className="border border-card-border rounded-sm px-6 py-5 text-[13px] text-muted-foreground font-mono tracking-wide"
              >
                MCP feed connection failed. Check API server status.
              </div>
            )}

            <div className="space-y-4">
              {isLoading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : (
                mcpAlerts?.map((alert) => (
                  <AlertCard key={alert.id} card={alert} />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
