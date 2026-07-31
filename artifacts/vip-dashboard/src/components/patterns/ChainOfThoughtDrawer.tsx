/**
 * ChainOfThoughtDrawer — Enterprise Agentic Pattern (Presentational)
 *
 * Collapsible AI reasoning audit drawer. Shows ordered reasoning steps,
 * a confidence gauge, and evaluated data sources.
 *
 * All state is owned by useAgenticOrchestrator; this component is pure UI.
 *
 * Cognitive Scaffold Design System — Enterprise Agentic Patterns
 */
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export interface CoTStep {
  label: string;
}

export interface ChainOfThoughtDrawerProps {
  steps:           string[];
  confidenceScore: number;
  dataSources:     string[];
  isOpen:          boolean;
  onToggle:        () => void;
  /** Tailwind colour class for the accent, e.g. "text-[#C8975A]" */
  accentClass?:    string;
  label?:          string;
  confidenceLabel?: string;
  stepsLabel?:      string;
  sourcesLabel?:    string;
}

function ConfidenceGauge({ score, accentClass }: { score: number; accentClass: string }) {
  const r         = 22;
  const cx        = 28;
  const cy        = 28;
  const halfCirc  = Math.PI * r;
  const filled    = (score / 100) * halfCirc;
  const path      = `M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`;

  return (
    <div className="relative flex flex-col items-center justify-end" style={{ width: 56, height: 38 }}>
      <svg width="56" height="26" viewBox="0 2 56 26" className="absolute top-0" style={{ overflow: "visible" }}>
        <path d={path} fill="none" strokeWidth="3.5" strokeLinecap="round"
              stroke="currentColor" className="text-white/10" />
        <path d={path} fill="none" strokeWidth="3.5" strokeLinecap="round"
              stroke="currentColor" strokeDasharray={`${filled} ${halfCirc}`} className={accentClass} />
      </svg>
      <span className="relative font-mono text-[14px] font-bold text-foreground leading-none">
        {score}<span className="text-[9px] font-normal opacity-50 ms-0.5">%</span>
      </span>
    </div>
  );
}

export function ChainOfThoughtDrawer({
  steps,
  confidenceScore,
  dataSources,
  isOpen,
  onToggle,
  accentClass     = "text-[color:var(--token-cot-step)]",
  label           = "Chain of Thought · AI Reasoning Transparency",
  confidenceLabel = "Confidence",
  stepsLabel      = "Reasoning Steps",
  sourcesLabel    = "Data Sources Evaluated",
}: ChainOfThoughtDrawerProps) {
  return (
    <div className="rounded-sm border border-cot-border bg-cot-surface overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-4 pt-4 pb-3 border-b border-cot-border/50 text-start hover:bg-white/[0.02] transition-colors"
        aria-expanded={isOpen}
      >
        <div className="space-y-0.5 min-w-0 flex-1">
          <p className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/40">
            {label}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <ConfidenceGauge score={confidenceScore} accentClass={accentClass} />
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-muted-foreground/40"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="cot-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            {/* Reasoning steps */}
            <div className="px-4 pt-3 pb-2 border-b border-cot-border/30">
              <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/35 block mb-2.5">
                {stepsLabel}
              </span>
              <ol className="space-y-2">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-2.5 items-start">
                    <span className={`font-mono text-[9px] font-bold leading-none mt-[3px] flex-shrink-0 tabular-nums ${accentClass} opacity-60`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[11px] text-foreground/65 leading-snug">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Confidence label row */}
            <div className="px-4 pt-2 pb-1">
              <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/35">
                {confidenceLabel}
              </span>
            </div>

            {/* Data sources */}
            <div className="px-4 pt-1 pb-3">
              <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/35 block mb-2">
                {sourcesLabel}
              </span>
              <div className="divide-y divide-border/20">
                {dataSources.map((src, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-1.5">
                    <div className={`w-1 h-1 rounded-full flex-shrink-0 bg-cot-step opacity-50`} />
                    <span className="text-[11px] text-foreground/60 leading-snug">{src}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
