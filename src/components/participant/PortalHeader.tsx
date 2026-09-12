"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/Button"
import Image from "next/image"

interface PortalHeaderProps {
  teamName: string
  onLogout?: () => void
}

export function PortalHeader({ teamName, onLogout }: PortalHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#DDD3C7] bg-yec-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 overflow-hidden rounded-full">
            <Image src="/logo-yec.jpeg" alt="YEC Logo" fill className="object-cover" />
          </div>
          <span className="font-semibold text-yec-text hidden md:inline-block">YEC Portal</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs text-yec-text-muted">Tim saat ini</span>
            <span className="text-sm font-bold text-yec-brown">{teamName}</span>
          </div>
          <div className="h-8 w-px bg-[#DDD3C7]"></div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-yec-text hover:text-danger hover:bg-danger/10">
            <LogOut className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Keluar</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
