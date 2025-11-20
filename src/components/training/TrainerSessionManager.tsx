"use client";

import { useState } from "react";
import {
  TrainerProgramDetail,
  ProgramSession,
  SessionEnrollmentInfo,
} from "@/lib/types/training-programs";
import {
  CaretDownIcon,
  CaretRightIcon,
  CheckCircleIcon,
  CircleIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";

interface TrainerSessionManagerProps {
  program: TrainerProgramDetail;
  onUpdate?: () => void;
}

export default function TrainerSessionManager({
  program,
  onUpdate,
}: TrainerSessionManagerProps) {
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(
    new Set()
  );
  const [updatingEnrollments, setUpdatingEnrollments] = useState<Set<string>>(
    new Set()
  );
  const [updatingSessions, setUpdatingSessions] = useState<Set<string>>(
    new Set()
  );
  const [error, setError] = useState<string | null>(null);

  // Filter to only sessions owned by the trainer
  const trainerSessions = program.sessions.filter(
    (session) => session.isOwner === true
  );

  // Group enrollments by session
  const getEnrollmentsForSession = (
    sessionId: string
  ): SessionEnrollmentInfo[] => {
    return program.enrolledEmployees.filter(
      (enrollment) => enrollment.session_id === sessionId
    );
  };

  const toggleSession = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const markEnrollmentComplete = async (enrollmentId: string) => {
    setError(null);
    setUpdatingEnrollments(new Set(updatingEnrollments).add(enrollmentId));

    try {
      const response = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to mark enrollment complete");
      }

      // Success - trigger refresh
      onUpdate?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update enrollment"
      );
    } finally {
      const newUpdating = new Set(updatingEnrollments);
      newUpdating.delete(enrollmentId);
      setUpdatingEnrollments(newUpdating);
    }
  };

  const markAllComplete = async (sessionId: string) => {
    const enrollments = getEnrollmentsForSession(sessionId);
    const incomplete = enrollments.filter((e) => !e.completed);

    if (incomplete.length === 0) {
      return;
    }

    if (
      !confirm(
        `Mark all ${incomplete.length} employees as complete for this session?`
      )
    ) {
      return;
    }

    setError(null);
    setUpdatingSessions(new Set(updatingSessions).add(sessionId));

    try {
      const response = await fetch(`/api/sessions/${sessionId}/complete-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to mark all enrollments complete"
        );
      }

      // Success - trigger refresh
      onUpdate?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update enrollments"
      );
    } finally {
      const newUpdating = new Set(updatingSessions);
      newUpdating.delete(sessionId);
      setUpdatingSessions(newUpdating);
    }
  };

  if (trainerSessions.length === 0) {
    return (
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Your Sessions</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
          <p className="text-gray-600">
            You have no sessions assigned for this program.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4">Your Sessions</h2>

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
        {trainerSessions.map((session) => {
          const enrollments = getEnrollmentsForSession(session.id);
          const completedCount = enrollments.filter((e) => e.completed).length;
          const totalCount = enrollments.length;
          const allComplete = completedCount === totalCount && totalCount > 0;
          const isExpanded = expandedSessions.has(session.id);
          const isUpdating = updatingSessions.has(session.id);

          const sessionDate = new Date(session.session_datetime);
          const isPast = sessionDate < new Date();
          const hasIncomplete = totalCount > 0 && completedCount < totalCount;

          return (
            <div
              key={session.id}
              className={`border rounded-md overflow-hidden ${
                isPast && hasIncomplete
                  ? "border-secondary-light bg-orange-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              {/* Session Header */}
              <div
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isExpanded ? "bg-gray-50" : ""
                }`}
                onClick={() => toggleSession(session.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-gray-600">
                      {isExpanded ? (
                        <CaretDownIcon size={20} weight="bold" />
                      ) : (
                        <CaretRightIcon size={20} weight="bold" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
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
                        {isPast && hasIncomplete && (
                          <span className="px-2 py-0.5 bg-secondary-light text-secondary-dark text-xs font-medium rounded">
                            Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Duration: {session.duration_minutes} minutes •{" "}
                        {completedCount} of {totalCount} completed
                        {totalCount === 0 && "No enrollments"}
                      </p>
                    </div>
                  </div>

                  {/* Mark All Complete Button */}
                  {isExpanded && totalCount > 0 && !allComplete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllComplete(session.id);
                      }}
                      disabled={isUpdating}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      {isUpdating ? (
                        <>
                          <SpinnerGapIcon size={16} className="animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Mark All Complete"
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Session Body - Enrollments */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-white">
                  {totalCount === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <p>No employees enrolled in this session yet.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {enrollments.map((enrollment) => {
                        const isUpdatingThis = updatingEnrollments.has(
                          enrollment.id
                        );
                        const isCompleted = enrollment.completed;

                        return (
                          <div
                            key={enrollment.id}
                            className={`p-4 flex items-center justify-between ${
                              isCompleted ? "bg-green-50" : ""
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {isCompleted ? (
                                <CheckCircleIcon
                                  size={24}
                                  weight="fill"
                                  className="text-green-600"
                                />
                              ) : (
                                <CircleIcon
                                  size={24}
                                  weight="regular"
                                  className="text-gray-400"
                                />
                              )}
                              <div>
                                <p className="font-medium">
                                  {enrollment.employee.fullName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {enrollment.employee.email}
                                </p>
                              </div>
                            </div>

                            <div>
                              {isCompleted ? (
                                <div className="text-right">
                                  <span className="inline-flex items-center gap-1 px-3 py-3 rounded-lg bg-green-200 text-green-800 text-md font-medium btn">
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
                                <button
                                  onClick={() =>
                                    markEnrollmentComplete(enrollment.id)
                                  }
                                  disabled={isUpdatingThis}
                                  className="btn btn-secondary flex items-center gap-2"
                                >
                                  {isUpdatingThis ? (
                                    <>
                                      <SpinnerGapIcon
                                        size={16}
                                        className="animate-spin"
                                      />
                                      Marking...
                                    </>
                                  ) : (
                                    "Mark Complete"
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
