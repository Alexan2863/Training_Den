"use client";

import { useState } from "react";

export default function TrainingProgramDetailModal() {
  const [open, setOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [completed, setCompleted] = useState(false);

  return (
    <>
      {/* Button to open modal */}
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-purple-600 btn-primary"
      >
        Test
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
            bg-white border-2 border-ring rounded-xl w-full max-w-lg shadow-xl relative
            p-6
            max-h-[80vh]
            overflow-y-auto
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

          {/* Title */}
          <h2 className="text-3xl font-semibold mb-6">
            Anti-Harassment & Discrimination Training
          </h2>

          <p className="font-semibold">Description:</p>
          <p>
            Required annual training on creating an inclusive workplace,
            recognizing harassment, and understanding reporting procedures.
          </p>
          <br />

          <p className="font-semibold">Duration:</p>
          <p>60 Min</p>
          <br />

          <p className="font-semibold">Deadline:</p>
          <p>February 28, 2026</p>
          <br />

          {/* ================================
              SESSION DROPDOWN STARTS HERE
              ================================ */}
          <div className="border rounded-md overflow-hidden w-full mt-4">
            <button
              onClick={() => setSessionOpen(!sessionOpen)}
              className="w-full flex justify-between items-center bg-primary text-white px-4 py-3 font-medium"
            >
              <span>Session 1</span>

              <svg
                className={`w-5 h-5 transition-transform ${
                  sessionOpen ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m5 9 7 7 7-7" />
              </svg>
            </button>

            {sessionOpen && (
              <div className="bg-gray-50 p-4 space-y-4">
                {/* Session Details */}
                <div>
                  <p className="font-semibold">Date:</p>
                  <p>December 10, 2025 9:00 AM</p>

                  <p className="font-semibold mt-4">Trainer:</p>
                  <p>Kevin O’Connor</p>
                </div>

                {/* Table Header */}
                <div className="bg-primary text-white px-4 py-2 flex justify-between text-sm font-medium">
                  <span>Name</span>
                  <div className="flex items-center gap-2">
                    <span>Mark All as Completed?</span>
                    <input type="checkbox" className="w-4 h-4" />
                  </div>
                </div>

                {/* Person Row */}
                <div className="flex justify-between items-center px-4 py-3 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                      TD
                    </div>
                    <p>Tyler Davis</p>
                  </div>
                  <button
                    onClick={() => setCompleted(!completed)} // toggle state on click
                    className={`px-4 py-2 rounded-full text-white ${
                        completed ? "bg-green-600" : "bg-primary"
                    }`}
                    >
                    Completed?
                </button>
                </div>
              </div>
            )}
          </div>
          {/* ================================
              END SESSION DROPDOWN
              ================================ */}

        </div>
      </div>
    </>
  );
}
