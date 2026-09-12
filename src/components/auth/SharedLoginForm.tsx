"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField } from "@/components/ui/FormField"
import { Eye, EyeOff } from "lucide-react"

export function SharedLoginForm() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [showPassword, setShowPassword] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const username = (formData.get("username") as string || '').trim()
    const password = formData.get("password") as string || ''

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || "Username atau password salah.")
      } else {
        window.location.href = data.data.redirectUrl || "/admin/dashboard"
      }
    } catch {
      setError("Terjadi kesalahan koneksi saat login.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <FormField label="Username" htmlFor="username">
          <Input 
            id="username" 
            name="username" 
            type="text" 
            placeholder="Masukkan username" 
            required 
            autoComplete="username"
          />
        </FormField>
        
        <FormField label="Password" htmlFor="password">
          <div className="relative">
            <Input 
              id="password" 
              name="password" 
              type={showPassword ? "text" : "password"} 
              placeholder="Masukkan password" 
              required 
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-yec-text-muted hover:text-yec-text"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </FormField>
      </div>

      {error && (
        <div className="p-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
        Masuk
      </Button>
    </form>
  )
}
