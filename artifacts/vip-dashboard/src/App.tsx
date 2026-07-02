import React, { useEffect } from "react";
import { User, Shield, Briefcase, Calendar, BarChart3, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Cognitive Scaffold", icon: Shield, active: true },
  { name: "Portfolio", icon: Briefcase },
  { name: "Calendar", icon: Calendar },
  { name: "Intelligence", icon: BarChart3 },
  { name: "Settings", icon: Settings },
];

const alertCards = [
  {
    id: 1,
    urgency: "CRITICAL",
    time: "DUE IN 2H",
    urgencyColor: "border-l-[#C8975A] text-[#C8975A]",
    title: "VIP Arrival Logistics",
    description: "Ambassador Chen's motorcade protocol requires final confirmation with venue security. Ground transport brief has not been distributed to the advance team.",
    actionLabel: "Open Brief",
    actionPrimary: true,
  },
  {
    id: 2,
    urgency: "PRIORITY",
    time: "TODAY",
    urgencyColor: "border-l-[#A67B48] text-[#A67B48]",
    title: "Strategic Donor Outreach",
    description: "Follow-up window with the Harrington Foundation closes at 5 PM. Q4 impact report is ready. Personal note from the Director is pending your review and sign-off.",
    actionLabel: "Review & Sign",
    actionPrimary: true,
  },
  {
    id: 3,
    urgency: "SCHEDULED",
    time: "3 PM",
    urgencyColor: "border-l-[#7A7570] text-[#7A7570]",
    title: "Board Member Pre-briefing",
    description: "Confidential agenda packets for Thornton, Vasquez, and Park must be distributed 90 minutes before the governance session. Encryption keys need to be generated.",
    actionLabel: "Generate & Send",
    actionPrimary: true,
  }
];

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Sidebar */}
      <aside className="w-[220px] flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col justify-between">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-sidebar-border/50">
            <h1 className="font-semibold tracking-wide text-sm tracking-widest uppercase text-foreground/90">
              Concierge OS
            </h1>
          </div>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.name}
                href="#"
                data-testid={`nav-${item.name.toLowerCase().replace(" ", "-")}`}
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 flex-shrink-0 flex items-center px-8 lg:px-12 border-b border-transparent">
          {/* Empty header area to balance layout, could hold search or breadcrumbs later */}
        </header>

        <div className="flex-1 overflow-y-auto px-8 lg:px-12 pb-24">
          <div className="max-w-3xl mx-auto pt-8">
            <div className="mb-8">
              <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-foreground mb-2" data-testid="section-title">
                Cognitive Scaffold
              </h2>
              <p className="text-[13px] text-muted-foreground">
                3 items requiring immediate decision.
              </p>
              <div className="h-px w-full bg-border mt-6"></div>
            </div>

            <div className="space-y-4">
              {alertCards.map((card) => (
                <div 
                  key={card.id}
                  data-testid={`alert-card-${card.id}`}
                  className={`bg-card rounded-sm border border-card-border p-6 relative overflow-hidden transition-all duration-200 hover:border-border/80 group flex flex-col sm:flex-row gap-6 sm:items-start`}
                >
                  {/* Left Accent Border */}
                  <div className={`absolute left-0 top-0 bottom-0 w-[2px] ${card.urgencyColor.split(' ')[0]}`}></div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-[10px] tracking-widest uppercase ${card.urgencyColor.split(' ')[1]}`}>
                        {card.urgency} <span className="opacity-50 mx-1">·</span> {card.time}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline-block">
                        Just now
                      </span>
                    </div>
                    
                    <h3 className="text-[19px] font-semibold text-foreground tracking-tight">
                      {card.title}
                    </h3>
                    
                    <p className="text-[14px] leading-relaxed text-muted-foreground/90 max-w-2xl">
                      {card.description}
                    </p>
                  </div>

                  <div className="sm:ml-auto pt-2 sm:pt-6">
                    <Button 
                      data-testid={`action-${card.id}`}
                      className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-[13px] px-6 py-5 rounded-sm transition-all shadow-none"
                    >
                      {card.actionLabel}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
