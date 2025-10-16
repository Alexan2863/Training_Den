"use client";

import Link from "next/link";
import Image from "next/image";

export default function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { name: "Home", href: "/dashboard" },
    { name: "Training Programs", href: "/training-programs" },
    { name: "Users", href: "/users" },
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
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white text-lg hover:text-secondary-light transition-colors"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    onClose();
                  }
                }}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
