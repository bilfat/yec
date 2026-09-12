"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { ExternalLink, FileText } from "lucide-react"

interface PdfViewerProps {
  pdfUrl: string | null
  fileName?: string
}

export function PdfViewer({ pdfUrl, fileName = "Dokumen Peserta" }: PdfViewerProps) {
  const [error, setError] = React.useState(false)

  if (!pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-yec-paper text-yec-text-muted p-8 text-center border-r border-[#DDD3C7]">
        <FileText className="w-16 h-16 mb-4 text-[#DDD3C7]" />
        <h3 className="text-lg font-semibold text-yec-text mb-2">Dokumen Tidak Tersedia</h3>
        <p className="max-w-sm">Tim ini belum mengunggah dokumen atau URL dokumen tidak valid.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-yec-paper text-yec-text-muted p-8 text-center border-r border-[#DDD3C7]">
        <FileText className="w-16 h-16 mb-4 text-[#DDD3C7]" />
        <h3 className="text-lg font-semibold text-yec-text mb-2">Gagal Memuat Dokumen</h3>
        <p className="max-w-sm mb-6">Browser Anda mungkin memblokir tampilan PDF atau file rusak.</p>
        <Button asChild variant="outline">
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Buka di Tab Baru
          </a>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 border-r border-[#DDD3C7]">
      {/* Header for PDF viewer */}
      <div className="bg-yec-white px-4 py-3 border-b border-[#DDD3C7] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <FileText className="w-5 h-5 text-yec-amber shrink-0" />
          <span className="text-sm font-medium text-yec-text truncate">{fileName}</span>
        </div>
        <Button asChild variant="ghost" size="sm" className="shrink-0 ml-2">
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" title="Buka di tab baru">
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </div>
      
      {/* PDF Iframe */}
      <div className="flex-1 w-full relative">
        {/* We use object/iframe to embed PDF natively if supported by browser */}
        <iframe
          src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
          className="absolute inset-0 w-full h-full border-0"
          title={fileName}
          onError={() => setError(true)}
          // using onload doesn't perfectly catch all PDF block errors, but helps
        />
      </div>
    </div>
  )
}
