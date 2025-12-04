"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  EmployeeProgramDetail,
  SessionEnrollmentInfo,
} from "@/lib/types/training-programs";
import {
  CheckCircleIcon,
  SpinnerGapIcon,
  SquareIcon,
  CheckSquareIcon,
} from "@phosphor-icons/react";

interface EmployeeSessionEnrollmentProps {
  program: EmployeeProgramDetail;
  onUpdate?: () => void;
}

export default function EmployeeSessionEnrollment({
  program,
  onUpdate,
}: EmployeeSessionEnrollmentProps) {
  const [updatingSessions, setUpdatingSessions] = useState<Set<string>>(
    new Set()
  );
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Find enrollment for a given session
  const getEnrollmentForSession = (
    sessionId: string
  ): SessionEnrollmentInfo | undefined => {
    return program.myEnrollments.find(
      (enrollment) => enrollment.session_id === sessionId
    );
  };

  const enrollInSession = async (sessionId: string) => {
    setError(null);
    setUpdatingSessions((prev) => new Set(prev).add(sessionId));

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`/api/sessions/${sessionId}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => ({ message: "Request failed" }));
        throw new Error(data.message || "Failed to enroll in session");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to enroll in session");
      }

      // Success - trigger refresh
      onUpdate?.();
    } catch (err) {
      // Don't set error if request was aborted (component unmounted)
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message || "Failed to enroll in session");
      }
    } finally {
      setUpdatingSessions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
    }
  };

  const unenrollFromSession = async (sessionId: string) => {
    if (!confirm("Unenroll from this session?")) {
      return;
    }

    setError(null);
    setUpdatingSessions((prev) => new Set(prev).add(sessionId));

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`/api/sessions/${sessionId}/enroll`, {
        method: "DELETE",
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => ({ message: "Request failed" }));
        throw new Error(data.message || "Failed to unenroll from session");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to unenroll from session");
      }

      // Success - trigger refresh
      onUpdate?.();
    } catch (err) {
      // Don't set error if request was aborted (component unmounted)
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message || "Failed to unenroll from session");
      }
    } finally {
      setUpdatingSessions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
    }
  };

  const handleToggle = (
    sessionId: string,
    enrollment: SessionEnrollmentInfo | undefined
  ) => {
    if (enrollment) {
      // Already enrolled - try to unenroll
      if (enrollment.completed) {
        // Cannot unenroll from completed sessions
        return;
      }
      unenrollFromSession(sessionId);
    } else {
      // Not enrolled - enroll
      enrollInSession(sessionId);
    }
  };

  // Sort sessions by date (upcoming first) - memoized to avoid recalculation
  const sortedSessions = useMemo(() => {
    return [...program.sessions].sort((a, b) => {
      return (
        new Date(a.session_datetime).getTime() -
        new Date(b.session_datetime).getTime()
      );
    });
  }, [program.sessions]);

  if (sortedSessions.length === 0) {
    return (
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Session Enrollments</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
          <p className="text-gray-600">
            No sessions available for this program yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Session Enrollments</h2>

      {error && (
        <div
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md"
          role="alert"
        >
          <p className="text-red-800 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 text-sm underline mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="space-y-3">
        {sortedSessions.map((session) => {
          const enrollment = getEnrollmentForSession(session.id);
          const isEnrolled = !!enrollment;
          const isCompleted = enrollment?.completed || false;
          const isUpdating = updatingSessions.has(session.id);
          const sessionDate = new Date(session.session_datetime);
          const isPast = sessionDate < new Date();

          return (
            <div
              key={session.id}
              className={`border rounded-md p-3 sm:p-4 ${
                isPast && !isCompleted
                  ? "bg-orange-50 border-secondary-light"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Checkbox/Toggle */}
                <div className="pt-0.5 sm:pt-1 flex-shrink-0">
                  {isUpdating ? (
                    <SpinnerGapIcon
                      size={24}
                      className="text-primary animate-spin"
                    />
                  ) : isCompleted ? (
                    <div
                      className="cursor-not-allowed"
                      title="Cannot unenroll from completed sessions"
                    >
                      <CheckSquareIcon
                        size={24}
                        weight="fill"
                        className="text-primary-light"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => handleToggle(session.id, enrollment)}
                      disabled={isUpdating}
                      aria-busy={isUpdating}
                      aria-label={
                        isEnrolled
                          ? "Unenroll from session"
                          : "Enroll in session"
                      }
                      className="hover:opacity-70 transition-opacity"
                    >
                      {isEnrolled ? (
                        <CheckSquareIcon
                          size={24}
                          weight="fill"
                          className="text-primary"
                        />
                      ) : (
                        <SquareIcon
                          size={24}
                          weight="regular"
                          className="text-gray-400"
                        />
                      )}
                    </button>
                  )}
                </div>

                {/* Session Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg">
                        {sessionDate.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        at{" "}
                        {sessionDate.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-sm text-gray-600">
                        <span>
                          Trainer: {session.trainerName || "Not assigned"}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>{session.duration_minutes} minutes</span>
                      </div>
                      {session.notes && (
                        <p className="mt-2 text-sm text-gray-700">
                          {session.notes}
                        </p>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      {isEnrolled && (
                        <div>
                          {isCompleted ? (
                            <div className="text-left sm:text-right">
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-lg">
                                <CheckCircleIcon size={16} weight="fill" />
                                Completed
                              </span>
                              {enrollment.completion_date && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(
                                    enrollment.completion_date
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 bg-primary text-white text-sm font-medium rounded-lg">
                              Enrolled
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action hint for non-enrolled sessions */}
                  {!isEnrolled && !isUpdating && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Click the checkbox to enroll in this session
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
