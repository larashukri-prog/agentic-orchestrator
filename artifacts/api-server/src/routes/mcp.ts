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
    dataSources: [
      { label: "CRM", value: "VIP Profile & Visit History", icon: "crm" },
      { label: "FLIGHT API", value: "Delta Airlines Live Status", icon: "flight" },
      { label: "LOGISTICS", value: "Ground Transport Coordinator", icon: "transport" },
      { label: "SECURITY", value: "Advance Team Briefing System", icon: "security" },
    ],
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
    dataSources: [
      { label: "CRM", value: "Donor Engagement History", icon: "crm" },
      { label: "FINANCE", value: "Q4 Reporting System", icon: "finance" },
      { label: "EMAIL", value: "Outreach Engagement Analytics", icon: "email" },
      { label: "REGISTRY", value: "Foundation Preference Profiles", icon: "registry" },
    ],
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
    dataSources: [
      { label: "CALENDAR", value: "Board Governance Scheduler", icon: "calendar" },
      { label: "ENCRYPTION", value: "Secure Document Delivery System", icon: "security" },
      { label: "PROFILES", value: "Member Preference Registry", icon: "registry" },
      { label: "COMPLIANCE", value: "Audit Trail & Access Log", icon: "compliance" },
    ],
  },
  {
    id: 4,
    clientName: "Reeves Capital Group",
    triggerEvent: "Quarterly portfolio review overdue by 48 hours — principal is travelling",
    suggestedAction: "Reschedule review call and pre-circulate updated asset summary to the principal's chief of staff",
    confidenceScore: 81,
    urgency: "PRIORITY",
    urgencyTime: "OVERDUE",
    actionLabel: "Reschedule",
    dataSources: [
      { label: "PORTFOLIO", value: "Asset Management Platform", icon: "finance" },
      { label: "TRAVEL", value: "Principal Travel Intelligence API", icon: "flight" },
      { label: "CRM", value: "Activity & Interaction Log", icon: "crm" },
      { label: "COMMS", value: "Chief of Staff Message Thread", icon: "email" },
    ],
  },
  {
    id: 5,
    clientName: "Lady Arabella Morrow",
    triggerEvent: "Spa reservation conflicts with private board dinner — double-booked at 19:00",
    suggestedAction: "Move spa appointment to morning slot and confirm revised itinerary with estate manager",
    confidenceScore: 99,
    urgency: "SCHEDULED",
    urgencyTime: "THIS EVE",
    actionLabel: "Resolve Conflict",
    dataSources: [
      { label: "CALENDAR", value: "Conflict Detection Engine", icon: "calendar" },
      { label: "ESTATE", value: "Estate Management System", icon: "registry" },
      { label: "VENUES", value: "Reservation & Booking API", icon: "transport" },
      { label: "ITINERARY", value: "Personal Schedule Tracker", icon: "compliance" },
    ],
  },
];

router.get("/mcp/feed", (_req, res) => {
  res.json(mcpFeed);
});

export default router;
