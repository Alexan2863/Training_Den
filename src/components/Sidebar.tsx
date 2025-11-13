"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { House, PresentationChartIcon, UsersIcon } from "@phosphor-icons/react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navItems = [
    { name: "Home", href: "/dashboard", icon: House },
    {
      name: "Training Programs",
      href: "/not-found",
      icon: PresentationChartIcon,
    },
    { name: "Users", href: "/users", icon: UsersIcon },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-primary z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static
        `}
      >
        <div className="flex flex-col h-full p-6">
          <div className="mb-8 flex flex-col items-center">
            <Image
              src="/logo.svg"
              alt="Training Den Logo"
              width={250}
              height={60}
              className="mb-4"
            />
            <h1 className="text-white text-4xl font-regular">Training Den</h1>
          </div>

          <nav className="flex flex-col gap-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 text-white text-lg hover:text-secondary-light transition-colors hover:underline"
                  onClick={() => {
                    if (
                      typeof window !== "undefined" &&
                      window.innerWidth < 1024
                    ) {
                      onClose();
                    }
                  }}
                >
                  <Icon size={24} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}

export default memo(Sidebar);
