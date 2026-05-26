"use client";

import { useTaxes } from "@/hooks/useTax";
import { useTaxStore } from "@/store/useTaxStore";
import { TaxTable } from "@/components/tax/TaxTable";
import { TaxModal } from "@/components/tax/TaxModal";
import { TaxDeleteAlert } from "@/components/tax/TaxDeleteAlert";
import { useState } from "react";

export default function TaxesPage() {
  const { data: taxes, isLoading, error } = useTaxes();
  const { openModal } = useTaxStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTaxes = taxes?.filter(tax => 
    tax.tax_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (error) {
    return (
      <div className="p-margin-desktop w-full h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-error-container/20 text-error rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px]" data-icon="error">error</span>
        </div>
        <h2 className="font-display text-title-lg font-bold text-on-surface">Failed to load taxes</h2>
        <p className="text-body-md text-on-surface-variant">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <header className="flex justify-between items-center px-margin-desktop w-full h-16 bg-background border-b border-outline-variant/15 sticky top-0 z-40 backdrop-blur-md bg-background/80">
        <div className="flex items-center gap-6">
          <h1 className="font-display text-headline-md font-bold text-primary">Tax Management</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-primary text-on-primary font-label-md px-4 py-2 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors active:scale-95 duration-150"
          >
            <span className="material-symbols-outlined text-[18px]" data-icon="add">add</span>
            Add Tax
          </button>
        </div>
      </header>

      <div className="p-margin-desktop max-w-[1600px] mx-auto space-y-md">
        <div className="bg-surface-container-low rounded-lg border border-outline-variant/15 p-md flex flex-col">
          <div className="flex justify-between items-center mb-md">
            <div>
              <h3 className="font-headline-md text-primary">Tax Configurations</h3>
              <p className="text-on-surface-variant text-label-sm">Manage tax rates and active status</p>
            </div>
            <div className="flex gap-2 bg-surface-container-highest rounded-lg p-1">
              <span className="material-symbols-outlined text-on-surface-variant p-1" data-icon="search">search</span>
              <input 
                type="text" 
                placeholder="Search tax..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-body-sm text-on-surface w-48"
              />
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
