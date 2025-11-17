import { User } from "@/lib/types/users";
import UserAvatar from "./UserAvatar";
import RoleBadge from "./RoleBadge";
import {
  PencilSimple,
  PencilSimpleIcon,
  Trash,
  TrashIcon,
} from "@phosphor-icons/react";

interface UserTableRowProps {
  user: User;
  onEdit: (userId: string) => void;
  onDelete: (userId: string) => void;
  isAdmin: boolean;
}

export default function UserTableRow({
  user,
  onEdit,
  onDelete,
  isAdmin,
}: UserTableRowProps) {
  const fullName = `${user.first_name} ${user.last_name}`;
  const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <UserAvatar initials={initials} role={user.role} />
          <div>
            <div className="font-medium text-gray-900">{fullName}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <RoleBadge role={user.role} />
      </td>

      {/* Actions Column - Only show for admins */}
      {isAdmin && (
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onEdit(user.id)}
              className="text-gray-600 hover:text-blue-600"
              aria-label="Edit user"
            >
              <PencilSimpleIcon size={24} weight="regular" />
            </button>
            <button
              onClick={() => onDelete(user.id)}
              className="text-gray-600 hover:text-red-600"
              aria-label="Delete user"
            >
              <TrashIcon size={24} weight="regular" />
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}
