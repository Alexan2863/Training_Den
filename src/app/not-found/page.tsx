"use client";

import Link from "next/link";
import { CraneIcon } from "@phosphor-icons/react";

export default function NotFound() {
  return (
    <div className="pt-10 flex items-center justify-start">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="relative mb-4">
          <div className="w-25 h-25 mx-auto bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center shadow-2xl">
            <div className="w-14 h-14 bg-card rounded-full flex items-center justify-center shadow-inner">
              <CraneIcon size={32} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground tracking-tight">
                Page Under Construction
              </h1>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
            </div>
          </div>

          <p className="text-xl text-muted-foreground max-w-md mx-auto leading-relaxed font-light">
            We&apos;re crafting something extraordinary here. Please check back
            soon while we put the finishing touches.
          </p>

          {/* Link to Dashboard */}
          <div className="pt-2">
            <p className="text-sm text-muted-foreground font-medium">
              Return to{" "}
              <Link
                href="/dashboard"
                className="text-primary hover:text-primary-dark underline transition-colors"
              >
                dashboard
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
