"use client"

import { useEffect } from "react"
import Lenis from "lenis"
import { usePathname } from "next/navigation"

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
      direction: "vertical", // vertical, horizontal
      gestureDirection: "vertical", // vertical, horizontal, both
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    } as any)

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // Stop Lenis on admin/juri pages if we don't want smooth scroll there
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/juri")) {
      lenis.destroy()
    }

    return () => {
      lenis.destroy()
    }
  }, [pathname])

  return <>{children}</>
}
