"use client";

import { useState } from "react";

export default function TrainingProgramForm() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Button to open modal */}
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-purple-600 btn-primary"
      >
        Create Training
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Modal */}
      <div
        className={`${
          open ? "flex" : "hidden"
        } fixed inset-0 z-50 justify-center items-center p-4`}
      >
        <div
          className="
            bg-white border-4 border-ring rounded-xl w-full max-w-lg shadow-xl relative
            p-6
            max-h-[80vh]          /* LIMIT HEIGHT */
            overflow-y-auto       /* ENABLE SCROLL */
          "
        >

          {/* Close Button */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 text-gray-600 hover:text-black"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Create Title */}
          <h2 className="text-3xl font-semibold mb-6">Create Training</h2>

          {/* Form */}
          <form className="space-y-5">

            {/* Title */}
            <div>
              <label className="block font-semibold mb-1">Title</label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Training title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold mb-1">Description</label>
              <textarea
                rows={4}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Describe the training..."
              ></textarea>
            </div>

            {/* Status */}
            <div>
              <label className="block font-semibold mb-1">Status</label>
              <select
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

            {/* Manager */}
            <div>
              <label className="block font-semibold mb-1">Manager</label>
              <select
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option>Robert Johnson</option>
                <option>Jane Smith</option>
                <option>Sarah Miller</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block font-semibold mb-1">Duration (minutes)</label>
              <input
                type="number"
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="60"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block font-semibold mb-1">Deadline</label>
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Divider */}
            <hr className="my-6 border-gray-300" />

            <h3 className="text-xl font-semibold mb-4">Session 1</h3>

            {/* Session Date */}
            <div>
            <label className="block font-semibold mb-1">Date</label>
            <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="December 10, 2025 9:00 AM"
            />
            </div>

            {/* Trainer */}
            <div>
            <label className="block font-semibold mb-1">Trainer</label>
            <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Kevin O’Connor"
            />
            </div>

            {/* Status */}
            <div>
            <label className="block font-semibold mb-1">Status</label>
            <select
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
                <option>Active</option>
                <option>Inactive</option>
            </select>
            </div>


            {/* Footer button */}
            <div className="flex justify-end pt-3">
              <button
                type="button"
                className="bg-purple-600 text-white rounded-full px-6 py-2 btn-primary"
              >
                Next
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}
