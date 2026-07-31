/**
 * RuleOfThreeContainer — Enterprise Agentic Pattern (Presentational)
 *
 * Ordered three-intervention triptych. Renders up to 3 priority-ranked items
 * with colour-coded priority indicators from the Rule-of-Three token scale.
 *
 * All state is owned by useAgenticOrchestrator; this component is pure UI.
 *
 * Cognitive Scaffold Design System — Enterprise Agentic Patterns
 *
 * WCAG 2.1 AA: all text uses full semantic tokens — opacity modifiers (/30–/80)
 * removed because they lowered contrast below 4.5:1 at the point of use.
 */
import { motion } from "framer-motion";
import type { McpAlert } from "@workspace/api-client-react";

export interface RuleOfThreeContainerProps {
  alerts:       McpAlert[];
  selectedId:   string | null;
  onSelect:     (id: string) => void;
  isPanelOpen:  boolean;
  /** Urgency label lookup */
  urgencyLabels: Record<string, string>;
  /** CTA label lookup */
  urgencyActions: Record<string, string>;
  /** Confidence formatter */
  confidenceLabel: (n: number) => string;
  triggerEventLabel: string;
  suggestedActionLabel: string;
  mcpFeedLabel: string;
}

const PRIORITY_CLASSES = [
  "bg-rot-primary",
  "bg-rot-secondary",
  "bg-rot-tertiary",
] as const;

const BADGE_CLASSES = [
  "text-[color:var(--token-rot-primary)]",
  "text-[color:var(--token-rot-secondary)]",
  "text-[color:var(--token-rot-tertiary)]",
] as const;

const DOT_CLASSES = [
  "bg-rot-primary",
  "bg-rot-secondary",
  "bg-rot-tertiary",
] as const;

const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export function RuleOfThreeContainer({
  alerts,
  selectedId,
  onSelect,
  isPanelOpen,
  urgencyLabels,
  urgencyActions,
  confidenceLabel,
  triggerEventLabel,
  suggestedActionLabel,
  mcpFeedLabel,
}: RuleOfThreeContainerProps) {
  const items = alerts.slice(0, 3);

  return (
    <motion.div
      className="space-y-3"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {items.map((alert, idx) => {
        const isSelected = alert.id === selectedId;
        const accent     = PRIORITY_CLASSES[idx] ?? PRIORITY_CLASSES[2];
        const badge      = BADGE_CLASSES[idx]    ?? BADGE_CLASSES[2];
        const dot        = DOT_CLASSES[idx]       ?? DOT_CLASSES[2];
        const urgency    = urgencyLabels[alert.urgency]  ?? alert.urgency.toUpperCase();
        const cta        = urgencyActions[alert.urgency] ?? "Review";

        return (
          <motion.div
            key={alert.id}
            variants={itemVariants}
            data-testid={`alert-card-${alert.id}`}
            onClick={() => onSelect(alert.id)}
            className={[
              "bg-card rounded-sm border transition-all duration-200 cursor-pointer flex flex-col gap-4 relative overflow-hidden",
              isSelected
                ? "border-primary/60 shadow-[0_0_0_1px_hsl(var(--primary)/0.3)]"
                : "border-card-border hover:border-border/70",
              isPanelOpen ? "p-4" : "p-6",
            ].join(" ")}
          >
            {/* Priority accent strip */}
            <div className={`absolute inset-y-0 start-0 w-[2px] ${accent}`} />

            {/* Priority badge row */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* P-rank pill: full muted-foreground + border/50 — was /30 text & /30 border */}
                  <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground border border-border/50 rounded-sm px-1.5 py-0.5">
                    P{idx + 1}
                  </span>
                  <span className={`font-mono text-[10px] tracking-widest uppercase ${badge}`}>
                    {urgency}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground ms-auto">
                    {confidenceLabel(alert.confidenceScore)}
                  </span>
                </div>
                <h3 className={`font-semibold text-foreground tracking-tight leading-snug ${isPanelOpen ? "text-[15px]" : "text-[18px]"}`}>
                  {alert.clientName}
                </h3>
                {/* Tier: full muted-foreground — was /45 */}
                <p className="font-mono text-[10px] text-muted-foreground tracking-wide truncate">
                  {alert.tier}
                </p>
              </div>

              {!isPanelOpen && (
                <button
                  data-testid={`action-${alert.id}`}
                  onClick={(e) => { e.stopPropagation(); onSelect(alert.id); }}
                  className="flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-[13px] px-5 py-2.5 rounded-sm transition-all shadow-none"
                >
                  {cta}
                </button>
              )}
            </div>

            {!isPanelOpen && (
              <div className="space-y-3">
                <div className="space-y-1">
                  {/* Section labels: full muted-foreground — was /60 */}
                  <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
                    {triggerEventLabel}
                  </span>
                  {/* Body text: full muted-foreground — was /80 */}
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    {alert.triggerEvent}
                  </p>
                </div>
                <div className="h-px w-full bg-border/40" />
                <div className="space-y-1">
                  {/* Section labels: full muted-foreground — was /60 */}
                  <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
                    {suggestedActionLabel}
                  </span>
                  {/* Action text: full foreground — was /90 */}
                  <p className="text-[14px] leading-relaxed text-foreground">
                    {alert.suggestedAction}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {/* Decorative dot: opacity-60 is acceptable for non-text elements */}
                  <div className={`w-1.5 h-1.5 rounded-full ${dot} opacity-60`} />
                  {/* MCP label: full muted-foreground — was /50 */}
                  <span className="text-[10px] font-mono text-muted-foreground tracking-wide uppercase">
                    {mcpFeedLabel}
                  </span>
                </div>
              </div>
            )}

            {isPanelOpen && (
              /* Trigger preview: full muted-foreground — was /70 */
              <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">
                {alert.triggerEvent}
              </p>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
