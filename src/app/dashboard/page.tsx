"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, signOut, AuthUser } from "../../lib/auth";

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
      setIsLoading(false);
    }

    loadUser();
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-violet-900 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-white">Training Den</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">
                Welcome, {user.first_name} {user.last_name}
              </span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  user.role === "admin"
                    ? "bg-emerald-50 text-emerald-800"
                    : user.role === "manager"
                    ? "bg-rose-50 text-rose-800"
                    : user.role === "trainer"
                    ? "bg-fuchsia-50 text-fuchsia-800"
                    : user.role === "employee"
                    ? "bg-sky-50 text-sky-800"
                    : "bg-blue-50 text-blue-800"
                }`}
              >
                {user.role.toUpperCase()}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-white hover:bg-violet-100 text-violet-900 border-violet-900 border px-4 py-2 rounded text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
            </h2>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Your Information
                </h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Full name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user.first_name} {user.last_name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Email address
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.role}</dd>
                  </div>
                  {user.phone && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Phone
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {user.phone}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            <div className="mt-6 text-center text-gray-500">
              <p>Role-specific features coming soon!</p>
              <p className="text-sm mt-2">
                This dashboard will show different content based on your role:{" "}
                {user.role}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
