"use client";

import { useDiscounts } from "@/hooks/useDiscount";
import { useDiscountStore } from "@/store/useDiscountStore";
import { DiscountTable } from "@/components/discount/DiscountTable";
import { DiscountModal } from "@/components/discount/DiscountModal";
import { DiscountDeleteAlert } from "@/components/discount/DiscountDeleteAlert";

export default function DiscountPage() {
  const { data: discounts, isLoading, error } = useDiscounts();
  const { openModal } = useDiscountStore();

  if (error) {
    return (
      <div className="p-margin-desktop w-full h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-error-container/20 text-error rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px]" data-icon="error">error</span>
        </div>
        <h2 className="font-display text-title-lg font-bold text-on-surface">Failed to load discounts</h2>
        <p className="text-body-md text-on-surface-variant">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <header className="flex justify-between items-center px-margin-desktop w-full h-16 bg-background border-b border-outline-variant/15 sticky top-0 z-40 backdrop-blur-md bg-background/80">
        <div className="flex items-center gap-6">
          <h1 className="font-display text-headline-md font-bold text-primary">Discounts Management</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <span className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors cursor-pointer" data-icon="notifications">notifications</span>
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-primary text-on-primary font-label-md px-4 py-2 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors active:scale-95 duration-150"
          >
            <span className="material-symbols-outlined text-[18px]" data-icon="add">add</span>
            Add Discount
          </button>
        </div>
      </header>

      <div className="p-margin-desktop max-w-[1600px] mx-auto space-y-md">
        <div className="bg-surface-container-low rounded-lg border border-outline-variant/15 p-md flex flex-col">
          <div className="flex justify-between items-center mb-md">
            <div>
              <h3 className="font-headline-md text-primary">Discount Campaigns</h3>
              <p className="text-on-surface-variant text-label-sm">Manage active promotions and global discounts</p>
            </div>
            <div className="flex gap-2 bg-surface-container-highest rounded-lg p-1">
              <span className="material-symbols-outlined text-on-surface-variant p-1" data-icon="search">search</span>
              <input 
                type="text" 
                placeholder="Search discount..." 
                className="bg-transparent border-none outline-none text-body-sm text-on-surface w-48"
              />
            </div>
          </div>
          
          <DiscountTable discounts={discounts || []} isLoading={isLoading} />
        </div>
      </div>

      <DiscountModal />
      <DiscountDeleteAlert />
    </>
  );
}
