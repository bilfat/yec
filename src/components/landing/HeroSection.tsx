"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import gsap from "gsap"
import { Button } from "@/components/ui/Button"
import { fetchApi } from "@/lib/api"

interface Settings {
  eventName?: string
  heroTitle?: string
  heroSubtitle?: string
  announcement?: string
  competition_name?: string
}

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  
  useEffect(() => {
    async function loadSettings() {
      const res = await fetchApi<Settings>('/settings')
      if (res.success && res.data) {
        setSettings(res.data)
      }
    }
    loadSettings()
  }, [])

  useEffect(() => {
    if (!settings) return; // Wait for data to animate
    
    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
      
      tl.from(".hero-visual", { scale: 1.05, opacity: 0, duration: 1.2 })
        .from(".hero-eyebrow", { y: 20, opacity: 0, duration: 0.6 }, "-=0.8")
        .from(".hero-title", { y: 30, opacity: 0, duration: 0.8, stagger: 0.2 }, "-=0.6")
        .from(".hero-desc", { y: 20, opacity: 0, duration: 0.6 }, "-=0.6")
        .from(".hero-cta", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
        .from(".hero-decor", { opacity: 0, scale: 0.8, duration: 1.2, stagger: 0.2 }, "-=0.8")
    }, containerRef)

    return () => ctx.revert()
  }, [settings])

  if (!settings) {
    return (
      <section className="relative min-h-[90vh] overflow-hidden bg-yec-paper flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-yec-amber border-t-transparent" />
      </section>
    )
  }

  // Parse heroTitle (assuming it has two lines separated by character or just space for split)
  // For simplicity, we'll just split it in half or by a known pattern if we want two colors.
  // The original has "BUILD YOUR IDEA." and "BUILD YOUR CHARACTER."
  // If heroTitle doesn't have a split, we just display it in one span.
  const heroTitle = settings.heroTitle || "BUILD YOUR IDEA. BUILD YOUR CHARACTER."
  const heroSubtitle = settings.heroSubtitle || "Kompetisi bisnis pemuda se-Indonesia."
  const eventName = settings.eventName || settings.competition_name || "YEC 2026"

  const titleParts = heroTitle.split('.')
  const part1 = titleParts[0] ? titleParts[0] + '.' : ''
  const part2 = titleParts.slice(1).join('.').trim()

  return (
    <section ref={containerRef} className="relative min-h-[90vh] overflow-hidden bg-yec-paper pt-28 lg:pt-32 pb-24 flex items-center">
      
      {/* Top Left Tree Leaves Frame Decor */}
      <motion.div 
        animate={{ y: [0, 8, 0], rotate: [0, 1.5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="hero-decor absolute -top-6 -left-6 sm:-top-8 sm:-left-8 md:-left-12 w-44 sm:w-64 md:w-96 pointer-events-none z-20 mix-blend-multiply opacity-60"
      >
        <Image 
          src="/decor/tree-leaves.jpg" 
          alt="Daun & Dahan Pohon" 
          width={400} 
          height={400} 
          className="w-full h-auto object-contain"
        />
      </motion.div>

      {/* Top Right Curved Tree Vines Frame Decor */}
      <motion.div 
        animate={{ y: [0, -6, 0], rotate: [0, -2, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="hero-decor absolute -top-8 -right-8 sm:-top-10 sm:-right-10 w-48 sm:w-72 md:w-[420px] pointer-events-none z-20 mix-blend-multiply opacity-55"
      >
        <Image 
          src="/decor/tree-vines.jpg" 
          alt="Ranting Pohon & Sulur" 
          width={450} 
          height={450} 
          className="w-full h-auto object-contain"
        />
      </motion.div>

      {/* Animated Flying Birds Path across top section */}
      <motion.div 
        initial={{ x: "-20vw", y: 40 }}
        animate={{ 
          x: ["-10vw", "110vw"], 
          y: [30, -20, 15, -30, 20],
          rotate: [0, 4, -3, 5, 0] 
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="hero-decor absolute top-12 sm:top-16 left-0 w-28 sm:w-36 md:w-48 pointer-events-none z-30 mix-blend-multiply opacity-65"
      >
        <Image 
          src="/decor/flying-birds.jpg" 
          alt="Burung Terbang" 
          width={250} 
          height={250} 
          className="w-full h-auto object-contain"
        />
      </motion.div>

      {/* Woodpecker on Trunk (Left side decor with head pecking animation) */}
      <motion.div 
        animate={{ 
          y: [0, -8, 0, -4, 0],
          rotate: [0, 2, -2, 3, 0],
          scale: [1, 1.02, 1, 1.01, 1] 
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="hero-decor absolute top-1/4 sm:top-1/3 -left-4 sm:left-2 lg:left-6 w-28 sm:w-40 md:w-56 pointer-events-none z-20 mix-blend-multiply opacity-65"
      >
        <Image 
          src="/decor/woodpecker-trunk.jpg" 
          alt="Burung Pelatuk Pohon" 
          width={300} 
          height={300} 
          className="w-full h-auto object-contain drop-shadow-sm"
        />
      </motion.div>

      {/* Floating Bird on Branch Decor (Right side behind or near visual) */}
      <motion.div 
        animate={{ y: [0, -12, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="hero-decor absolute top-20 sm:top-28 right-2 sm:right-6 md:right-12 lg:right-24 w-28 sm:w-44 md:w-52 pointer-events-none z-20 mix-blend-multiply opacity-70"
      >
        <Image 
          src="/decor/bird-branch.jpg" 
          alt="Burung Ranting Pohon" 
          width={300} 
          height={300} 
          className="w-full h-auto object-contain drop-shadow-sm"
        />
      </motion.div>

      {/* Camp Tent Decor (Bottom Right) */}
      <motion.div 
        animate={{ scale: [1, 1.02, 1], y: [0, -5, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="hero-decor absolute -bottom-8 -right-4 sm:-bottom-10 sm:-right-6 md:right-4 lg:right-12 w-48 sm:w-64 md:w-80 lg:w-[420px] pointer-events-none z-20 mix-blend-multiply opacity-65"
      >
        <Image 
          src="/decor/camp-tent.jpg" 
          alt="Tenda Camping YEC" 
          width={450} 
          height={450} 
          className="w-full h-auto object-contain"
        />
      </motion.div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Content (60%) */}
          <div className="lg:col-span-7">
            
            
            <span className="hero-eyebrow inline-block rounded-full bg-yec-amber/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-yec-brown mb-4 border border-yec-amber/30 mt-2 block w-max">
              ⛺ {eventName}
            </span>
            
            <h1 className="font-display text-4xl leading-[1.1] text-yec-brown md:text-6xl lg:text-[76px]">
              {part2 ? (
                <>
                  <span className="hero-title block">{part1}</span>
                  <span className="hero-title block text-yec-amber">{part2}</span>
                </>
              ) : (
                <span className="hero-title block">{heroTitle}</span>
              )}
            </h1>
            <p className="hero-desc mt-6 max-w-lg text-base text-yec-text-secondary md:text-xl leading-relaxed">
              {heroSubtitle}
            </p>
            <div className="hero-cta mt-8 flex flex-wrap items-center gap-4">
              <Link href="/portal">
                <Button size="lg" className="rounded-full px-8 h-14 text-base font-bold shadow-lg shadow-yec-amber/20 hover:scale-105 transition-transform">
                  Akses Portal Tim
                </Button>
              </Link>
              <Link href="#about">
                <Button variant="ghost" size="lg" className="rounded-full px-8 h-14 text-base font-semibold hover:bg-yec-brown/10">
                  Pelajari Lebih Lanjut
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual (40%) */}
          <div className="hero-visual relative lg:col-span-5 h-[380px] lg:h-[480px] w-full rounded-[32px] overflow-hidden shadow-2xl border-8 border-yec-white">
            <div className="absolute inset-0 bg-yec-brown/10 z-10 mix-blend-overlay"></div>
            <Image 
              src="/logo-yec.jpeg" 
              alt="YEC Hero Visual" 
              fill 
              className="object-cover"
              priority
            />
          </div>

        </div>
      </div>
    </section>
  )
}

