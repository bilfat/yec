"use client"

import Image from "next/image"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const stages = [
  {
    title: "1. Business Model Canvas (BMC)",
    description: "Peserta mendaftarkan tim dan mengirimkan ide bisnis mereka dalam format Business Model Canvas. Format ini dipilih agar peserta bisa memetakan ide bisnis secara komprehensif mulai dari target pasar hingga struktur biaya."
  },
  {
    title: "2. Evaluasi & Seleksi",
    description: "Karya BMC yang telah disubmit akan dinilai secara independen oleh dewan juri ahli kami. Hanya ide bisnis dengan potensi dan skor terbaik yang berhak melaju ke tahap Pitching."
  },
  {
    title: "3. Pitching Session",
    description: "Tim yang lolos akan mempresentasikan ide bisnis mereka di hadapan panel juri dan investor potensial. Ini adalah kesempatan untuk membuktikan kemampuan komunikasi, kepemimpinan, dan kelayakan ide."
  },
  {
    title: "4. Malam Final & Penghargaan",
    description: "Pengumuman pemenang dan pemberian penghargaan kepada tim-tim terbaik. Para pemenang akan mendapatkan hadiah modal usaha dan kesempatan mentorship eksklusif."
  }
]

export function CompetitionStages() {
  const [openIndex, setOpenIndex] = useState<number>(0)

  return (
    <section className="bg-yec-paper py-24 relative overflow-hidden">
      {/* Decorative Tree Canopy & Bird in CompetitionStages */}
      <motion.div 
        animate={{ y: [0, 6, 0], rotate: [0, 1.5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-6 -right-6 w-36 sm:w-56 md:w-80 pointer-events-none z-10 mix-blend-multiply opacity-50"
      >
        <Image 
          src="/decor/tree-leaves.jpg" 
          alt="Dahan Daun" 
          width={350} 
          height={350} 
          className="w-full h-auto object-contain"
        />
      </motion.div>

      <motion.div 
        animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-4 -left-4 w-28 sm:w-40 md:w-52 pointer-events-none z-10 mix-blend-multiply opacity-55"
      >
        <Image 
          src="/decor/woodpecker-trunk.jpg" 
          alt="Burung Pelatuk" 
          width={300} 
          height={300} 
          className="w-full h-auto object-contain"
        />
      </motion.div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-4xl font-bold text-yec-brown">Detail Tahapan Kompetisi</h2>
            <p className="mt-4 text-yec-text-secondary">Pahami setiap proses yang akan kamu lalui selama Young Entrepreneur Camp berlangsung.</p>
          </div>

          <div className="space-y-4">
            {stages.map((stage, index) => {
              const isOpen = openIndex === index
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="overflow-hidden rounded-2xl border border-[#DDD3C7] bg-yec-white"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-yec-paper/50"
                  >
                    <h3 className="font-display text-xl font-bold text-yec-brown">{stage.title}</h3>
                    <ChevronDown className={`h-5 w-5 text-yec-text-muted transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-6 text-yec-text-secondary border-t border-[#DDD3C7] pt-4">
                          {stage.description}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
