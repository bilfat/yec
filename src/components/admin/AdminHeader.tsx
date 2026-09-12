"use client"

import Link from "next/link"
import { Menu, LogOut, ShieldCheck, Home } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

import { useRouter } from "next/navigation"

interface AdminHeaderProps {
  onToggleMenu: () => void
  title?: string
}

export function AdminHeader({ onToggleMenu, title = "Admin Dashboard" }: AdminHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 sm:h-20 w-full items-center justify-between border-b border-[#DDD3C7] bg-yec-white/95 backdrop-blur-md px-4 sm:px-6 md:px-8">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <button
          onClick={onToggleMenu}
          className="p-2 rounded-xl border border-[#DDD3C7] text-yec-brown hover:bg-yec-paper lg:hidden shrink-0"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-display font-bold text-base sm:text-xl md:text-2xl text-yec-brown tracking-tight">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DDD3C7] text-xs font-semibold text-yec-brown hover:bg-yec-paper transition-colors"
        >
          <Home className="h-3.5 w-3.5 text-yec-amber" /> Lihat Web Utama
        </Link>
        <div className="flex items-center gap-2 rounded-full border border-[#DDD3C7] bg-yec-paper py-1 px-2.5 sm:px-3">
          <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-yec-forest text-white text-xs font-bold shrink-0">
            <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <span className="text-xs font-semibold text-yec-brown hidden md:inline">Panitia Admin</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-danger hover:bg-danger/10 transition-colors"
          title="Keluar / Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}

