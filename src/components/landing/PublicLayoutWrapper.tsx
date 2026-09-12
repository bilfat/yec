"use client"

import { usePathname } from "next/navigation"
import { PublicNavbar } from "./PublicNavbar"
import { PublicFooter } from "./PublicFooter"

export function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublicPage = pathname === "/" || pathname === "/tentang" || pathname.startsWith("/portal")
  
  if (!isPublicPage) {
    return <>{children}</>
  }

  const transparentOnTop = true
  const darkThemeOnTop = pathname === "/tentang"

  return (
    <>
      <PublicNavbar transparentOnTop={transparentOnTop} darkThemeOnTop={darkThemeOnTop} />
      {children}
      <PublicFooter />
    </>
  )
}
