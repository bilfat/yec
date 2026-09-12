import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8EA] text-yec-text p-6">
      <div className="text-center max-w-md space-y-6">
        <h1 className="text-6xl font-display font-bold text-yec-amber">404</h1>
        <h2 className="text-2xl font-bold">Halaman Tidak Ditemukan</h2>
        <p className="text-yec-text-muted">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <div className="pt-4">
          <Button asChild variant="primary">
            <Link href="/">
              Kembali ke Beranda
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
