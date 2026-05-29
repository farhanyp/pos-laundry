"use client";

import { useUserStore } from "@/store/useUserStore";
import { useDeleteUser } from "@/hooks/useUsers";
import { AlertTriangle, Loader2 } from "lucide-react";

export function UserDeleteAlert() {
  const { isDeleteAlertOpen, userToDelete, closeDeleteAlert } = useUserStore();
  const { mutate: deleteUser, isPending } = useDeleteUser();

  if (!isDeleteAlertOpen || !userToDelete) return null;

  const handleDelete = () => {
    deleteUser(userToDelete.id, {
      onSuccess: () => {
        closeDeleteAlert();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div className="bg-surface rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-error/10 text-error mb-4 mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-title-lg font-display font-bold text-on-surface text-center mb-2">Hapus Pengguna</h3>
          <p className="text-body-md text-on-surface-variant text-center mb-6">
            Apakah Anda yakin ingin menghapus pengguna <span className="font-bold text-on-surface">{userToDelete.name}</span>? Tindakan ini tidak dapat dibatalkan.
          </p>
          
          <div className="flex items-center gap-3">
            <button
              onClick={closeDeleteAlert}
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-surface-container-high text-on-surface font-label-md rounded-lg hover:bg-surface-container-highest transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-error text-on-error font-label-md rounded-lg hover:bg-error/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus Pengguna"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
