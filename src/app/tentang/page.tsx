"use client"

import { useState } from "react"
import Image from "next/image"
import { SubthemeSection } from "@/components/landing/SubthemeSection"
import { JourneySection } from "@/components/landing/JourneySection"
import { CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

const bmcCriteria = [
  { id: "01", title: "Problem & Solution Fit", weight: "25%", desc: "Kejelasan masalah yang diangkat dan seberapa efektif solusi yang ditawarkan." },
  { id: "02", title: "Market Potential", weight: "25%", desc: "Ukuran pasar, target pelanggan, dan potensi pertumbuhan bisnis." },
  { id: "03", title: "Business Model & Revenue", weight: "20%", desc: "Kejelasan model pendapatan, struktur biaya, dan kelayakan finansial." },
  { id: "04", title: "Competitive Advantage", weight: "15%", desc: "Keunggulan kompetitif dibandingkan pesaing yang ada di pasar." },
  { id: "05", title: "Team Capability", weight: "15%", desc: "Kapasitas tim dalam mengeksekusi ide dan pengalaman yang relevan." },
]

const pitchingCriteria = [
  { id: "01", title: "Inovasi & Value Proposition", weight: "35%", desc: "Keunikan produk/jasa dan nilai tambah yang diberikan kepada pelanggan." },
  { id: "02", title: "Model Bisnis & Respon Q&A", weight: "35%", desc: "Kelayakan bisnis dan kemampuan tim menjawab pertanyaan dewan juri secara logis dan realistis." },
  { id: "03", title: "Teknik Pitching & Delivery", weight: "30%", desc: "Kejelasan, kepercayaan diri, cara penyampaian presentasi, dan manajemen waktu." },
]

export default function TentangPage() {
  const [activeTab, setActiveTab] = useState<"bmc" | "pitching">("bmc")
  const activeCriteria = activeTab === "bmc" ? bmcCriteria : pitchingCriteria

  return (
    <main className="min-h-screen bg-yec-paper">
      {/* Header */}
      <section className="bg-yec-forest pt-36 pb-20 text-yec-cream relative overflow-hidden">
        {/* Tree Vines & Flying Birds on Header */}
        <motion.div 
          animate={{ y: [0, -6, 0], rotate: [0, -2, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-10 -right-10 w-72 md:w-96 pointer-events-none z-10 opacity-30 mix-blend-screen"
        >
          <Image 
            src="/decor/tree-vines.jpg" 
            alt="Ranting Pohon" 
            width={400} 
            height={400} 
            className="w-full h-auto object-contain invert brightness-200"
          />
        </motion.div>

        <motion.div 
          animate={{ 
            x: ["-20vw", "110vw"],
            y: [10, -20, 15, -10],
            rotate: [0, 3, -3, 0]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute top-12 left-0 w-36 pointer-events-none z-10 opacity-30 mix-blend-screen"
        >
          <Image 
            src="/decor/flying-birds.jpg" 
            alt="Burung Terbang" 
            width={250} 
            height={250} 
            className="w-full h-auto object-contain invert brightness-200"
          />
        </motion.div>

        <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl relative z-10">
          <span className="text-3xl mb-4 inline-block animate-bounce">🏕️ 🌲</span>
          <h1 className="font-display text-4xl font-bold md:text-5xl lg:text-6xl mb-6">
            Tentang YEC
          </h1>
          <p className="text-lg text-yec-cream/90 md:text-xl leading-relaxed">
            Semua yang perlu kamu tahu sebelum mendaftarkan timmu — dari kategori, alur perjalanan, hingga apa yang juri nilai dari karyamu.
          </p>
        </div>
      </section>

      {/* Subtema */}
      <SubthemeSection />

      {/* Journey */}
      <JourneySection />

      {/* Kriteria Penilaian */}
      <section className="bg-yec-white py-24 relative overflow-hidden">
        {/* Decor Bird on Branch in Kriteria Penilaian */}
        <motion.div 
          animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-4 md:left-10 w-44 md:w-56 pointer-events-none z-10 mix-blend-multiply opacity-55 hidden md:block"
        >
          <Image 
            src="/decor/woodpecker-trunk.jpg" 
            alt="Burung Pelatuk" 
            width={300} 
            height={300} 
            className="w-full h-auto object-contain"
          />
        </motion.div>

        <motion.div 
          animate={{ scale: [1, 1.02, 1], y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-4 right-4 md:right-10 w-56 md:w-72 pointer-events-none z-10 mix-blend-multiply opacity-55 hidden lg:block"
        >
          <Image 
            src="/decor/camp-tent.jpg" 
            alt="Tenda Camp" 
            width={350} 
            height={350} 
            className="w-full h-auto object-contain"
          />
        </motion.div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <span className="inline-block rounded-full bg-yec-amber/10 px-4 py-1.5 text-sm font-semibold tracking-widest text-yec-amber uppercase mb-4">
                Penilaian Juri
              </span>
              <h2 className="font-display text-4xl font-bold text-yec-brown">Kriteria Penilaian</h2>
              <p className="mt-4 text-yec-text-secondary">
                Berikut adalah aspek-aspek yang dinilai oleh dewan juri pada setiap tahapan.
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-10 flex justify-center">
              <div className="flex rounded-full bg-yec-paper p-1 shadow-sm border border-[#DDD3C7]">
                {(["bmc", "pitching"] as const).map((tab) => {
                  const isActive = activeTab === tab
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative rounded-full px-6 py-2.5 text-sm font-bold transition-colors ${
                        isActive ? "text-yec-brown" : "text-yec-text hover:text-yec-brown"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="criteria-tab"
                          className="absolute inset-0 rounded-full bg-white shadow-sm border border-[#DDD3C7]"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">
                        {tab === "bmc" ? "Tahap BMC" : "Tahap Pitching"}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {activeCriteria.map((item) => (
                <div key={item.id} className="flex items-start gap-5 rounded-2xl border border-[#DDD3C7] bg-yec-paper p-6 transition-shadow hover:shadow-md">
                  <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-yec-amber" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <h3 className="font-display text-lg font-bold text-yec-brown">{item.title}</h3>
                      <span className="shrink-0 rounded-full bg-yec-amber/10 px-3 py-1 text-sm font-bold text-yec-amber">
                        {item.weight}
                      </span>
                    </div>
                    <p className="text-sm text-yec-text-secondary leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            <p className="mt-8 text-center text-sm text-yec-text-muted italic">
              * Persentase penilaian di atas bersifat indikatif dan dapat disesuaikan oleh panitia.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
