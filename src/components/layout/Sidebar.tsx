"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLogout } from '@/hooks/useLogout';
import { useAuthStore } from '@/store/useAuthStore';
import { LayoutDashboard, Shirt, LayoutGrid, Tag, Wallet, Users, Receipt, Loader2, LogOut, Menu, X } from 'lucide-react';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
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

  // Close sidebar on link click (mobile)
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-5 left-4 z-50 p-2 bg-background border border-outline-variant/20 rounded-md shadow-sm text-on-surface hover:bg-surface-container-low transition-colors"
        aria-label="Buka menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Content */}
      <aside className={`fixed left-0 top-0 h-full flex flex-col py-6 bg-surface-container-low dark:bg-surface-dim w-64 border-r border-outline-variant/15 z-[60] transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-6 mb-10 flex justify-between items-start">
          <div>
            <span className="text-headline-md font-display font-bold text-primary dark:text-primary-fixed-dim">Mari Laundry</span>
          </div>
          <button
            className="md:hidden p-1 -mt-1 -mr-2 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-grow overflow-y-auto">
          <Link className={getLinkClassName("/")} href="/" onClick={handleLinkClick}>
            <LayoutDashboard className="w-6 h-6" />
            <span className="font-body-md text-body-md">Dasbor</span>
          </Link>
          <Link className={getLinkClassName("/order")} href="/order" onClick={handleLinkClick}>
            <Shirt className="w-6 h-6" />
            <span className="font-body-md text-body-md">Pesanan Aktif</span>
          </Link>
          <Link className={getLinkClassName("/services")} href="/services" onClick={handleLinkClick}>
            <LayoutGrid className="w-6 h-6" />
            <span className="font-body-md text-body-md">Katalog Layanan</span>
          </Link>
          <Link className={getLinkClassName("/discounts")} href="/discounts" onClick={handleLinkClick}>
            <Tag className="w-6 h-6" />
            <span className="font-body-md text-body-md">Diskon</span>
          </Link>
          <Link className={getLinkClassName("/fees")} href="/fees" onClick={handleLinkClick}>
            <Wallet className="w-6 h-6" />
            <span className="font-body-md text-body-md">Biaya Tambahan</span>
          </Link>
          <Link className={getLinkClassName("/customers")} href="/customers" onClick={handleLinkClick}>
            <Users className="w-6 h-6" />
            <span className="font-body-md text-body-md">Data Pelanggan</span>
          </Link>
          <Link className={getLinkClassName("/taxes")} href="/taxes" onClick={handleLinkClick}>
            <Receipt className="w-6 h-6" />
            <span className="font-body-md text-body-md">Pajak</span>
          </Link>
        </nav>

        <div className="px-2 mt-auto pt-4">
          <div className="flex flex-col gap-3 p-3 bg-surface-container-highest/30 rounded-xl border border-outline-variant/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-primary text-on-primary font-display font-bold flex items-center justify-center border border-outline-variant/30 shadow-sm">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}
              </div>
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-label-md font-bold text-on-surface truncate">{user?.name || "Memuat..."}</span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{user?.roles?.[0] || "STAF"}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center gap-2 p-2 text-error font-label-md border border-error/20 rounded-lg hover:bg-error/5 transition-colors active:scale-95 duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              {isLoggingOut ? "Keluar..." : "Keluar"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
