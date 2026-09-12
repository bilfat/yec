"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField } from "@/components/ui/FormField"
import { Card } from "@/components/ui/Card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function TeamAccessForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    // Mock login delay
    setTimeout(() => {
      setIsLoading(false)
      // We'll simulate success on the parent component later
      // For now just console log
      console.log("Submit access form")
    }, 1500)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-yec-paper p-4">
      {/* Back to Home Link */}
      <Link 
        href="/" 
        className="absolute left-6 top-8 flex items-center gap-2 text-sm font-semibold text-yec-text-secondary transition-colors hover:text-yec-amber md:left-12 md:top-12"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Beranda
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-bold text-yec-brown">Portal Tim</h1>
          <p className="mt-2 text-yec-text-secondary">Masukkan PIN untuk mengakses dashboard tim kamu.</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField label="Nama Tim" htmlFor="teamName">
              <Input id="teamName" placeholder="Pilih atau ketik nama tim..." required />
            </FormField>

            <FormField label="PIN Akses" htmlFor="pin" error={error}>
              <Input 
                id="pin" 
                type="password" 
                placeholder="••••••" 
                maxLength={6}
                required 
                className="font-mono tracking-[0.5em] text-center text-lg"
              />
            </FormField>

            <Button type="submit" className="w-full h-12 mt-2" isLoading={isLoading}>
              Masuk ke Portal
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
