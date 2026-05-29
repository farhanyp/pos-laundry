"use client";

import { useTaxes } from "@/hooks/useTax";
import { useTaxStore } from "@/store/useTaxStore";
import { TaxTable } from "@/components/tax/TaxTable";
import { TaxModal } from "@/components/tax/TaxModal";
import { TaxDeleteAlert } from "@/components/tax/TaxDeleteAlert";
import { useState } from "react";
import { Plus, Search, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { canManageData } from "@/lib/utils";

export default function TaxesPage() {
  const { data: taxes, isLoading, error } = useTaxes();
  const { openModal } = useTaxStore();
  const currentUser = useAuthStore(state => state.user);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTaxes = taxes?.filter(tax => 
    tax.tax_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (error) {
    return (
      <div className="p-margin-desktop w-full h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-error-container/20 text-error rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="font-display text-title-lg font-bold text-on-surface">Gagal memuat pajak</h2>
        <p className="text-body-md text-on-surface-variant">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-margin-desktop pt-16 md:pt-margin-desktop max-w-[1600px] mx-auto space-y-md">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-display text-title-lg md:text-headline-md font-bold text-primary">Manajemen Pajak</h1>
          {canManageData(currentUser?.roles) && (
            <button 
              onClick={() => openModal()}
              className="flex items-center justify-center gap-2 bg-primary text-on-primary font-label-md p-2 md:px-4 md:py-2 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors active:scale-95 duration-150 shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden md:inline">Tambah Pajak</span>
            </button>
          )}
        </div>

        <div className="bg-surface-container-low rounded-lg border border-outline-variant/15 p-4 md:p-md flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-md gap-4">
            <div>
              <h3 className="font-headline-md text-primary">Konfigurasi Pajak</h3>
              <p className="text-on-surface-variant text-label-sm">Kelola tarif pajak dan status aktif</p>
            </div>
            <div className="w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-surface-container-highest rounded-lg p-1 px-2 border border-outline-variant/20 focus-within:border-primary">
                <Search className="w-4 h-4 text-on-surface-variant" />
                <input 
                  type="text" 
                  placeholder="Cari pajak..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-body-sm text-on-surface w-full sm:w-48 py-1"
                />
              </div>
            </div>
          </div>
          
          <TaxTable taxes={filteredTaxes} isLoading={isLoading} />
        </div>
      </div>

      <TaxModal />
      <TaxDeleteAlert />
    </>
  );
}
