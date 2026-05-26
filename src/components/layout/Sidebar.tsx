"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLogout } from '@/hooks/useLogout';
import { useAuthStore } from '@/store/useAuthStore';

export function Sidebar() {
  const { logoutMutation } = useLogout();
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isLoggingOut = logoutMutation.isPending;

  const getLinkClassName = (href: string) => {
    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
    return isActive
      ? "bg-primary-container dark:bg-primary text-on-primary-container dark:text-on-primary rounded-lg mx-2 my-1 p-3 flex items-center gap-3 transition-all duration-200 ease-in-out"
      : "text-on-surface-variant dark:text-on-surface-variant mx-2 my-1 p-3 flex items-center gap-3 hover:bg-surface-container-highest dark:hover:bg-on-surface-variant/10 rounded-lg transition-all duration-200 ease-in-out";
  };

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col py-6 bg-surface-container-low dark:bg-surface-dim h-screen w-64 border-r border-outline-variant/15 z-50">
      <div className="px-6 mb-10">
        <span className="text-headline-md font-display font-bold text-primary dark:text-primary-fixed-dim">FreshPress POS</span>
        <p className="text-on-surface-variant font-body-md text-xs mt-1">Staff Portal • Station #1</p>
      </div>
      <nav className="flex-grow">
        <Link className={getLinkClassName("/")} href="/">
          <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
          <span className="font-body-md text-body-md">Dashboard</span>
        </Link>
        <Link className={getLinkClassName("#")} href="#">
          <span className="material-symbols-outlined" data-icon="local_laundry_service">local_laundry_service</span>
          <span className="font-body-md text-body-md">Active Orders</span>
        </Link>
        <Link className={getLinkClassName("/services")} href="/services">
          <span className="material-symbols-outlined" data-icon="category">category</span>
          <span className="font-body-md text-body-md">Laundry Catalog</span>
        </Link>
        <Link className={getLinkClassName("/discounts")} href="/discounts">
          <span className="material-symbols-outlined" data-icon="sell">sell</span>
          <span className="font-body-md text-body-md">Discounts</span>
        </Link>
        <Link className={getLinkClassName("/fees")} href="/fees">
          <span className="material-symbols-outlined" data-icon="account_balance_wallet">account_balance_wallet</span>
          <span className="font-body-md text-body-md">Fees</span>
        </Link>
        <Link className={getLinkClassName("/customers")} href="/customers">
          <span className="material-symbols-outlined" data-icon="group">group</span>
          <span className="font-body-md text-body-md">Customer Database</span>
        </Link>
        <Link className={getLinkClassName("/taxes")} href="/taxes">
          <span className="material-symbols-outlined" data-icon="receipt_long">receipt_long</span>
          <span className="font-body-md text-body-md">Taxes</span>
        </Link>
        <Link className={getLinkClassName("#")} href="#">
          <span className="material-symbols-outlined" data-icon="settings">settings</span>
          <span className="font-body-md text-body-md">Settings</span>
        </Link>
      </nav>
      <div className="px-2 mt-auto">
        <Link className="text-on-surface-variant dark:text-on-surface-variant mx-2 my-1 p-3 flex items-center gap-3 hover:bg-surface-container-highest rounded-lg transition-all duration-200" href="#">
          <span className="material-symbols-outlined" data-icon="help">help</span>
          <span className="font-body-md text-body-md">Help Support</span>
        </Link>
        <div className="flex flex-col gap-3 mt-4 p-3 bg-surface-container-highest/30 rounded-xl border border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-primary text-on-primary font-display font-bold flex items-center justify-center border border-outline-variant/30 shadow-sm">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-label-md font-bold text-on-surface truncate">{user?.name || "Loading..."}</span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{user?.roles?.[0] || "STAFF"}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 p-2 text-error font-label-md border border-error/20 rounded-lg hover:bg-error/5 transition-colors active:scale-95 duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <span className="material-symbols-outlined text-sm animate-spin" data-icon="progress_activity">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-sm" data-icon="logout">logout</span>
            )}
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </aside>
  );
}
