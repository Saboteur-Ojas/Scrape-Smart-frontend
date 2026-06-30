import type { ReactNode } from "react";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { TopBar } from "./TopBar";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="app-shell">
      {/* Desktop sidebar */}
      <DesktopSidebar />

      {/* Main area */}
      <main className="app-main">
        {/* Desktop top bar */}
        <TopBar title={title} />

        {/* Page content */}
        <div className="app-content">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
}
