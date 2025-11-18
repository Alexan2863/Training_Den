"use client";

import { useState, useMemo } from "react";
import { UserRole, UserFormData } from "@/lib/types/users";
import { CaretDownIcon, XIcon } from "@phosphor-icons/react";

// Role colors matching ProfileIcon
const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  admin: { bg: "bg-emerald-50", text: "text-emerald-800" },
  manager: { bg: "bg-rose-50", text: "text-rose-800" },
  trainer: { bg: "bg-fuchsia-50", text: "text-fuchsia-800" },
  employee: { bg: "bg-sky-50", text: "text-sky-800" },
};

interface UserFormProps {
  onSuccess?: () => void;
}

export default function UserForm({ onSuccess }: UserFormProps) {
  const [open, setOpen] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("employee");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initials = useMemo(() => {
    const f = firstName?.charAt(0) || "";
    const l = lastName?.charAt(0) || "";
    return (f + l).toUpperCase();
  }, [firstName, lastName]);

  const avatarColors = ROLE_COLORS[role];

  // Validation
  const validateForm = (): string | null => {
    if (!firstName.trim()) return "First name is required";
    if (!lastName.trim()) return "Last name is required";
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Invalid email format";
    }
    if (!password.trim()) return "Password is required";
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return null;
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setRole("employee");
    setPassword("");
    setIsActive(true);
    setError(null);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const formData: UserFormData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        role,
        password,
      };

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create user");
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
      {/* Button to open modal */}
      <button
        className="px-4 py-2 btn-primary text-white rounded-md"
        onClick={() => setOpen(true)}
      >
        Add User
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={handleClose} />
      )}

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex justify-center items-center p-4 ${
          open ? "" : "hidden"
        }`}
      >
        <div className="bg-white border-2 border-ring rounded-2xl w-full max-w-lg shadow-xl relative max-h-[90vh] flex flex-col">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-700 hover:text-black"
            disabled={isSubmitting}
          >
            <XIcon className="cursor-pointer hover:text-secondary" size={24} />
          </button>

          {/* Error Banner */}
          {error && (
            <div className="mx-8 mt-6 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Scrollable content */}
            <div className="overflow-y-auto px-8 pt-10 pb-6">
              {/* Avatar with role colors */}
              <div className="w-full flex justify-center mb-6">
                <div
                  className={`w-36 h-36 rounded-full border-2 flex items-center justify-center text-5xl font-semibold ${avatarColors.bg} ${avatarColors.text}`}
                >
                  {initials || "?"}
                </div>
              </div>

              {/* FIRST NAME */}
              <div className="mb-4">
                <label className="block font-semibold mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* LAST NAME */}
              <div className="mb-4">
                <label className="block font-semibold mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* EMAIL */}
              <div className="mb-4">
                <label className="block font-semibold mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="example@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* PASSWORD */}
              <div className="mb-4">
                <label className="block font-semibold mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* PHONE */}
              <div className="mb-4">
                <label className="block font-semibold mb-1">Phone</label>
                <input
                  type="tel"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* ROLE */}
              <div className="mb-4">
                <label className="block font-semibold mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none ${avatarColors.bg} ${avatarColors.text} font-medium appearance-none cursor-pointer`}
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    disabled={isSubmitting}
                    required
                  >
                    <option value="employee">Employee</option>
                    <option value="trainer">Trainer</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <CaretDownIcon
                      className="w-5 h-5 text-gray-600"
                      size={20}
                    />
                  </div>
                </div>

                {/* STATUS */}
                <div className="mb-8">
                  <label className="block font-semibold mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none appearance-none cursor-pointer"
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
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-8 py-4 bg-gray-50 rounded-b-2xl">
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
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
