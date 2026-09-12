'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8EA] text-yec-text p-6">
      <div className="text-center max-w-md space-y-6">
        <h1 className="text-6xl font-display font-bold text-danger">500</h1>
        <h2 className="text-2xl font-bold">Terjadi Kesalahan Server</h2>
        <p className="text-yec-text-muted">
          Maaf, terjadi kesalahan yang tidak terduga pada sistem kami.
        </p>
        <div className="pt-4">
          <Button onClick={() => reset()} variant="primary">
            Coba Lagi
          </Button>
        </div>
      </div>
    </div>
  )
}
