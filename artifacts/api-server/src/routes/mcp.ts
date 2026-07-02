import { Router, type IRouter } from "express";

const router: IRouter = Router();

const mcpFeed = [
  {
    id: "mcp-001",
    clientName: "Marcus Vance",
    tier: "Ultra-High-Net-Worth / Centurion",
    urgency: "high",
    triggerEvent: "Inbound flight UA1248 delayed by 2.5 hours. Estimated arrival shifted past kitchen closing hours.",
    confidenceScore: 96,
    dataSourcesEvaluated: [
      "FlightAware Global API (Live Status Tracking)",
      "Property Management System (Room Availability)",
      "Guest Preference Profile (Historical Dining Data)",
    ],
    chainOfThought: [
      "Delayed arrival at 11:15 PM bypasses the main dining room operating hours.",
      "Guest profile indicates a consistent preference for high-protein, low-sodium meals post-travel.",
      "Executive suite 402 is currently vacant and equipped with a temperature-controlled sub-kitchen pantry.",
    ],
    suggestedAction: "Authorize late-night room service staging & suite upgrade.",
    actionPayload: `Dear Mr. Vance,

We have noted the delay on your flight from London and have adjusted your arrangements accordingly. To ensure your comfort upon arrival tonight, we have upgraded you to Executive Suite 402.

Our main kitchen will be closed when you arrive, so our culinary team has prepared a curated charcuterie and chilled roasted salmon platter, placed directly in your suite's private pantry alongside your preferred sparkling water.

Our night concierge team is fully briefed for your seamless check-in.

Safe travels,
The Guest Relations Team`,
  },
  {
    id: "mcp-002",
    clientName: "Elena Rostova",
    tier: "Principal Philanthropic Prospect",
    urgency: "medium",
    triggerEvent: "SEC Form 4 filing detects a significant liquidity event ($12M stock optimization) executed 24 hours ago.",
    confidenceScore: 89,
    dataSourcesEvaluated: [
      "SEC Edgar Live API (Financial Compliance Scraping)",
      "Salesforce Wealth Engine (Philanthropic Capacity Analytics)",
      "Internal Development Database (Past Gala Attendance)",
    ],
    chainOfThought: [
      "Liquidity event increases near-term tax-mitigation giving capacity by an estimated 35%.",
      "Prospect historically declines cold outreach but engages heavily with peer-to-peer climate initiatives.",
      "Board Member Sarah Jenkins has an open calendar block this Friday and maintains a close professional relationship with the prospect.",
    ],
    suggestedAction: "Draft a private lunch invitation for the upcoming Climate Seed Fund gala.",
    actionPayload: `Dear Elena,

I hope you are having an excellent week. Sarah Jenkins and I were recently reviewing the strategic outline for our upcoming Climate Seed Fund initiative, and your recent insights on sustainable tech scalability immediately came to mind.

Sarah is hosting an intimate, private lunch this Friday at 12:30 PM in the West Village to discuss our multi-year scaling roadmap before it goes public.

We would be honored to have you join us for this closed-door conversation. Let me know if your schedule allows and I will coordinate the logistics.

Warm regards,
Development Director`,
  },
  {
    id: "mcp-003",
    clientName: "Dr. Aris Thorne",
    tier: "Elite Legacy Member",
    urgency: "medium",
    triggerEvent: "Real-time semantic analysis flags a negative sentiment drop (3/5 stars) on an internal local dining feedback card.",
    confidenceScore: 92,
    dataSourcesEvaluated: [
      "OpenTable Enterprise Feedback Loop (Sentiment Analysis)",
      "Amex Membership Rewards Portal (Historical Spend Matrix)",
      "Sommelier Inventory System (Past Vintage Preferences)",
    ],
    chainOfThought: [
      "Feedback notes dissatisfaction with service pacing during the main course, though food quality was rated high.",
      "Guest has a lifetime spend in the top 2% and historically reserves tables for high-stakes business entertaining.",
      "Compensating with a generic discount undermines the luxury brand promise; a personalized culinary gesture preserves retention.",
    ],
    suggestedAction: "Deploy a bespoke tasting menu reservation with a personal general manager apology.",
    actionPayload: `Dear Dr. Thorne,

Thank you for sharing your candid feedback regarding your dining experience with us last night. While I am glad you enjoyed the culinary selections, I sincerely apologize that our service pacing did not meet our typical standard of excellence.

To ensure your next experience reflects the true caliber of our hospitality, I have personally reserved our private Chef's Alcove for you and a guest for a complimentary, custom-tailored 6-course wine pairing menu.

Our lead sommelier has noted your preference for the 2015 Bordeaux varietals and will have a selection uncorked for your arrival. I look forward to personally welcoming you back.

Sincerely,
General Manager`,
  },
];

router.get("/mcp/feed", (_req, res) => {
  res.json(mcpFeed);
});

export default router;
