import { UserItem } from '@/types/user';
import { Role } from '@/types/enums';
import { useAuthStore } from '@/store/useAuthStore';

const getHeaders = () => {
  const token = useAuthStore.getState().accessToken;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getUsers = async (): Promise<UserItem[]> => {
  const res = await fetch('/api/users', { headers: getHeaders() });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch users');
  }
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data;
};

export const updateUserRole = async ({ id, role }: { id: string; role: Role }): Promise<void> => {
  const res = await fetch(`/api/users/${id}/role`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to update role');
  }
  const json = await res.json();
  if (json.error) throw new Error(json.error);
};

export const deleteUser = async (id: string): Promise<void> => {
  const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers: getHeaders() });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to delete user');
  }
  const json = await res.json();
  if (json.error) throw new Error(json.error);
};
