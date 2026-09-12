"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export function EventIntro() {
  return (
    <section id="about" className="bg-yec-forest py-20 md:py-32 text-yec-cream relative overflow-hidden">
      
      {/* Top Transition Curve (Connecting Hero bg-yec-paper to EventIntro bg-yec-forest) */}
      <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none z-10">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-10 md:h-16 text-yec-paper fill-current">
          <path d="M0,0 C150,90 350,-40 500,60 C650,140 900,10 1200,40 L1200,0 L0,0 Z"></path>
        </svg>
      </div>

      {/* Decorative Flying Birds across EventIntro */}
      <motion.div 
        animate={{ 
          x: ["100vw", "-20vw"],
          y: [-20, 20, -10, 15, -20],
          rotate: [0, -4, 3, -2, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-12 right-0 w-28 sm:w-36 md:w-52 pointer-events-none z-10 opacity-40 mix-blend-screen"
      >
        <Image 
          src="/decor/flying-birds.jpg" 
          alt="Burung Terbang" 
          width={250} 
          height={250} 
          className="w-full h-auto object-contain invert brightness-200"
        />
      </motion.div>

      {/* Woodpecker on trunk overlay in EventIntro */}
      <motion.div 
        animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-12 left-2 sm:left-6 w-24 sm:w-36 md:w-48 pointer-events-none z-10 opacity-40 mix-blend-screen"
      >
        <Image 
          src="/decor/woodpecker-trunk.jpg" 
          alt="Pelatuk" 
          width={250} 
          height={250} 
          className="w-full h-auto object-contain invert brightness-200"
        />
      </motion.div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="text-3xl sm:text-4xl mb-4 inline-block animate-bounce">🌲 🏕️ 🌿</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight md:text-5xl lg:text-6xl mb-6">
            Lebih Dari Sekadar <span className="text-yec-amber">Kompetisi Bisnis.</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-yec-cream/90 leading-relaxed">
            Young Entrepreneur Camp (YEC) dirancang untuk menantang batas kemampuanmu. 
            Kami percaya bahwa ide brilian harus diimbangi dengan karakter yang kuat. 
            Di sini, kamu akan dibimbing, diuji, dan dibentuk menjadi entrepreneur sejati 
            yang siap menghadapi dunia nyata.
          </p>
        </motion.div>
      </div>

      {/* Bottom Transition Curve (Connecting EventIntro bg-yec-forest back to bg-yec-paper) */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-10 md:h-16 text-yec-paper fill-current">
          <path d="M0,40 C300,120 600,0 900,80 C1050,110 1150,50 1200,80 L1200,120 L0,120 Z"></path>
        </svg>
      </div>
    </section>
  )
}
