"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, AuthUser } from "../../lib/auth";

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
    <div className="w-full h-full max-w-7xl">
      <main className="w-full h-full p-6">
        <div className="border-4 border-dashed border-gray-200 rounded-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
          </h2>

          <div className="bg-white overflow-hidden shadow rounded-md">
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
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.phone}</dd>
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
      </main>
    </div>
  );
}
