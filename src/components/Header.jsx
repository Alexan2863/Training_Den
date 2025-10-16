"use client";

import ProfileIcon from "./ProfileIcon";

export default function Header({ pageTitle, onMenuClick, user }) {
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="flex items-center justify-between px-4 py-4 lg:px-6">
        {/* Mobile menu icon */}
        <button
          onClick={onMenuClick}
          className="lg:hidden flex flex-col gap-1.5 w-8 h-8 justify-center items-center focus:outline-none"
          aria-label="Toggle menu"
        >
          <span className="w-6 h-0.5 bg-white"></span>
          <span className="w-6 h-0.5 bg-white"></span>
          <span className="w-6 h-0.5 bg-white"></span>
        </button>

        <h1 className="text-xl font-semibold lg:ml-0 ml-auto mr-auto">
          {pageTitle}
        </h1>

        <ProfileIcon user={user} size="md" />
      </div>
    </header>
  );
}
