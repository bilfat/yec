"use client"

import * as React from "react"
import { UploadCloud, X, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./Button"

export interface FileDropzoneProps {
  onFileSelect: (file: File | null) => void
  accept?: string
  maxSizeMB?: number
  disabled?: boolean
  className?: string
}

export function FileDropzone({
  onFileSelect,
  accept = "application/pdf",
  maxSizeMB = 10,
  disabled = false,
  className
}: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }

  const validateAndSetFile = (file: File) => {
    setError(null)
    
    // Check size
    const sizeInMB = file.size / (1024 * 1024)
    if (sizeInMB > maxSizeMB) {
      setError(`Ukuran file terlalu besar. Maksimal ${maxSizeMB}MB.`)
      return
    }

    // Check type loosely (just UX validation, server will validate strictly)
    if (accept.includes("pdf") && file.type !== "application/pdf") {
      // Allow if accept string allows PPT but this is simple check
      if (!accept.includes("powerpoint") && !accept.includes("presentation")) {
         setError("Format file tidak didukung.")
         return
      }
    }

    setSelectedFile(file)
    onFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    if (disabled) return

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedFile(null)
    onFileSelect(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className={className}>
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        accept={accept}
        className="hidden"
        disabled={disabled}
      />
      
      {!selectedFile ? (
        <div
          onClick={() => !disabled && inputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
            isDragActive 
              ? "border-yec-amber bg-yec-amber/5" 
              : "border-[#DDD3C7] bg-yec-white hover:bg-yec-paper/50",
            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
            error ? "border-danger bg-danger/5" : ""
          )}
        >
          <div className={cn(
            "mb-4 flex h-14 w-14 items-center justify-center rounded-full",
            error ? "bg-danger/10 text-danger" : "bg-yec-cream text-yec-amber"
          )}>
            <UploadCloud className="h-6 w-6" />
          </div>
          <h4 className="text-base font-semibold text-yec-text">
            Klik atau Tarik file ke sini
          </h4>
          <p className="mt-1 text-sm text-yec-text-secondary">
            Format didukung: {accept.includes("pdf") ? "PDF" : accept}. Maks {maxSizeMB}MB.
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-[#DDD3C7] bg-yec-white p-4 shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yec-amber/10 text-yec-amber">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-yec-text">
                {selectedFile.name}
              </p>
              <p className="text-xs text-yec-text-muted">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFile}
            className="h-8 w-8 rounded-full p-0 text-danger hover:bg-danger/10 hover:text-danger"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {error && (
        <p className="mt-2 text-sm font-medium text-danger">{error}</p>
      )}
    </div>
  )
}
