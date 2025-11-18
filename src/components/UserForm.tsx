"use client";

import { useState, useMemo } from "react";

export default function UserForm() {
  const [open, setOpen] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Auto initials from first/last name
  const initials = useMemo(() => {
    const f = firstName?.charAt(0) || "";
    const l = lastName?.charAt(0) || "";
    return (f + l).toUpperCase();
  }, [firstName, lastName]);

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
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex justify-center items-center p-4 ${
          open ? "" : "hidden"
        }`}
      >
        <div className="bg-white border-4 border-ring rounded-2xl w-full max-w-lg shadow-xl relative max-h-[90vh] flex flex-col">

          {/* Close Button */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 text-gray-700 hover:text-black"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Scrollable content */}
          <div className="overflow-y-auto px-8 pt-10 pb-6">

            {/* Avatar */}
            <div className="w-full flex justify-center mb-6">
              <div className="w-36 h-36 rounded-full border flex items-center justify-center text-5xl font-semibold">
                {initials || "?"}
              </div>
            </div>

            {/* FIRST NAME */}
            <div className="mb-4">
              <label className="block font-semibold mb-1">First Name</label>
              <input
                type="text"
                className="w-full border rounded-md px-4 py-2"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            {/* LAST NAME */}
            <div className="mb-4">
              <label className="block font-semibold mb-1">Last Name</label>
              <input
                type="text"
                className="w-full border rounded-md px-4 py-2"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            {/* EMAIL */}
            <div className="mb-4">
              <label className="block font-semibold mb-1">Email</label>
              <input
                type="email"
                className="w-full border rounded-md px-4 py-2"
                placeholder="example@domain.com"
              />
            </div>

            {/* PHONE */}
            <div className="mb-4">
              <label className="block font-semibold mb-1">Phone</label>
              <input
                type="text"
                className="w-full border rounded-md px-4 py-2"
                placeholder="(555) 123-4567"
              />
            </div>

            {/* ROLE */}
            <div className="mb-4">
              <label className="block font-semibold mb-1">Role</label>
              <select className="w-full border rounded-md px-4 py-2">
                <option>Employee</option>
                <option>Manager</option>
                <option>Admin</option>
              </select>
            </div>

            {/* STATUS */}
            <div className="mb-8">
              <label className="block font-semibold mb-1">Status</label>
              <select className="w-full border rounded-md px-4 py-2">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-8 py-4 bg-gray-50 rounded-b-2xl">
            <button
              onClick={() => setOpen(false)}
              className="px-6 py-2 rounded-full border btn-secondary"
            >
              Cancel
            </button>
            <button className="px-6 py-2 rounded-full btn-primary">
              Save
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
