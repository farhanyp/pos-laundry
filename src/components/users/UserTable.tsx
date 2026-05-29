"use client";

import { useState } from "react";
import { UserItem } from "@/types/user";
import { Loader2, Edit, Trash2, ChevronLeft, ChevronRight, Mail, Calendar } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";

interface UserTableProps {
  users: UserItem[];
  isLoading: boolean;
}

export function UserTable({ users, isLoading }: UserTableProps) {
  const { openRoleModal, openDeleteAlert } = useUserStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil((users?.length || 0) / itemsPerPage);
  const paginatedData = users?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="w-full text-center py-8 text-on-surface-variant font-body-md border border-outline-variant/15 rounded-lg border-dashed">
        Tidak ada pengguna ditemukan.
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="w-full">
      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col gap-4 mb-4">
        {paginatedData.map((user) => (
          <div key={user.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden flex flex-col hover:border-primary/20 transition-all">
            <div className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="font-bold text-primary text-body-lg">{user.name}</h4>
                  <div className="flex items-center gap-2 mt-1.5 text-on-surface-variant text-label-sm break-all">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    {user.email}
                  </div>
                </div>
                <div className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold uppercase shrink-0">
                  {user.roles?.[0] || 'TIDAK ADA ROLE'}
                </div>
              </div>

              <div className="bg-surface-container-highest/30 p-3 rounded-lg text-label-sm text-on-surface-variant flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary/70 shrink-0" />
                <span>Terdaftar: {formatDate(user.created_at)}</span>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-outline-variant/10 mt-1">
                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={() => openRoleModal(user)}
                    className="flex-1 flex justify-center items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-label-sm font-bold hover:bg-primary/20 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Ubah Role
                  </button>
                  <button
                    onClick={() => openDeleteAlert(user)}
                    className="flex-1 flex justify-center items-center gap-1.5 px-3 py-1.5 bg-error/10 text-error rounded-lg text-label-sm font-bold hover:bg-error/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto w-full rounded-lg border border-outline-variant/15 bg-surface-container-low shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-highest/30 border-b border-outline-variant/15">
              <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Nama</th>
              <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Email</th>
              <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Role</th>
              <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Tanggal Daftar</th>
              <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {paginatedData.map((user) => (
              <tr key={user.id} className="hover:bg-surface-container-highest/20 transition-colors">
                <td className="px-4 py-3 font-body-md text-on-surface">
                  <span className="font-medium text-primary">{user.name}</span>
                </td>
                <td className="px-4 py-3 font-body-md text-on-surface">
                  {user.email}
                </td>
                <td className="px-4 py-3 font-body-md text-on-surface">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold uppercase">
                    {user.roles?.[0] || 'TIDAK ADA ROLE'}
                  </span>
                </td>
                <td className="px-4 py-3 font-body-md text-on-surface">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-4 py-3 font-body-md text-on-surface text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openRoleModal(user)}
                      className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/20 rounded transition-colors"
                      title="Ubah Role Pengguna"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteAlert(user)}
                      className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded transition-colors"
                      title="Hapus Pengguna"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/15 bg-surface-container-low">
          <div className="text-label-sm text-on-surface-variant">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} hingga {Math.min(currentPage * itemsPerPage, users?.length || 0)} dari {users?.length || 0} entri
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-surface-container-highest disabled:opacity-50 disabled:cursor-not-allowed text-on-surface-variant"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded text-label-sm font-medium ${currentPage === page ? 'bg-primary text-on-primary' : 'hover:bg-surface-container-highest text-on-surface'}`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-surface-container-highest disabled:opacity-50 disabled:cursor-not-allowed text-on-surface-variant"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
