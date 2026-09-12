"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Users, Lightbulb, TrendingUp, HelpCircle } from "lucide-react"
import { fetchApi } from "@/lib/api"

interface Subtheme {
  id: string
  title: string
  description: string
  color: string
  textColor: string
  iconName: string
}

export function HighlightGrid() {
  const [highlights, setHighlights] = React.useState<Subtheme[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      const res = await fetchApi<Subtheme[]>('/subthemes')
      if (res.success && res.data) {
        setHighlights(res.data)
      }
      setIsLoading(false)
    }
    loadData()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as any } }
  }

  const renderIcon = (name: string) => {
    switch (name) {
      case "users": return <Users className="h-6 w-6" />
      case "trending-up": return <TrendingUp className="h-6 w-6" />
      case "lightbulb": return <Lightbulb className="h-6 w-6" />
      default: return <HelpCircle className="h-6 w-6" />
    }
  }

  if (isLoading) {
    return (
      <section className="bg-yec-paper py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-yec-amber border-t-transparent" />
        </div>
      </section>
    )
  }

  return (
    <section className="bg-yec-paper py-24 relative overflow-hidden">
      {/* Decorative Tree Vines & Bird in HighlightGrid */}
      <motion.div 
        animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-8 -left-8 w-36 sm:w-56 md:w-80 pointer-events-none z-10 mix-blend-multiply opacity-50"
      >
        <Image 
          src="/decor/tree-vines.jpg" 
          alt="Sulur Pohon" 
          width={350} 
          height={350} 
          className="w-full h-auto object-contain"
        />
      </motion.div>

      <motion.div 
        animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-2 -right-4 w-28 sm:w-44 md:w-56 pointer-events-none z-10 mix-blend-multiply opacity-55"
      >
        <Image 
          src="/decor/bird-branch.jpg" 
          alt="Burung di Ranting" 
          width={300} 
          height={300} 
          className="w-full h-auto object-contain"
        />
      </motion.div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-6 md:grid-cols-3"
        >
          {highlights.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className={`${item.color} ${item.textColor} rounded-[32px] p-8 shadow-sm transition-transform hover:-translate-y-2 relative overflow-hidden`}
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="font-display text-4xl font-bold opacity-50">{item.id}</span>
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${item.id === '01' ? 'bg-yec-amber/10' : 'bg-white/10'}`}>
                  {renderIcon(item.iconName)}
                </div>
              </div>
              <h3 className="mb-4 font-display text-3xl font-bold">{item.title}</h3>
              <p className="opacity-90">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
