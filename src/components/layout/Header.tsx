import { Bell, Search } from 'lucide-react'

export function Header() {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center bg-slate-100 rounded-md px-3 py-1.5 w-96">
        <Search className="w-4 h-4 text-slate-400 mr-2" />
        <input 
          type="text" 
          placeholder="Cari pesanan atau pelanggan..." 
          className="bg-transparent border-none outline-none text-sm w-full"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-slate-100 rounded-full relative">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  )
}
