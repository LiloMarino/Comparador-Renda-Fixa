import { Outlet } from "react-router-dom";
import { SettingsButton } from "@/components/settings-button";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function MainLayout() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Toaster richColors position="bottom-right" />
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <h1 className="text-lg font-semibold tracking-tight">Comparador de Renda Fixa</h1>
            <SettingsButton />
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-8">
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  );
}
