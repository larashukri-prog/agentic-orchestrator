/**
 * HitlStagingCard — Enterprise Agentic Pattern (Presentational)
 *
 * Human-in-the-Loop decision card with a staged state machine:
 *   idle → loading (1.1 s) → done (0.9 s) → [dismissed by orchestrator]
 *
 * All state is owned by useAgenticOrchestrator; this component is pure UI.
 *
 * Cognitive Scaffold Design System — Enterprise Agentic Patterns
 */
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApprovalState } from "@/lib/useAgenticOrchestrator";

export interface HitlStagingCardProps {
  approvalState:   ApprovalState;
  confidenceScore: number;
  onApprove:       () => void;
  onReject:        () => void;
  /* Labels — supply translated strings from parent */
  approveLabel?:   string;
  executingLabel?: string;
  executedLabel?:  string;
  rejectLabel?:    string;
  footerLabel?:    string;
  confidenceLabel?: (n: number) => string;
}

const stateVariants = {
  idle:    { opacity: 1,   scale: 1,    y: 0 },
  loading: { opacity: 0.9, scale: 0.98, y: 0 },
  done:    { opacity: 1,   scale: 1,    y: 0 },
};

export function HitlStagingCard({
  approvalState,
  confidenceScore,
  onApprove,
  onReject,
  approveLabel    = "Approve & Execute",
  executingLabel  = "Executing…",
  executedLabel   = "Executed",
  rejectLabel     = "Reject / Modify",
  footerLabel     = "MCP · Model Context Protocol",
  confidenceLabel = (n) => `${n}% MCP confidence`,
}: HitlStagingCardProps) {
  return (
    <motion.div
      className="space-y-3"
      variants={stateVariants}
      animate={approvalState}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Approve button */}
      <Button
        data-testid="approve-button"
        onClick={onApprove}
        disabled={approvalState !== "idle"}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-[13px] py-5 rounded-sm transition-all shadow-none flex items-center justify-center gap-2 disabled:opacity-100"
      >
        <AnimatePresence mode="wait">
          {approvalState === "idle" && (
            <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {approveLabel}
            </motion.span>
          )}
          {approvalState === "loading" && (
            <motion.span key="loading" className="flex items-center gap-2"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{executingLabel}</span>
            </motion.span>
          )}
          {approvalState === "done" && (
            <motion.span key="done" className="flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <Check className="w-4 h-4" />
              <span>{executedLabel}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      {/* Reject button */}
      <Button
        data-testid="reject-button"
        onClick={onReject}
        disabled={approvalState !== "idle"}
        variant="outline"
        className="w-full bg-transparent border-border/50 text-muted-foreground hover:text-foreground hover:bg-white/5 font-medium text-[13px] py-5 rounded-sm transition-all shadow-none disabled:opacity-40"
      >
        {rejectLabel}
      </Button>

      {/* Footer — WCAG: full muted-foreground token (~7:1); was /30 and /40 */}
      <div className="flex items-center justify-between pt-1">
        <p className="font-mono text-[10px] text-muted-foreground tracking-wide uppercase">
          {footerLabel}
        </p>
        <span className="font-mono text-[10px] text-muted-foreground tracking-wide">
          {confidenceLabel(confidenceScore)}
        </span>
      </div>
    </motion.div>
  );
}
