"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserDisplay } from "@/lib/types/users";
import { getCurrentUser } from "@/lib/auth";
import UserTable from "@/components/admin/users/UserTable/UserTable";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUserRole();
    fetchUsers();
  }, []);

  async function checkUserRole() {
    const user = await getCurrentUser();
    setIsAdmin(user?.role === "admin");
  }

  async function fetchUsers() {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }

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

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <div className="w-full h-full">
      <main className="w-full h-full p-6 overflow-y-scroll">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">All Users</h1>
            {isAdmin && (
              <button
                onClick={() => router.push("/admin/users/create")}
                className="btn-primary"
              >
                Add User
              </button>
            )}
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
