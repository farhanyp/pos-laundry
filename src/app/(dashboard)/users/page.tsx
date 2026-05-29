"use client";

import { useUsers } from "@/hooks/useUsers";
import { UserTable } from "@/components/users/UserTable";
import { UserRoleModal } from "@/components/users/UserRoleModal";
import { UserDeleteAlert } from "@/components/users/UserDeleteAlert";
import { Search, AlertTriangle, Users } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Role } from "@/types/enums";
import { useState, useMemo } from "react";

export default function UsersPage() {
  const { data: users, isLoading, error } = useUsers();
  const user = useAuthStore(state => state.user);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchTerm) return users;
    
    return users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.roles && u.roles[0]?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  // Check if user is superadmin
  if (user && !user.roles?.includes(Role.SUPERADMIN)) {
    return (
      <div className="p-margin-desktop w-full h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-error-container/20 text-error rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="font-display text-title-lg font-bold text-on-surface">Akses Ditolak</h2>
        <p className="text-body-md text-on-surface-variant">Hanya Superadmin yang dapat mengakses halaman ini.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-margin-desktop w-full h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-error-container/20 text-error rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="font-display text-title-lg font-bold text-on-surface">Gagal memuat data pengguna</h2>
        <p className="text-body-md text-on-surface-variant">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-margin-desktop pt-16 md:pt-margin-desktop max-w-[1600px] mx-auto space-y-md">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="hidden md:flex w-12 h-12 bg-primary/10 rounded-xl items-center justify-center text-primary">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display text-title-lg md:text-headline-md font-bold text-primary">Manajemen Pengguna</h1>
              <p className="text-on-surface-variant text-label-sm hidden md:block mt-1">Kelola akses dan role pengguna sistem</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-lg border border-outline-variant/15 p-4 md:p-md flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-md gap-4">
            <div>
              <h3 className="font-headline-md text-primary">Daftar Pengguna</h3>
              <p className="text-on-surface-variant text-label-sm">Ubah role atau hapus akses pengguna</p>
            </div>
            <div className="w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-surface-container-highest rounded-lg p-1 px-2 border border-outline-variant/20 focus-within:border-primary">
                <Search className="w-4 h-4 text-on-surface-variant" />
                <input 
                  type="text" 
                  placeholder="Cari pengguna..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-body-sm text-on-surface w-full sm:w-48 py-1"
                />
              </div>
            </div>
          </div>
          
          <UserTable users={filteredUsers} isLoading={isLoading} />
        </div>
      </div>

      <UserRoleModal />
      <UserDeleteAlert />
    </>
  );
}
