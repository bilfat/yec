import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Portal Tim — Young Entrepreneur Camp",
  description: "Dashboard akses tim peserta YEC",
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#FDF9F3]">
      {children}
    </div>
  )
}
