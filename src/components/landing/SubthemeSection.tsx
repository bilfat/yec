"use client"

import { motion } from "framer-motion"
import { Laptop, Palette, Coffee, Leaf } from "lucide-react"

const subthemes = [
  {
    id: "tech",
    title: "Teknologi & Digital",
    description: "Solusi inovatif berbasis teknologi, aplikasi, software, IoT, atau platform digital.",
    icon: <Laptop className="h-6 w-6" />,
    color: "bg-info/10 text-info border-info/20"
  },
  {
    id: "creative",
    title: "Industri Kreatif",
    description: "Bisnis di bidang fashion, seni, desain, media, atau hiburan yang membawa nilai orisinal.",
    icon: <Palette className="h-6 w-6" />,
    color: "bg-yec-amber/10 text-yec-amber border-yec-amber/20"
  },
  {
    id: "fnb",
    title: "Food & Beverage",
    description: "Inovasi kuliner, produk makanan/minuman kemasan, atau konsep restoran modern.",
    icon: <Coffee className="h-6 w-6" />,
    color: "bg-yec-brown/10 text-yec-brown border-yec-brown/20"
  },
  {
    id: "green",
    title: "Green Business",
    description: "Bisnis yang berfokus pada keberlanjutan lingkungan, daur ulang, atau energi ramah.",
    icon: <Leaf className="h-6 w-6" />,
    color: "bg-success/10 text-success border-success/20"
  }
]

export function SubthemeSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
  }

  return (
    <section id="kategori" className="bg-yec-white py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <span className="inline-block rounded-full bg-yec-amber/10 px-4 py-1.5 text-sm font-semibold tracking-widest text-yec-amber uppercase mb-4">
            Kategori Kompetisi
          </span>
          <h2 className="font-display text-4xl font-bold text-yec-brown md:text-5xl">
            Pilih Sub-tema Bisnismu
          </h2>
          <p className="mt-6 text-lg text-yec-text-secondary">
            Young Entrepreneur Camp membuka kesempatan bagi berbagai inovasi. 
            Sesuaikan ide bisnismu dengan salah satu dari empat kategori utama berikut.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {subthemes.map((theme) => (
            <motion.div
              key={theme.id}
              variants={itemVariants}
              className={`rounded-[24px] border-2 bg-yec-white p-6 transition-all hover:-translate-y-1 hover:shadow-md ${theme.color}`}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm border border-inherit">
                {theme.icon}
              </div>
              <h3 className="mb-3 font-display text-xl font-bold text-yec-brown">{theme.title}</h3>
              <p className="text-sm text-yec-text-secondary leading-relaxed">{theme.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
