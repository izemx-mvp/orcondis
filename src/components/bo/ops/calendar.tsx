import { useState, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type CalendarViewType = "Jour" | "Semaine" | "Mois";

export interface CalendarProps {
  date: Date;
  onDateChange: (date: Date) => void;
  view: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  children: ReactNode;
  actions?: ReactNode;
}

export function CalendarContainer({
  date,
  onDateChange,
  view,
  onViewChange,
  children,
  actions
}: CalendarProps) {
  return (
    <div className="flex flex-col h-full bg-white/50 backdrop-blur-xl border-none rounded-[1.5rem] shadow-elevated overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-6 p-6 border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-4">
          <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-xl border border-border shadow-sm">
            {(["Jour", "Semaine", "Mois"] as const).map((v) => (
              <button
                key={v}
                onClick={() => onViewChange(v)}
                className={cn(
                  "px-5 py-2 text-sm font-black rounded-lg transition-all",
                  view === v 
                    ? "bg-navy text-white shadow-lg" 
                    : "text-muted-foreground hover:text-navy hover:bg-muted/30"
                )}
              >
                {v}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-1 ml-4">
            <Button 
              variant="outline" 
              size="default" 
              onClick={() => {
                const now = new Date();
                onDateChange(now);
              }}
              className="rounded-lg h-10 px-6 text-sm font-bold"
            >
              Aujourd'hui
            </Button>
            <div className="flex items-center ml-2 border border-border rounded-md overflow-hidden">
               <Button 
                 variant="ghost" 
                 size="icon" 
                 className="h-8 w-8 rounded-none border-r border-border"
                 onClick={() => {
                   const newDate = new Date(date);
                   if (view === "Jour") newDate.setDate(date.getDate() - 1);
                   if (view === "Semaine") newDate.setDate(date.getDate() - 7);
                   if (view === "Mois") newDate.setMonth(date.getMonth() - 1);
                   onDateChange(newDate);
                 }}
               >
                 <span className="sr-only">Précédent</span>
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
               </Button>
               <Button 
                 variant="ghost" 
                 size="icon" 
                 className="h-8 w-8 rounded-none"
                 onClick={() => {
                   const newDate = new Date(date);
                   if (view === "Jour") newDate.setDate(date.getDate() + 1);
                   if (view === "Semaine") newDate.setDate(date.getDate() + 7);
                   if (view === "Mois") newDate.setMonth(date.getMonth() + 1);
                   onDateChange(newDate);
                 }}
               >
                 <span className="sr-only">Suivant</span>
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-9-6"/></svg>
               </Button>
            </div>
          </div>
          
          <h3 className="ml-8 text-2xl font-black text-navy tracking-tight capitalize">
            {date.toLocaleDateString('fr-FR', { 
              month: 'long', 
              year: 'numeric',
              day: view !== 'Mois' ? 'numeric' : undefined
            })}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          {actions}
        </div>
      </header>
      
      <div className="flex-1 overflow-auto relative min-h-[600px]">
        {children}
      </div>
    </div>
  );
}
