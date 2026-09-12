"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"

export function CtaSection() {
  return (
    <section className="bg-yec-brown py-32 relative overflow-hidden">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#DF7F06 2px, transparent 2px)", backgroundSize: "32px 32px" }}></div>
      
      {/* Animated Flying Birds across CTA Section */}
      <motion.div 
        animate={{ 
          x: ["-20vw", "110vw"],
          y: [15, -15, 20, -10],
          rotate: [0, 3, -3, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-10 left-0 w-28 sm:w-36 md:w-48 pointer-events-none z-10 opacity-35 mix-blend-screen"
      >
        <Image 
          src="/decor/flying-birds.jpg" 
          alt="Burung Terbang" 
          width={250} 
          height={250} 
          className="w-full h-auto object-contain invert brightness-200"
        />
      </motion.div>

      {/* Decorative Tree Vines corner in CTA */}
      <motion.div 
        animate={{ y: [0, -6, 0], rotate: [0, 2, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-8 -left-8 w-36 sm:w-56 md:w-80 pointer-events-none z-10 opacity-40 mix-blend-screen"
      >
        <Image 
          src="/decor/tree-vines.jpg" 
          alt="Sulur Pohon" 
          width={350} 
          height={350} 
          className="w-full h-auto object-contain invert brightness-200"
        />
      </motion.div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: "spring" }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="font-display text-4xl font-bold text-yec-white md:text-5xl lg:text-6xl mb-6">
            Siap Mewujudkan Ide Bisnismu?
          </h2>
          <p className="text-lg text-yec-cream/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Jangan biarkan idemu hanya menjadi angan. Daftarkan timmu sekarang, 
            submit karyamu, dan mulai perjalanan transformatifmu di Young Entrepreneur Camp.
          </p>
          <Link href="/portal">
            <Button size="lg" className="rounded-full px-10 h-16 text-lg font-bold shadow-[0_0_40px_rgba(223,127,6,0.5)] transition-transform hover:scale-105">
              Masuk ke Portal Tim
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
