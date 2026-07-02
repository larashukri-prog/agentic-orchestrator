import { Router, type IRouter } from "express";

const router: IRouter = Router();

const mcpFeed = [
  {
    id: 1,
    clientName: "Ambassador Chen",
    triggerEvent: "Flight delayed by 2 hours — revised ETA 21:40",
    suggestedAction: "Draft upgrade confirmation to Presidential Suite and redistribute motorcade brief to advance team",
    confidenceScore: 94,
    urgency: "CRITICAL",
    urgencyTime: "DUE IN 2H",
    actionLabel: "Open Brief",
  },
  {
    id: 2,
    clientName: "Harrington Foundation",
    triggerEvent: "Donor engagement window closes at 17:00 — Q4 impact report flagged ready",
    suggestedAction: "Route Q4 report to Director for sign-off and dispatch personalized outreach before window closes",
    confidenceScore: 88,
    urgency: "PRIORITY",
    urgencyTime: "TODAY",
    actionLabel: "Review & Sign",
  },
  {
    id: 3,
    clientName: "Thornton, Vasquez & Park",
    triggerEvent: "Governance session in 90 minutes — confidential packets not yet distributed",
    suggestedAction: "Generate per-recipient encryption keys and deliver sealed agenda packets to all three board members",
    confidenceScore: 97,
    urgency: "SCHEDULED",
    urgencyTime: "3 PM",
    actionLabel: "Generate & Send",
  },
];

router.get("/mcp/feed", (_req, res) => {
  res.json(mcpFeed);
});

export default router;
