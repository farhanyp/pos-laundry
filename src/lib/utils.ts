import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Role, LaundryStatus, PaymentStatus } from "@/types/enums"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStoredRefreshToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refresh_token");
  }
  return null;
}

export function removeStoredRefreshToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("refresh_token");
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatWhatsAppNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  } else if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

export function validateWhatsAppNumber(phone: string): boolean {
  const formatted = formatWhatsAppNumber(phone);
  return /^628\d{7,13}$/.test(formatted);
}

export function formatPercentage(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

export function calculateDPAmount(totalAmount: number): number {
  return totalAmount * 0.5; // 50% fixed DP
}

export function calculateChange(amountPaid: number, expectedAmount: number): number {
  return Math.max(0, amountPaid - expectedAmount);
}

export const PERMISSIONS: Record<Role, string[]> = {
  [Role.SUPERADMIN]: [
    "/customers",
    "/discounts",
    "/fees",
    "/order",
    "/services",
    "/taxes",
    "/users",
    "/" 
  ],
  [Role.OWNER]: [
    "/customers",
    "/discounts",
    "/fees",
    "/order",
    "/services",
    "/taxes",
    "/users",
    "/" 
  ],
  [Role.STAFF]: [
    "/order",
    "/" 
  ]
};

export const hasAccess = (roles: Role[] | undefined, path: string): boolean => {
  if (!roles || roles.length === 0) return false;
  return roles.some((role) => {
    const allowedPaths = PERMISSIONS[role] || [];
    return allowedPaths.some(
      allowedPath => path === allowedPath || (allowedPath !== '/' && path.startsWith(allowedPath))
    );
  });
};

export const canManageData = (roles?: Role[]): boolean => {
  if (!roles) return false;
  return roles.includes(Role.SUPERADMIN) || roles.includes(Role.OWNER);
};

export const translateLaundryStatus = (status: LaundryStatus): string => {
  switch (status) {
    case LaundryStatus.WAITING_PAYMENT: return "Menunggu Pembayaran";
    case LaundryStatus.PROCESS: return "Sedang Diproses";
    case LaundryStatus.WAITING_FOR_PICKUP: return "Menunggu Diambil";
    case LaundryStatus.COMPLETED: return "Selesai";
    default: return status;
  }
};

export const translatePaymentStatus = (status: PaymentStatus): string => {
  switch (status) {
    case PaymentStatus.INITATE: return "Dimulai";
    case PaymentStatus.UNPAID: return "Belum Lunas";
    case PaymentStatus.DP: return "DP (Dibayar Sebagian)";
    case PaymentStatus.PAID: return "Lunas";
    default: return status;
  }
};