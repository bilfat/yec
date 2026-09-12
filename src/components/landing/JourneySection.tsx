"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

const journeySteps = [
  { id: "01", title: "BUILD", subtitle: "Business Model Canvas" },
  { id: "02", title: "SELECT", subtitle: "Evaluation & Selection" },
  { id: "03", title: "PITCH", subtitle: "Present Your Idea" },
  { id: "04", title: "WIN", subtitle: "Final Result" },
]

export function JourneySection() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  })
  
  // Transform scroll progress to path length
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section id="journey" ref={containerRef} className="bg-yec-paper py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-20">
          <h2 className="font-display text-4xl font-bold text-yec-brown md:text-5xl">
            Perjalanan Panjang Menuju Puncak
          </h2>
        </div>

        <div className="relative mx-auto max-w-5xl">
          {/* Desktop SVG Line */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-2">
            <svg width="100%" height="8" viewBox="0 0 1000 8" fill="none" preserveAspectRatio="none">
              <path d="M0 4L1000 4" stroke="#DDD3C7" strokeWidth="4" strokeDasharray="8 8" />
              <motion.path 
                d="M0 4L1000 4" 
                stroke="#DF7F06" 
                strokeWidth="4" 
                style={{ pathLength }}
              />
            </svg>
          </div>

          {/* Steps */}
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-12 md:gap-4">
            {journeySteps.map((step, index) => (
              <div key={step.id} className="relative flex flex-row md:flex-col items-start md:items-center gap-6 md:gap-8 w-full md:w-1/4">
                
                {/* Mobile vertical line */}
                {index !== journeySteps.length - 1 && (
                  <div className="md:hidden absolute left-6 top-16 bottom-[-48px] w-1 bg-[#DDD3C7]">
                    <motion.div 
                      className="w-full bg-yec-amber origin-top"
                      style={{ scaleY: pathLength }}
                    />
                  </div>
                )}

                {/* Node */}
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.2, type: "spring" }}
                  className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-yec-paper bg-yec-amber text-xl font-bold text-yec-white shadow-md"
                >
                  {index === 3 ? "🏆" : step.id}
                </motion.div>
                
                {/* Content */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.2 + 0.2 }}
                  className="md:text-center pt-2 md:pt-0"
                >
                  <h3 className="font-display text-2xl font-bold text-yec-brown">{step.title}</h3>
                  <p className="text-yec-text-secondary mt-1">{step.subtitle}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
