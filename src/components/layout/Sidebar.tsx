import Link from 'next/link'
import { LayoutDashboard, ShoppingCart, Users, Layers, Settings, ReceiptText } from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Transaksi POS', href: '/orders/new', icon: ShoppingCart },
  { name: 'Riwayat Pesanan', href: '/orders', icon: ReceiptText },
  { name: 'Pelanggan', href: '/customers', icon: Users },
  { name: 'Layanan Laundry', href: '/services', icon: Layers },
  { name: 'Pengaturan', href: '/settings', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-100 min-h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-400">CleanPOS</h1>
        <p className="text-sm text-slate-400">Sistem Manajemen Laundry</p>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            <item.icon className="w-5 h-5 text-slate-400" />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
            A
          </div>
          <div>
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-slate-400">Owner</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
