import Link from "next/link"

export function PublicFooter() {
  return (
    <footer className="bg-yec-brown py-12 text-yec-cream">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <h3 className="font-display text-2xl font-bold text-yec-white mb-4">YEC.</h3>
            <p className="max-w-xs text-yec-cream/80 text-sm leading-relaxed">
              Young Entrepreneur Camp adalah wadah bagi generasi muda untuk mengembangkan ide bisnis dan karakter kepemimpinan.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-yec-white mb-4">Akses & Navigasi</h4>
            <ul className="space-y-2.5 text-sm text-yec-cream/80">
              <li>
                <Link href="/" className="hover:text-yec-amber transition-colors">Beranda</Link>
              </li>
              <li>
                <Link href="/tentang" className="hover:text-yec-amber transition-colors">Tentang YEC</Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-yec-amber transition-colors font-medium text-yec-cream">Portal Tim Peserta</Link>
              </li>
              <li>
                <Link href="/juri/login" className="hover:text-yec-amber transition-colors">Login Dewan Juri</Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-yec-amber transition-colors">Login Panitia Admin</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-yec-white mb-4">Kontak Helpdesk</h4>
            <ul className="space-y-2.5 text-sm text-yec-cream/80">
              <li>support@yec.id</li>
              <li>
                <a
                  href="https://wa.me/6281219843922"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-yec-amber transition-colors"
                >
                  WhatsApp: +62 812 1984 3922
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-yec-cream/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-yec-cream/60">
          <p>© {new Date().getFullYear()} Young Entrepreneur Camp. Hak Cipta Dilindungi. bilfat</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-yec-white transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-yec-white transition-colors">Kebijakan Privasi</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
