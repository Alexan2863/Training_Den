"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ProgramDetail } from "@/lib/types/training-programs";
import TrainingProgramForm from "@/components/forms/TrainingProgramForm";
import TrainerSessionManager from "@/components/training/TrainerSessionManager";
import ManagerEmployeeAssignment from "@/components/training/ManagerEmployeeAssignment";
import EmployeeSessionEnrollment from "@/components/training/EmployeeSessionEnrollment";
import { useUser } from "@/components/UserProvider";
import ProfileIcon from "@/components/ProfileIcon";

function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-5 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="h-9 bg-gray-300 rounded w-1/3 mb-2"></div>
        <div className="flex items-center gap-4">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-40"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
      </div>

      {/* Notes skeleton */}
      <div className="mb-6 max-w-3xl">
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>

      {/* Sessions skeleton */}
      <div className="mb-6">
        <div className="h-7 bg-gray-300 rounded w-32 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-md p-4 bg-white"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="h-6 bg-gray-300 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-300 rounded w-40"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TrainingProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const programId = params.id as string;
  const user = useUser();

  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function fetchProgram() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/training-programs/${programId}`);
        const data = await response.json();

        if (data.success) {
          setProgram(data.data);
        } else {
          setError(data.message || "Failed to load training program");
        }
      } catch {
        setError("Failed to fetch training program details");
      } finally {
        setLoading(false);
      }
    }

    if (programId) {
      fetchProgram();
    }
  }, [programId, searchParams, refreshTrigger]);

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <p className="text-red-800 font-semibold mb-2">Error</p>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push("/training-programs")}
            className="mt-4 px-4 py-2 text-primary cursor-pointer hover:underline"
          >
            Back to Training Programs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full max-w-7xl px-4 py-4 sm:p-6 overflow-y-scroll scrollbar-hidden">
      <div className="crossfade-container">
        {/* Skeleton */}
        <div className={`crossfade-skeleton ${!loading ? "hidden" : ""}`}>
          <DetailSkeleton />
        </div>

        {/* Content */}
        <div className={`crossfade-content ${!loading && program ? "visible" : ""}`}>
          {program && (
            <>
              {/* Header */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                  <button
                    onClick={() => router.push("/training-programs")}
                    className="text-primary hover:text-primary-light cursor-pointer flex items-center gap-2"
                  >
                    ← Back to Training Programs
                  </button>
                  {user?.role === "admin" && (
                    <button
                      onClick={() => setShowEditForm(true)}
                      className="btn btn-primary w-full sm:w-auto"
                    >
                      Edit Program
                    </button>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{program.title}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                  <span>Manager: {program.managerName}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>
                    Deadline:{" "}
                    {new Date(program.deadline).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      program.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {program.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {program.notes && (
                <div className="mb-6 max-w-3xl">
                  <p className="text-gray-700">{program.notes}</p>
                </div>
              )}

              {/* Sessions */}
              {"sessions" in program && program.sessions && (
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold mb-4">Sessions</h2>
                  <div className="space-y-4 stagger-fade-in">
                    {program.sessions.map((session, index) => (
                      <div
                        key={session.id}
                        className="border border-gray-200 rounded-md p-4 bg-white"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">Session {index + 1}</h3>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              session.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {session.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Date & Time:</span>
                            <p className="font-medium">
                              {(() => {
                                const sessionDate = new Date(session.session_datetime);
                                const datePart = sessionDate.toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                });
                                const timePart = sessionDate.toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                });
                                return `${datePart} - ${timePart}`;
                              })()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Duration:</span>
                            <p className="font-medium">{session.duration_minutes} minutes</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Trainer:</span>
                            <p className="font-medium">{session.trainerName || "Not assigned"}</p>
                          </div>
                        </div>
                        {session.notes && (
                          <div className="mt-3 pt-3 border-t">
                            <span className="text-gray-600 text-sm">Notes:</span>
                            <p className="text-sm mt-1">{session.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats (role-specific) */}
              {"stats" in program && program.stats && (
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold mb-4">Statistics</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 stagger-fade-in">
                    {Object.entries(program.stats).map(([key, value]) => (
                      <div key={key} className="bg-white border rounded-md p-4">
                        <p className="text-gray-600 text-sm capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                        <p className="text-xl sm:text-2xl font-bold">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trainer Session Management (for trainers) */}
              {user?.role === "trainer" &&
                "sessions" in program &&
                "enrolledEmployees" in program && (
                  <TrainerSessionManager
                    program={program as any}
                    onUpdate={() => setRefreshTrigger((prev) => prev + 1)}
                  />
                )}

              {/* Enrolled Employees (for admin - read-only view) */}
              {user?.role === "admin" &&
                "enrolledEmployees" in program &&
                program.enrolledEmployees && (
                  <div className="mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4">Enrolled Employees</h2>
                    {/* Mobile: Card layout */}
                    <div className="block sm:hidden space-y-3">
                      {program.enrolledEmployees.map((enrollment) => (
                        <div
                          key={enrollment.id}
                          className="bg-white border rounded-md p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <ProfileIcon
                                user={{
                                  id: enrollment.employee.id,
                                  email: enrollment.employee.email,
                                  first_name: enrollment.employee.first_name,
                                  last_name: enrollment.employee.last_name,
                                  role: "employee",
                                }}
                                size="md"
                              />
                              <span className="font-medium">{enrollment.employee.fullName}</span>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                enrollment.completed
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {enrollment.completed ? "Completed" : "Pending"}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>{enrollment.employee.email}</p>
                            <p>Session {enrollment.session_id}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Desktop: Table layout */}
                    <div className="hidden sm:block bg-white border rounded-md overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-primary text-white border-b">
                          <tr>
                            <th className="text-left p-3 text-sm font-semibold">Employee</th>
                            <th className="text-left p-3 text-sm font-semibold">Email</th>
                            <th className="text-left p-3 text-sm font-semibold">Session</th>
                            <th className="text-left p-3 text-sm font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {program.enrolledEmployees.map((enrollment) => (
                            <tr key={enrollment.id} className="border-b last:border-b-0">
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <ProfileIcon
                                    user={{
                                      id: enrollment.employee.id,
                                      email: enrollment.employee.email,
                                      first_name: enrollment.employee.first_name,
                                      last_name: enrollment.employee.last_name,
                                      role: "employee",
                                    }}
                                    size="md"
                                  />
                                  {enrollment.employee.fullName}
                                </div>
                              </td>
                              <td className="p-3 text-sm text-gray-600">{enrollment.employee.email}</td>
                              <td className="p-3 text-sm">Session {enrollment.session_id}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    enrollment.completed
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {enrollment.completed ? "Completed" : "Pending"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* Manager Employee Assignment (for managers) */}
              {user?.role === "manager" &&
                "assignedEmployees" in program &&
                "availableEmployees" in program && (
                  <ManagerEmployeeAssignment
                    program={program as any}
                    onUpdate={() => setRefreshTrigger((prev) => prev + 1)}
                  />
                )}

              {/* Employee Session Enrollment (for employees) */}
              {user?.role === "employee" &&
                "sessions" in program &&
                "myEnrollments" in program && (
                  <EmployeeSessionEnrollment
                    program={program as any}
                    onUpdate={() => setRefreshTrigger((prev) => prev + 1)}
                  />
                )}
            </>
          )}
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <TrainingProgramForm
          programId={programId}
          initialOpen={true}
          onSuccess={() => {
            setShowEditForm(false);
            setRefreshTrigger((prev) => prev + 1);
          }}
          onCancel={() => {
            setShowEditForm(false);
          }}
        />
      )}
    </div>
  );
}
