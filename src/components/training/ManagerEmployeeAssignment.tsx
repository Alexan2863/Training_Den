"use client";

import { useState, useEffect, useRef } from "react";
import { ManagerProgramDetail } from "@/lib/types/training-programs";
import {
  CaretDownIcon,
  CaretRightIcon,
  UserMinusIcon,
  UserPlusIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";

interface ManagerEmployeeAssignmentProps {
  program: ManagerProgramDetail;
  onUpdate?: () => void;
}

export default function ManagerEmployeeAssignment({
  program,
  onUpdate,
}: ManagerEmployeeAssignmentProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["assigned"])
  );
  const [updatingEmployees, setUpdatingEmployees] = useState<Set<string>>(
    new Set()
  );
  const [bulkOperating, setBulkOperating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(section)) {
        newExpanded.delete(section);
      } else {
        newExpanded.add(section);
      }
      return newExpanded;
    });
  };

  const assignEmployee = async (employeeId: string) => {
    setError(null);
    setUpdatingEmployees(prev => new Set(prev).add(employeeId));

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`/api/programs/${program.id}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(data.message || "Failed to assign employee");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to assign employee");
      }

      // Success - trigger refresh
      onUpdate?.();
    } catch (err) {
      // Don't set error if request was aborted (component unmounted)
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message || "Failed to assign employee");
      }
    } finally {
      setUpdatingEmployees(prev => {
        const newSet = new Set(prev);
        newSet.delete(employeeId);
        return newSet;
      });
    }
  };

  const removeEmployee = async (employeeId: string, employeeName: string) => {
    if (
      !confirm(
        `Remove ${employeeName} from this program? This will also remove them from all sessions.`
      )
    ) {
      return;
    }

    setError(null);
    setUpdatingEmployees(prev => new Set(prev).add(employeeId));

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(
        `/api/programs/${program.id}/assign/${employeeId}`,
        {
          method: "DELETE",
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(data.message || "Failed to remove employee");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to remove employee");
      }

      // Success - trigger refresh
      onUpdate?.();
    } catch (err) {
      // Don't set error if request was aborted (component unmounted)
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message || "Failed to remove employee");
      }
    } finally {
      setUpdatingEmployees(prev => {
        const newSet = new Set(prev);
        newSet.delete(employeeId);
        return newSet;
      });
    }
  };

  const assignAll = async () => {
    if (program.availableEmployees.length === 0) {
      return;
    }

    if (
      !confirm(
        `Assign all ${program.availableEmployees.length} available employees to this program?`
      )
    ) {
      return;
    }

    setError(null);
    setBulkOperating(true);

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`/api/programs/${program.id}/assign-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(data.message || "Failed to assign all employees");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to assign all employees");
      }

      // Success - trigger refresh
      onUpdate?.();
    } catch (err) {
      // Don't set error if request was aborted (component unmounted)
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message || "Failed to assign employees");
      }
    } finally {
      setBulkOperating(false);
    }
  };

  const removeAll = async () => {
    if (program.assignedEmployees.length === 0) {
      return;
    }

    if (
      !confirm(
        `Remove all ${program.assignedEmployees.length} employees from this program? This will also remove them from all sessions.`
      )
    ) {
      return;
    }

    setError(null);
    setBulkOperating(true);

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`/api/programs/${program.id}/assign`, {
        method: "DELETE",
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(data.message || "Failed to remove all employees");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to remove all employees");
      }

      // Success - trigger refresh
      onUpdate?.();
    } catch (err) {
      // Don't set error if request was aborted (component unmounted)
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message || "Failed to remove employees");
      }
    } finally {
      setBulkOperating(false);
    }
  };

  const assignedCount = program.assignedEmployees.length;
  const availableCount = program.availableEmployees.length;
  const isAssignedExpanded = expandedSections.has("assigned");
  const isAvailableExpanded = expandedSections.has("available");

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4">Employee Assignments</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md" role="alert">
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
        {/* Assigned Employees Section */}
        <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
          <div
            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
              isAssignedExpanded ? "bg-gray-50" : ""
            }`}
            onClick={() => toggleSection("assigned")}
            role="button"
            aria-expanded={isAssignedExpanded}
            aria-controls="assigned-employees-content"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleSection("assigned");
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="text-gray-600">
                  {isAssignedExpanded ? (
                    <CaretDownIcon size={20} weight="bold" />
                  ) : (
                    <CaretRightIcon size={20} weight="bold" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    Assigned Employees ({assignedCount})
                  </h3>
                  <p className="text-sm text-gray-600">
                    Employees currently assigned to this program
                  </p>
                </div>
              </div>

              {isAssignedExpanded && assignedCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAll();
                  }}
                  disabled={bulkOperating}
                  aria-busy={bulkOperating}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  {bulkOperating ? (
                    <>
                      <SpinnerGapIcon size={16} className="animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <UserMinusIcon size={16} weight="bold" />
                      Remove All
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {isAssignedExpanded && (
            <div className="border-t border-gray-200" id="assigned-employees-content">
              {assignedCount === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>No employees assigned yet. Assign employees below.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {program.assignedEmployees.map((assignment) => {
                    const isUpdating = updatingEmployees.has(
                      assignment.employee.id
                    );

                    return (
                      <div
                        key={assignment.id}
                        className="p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-700 font-semibold text-sm">
                              {assignment.employee.first_name[0]}
                              {assignment.employee.last_name[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {assignment.employee.fullName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {assignment.employee.email}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            removeEmployee(
                              assignment.employee.id,
                              assignment.employee.fullName
                            )
                          }
                          disabled={isUpdating}
                          aria-busy={isUpdating}
                          className="btn btn-secondary flex items-center gap-2"
                        >
                          {isUpdating ? (
                            <>
                              <SpinnerGapIcon
                                size={16}
                                className="animate-spin"
                              />
                              Removing...
                            </>
                          ) : (
                            <>
                              <UserMinusIcon size={16} weight="bold" />
                              Remove
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Available Employees Section */}
        <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
          <div
            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
              isAvailableExpanded ? "bg-gray-50" : ""
            }`}
            onClick={() => toggleSection("available")}
            role="button"
            aria-expanded={isAvailableExpanded}
            aria-controls="available-employees-content"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleSection("available");
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="text-gray-600">
                  {isAvailableExpanded ? (
                    <CaretDownIcon size={20} weight="bold" />
                  ) : (
                    <CaretRightIcon size={20} weight="bold" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    Available Employees ({availableCount})
                  </h3>
                  <p className="text-sm text-gray-600">
                    Employees not yet assigned to this program
                  </p>
                </div>
              </div>

              {isAvailableExpanded && availableCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    assignAll();
                  }}
                  disabled={bulkOperating}
                  aria-busy={bulkOperating}
                  className="btn btn-primary flex items-center gap-2"
                >
                  {bulkOperating ? (
                    <>
                      <SpinnerGapIcon size={16} className="animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <UserPlusIcon size={16} weight="bold" />
                      Assign All
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {isAvailableExpanded && (
            <div className="border-t border-gray-200" id="available-employees-content">
              {availableCount === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>All employees have been assigned to this program.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {program.availableEmployees.map((employee) => {
                    const isUpdating = updatingEmployees.has(employee.id);

                    return (
                      <div
                        key={employee.id}
                        className="p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-700 font-semibold text-sm">
                              {employee.first_name[0]}
                              {employee.last_name[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{employee.fullName}</p>
                            <p className="text-sm text-gray-600">
                              {employee.email}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => assignEmployee(employee.id)}
                          disabled={isUpdating}
                          aria-busy={isUpdating}
                          className="btn btn-primary flex items-center gap-2"
                        >
                          {isUpdating ? (
                            <>
                              <SpinnerGapIcon
                                size={16}
                                className="animate-spin"
                              />
                              Assigning...
                            </>
                          ) : (
                            <>
                              <UserPlusIcon size={16} weight="bold" />
                              Assign
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
