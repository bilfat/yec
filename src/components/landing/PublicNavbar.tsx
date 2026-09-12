"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface PublicNavbarProps {
  transparentOnTop?: boolean
  darkThemeOnTop?: boolean
}

export function PublicNavbar({ transparentOnTop = true, darkThemeOnTop = false }: PublicNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "Beranda", path: "/" },
    { name: "Tentang", path: "/tentang" },
    { name: "Portal Tim", path: "/portal" },
  ]

  const isTransparent = !isScrolled && transparentOnTop && !isMobileMenuOpen
  const isDarkText = !isTransparent || !darkThemeOnTop

  return (
    <>
      <motion.nav
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          isTransparent
            ? "bg-transparent py-4 md:py-5"
            : "bg-yec-paper/95 py-3 shadow-sm backdrop-blur-md"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 md:gap-3" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="relative h-8 w-8 md:h-10 md:w-10 overflow-hidden rounded-full shrink-0 bg-white">
                <Image src="/logo-yec.jpeg" alt="YEC Logo" fill className="object-cover" />
              </div>
              <span className={`font-display text-base md:text-xl font-bold leading-tight transition-colors ${
                isDarkText ? "text-yec-brown" : "text-yec-cream"
              }`}>
                Young Entrepreneur Camp
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden items-center gap-6 md:flex">
              <div className="flex items-center gap-6 mr-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`relative py-1 text-sm font-medium transition-colors ${
                        isActive 
                          ? "text-yec-amber" 
                          : isDarkText 
                            ? "text-yec-text hover:text-yec-amber" 
                            : "text-yec-cream/80 hover:text-yec-cream"
                      }`}
                    >
                      {item.name}
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-yec-amber"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </Link>
                  )
                })}
              </div>

              {/* Action Button - Single Login */}
              <Link href="/login">
                <Button variant="outline" size="sm" className={`gap-1.5 text-xs ${
                  isDarkText 
                    ? "border-[#DDD3C7] text-yec-brown hover:bg-yec-paper" 
                    : "border-white/20 text-yec-cream hover:bg-white/10"
                }`}>
                  <ShieldCheck className="h-3.5 w-3.5 text-yec-amber" /> Masuk
                </Button>
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm md:hidden transition-colors ${
                isDarkText 
                  ? "border-[#DDD3C7] bg-yec-paper text-yec-text" 
                  : "border-white/20 bg-white/10 text-yec-cream backdrop-blur-md"
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-0 z-40 bg-yec-paper pt-24 pb-8 overflow-y-auto"
          >
            <div className="container mx-auto flex flex-col items-center gap-5 px-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`font-display text-xl font-bold transition-colors ${
                    pathname === item.path ? "text-yec-amber" : "text-yec-brown hover:text-yec-amber"
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              <div className="mt-4 w-full max-w-[260px] border-t border-[#DDD3C7] pt-6 flex flex-col gap-3">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full rounded-full gap-2 border-[#DDD3C7]">
                    <ShieldCheck className="h-4 w-4 text-yec-amber" /> Masuk (Admin / Juri)
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
