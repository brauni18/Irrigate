import { useState } from 'react';
import { Outlet } from 'react-router';
import { Navbar } from '@/ui/components/Navbar/Navbar';
import { Sidebar } from '@/ui/components/Sidebar/Sidebar';
import { cn } from '@/shadcn/lib/utils';

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      setSidebarCollapsed((prev) => !prev);
      return;
    }
    setMobileSidebarOpen((prev) => !prev);
  };

  return (
    <div className="bg-background flex h-svh flex-col overflow-hidden">
      <Navbar onMenuClick={toggleSidebar} />

      <div className="relative flex min-h-0 flex-1">
        {mobileSidebarOpen && (
          <button
            type="button"
            className="absolute inset-0 z-20 bg-black/40 md:hidden"
            aria-label="Close sidebar overlay"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        <div
          className={cn(
            'z-30 h-full shrink-0 transition-transform duration-200 md:relative md:translate-x-0',
            'absolute inset-y-0 left-0 md:static',
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          )}
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
            className="h-full shadow-lg md:shadow-none"
          />
        </div>

        <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
