"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Settings, Users, UserCheck,
  FileCheck, FileText, Award, X
} from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface NavGroup {
  groupLabel: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupLabel: "OVERVIEW",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    ],
  },
  {
    groupLabel: "MANAGEMENT",
    items: [
      { label: "Pengaturan Lomba", href: "/admin/settings", icon: <Settings className="h-4 w-4" /> },
      { label: "Manajemen Tim", href: "/admin/teams", icon: <Users className="h-4 w-4" /> },
      { label: "Manajemen Juri", href: "/admin/judges", icon: <UserCheck className="h-4 w-4" /> },
    ],
  },
  {
    groupLabel: "EVALUATION",
    items: [
      { label: "Template Penilaian", href: "/admin/evaluations/templates", icon: <FileText className="h-4 w-4" /> },
      { label: "Penilaian BMC", href: "/admin/evaluations/bmc", icon: <FileCheck className="h-4 w-4" /> },
      { label: "Penilaian Pitching", href: "/admin/evaluations/pitching", icon: <Award className="h-4 w-4" /> },
    ],
  },
]

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-yec-brown/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-yec-white border-r border-[#DDD3C7] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header Branding */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-[#DDD3C7]/60">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl">
              <Image src="/logo-yec.jpeg" alt="YEC Logo" fill className="object-cover" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-yec-brown tracking-tight block leading-tight">YEC 2026</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-yec-amber">Admin Console</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-yec-text-muted hover:bg-yec-paper lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.groupLabel} className="space-y-1">
              <p className="px-3 text-[10px] font-bold tracking-wider uppercase text-yec-text-muted mb-2">
                {group.groupLabel}
              </p>
              {group.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-yec-amber text-white shadow-sm font-semibold"
                        : "text-yec-text-secondary hover:text-yec-brown hover:bg-yec-paper"
                    }`}
                  >
                    <span className={isActive ? "text-white" : "text-yec-amber"}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#DDD3C7]/60 bg-yec-paper/50 text-xs text-yec-text-muted text-center">
          YEC Competition Platform v1.0
        </div>
      </aside>
    </>
  )
}
