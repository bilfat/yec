import { Metadata } from "next"
import { SharedLoginForm } from "@/components/auth/SharedLoginForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Login | Young Entrepreneur Camp",
  description: "Login untuk Admin dan Juri Young Entrepreneur Camp",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-yec-paper flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back to landing */}
        <div className="flex justify-center mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-yec-text-muted hover:text-yec-brown transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-yec-brown font-serif">
            Portal Manajemen
          </h2>
          <p className="text-sm text-yec-text-muted">
            Masuk sebagai Admin atau Juri menggunakan akun yang telah dibuat.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-yec-white py-8 px-4 shadow-card sm:rounded-2xl sm:px-10 border border-[#DDD3C7]">
          <SharedLoginForm />
        </div>
      </div>
    </div>
  )
}
