"use client";

import { useUserStore } from "@/store/useUserStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useUpdateUserRole } from "@/hooks/useUsers";
import { Loader2, X, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { Role } from "@/types/enums";

export function UserRoleModal() {
  const { isRoleModalOpen, selectedUser, closeRoleModal } = useUserStore();
  const currentUser = useAuthStore(state => state.user);
  const isSuperAdmin = currentUser?.roles?.includes(Role.SUPERADMIN);
  const { mutate: updateRole, isPending } = useUpdateUserRole();
  const [role, setRole] = useState<Role>(Role.STAFF);

  useEffect(() => {
    if (selectedUser && selectedUser.roles && selectedUser.roles.length > 0) {
      setRole(selectedUser.roles[0]);
    } else {
      setRole(Role.STAFF);
    }
  }, [selectedUser]);

  if (!isRoleModalOpen || !selectedUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRole(
      { id: selectedUser.id, role },
      {
        onSuccess: () => {
          closeRoleModal();
        },
      }
    );
  };

  const allRoles = [
    { value: Role.STAFF, label: "Staff", description: "Akses terbatas untuk operasional harian" },
    { value: Role.OWNER, label: "Owner", description: "Akses penuh ke semua fitur bisnis" },
    { value: Role.SUPERADMIN, label: "Superadmin", description: "Akses tertinggi termasuk manajemen pengguna" },
  ];

  const roles = isSuperAdmin ? allRoles : allRoles.filter(r => r.value !== Role.SUPERADMIN);

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm transition-all duration-300"
      onClick={closeRoleModal}
    >
      <div
        className="bg-surface-container-lowest shadow-2xl w-full sm:max-w-[480px] h-[100dvh] flex flex-col relative animate-in slide-in-from-bottom sm:slide-in-from-right duration-300 sm:border-l border-outline-variant/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 sm:px-8 py-6 border-b border-outline-variant/10 bg-surface-container-lowest shrink-0">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-[24px] font-bold text-primary leading-tight">
              Ubah Role Pengguna
            </h2>
            <p className="text-on-surface-variant text-[14px]">
              Perbarui hak akses untuk pengguna yang dipilih
            </p>
          </div>
          <button
            onClick={closeRoleModal}
            className="text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors p-2 rounded-full flex items-center justify-center shrink-0 -mr-2"
            disabled={isPending}
            type="button"
            title="Tutup panel"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 sm:px-8 py-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar bg-surface-container-lowest">

            {/* Info Pengguna */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="text-[14px] font-bold text-primary uppercase tracking-wider">Informasi Pengguna</h3>
              </div>

              <div className="space-y-2">
                <label className="text-[14px] font-semibold text-on-surface">Nama</label>
                <input
                  type="text"
                  value={selectedUser.name}
                  disabled
                  className="w-full bg-surface-container-highest/30 border border-outline-variant/40 text-on-surface rounded-xl px-4 py-3.5 text-[15px] opacity-60 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[14px] font-semibold text-on-surface">Email</label>
                <input
                  type="text"
                  value={selectedUser.email}
                  disabled
                  className="w-full bg-surface-container-highest/30 border border-outline-variant/40 text-on-surface rounded-xl px-4 py-3.5 text-[15px] opacity-60 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Pilihan Role */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="text-[14px] font-bold text-primary uppercase tracking-wider">Pilih Role</h3>
              </div>

              <div className="space-y-3">
                {roles.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      role === r.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-outline-variant/40 hover:border-primary/40 hover:bg-surface-container-highest/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={role === r.value}
                      onChange={() => setRole(r.value)}
                      className="mt-1 accent-primary shrink-0"
                    />
                    <div>
                      <p className={`text-[14px] font-bold uppercase tracking-wide ${role === r.value ? "text-primary" : "text-on-surface"}`}>
                        {r.label}
                      </p>
                      <p className="text-[13px] text-on-surface-variant mt-0.5">{r.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 sm:px-8 py-5 border-t border-outline-variant/10 bg-surface-container-low shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={closeRoleModal}
              disabled={isPending}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-[14px] font-bold text-on-surface-variant hover:bg-surface-variant/20 hover:text-on-surface transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl text-[14px] font-bold bg-primary text-on-primary hover:bg-primary/90 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-primary/20 hover:shadow-primary/40"
            >
              {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
