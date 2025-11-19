"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import { UserDisplay } from "@/lib/types/users";
import { useUser } from "@/components/UserProvider";
import UserTable from "@/components/admin/users/UserTable/UserTable";
import UserForm from "@/components/forms/UserForm";

type NotificationType = "success" | "error" | null;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: NotificationType;
    message: string;
  } | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const router = useRouter();
  const user = useUser();

  const showNotification = useCallback(
    (type: NotificationType, message: string) => {
      setNotification({ type, message });
      // Auto-hide after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    },
    []
  );

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
      } else {
        showNotification("error", data.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showNotification("error", "Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleView = (userId: string) => {
    router.push(`/users/${userId}`);
  };

  const handleEdit = (userId: string) => {
    setEditingUserId(userId);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to deactivate this user?")) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (response.ok && data.success) {
        showNotification("success", "User deactivated successfully");
        fetchUsers();
      } else {
        showNotification("error", data.message || "Failed to deactivate user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      showNotification("error", "Failed to deactivate user. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full">
        <main className="w-full h-full p-6 overflow-y-scroll">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="h-9 bg-gray-300 rounded w-48"></div>
                <div className="h-10 bg-gray-300 rounded w-32"></div>
              </div>
            </div>

            {/* Table skeleton */}
            <div className="bg-white rounded-md shadow overflow-hidden">
              {/* Table header */}
              <div className="bg-gray-300 h-12"></div>
              {/* Table rows */}
              <div className="divide-y divide-gray-200">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-4">
                    {/* Avatar circle */}
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    {/* Name and email */}
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-40"></div>
                      <div className="h-3 bg-gray-200 rounded w-56"></div>
                    </div>
                    {/* Role badge */}
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    {/* Action buttons */}
                    {user?.role === "admin" && (
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-gray-200 rounded"></div>
                        <div className="w-6 h-6 bg-gray-200 rounded"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <main className="w-full h-full p-6 overflow-y-scroll">
        {/* Notification Banner */}
        {notification && (
          <div
            className={`mb-4 p-4 rounded-md ${
              notification.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
            role="alert"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {notification.type === "success" ? (
                  <svg
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <p className="font-medium">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-current opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Dismiss notification"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">All Users</h1>
            {user?.role === "admin" && <UserForm onSuccess={fetchUsers} />}
          </div>
        </div>

        <UserTable
          users={users}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isAdmin={user?.role === "admin"}
        />

        {/* Edit User Modal */}
        {editingUserId && (
          <UserForm
            userId={editingUserId}
            initialOpen={true}
            onSuccess={() => {
              setEditingUserId(null);
              showNotification("success", "User updated successfully");
              fetchUsers();
            }}
            onCancel={() => {
              setEditingUserId(null);
            }}
          />
        )}
      </main>
    </div>
  );
}
