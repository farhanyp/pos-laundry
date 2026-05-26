import { Tax } from "@/types/tax";
import { formatPercentage } from "@/lib/utils";
import { useTaxStore } from "@/store/useTaxStore";

interface TaxTableProps {
  taxes: Tax[];
  isLoading: boolean;
}

export function TaxTable({ taxes, isLoading }: TaxTableProps) {
  const { openModal, openDeleteAlert } = useTaxStore();

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-8">
        <span className="material-symbols-outlined animate-spin text-primary text-[32px]" data-icon="progress_activity">progress_activity</span>
      </div>
    );
  }

  if (taxes.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12 text-on-surface-variant">
        <span className="material-symbols-outlined text-[48px] mb-4 opacity-50" data-icon="receipt_long">receipt_long</span>
        <p className="font-body-lg">No taxes found</p>
        <p className="font-body-sm opacity-70">Add a new tax to get started</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-outline-variant/15">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-highest border-b border-outline-variant/15 text-label-md font-bold text-on-surface">
            <th className="p-4">Tax Name</th>
            <th className="p-4 text-right">Rate</th>
            <th className="p-4 text-center">Status</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10 bg-surface-container-low">
          {taxes.map((tax) => (
            <tr key={tax.id} className="hover:bg-surface-container transition-colors group">
              <td className="p-4">
                <p className="font-body-md font-bold text-on-surface">{tax.tax_name}</p>
              </td>
              <td className="p-4 text-right">
                <span className="font-body-md text-on-surface-variant">
                  {formatPercentage(tax.rate_percentage)}
                </span>
              </td>
              <td className="p-4 text-center">
                {tax.is_active ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container/30 text-primary font-label-sm border border-primary/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container/30 text-error font-label-sm border border-error/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                    Inactive
                  </span>
                )}
              </td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openModal(tax)}
                    className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-container/20 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]" data-icon="edit">edit</span>
                  </button>
                  <button 
                    onClick={() => openDeleteAlert(tax)}
                    className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]" data-icon="delete">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
