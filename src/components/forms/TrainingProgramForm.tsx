"use client";

import { useState, useEffect } from "react";
import { CaretDownIcon, XIcon } from "@phosphor-icons/react";

interface TrainingProgramFormProps {
  onSuccess?: () => void;
  onCancel?: () => void; // Called when form is cancelled (useful for edit mode navigation)
  programId?: string; // If provided, form is in edit mode
  initialOpen?: boolean; // Auto-open the form (useful for edit pages)
}

interface Manager {
  id: string;
  fullName: string;
}

interface Session {
  sessionDate: string;
  sessionTime: string;
  trainerId: string;
  isActive: boolean;
}

export default function TrainingProgramForm({
  onSuccess,
  onCancel,
  programId,
  initialOpen = false,
}: TrainingProgramFormProps) {
  const [open, setOpen] = useState(initialOpen);
  const isEditMode = !!programId;

  // Form state - Program fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [managerId, setManagerId] = useState("");
  const [duration, setDuration] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Form state - Sessions (array of sessions)
  const [sessions, setSessions] = useState<Session[]>([
    { sessionDate: "", sessionTime: "", trainerId: "", isActive: true },
  ]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [trainers, setTrainers] = useState<Manager[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Fetch program data when in edit mode
  useEffect(() => {
    async function fetchProgramData() {
      if (!programId) return;

      setLoadingData(true);
      try {
        const response = await fetch(`/api/training-programs/${programId}`);
        const data = await response.json();

        if (data.success && data.data) {
          const program = data.data;

          // Populate program fields
          setTitle(program.title || "");
          setDescription(program.notes || "");
          setManagerId(program.manager_id || "");
          setDeadline(program.deadline ? program.deadline.split('T')[0] : "");
          setIsActive(program.is_active ?? true);

          // Populate sessions if they exist
          if ("sessions" in program && program.sessions && program.sessions.length > 0) {
            const formattedSessions = program.sessions.map((session: any) => {
              const datetime = new Date(session.session_datetime);
              const dateStr = datetime.toISOString().split('T')[0];
              const timeStr = datetime.toTimeString().slice(0, 5);

              return {
                sessionDate: dateStr,
                sessionTime: timeStr,
                trainerId: session.trainer_id || "",
                isActive: session.is_active ?? true,
              };
            });
            setSessions(formattedSessions);

            // Set duration from first session (all sessions should have same duration)
            const firstSessionDuration = program.sessions[0]?.duration_minutes;
            if (firstSessionDuration !== undefined && firstSessionDuration !== null) {
              setDuration(firstSessionDuration.toString());
            }
          }
        } else {
          setError(data.message || "Failed to load program data");
        }
      } catch (err) {
        setError("Failed to fetch program data");
        console.error("Error fetching program:", err);
      } finally {
        setLoadingData(false);
      }
    }

    if (isEditMode && open) {
      fetchProgramData();
    }
  }, [programId, isEditMode, open]);

  // Fetch managers and trainers when modal opens
  useEffect(() => {
    if (open) {
      fetchManagersAndTrainers();
    }
  }, [open]);

  const fetchManagersAndTrainers = async () => {
    setLoadingData(true);
    try {
      // Fetch managers
      const managersRes = await fetch("/api/users/by-role/manager");
      const managersData = await managersRes.json();

      // Fetch trainers
      const trainersRes = await fetch("/api/users/by-role/trainer");
      const trainersData = await trainersRes.json();

      if (managersData.success) {
        setManagers(managersData.data);
      }

      if (trainersData.success) {
        setTrainers(trainersData.data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingData(false);
    }
  };

  // Add a new session
  const addSession = () => {
    setSessions([
      ...sessions,
      { sessionDate: "", sessionTime: "", trainerId: "", isActive: true },
    ]);
  };

  // Remove a session
  const removeSession = (index: number) => {
    if (sessions.length > 1) {
      setSessions(sessions.filter((_, i) => i !== index));
    }
  };

  // Update a specific session field
  const updateSession = (
    index: number,
    field: keyof Session,
    value: string | boolean
  ) => {
    const newSessions = [...sessions];
    newSessions[index] = { ...newSessions[index], [field]: value };
    setSessions(newSessions);
  };

  // Validation
  const validateForm = (): string | null => {
    if (!title.trim()) return "Title is required";
    if (!managerId) return "Manager is required";
    if (!duration || parseInt(duration) <= 0)
      return "Valid duration is required";
    if (!deadline) return "Deadline is required";

    // Validate sessions
    if (sessions.length === 0) return "At least one session is required";

    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];
      if (!session.sessionDate) return `Session ${i + 1}: Date is required`;
      if (!session.sessionTime) return `Session ${i + 1}: Time is required`;
      if (!session.trainerId) return `Session ${i + 1}: Trainer is required`;
    }

    return null;
  };

  // Reset form
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setManagerId("");
    setDuration("");
    setDeadline("");
    setIsActive(true);
    setSessions([
      { sessionDate: "", sessionTime: "", trainerId: "", isActive: true },
    ]);
    setError(null);
  };

  // Handle close
  const handleClose = () => {
    setOpen(false);
    resetForm();
    // In edit mode, navigate away from edit page
    if (onCancel) {
      onCancel();
    }
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      // Transform sessions to API format
      const sessionsData = sessions.map((session) => ({
        session_datetime: `${session.sessionDate}T${session.sessionTime}:00`,
        duration_minutes: parseInt(duration),
        trainer_id: session.trainerId,
        is_active: session.isActive,
      }));

      const formData = {
        title: title.trim(),
        notes: description.trim() || null,
        manager_id: managerId,
        deadline,
        is_active: isActive,
        sessions: sessionsData,
      };

      const url = isEditMode
        ? `/api/training-programs/${programId}`
        : "/api/training-programs";
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const action = isEditMode ? "update" : "create";
        throw new Error(data.message || `Failed to ${action} training program`);
      }

      handleClose();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Button to open modal - only show in create mode */}
      {!isEditMode && (
        <button
          onClick={() => setOpen(true)}
          className="px-6 py-2 bg-purple-600 btn-primary"
        >
          Create Training Program
        </button>
      )}

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={handleClose} />
      )}

      {/* Modal */}
      <div
        className={`${
          open ? "flex" : "hidden"
        } fixed inset-0 z-50 justify-center items-center p-4`}
      >
        <div className="bg-white border-2 border-ring rounded-xl w-full max-w-2xl shadow-xl relative max-h-[90vh] flex flex-col">
          {/* Fixed Header with Close Button */}
          <div className="flex-shrink-0 flex justify-end p-4 border-b border-gray-200">
            <button
              onClick={handleClose}
              className="text-gray-600 hover:text-black"
              disabled={isSubmitting}
              type="button"
            >
              <XIcon className="cursor-pointer hover:text-secondary" size={24} />
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex-shrink-0 mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="overflow-y-auto scrollbar-hidden px-6 pt-6 pb-6 flex-1">
              <h2 className="text-3xl font-semibold mb-6">
                {isEditMode ? "Edit Training Program" : "Create Training"}
              </h2>
              {/* Title */}
              <div className="mb-4">
                <label className="block font-semibold mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border rounded-md px-4 py-2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={4}
                  className="w-full border rounded-md px-4 py-2 appearance-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Manager */}
              <div className="mb-4">
                <label className="block font-semibold mb-1">
                  Manager <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    className="w-full border rounded-md pl-4 pr-10 py-2 appearance-none cursor-pointer"
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    disabled={isSubmitting || loadingData}
                    required
                  >
                    <option value="">Select a manager...</option>
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.fullName}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <CaretDownIcon
                      className="w-5 h-5 text-gray-600"
                      size={20}
                    />
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="mb-4">
                <label className="block font-semibold mb-1">
                  Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="w-full border rounded-md px-4 py-2"
                  placeholder="60"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  disabled={isSubmitting}
                  min="1"
                  required
                />
              </div>

              {/* Deadline */}
              <div className="mb-4">
                <label className="block font-semibold mb-1">
                  Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full border rounded-md px-4 py-2"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Status - Only show in edit mode */}
              {isEditMode && (
                <div className="mb-4">
                  <label className="block font-semibold mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full border rounded-md pl-4 pr-10 py-2 appearance-none cursor-pointer"
                      value={isActive ? "active" : "inactive"}
                      onChange={(e) => setIsActive(e.target.value === "active")}
                      disabled={isSubmitting}
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <CaretDownIcon
                        className="w-5 h-5 text-gray-600"
                        size={20}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Divider */}
              <hr className="my-6 border-gray-300" />

              {/* Sessions Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Sessions</h3>
                <button
                  type="button"
                  onClick={addSession}
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  + Add Session
                </button>
              </div>

              {/* Render all sessions */}
              {sessions.map((session, index) => (
                <div
                  key={index}
                  className="mb-6 p-4 relative border rounded-md border-primary"
                >
                  {/* Session header with remove button */}
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-lg">
                      Session {index + 1}
                    </h4>
                    {sessions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSession(index)}
                        className="text-red-600 hover:text-red-800 cursor-pointer"
                        disabled={isSubmitting}
                      >
                        <XIcon size={20} />
                      </button>
                    )}
                  </div>

                  {/* Session Date */}
                  <div className="mb-4">
                    <label className="block font-semibold mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      className="w-full border rounded-md px-4 py-2 bg-white"
                      value={session.sessionDate}
                      onChange={(e) =>
                        updateSession(index, "sessionDate", e.target.value)
                      }
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  {/* Session Time */}
                  <div className="mb-4">
                    <label className="block font-semibold mb-1">
                      Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      className="w-full border rounded-md px-4 py-2 bg-white"
                      value={session.sessionTime}
                      onChange={(e) =>
                        updateSession(index, "sessionTime", e.target.value)
                      }
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  {/* Trainer */}
                  <div className="mb-4">
                    <label className="block font-semibold mb-1">
                      Trainer <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        className="w-full border rounded-md pl-4 pr-10 py-2 appearance-none cursor-pointer bg-white"
                        value={session.trainerId}
                        onChange={(e) =>
                          updateSession(index, "trainerId", e.target.value)
                        }
                        disabled={isSubmitting || loadingData}
                        required
                      >
                        <option value="">Select a trainer...</option>
                        {trainers.map((trainer) => (
                          <option key={trainer.id} value={trainer.id}>
                            {trainer.fullName}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <CaretDownIcon
                          className="w-5 h-5 text-gray-600"
                          size={20}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Session Status - Only show in edit mode */}
                  {isEditMode && (
                    <div className="mb-4">
                      <label className="block font-semibold mb-1">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          className="w-full border rounded-md pl-4 pr-10 py-2 appearance-none cursor-pointer bg-white"
                          value={session.isActive ? "active" : "inactive"}
                          onChange={(e) =>
                            updateSession(
                              index,
                              "isActive",
                              e.target.value === "active"
                            )
                          }
                          disabled={isSubmitting}
                          required
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <CaretDownIcon
                            className="w-5 h-5 text-gray-600"
                            size={20}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-xl">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 rounded-full border btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || loadingData}
              >
                {isSubmitting
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                  ? "Update Program"
                  : "Create Program"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
