"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import { UserDisplay } from "@/lib/types/users";
import { getCurrentUser } from "@/lib/auth";
import UserTable from "@/components/admin/users/UserTable/UserTable";
import UserForm from "@/components/forms/UserForm";

type NotificationType = "success" | "error" | null;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notification, setNotification] = useState<{
    type: NotificationType;
    message: string;
  } | null>(null);
  const router = useRouter();

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
    async function checkUserRole() {
      const user = await getCurrentUser();
      setIsAdmin(user?.role === "admin");
    }

    checkUserRole();
    fetchUsers();
  }, [fetchUsers]);

  const handleEdit = (userId: string) => {
    router.push(`/admin/users/${userId}`);
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
    return <div className="flex justify-center py-8">Loading...</div>;
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
            {isAdmin && <UserForm onSuccess={fetchUsers} />}
          </div>
        </div>

        <UserTable
          users={users}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isAdmin={isAdmin}
        />
      </main>
    </div>
  );
}
