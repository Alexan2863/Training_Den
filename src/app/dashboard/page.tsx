"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, AuthUser } from "../../lib/auth";
import {
  AdminDashboard,
  ManagerDashboard,
  TrainerDashboard,
  EmployeeDashboard,
} from "@/components/dashboard";

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
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
      // Trigger fade-in after user is loaded
      setTimeout(() => {
        setLoaded(true);
      }, 100);
    }

    loadUser();
  }, [router]);

  if (isLoading || !user) {
    return null; // Will show nothing while loading or redirecting
  }

  const renderDashboard = () => {
    switch (user.role) {
      case "admin":
        return <AdminDashboard />;
      case "manager":
        return <ManagerDashboard user={user} />;
      case "trainer":
        return <TrainerDashboard user={user} />;
      case "employee":
        return <EmployeeDashboard />;
      default:
        return (
          <div className="text-center text-gray-500">
            <p>Dashboard not available for this role</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full max-w-7xl">
      <main className="w-full h-full p-6">
        <div className={`loading ${loaded ? "loaded" : ""} space-y-8`}>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user.first_name} {user.last_name}
            </h2>
          </div>

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
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.phone}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          <div>{renderDashboard()}</div>
        </div>
      </main>
    </div>
  );
}
