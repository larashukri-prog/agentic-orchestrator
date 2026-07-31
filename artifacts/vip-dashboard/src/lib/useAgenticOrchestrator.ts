/**
 * useAgenticOrchestrator — Middle-Layer Hook
 *
 * Centralises all agentic feed state: MCP data fetching, dismissal queue,
 * selection, CoT visibility, and staged HITL approval flow.
 * Pattern components (ChainOfThoughtDrawer, HitlStagingCard, RuleOfThreeContainer)
 * are purely presentational — all business state lives here.
 *
 * Cognitive Scaffold Design System — Middle-Layer Hooks
 */
import { useState, useCallback, useMemo } from "react";
import { useGetMcpFeed } from "@workspace/api-client-react";
import type { McpAlert } from "@workspace/api-client-react";

export type ApprovalState = "idle" | "loading" | "done";

export interface AgenticOrchestrator {
  /** Raw feed from MCP (null while loading) */
  allAlerts:     McpAlert[] | null;
  /** Feed minus dismissed items */
  activeAlerts:  McpAlert[];
  /** activeAlerts sliced to visibleCount */
  visibleAlerts: McpAlert[];
  /** Currently selected alert, or null */
  selectedAlert: McpAlert | null;
  /** True when a panel is open */
  panelOpen:     boolean;
  /** HITL approval state machine */
  approvalState: ApprovalState;
  /** Whether the CoT drawer is expanded */
  cotVisible:    boolean;
  isLoading:     boolean;
  isError:       boolean;
  /* Actions */
  handleSelect:  (id: string) => void;
  handleClose:   () => void;
  handleApprove: () => void;
  handleReject:  () => void;
  toggleCot:     () => void;
  dismissAlert:  (id: string) => void;
}

const DEFAULT_VISIBLE = 3;
const LOADING_MS      = 1100;
const DONE_MS         = 900;

export function useAgenticOrchestrator(
  visibleCount = DEFAULT_VISIBLE,
): AgenticOrchestrator {
  const { data: allAlerts, isLoading, isError } = useGetMcpFeed();

  const [dismissedIds,  setDismissedIds]  = useState<Set<string>>(new Set());
  const [selectedId,    setSelectedId]    = useState<string | null>(null);
  const [approvalState, setApprovalState] = useState<ApprovalState>("idle");
  const [cotVisible,    setCotVisible]    = useState(false);

  const activeAlerts = useMemo(
    () => (allAlerts ?? []).filter((a) => !dismissedIds.has(a.id)),
    [allAlerts, dismissedIds],
  );

  const visibleAlerts = useMemo(
    () => activeAlerts.slice(0, visibleCount),
    [activeAlerts, visibleCount],
  );

  const selectedAlert = useMemo(
    () => visibleAlerts.find((a) => a.id === selectedId) ?? null,
    [visibleAlerts, selectedId],
  );

  const panelOpen = selectedAlert !== null;

  const handleSelect = useCallback((id: string) => {
    if (approvalState !== "idle") return;
    setSelectedId((p) => (p === id ? null : id));
    setApprovalState("idle");
    setCotVisible(false);
  }, [approvalState]);

  const handleClose = useCallback(() => {
    setSelectedId(null);
    setApprovalState("idle");
    setCotVisible(false);
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setDismissedIds((p) => new Set([...p, id]));
    setSelectedId((p) => (p === id ? null : p));
  }, []);

  const handleApprove = useCallback(() => {
    if (!selectedAlert || approvalState !== "idle") return;
    const id = selectedAlert.id;
    setApprovalState("loading");
    setTimeout(() => {
      setApprovalState("done");
      setTimeout(() => {
        dismissAlert(id);
        setApprovalState("idle");
        setCotVisible(false);
      }, DONE_MS);
    }, LOADING_MS);
  }, [selectedAlert, approvalState, dismissAlert]);

  const handleReject = useCallback(() => handleClose(), [handleClose]);
  const toggleCot    = useCallback(() => setCotVisible((v) => !v), []);

  return {
    allAlerts:    allAlerts ?? null,
    activeAlerts, visibleAlerts, selectedAlert, panelOpen,
    approvalState, cotVisible, isLoading, isError,
    handleSelect, handleClose, handleApprove, handleReject, toggleCot, dismissAlert,
  };
}
