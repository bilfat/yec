"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
export function InitialLoader() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initial loading splash screen duration
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-yec-paper"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.9, 1.05, 1], opacity: 1 }}
            transition={{ 
              duration: 1.2, 
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="relative h-28 w-28 overflow-hidden rounded-2xl shadow-large border-4 border-yec-white"
          >
            <Image
              src="/logo-yec.jpeg"
              alt="YEC Logo"
              fill
              className="object-cover"
              priority
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8 flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-1.5">
              <motion.div 
                animate={{ y: [0, -6, 0] }} 
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                className="h-2.5 w-2.5 rounded-full bg-yec-amber" 
              />
              <motion.div 
                animate={{ y: [0, -6, 0] }} 
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                className="h-2.5 w-2.5 rounded-full bg-yec-amber" 
              />
              <motion.div 
                animate={{ y: [0, -6, 0] }} 
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                className="h-2.5 w-2.5 rounded-full bg-yec-amber" 
              />
            </div>
            <p className="text-sm font-semibold tracking-widest text-yec-brown uppercase">
              Memuat...
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
