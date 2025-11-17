"use client";

import { User } from "@/lib/types/users";
import UserTableRow from "./UserTableRow";

interface UserTableProps {
  users: User[];
  onEdit: (userId: string) => void;
  onDelete: (userId: string) => void;
  isAdmin: boolean;
}

export default function UserTable({
  users,
  onEdit,
  onDelete,
  isAdmin,
}: UserTableProps) {
  return (
    <div className="bg-white rounded-md shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-primary text-white">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Role
            </th>
            {isAdmin && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.length === 0 ? (
            <tr>
              <td
                colSpan={isAdmin ? 3 : 2}
                className="px-6 py-8 text-center text-gray-500"
              >
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                onEdit={onEdit}
                onDelete={onDelete}
                isAdmin={isAdmin}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
