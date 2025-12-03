"use client";

import { useRouter } from "next/navigation";
import { UpcomingSession } from "@/lib/types/training-programs";
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";

interface UpcomingSessionsProps {
  sessions: UpcomingSession[] | null;
}

function SessionsSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-100 border border-gray-200 rounded-lg p-4 animate-pulse"
        >
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-3"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );
}

export default function UpcomingSessions({ sessions }: UpcomingSessionsProps) {
  const router = useRouter();
  const isLoading = sessions === null;

  const handleViewProgram = (programId: string) => {
    router.push(`/training-programs/${programId}`);
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>

      <div className="crossfade-container">
        {/* Skeleton */}
        <div className={`crossfade-skeleton ${!isLoading ? "hidden" : ""}`}>
          <SessionsSkeleton />
        </div>

        {/* Content */}
        <div className={`crossfade-content ${!isLoading ? "visible" : ""}`}>
          {sessions && sessions.length === 0 && (
            <div className="bg-[#fafbff] rounded-lg p-6 shadow-md text-center">
              <CalendarIcon size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">No upcoming sessions scheduled.</p>
              <p className="text-sm text-gray-500 mt-1">
                Enroll in sessions from your assigned programs to see them here.
              </p>
            </div>
          )}

          {sessions && sessions.length > 0 && (
            <div className="space-y-3 stagger-fade-in">
              {sessions.map((session) => {
                const sessionDate = new Date(session.sessionDatetime);
                const formattedDate = sessionDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });
                const formattedTime = sessionDate.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={session.enrollmentId}
                    className="bg-primary rounded-md p-4 shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => handleViewProgram(session.programId)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-white">
                          {session.programTitle}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-300">
                          <span className="flex items-center gap-1">
                            <CalendarIcon size={16} weight="fill" />
                            {formattedDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon size={16} weight="fill" />
                            {formattedTime} ({session.durationMinutes} min)
                          </span>
                          {session.trainerName && (
                            <span className="flex items-center gap-1">
                              <UserIcon size={16} weight="fill" />
                              {session.trainerName}
                            </span>
                          )}
                        </div>
                        {session.notes && (
                          <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                            {session.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-center text-white ml-4">
                        <CaretRightIcon size={24} weight="bold" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
