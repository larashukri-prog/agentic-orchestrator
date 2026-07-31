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
  /** Tailwind colour class for the accent, e.g. "text-urgency-high" */
  accentClass?:    string;
  label?:          string;
  confidenceLabel?: string;
  stepsLabel?:      string;
  sourcesLabel?:    string;
}

/** Full circular progress ring — matches App.tsx ConfidenceGauge. */
function ConfidenceGauge({ score, accentClass }: { score: number; accentClass: string }) {
  const size = 48;
  const strokeW = 3.5;
  const r = (size - strokeW * 2) / 2;        // 20.5
  const circumference = 2 * Math.PI * r;
  const filled = (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" strokeWidth={strokeW} stroke="currentColor"
          className="text-foreground/10" strokeLinecap="round"
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" strokeWidth={strokeW} stroke="currentColor"
          className={accentClass} strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - filled}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-[11px] font-bold text-foreground leading-none tabular-nums">
          {score}<span className="text-[8px] font-normal opacity-50 ms-0.5">%</span>
        </span>
      </div>
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
          {/* WCAG: full muted-foreground token (~7:1) — was /40 (~2.8:1, failed) */}
          <p className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground">
            {label}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <ConfidenceGauge score={confidenceScore} accentClass={accentClass} />
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-muted-foreground"
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
              {/* WCAG: full token — was /35 (~2.4:1, failed) */}
              <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground block mb-2.5">
                {stepsLabel}
              </span>
              <ol className="space-y-2">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-2.5 items-start">
                    {/* Step number: full accent, no opacity modifier */}
                    <span className={`font-mono text-[9px] font-bold leading-none mt-[3px] flex-shrink-0 tabular-nums ${accentClass}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {/* Step text: full foreground — was /65 */}
                    <span className="text-[11px] text-foreground leading-snug">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Confidence label row */}
            <div className="px-4 pt-2 pb-1">
              {/* WCAG: full token — was /35 */}
              <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground">
                {confidenceLabel}
              </span>
            </div>

            {/* Data sources */}
            <div className="px-4 pt-1 pb-3">
              {/* WCAG: full token — was /35 */}
              <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground block mb-2">
                {sourcesLabel}
              </span>
              <div className="divide-y divide-border/20">
                {dataSources.map((src, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-1.5">
                    <div className="w-1 h-1 rounded-full flex-shrink-0 bg-cot-step" />
                    {/* WCAG: muted-foreground — was text-foreground/60 (~9:1×0.6≈5.4, borderline; now full ~7:1) */}
                    <span className="text-[11px] text-muted-foreground leading-snug">{src}</span>
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
