"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getCurrentUser } from "../lib/auth";
import Header from "./Header";
import Sidebar from "./Sidebar";

function getPageTitle(pathname) {
  const pathMap = {
    "/dashboard": "Dashboard",
    "/training-programs": "Training Programs",
    "/users": "Users",
  };
  return pathMap[pathname] || "Training Den";
}

export default function LayoutWrapper({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }
    loadUser();
  }, [pathname]);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return <>{children}</>;
  }

  const pageTitle = getPageTitle(pathname);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          pageTitle={pageTitle}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          user={user}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </div>
  );
}
