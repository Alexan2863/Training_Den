"use client";

import { useState, useCallback, useMemo, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "./UserProvider";
import Header from "./Header";
import Sidebar from "./Sidebar";

function getPageTitle(pathname: string): string {
  const pathMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/training-programs": "Training Programs",
    "/users": "Users",
  };
  return pathMap[pathname] || "Training Den";
}

interface LayoutWrapperProps {
  children: ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = useUser();
  const pathname = usePathname();

  // Memoize callbacks to prevent unnecessary rerenders
  const handleSidebarClose = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const handleMenuClick = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // Memoize pageTitle to prevent recalculation
  const pageTitle = useMemo(() => getPageTitle(pathname), [pathname]);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          pageTitle={pageTitle}
          onMenuClick={handleMenuClick}
          user={user}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </div>
  );
}
