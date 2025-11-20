"use client";

import { useState } from "react";
import { EmployeeProgramDetail, SessionEnrollmentInfo } from "@/lib/types/training-programs";
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
  const [updatingSessions, setUpdatingSessions] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Find enrollment for a given session
  const getEnrollmentForSession = (sessionId: string): SessionEnrollmentInfo | undefined => {
    return program.myEnrollments.find((enrollment) => enrollment.session_id === sessionId);
  };

  const enrollInSession = async (sessionId: string) => {
    setError(null);
    setUpdatingSessions(new Set(updatingSessions).add(sessionId));

    try {
      const response = await fetch(`/api/sessions/${sessionId}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to enroll in session");
      }

      // Success - trigger refresh
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enroll in session");
    } finally {
      const newUpdating = new Set(updatingSessions);
      newUpdating.delete(sessionId);
      setUpdatingSessions(newUpdating);
    }
  };

  const unenrollFromSession = async (sessionId: string) => {
    if (!confirm("Unenroll from this session?")) {
      return;
    }

    setError(null);
    setUpdatingSessions(new Set(updatingSessions).add(sessionId));

    try {
      const response = await fetch(`/api/sessions/${sessionId}/enroll`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to unenroll from session");
      }

      // Success - trigger refresh
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unenroll from session");
    } finally {
      const newUpdating = new Set(updatingSessions);
      newUpdating.delete(sessionId);
      setUpdatingSessions(newUpdating);
    }
  };

  const handleToggle = (sessionId: string, enrollment: SessionEnrollmentInfo | undefined) => {
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

  // Sort sessions by date (upcoming first)
  const sortedSessions = [...program.sessions].sort((a, b) => {
    return new Date(a.session_datetime).getTime() - new Date(b.session_datetime).getTime();
  });

  if (sortedSessions.length === 0) {
    return (
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Session Enrollments</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
          <p className="text-gray-600">No sessions available for this program yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4">Session Enrollments</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
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
              className={`border rounded-md p-4 ${
                isPast && !isCompleted
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox/Toggle */}
                <div className="pt-1">
                  {isUpdating ? (
                    <SpinnerGapIcon size={24} className="text-blue-600 animate-spin" />
                  ) : isCompleted ? (
                    <div
                      className="cursor-not-allowed"
                      title="Cannot unenroll from completed sessions"
                    >
                      <CheckSquareIcon
                        size={24}
                        weight="fill"
                        className="text-green-600"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => handleToggle(session.id, enrollment)}
                      disabled={isUpdating}
                      className="hover:opacity-70 transition-opacity"
                    >
                      {isEnrolled ? (
                        <CheckSquareIcon
                          size={24}
                          weight="fill"
                          className="text-blue-600"
                        />
                      ) : (
                        <SquareIcon size={24} weight="regular" className="text-gray-400" />
                      )}
                    </button>
                  )}
                </div>

                {/* Session Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
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
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <span>Trainer: {session.trainerName || "Not assigned"}</span>
                        <span>•</span>
                        <span>{session.duration_minutes} minutes</span>
                      </div>
                      {session.notes && (
                        <p className="mt-2 text-sm text-gray-700">{session.notes}</p>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isEnrolled && (
                        <div>
                          {isCompleted ? (
                            <div className="text-right">
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded">
                                <CheckCircleIcon size={16} weight="fill" />
                                Completed
                              </span>
                              {enrollment.completion_date && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(enrollment.completion_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
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
