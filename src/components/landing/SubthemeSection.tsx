"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Laptop, Palette, Coffee, Leaf, Lightbulb, Sparkles } from "lucide-react"
import { fetchApi } from "@/lib/api"

export function SubthemeSection() {
  const [subthemes, setSubthemes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadSubthemes() {
      const res = await fetchApi<any[]>('/subthemes')
      if (res.success && res.data) {
        const presets = [
          { icon: <Laptop className="h-6 w-6" />, color: "bg-info/10 text-info border-info/20" },
          { icon: <Palette className="h-6 w-6" />, color: "bg-yec-amber/10 text-yec-amber border-yec-amber/20" },
          { icon: <Coffee className="h-6 w-6" />, color: "bg-yec-brown/10 text-yec-brown border-yec-brown/20" },
          { icon: <Leaf className="h-6 w-6" />, color: "bg-success/10 text-success border-success/20" },
          { icon: <Lightbulb className="h-6 w-6" />, color: "bg-warning/10 text-warning border-warning/20" },
          { icon: <Sparkles className="h-6 w-6" />, color: "bg-info/10 text-info border-info/20" }
        ]

        const mapped = res.data.map((st: any, idx: number) => {
          const preset = presets[idx % presets.length]
          return {
            id: st.id,
            title: st.name,
            description: st.description || "Inovasi sub-tema bisnis pemuda Young Entrepreneur Camp.",
            icon: preset.icon,
            color: preset.color
          }
        })
        setSubthemes(mapped)
      }
      setIsLoading(false)
    }
    loadSubthemes()
  }, [])

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
            Sesuaikan ide bisnismu dengan kategori sub-tema berikut.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-yec-amber border-t-transparent" />
          </div>
        ) : (
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
        )}
      </div>
    </section>
  )
}
