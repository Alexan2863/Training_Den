"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProfileIcon from "@/components/ProfileIcon";
import { getCurrentUser } from "@/lib/auth";

interface UserDetail {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: "admin" | "manager" | "trainer" | "employee";
  is_active: boolean;
  managedPrograms?: Array<{
    id: string;
    title: string;
    deadline: string;
    is_active: boolean;
  }>;
  trainingSessions?: Array<{
    id: string;
    session_datetime: string;
    duration_minutes: number;
    is_active: boolean;
    program: { id: string; title: string };
  }>;
  assignedPrograms?: Array<{
    id: string;
    created_at: string;
    program: { id: string; title: string; deadline: string };
  }>;
  enrolledSessions?: Array<{
    id: string;
    completed: boolean;
    completion_date: string | null;
    session: {
      id: string;
      session_datetime: string;
      program: { id: string; title: string };
    };
  }>;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check user role
  useEffect(() => {
    async function checkUserRole() {
      const currentUser = await getCurrentUser();
      setIsAdmin(currentUser?.role === "admin");
    }
    checkUserRole();
  }, []);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();

        if (data.success) {
          setUser(data.data);
        } else {
          setError(data.message || "Failed to load user");
        }
      } catch (err) {
        setError("Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <p className="text-red-800 font-semibold mb-2">Error</p>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push("/users")}
            className="mt-4 px-4 py-2 text-primary cursor-pointer hover:underline"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <p className="text-center text-gray-500">User not found</p>
      </div>
    );
  }

  const fullName = `${user.first_name} ${user.last_name}`;
  const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(
    0
  )}`.toUpperCase();

  return (
    <div className="w-full h-full max-w-7xl p-6 overflow-y-scroll">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <button
            onClick={() => router.push("/users")}
            className="text-primary hover:text-primary-light cursor-pointer flex items-center gap-2"
          >
            ← Back to Users
          </button>
        </div>

        {/* User Profile Section */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{fullName}</h1>
              <div className="space-y-1 text-gray-600">
                <p>
                  <span className="font-semibold">Email:</span> {user.email}
                </p>
                {user.phone && (
                  <p>
                    <span className="font-semibold">Phone:</span> {user.phone}
                  </p>
                )}
                <p>
                  <span className="font-semibold">Role:</span>{" "}
                  <span className="capitalize">{user.role}</span>
                </p>
                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      user.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role-specific sections - Only visible to admins */}
      {isAdmin && user.role === "manager" && user.managedPrograms && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Managed Programs</h2>
          {user.managedPrograms.length === 0 ? (
            <p className="text-gray-500">No programs managed</p>
          ) : (
            <div className="bg-white border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold">
                      Program
                    </th>
                    <th className="text-left p-3 text-sm font-semibold">
                      Deadline
                    </th>
                    <th className="text-left p-3 text-sm font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {user.managedPrograms.map((program) => (
                    <tr
                      key={program.id}
                      className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        router.push(`/training-programs/${program.id}`)
                      }
                    >
                      <td className="p-3">{program.title}</td>
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(program.deadline).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            program.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {program.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {isAdmin && user.role === "trainer" && user.trainingSessions && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Training Sessions</h2>
          {user.trainingSessions.length === 0 ? (
            <p className="text-gray-500">No training sessions assigned</p>
          ) : (
            <div className="bg-white border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold">
                      Program
                    </th>
                    <th className="text-left p-3 text-sm font-semibold">
                      Session Date & Time
                    </th>
                    <th className="text-left p-3 text-sm font-semibold">
                      Duration
                    </th>
                    <th className="text-left p-3 text-sm font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {user.trainingSessions.map((session) => {
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

                    return (
                      <tr
                        key={session.id}
                        className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                        onClick={() =>
                          router.push(
                            `/training-programs/${session.program.id}`
                          )
                        }
                      >
                        <td className="p-3">{session.program.title}</td>
                        <td className="p-3 text-sm">{`${datePart} - ${timePart}`}</td>
                        <td className="p-3 text-sm text-gray-600">
                          {session.duration_minutes} minutes
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              session.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {session.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {isAdmin && user.role === "employee" && (
        <>
          {/* Assigned Programs */}
          {user.assignedPrograms && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Assigned Programs</h2>
              {user.assignedPrograms.length === 0 ? (
                <p className="text-gray-500">No programs assigned</p>
              ) : (
                <div className="bg-white border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold">
                          Program
                        </th>
                        <th className="text-left p-3 text-sm font-semibold">
                          Deadline
                        </th>
                        <th className="text-left p-3 text-sm font-semibold">
                          Assigned Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.assignedPrograms.map((assignment) => (
                        <tr
                          key={assignment.id}
                          className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                          onClick={() =>
                            router.push(
                              `/training-programs/${assignment.program.id}`
                            )
                          }
                        >
                          <td className="p-3">{assignment.program.title}</td>
                          <td className="p-3 text-sm text-gray-600">
                            {new Date(
                              assignment.program.deadline
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {new Date(
                              assignment.created_at
                            ).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Enrolled Sessions */}
          {user.enrolledSessions && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Enrolled Sessions</h2>
              {user.enrolledSessions.length === 0 ? (
                <p className="text-gray-500">No sessions enrolled</p>
              ) : (
                <div className="bg-white border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold">
                          Program
                        </th>
                        <th className="text-left p-3 text-sm font-semibold">
                          Session Date
                        </th>
                        <th className="text-left p-3 text-sm font-semibold">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.enrolledSessions.map((enrollment) => {
                        const sessionDate = new Date(
                          enrollment.session.session_datetime
                        );
                        const datePart = sessionDate.toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        );
                        const timePart = sessionDate.toLocaleTimeString(
                          "en-US",
                          {
                            hour: "numeric",
                            minute: "2-digit",
                          }
                        );

                        return (
                          <tr
                            key={enrollment.id}
                            className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                            onClick={() =>
                              router.push(
                                `/training-programs/${enrollment.session.program.id}`
                              )
                            }
                          >
                            <td className="p-3">
                              {enrollment.session.program.title}
                            </td>
                            <td className="p-3 text-sm">{`${datePart} - ${timePart}`}</td>
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
