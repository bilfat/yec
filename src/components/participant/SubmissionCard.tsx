"use client"

import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { FileDropzone } from "@/components/ui/FileDropzone"
import { Button } from "@/components/ui/Button"
import { Select } from "@/components/ui/Select"
import { FormField } from "@/components/ui/FormField"
import { FileText, Clock } from "lucide-react"

export type SubmissionState = "READY" | "SUBMITTED" | "WAITING_RESULT" | "PASSED" | "FAILED"

interface SubmissionCardProps {
  title: string
  description: string
  state: SubmissionState
  onSubmit?: (file: File) => void
  deadline?: string
  submittedFile?: { name: string, date: string }
  maxSizeMB?: number
  showSubtheme?: boolean
}

export function SubmissionCard({ 
  title, 
  description, 
  state, 
  onSubmit, 
  deadline,
  submittedFile,
  maxSizeMB = 10,
  showSubtheme = false
}: SubmissionCardProps) {
  
  const renderContent = () => {
    switch (state) {
      case "READY":
        return (
          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between text-sm text-yec-text-secondary">
              <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> Batas Pengumpulan:</span>
              <span className="font-semibold text-yec-amber">{deadline}</span>
            </div>
            {showSubtheme && (
              <div className="mb-6">
                <FormField label="Pilih Sub-tema" htmlFor="subtheme">
                  <Select 
                    id="subtheme" 
                    options={[
                      { value: "", label: "Pilih Sub-tema Bisnis Anda..." },
                      { value: "tech", label: "Teknologi & Digital" },
                      { value: "creative", label: "Industri Kreatif" },
                      { value: "fnb", label: "Food & Beverage" },
                      { value: "green", label: "Green Business & Sustainability" }
                    ]}
                  />
                </FormField>
              </div>
            )}
            <FileDropzone 
              onFileSelect={(file) => {
                if (file && onSubmit) onSubmit(file)
              }} 
              accept="application/pdf"
              maxSizeMB={maxSizeMB}
            />
            <Button className="mt-4 w-full" disabled>Submit Karya</Button>
          </div>
        )
      
      case "SUBMITTED":
        return (
          <div className="mt-6 rounded-xl border border-success bg-success/5 p-5">
            <h4 className="mb-2 font-semibold text-success flex items-center gap-2">
              <FileText className="h-5 w-5" /> Karya Berhasil Disubmit
            </h4>
            {submittedFile && (
              <div className="text-sm text-success/80">
                <p>File: {submittedFile.name}</p>
                <p>Waktu: {submittedFile.date}</p>
              </div>
            )}
          </div>
        )

      case "WAITING_RESULT":
        return (
          <div className="mt-6 rounded-xl border border-info bg-info/5 p-5 text-center">
            <h4 className="mb-2 font-semibold text-info">Sedang Dinilai Juri</h4>
            <p className="text-sm text-info/80">Karyamu sedang dalam tahap evaluasi. Hasil akan diumumkan segera!</p>
          </div>
        )
        
      case "PASSED":
        return (
          <div className="mt-6 rounded-xl border border-success bg-success/5 p-5 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/20 text-success text-2xl">
              🎉
            </div>
            <h4 className="mb-1 text-lg font-bold text-success">Selamat! Tim Kamu Lolos</h4>
            <p className="text-sm text-success/80">Persiapkan dirimu untuk tahap selanjutnya.</p>
          </div>
        )

      case "FAILED":
        return (
          <div className="mt-6 rounded-xl border border-yec-text-muted bg-yec-paper p-5 text-center">
            <h4 className="mb-1 text-lg font-bold text-yec-text">Tetap Semangat!</h4>
            <p className="text-sm text-yec-text-secondary">Perjalananmu luar biasa, namun belum lolos ke tahap selanjutnya. Terima kasih atas partisipasinya!</p>
          </div>
        )
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-2xl font-bold text-yec-brown">{title}</h3>
          <p className="mt-1 text-sm text-yec-text-secondary">{description}</p>
        </div>
        <Badge 
          variant={
            state === "READY" ? "warning" : 
            state === "FAILED" ? "default" :
            state === "WAITING_RESULT" ? "info" : "success"
          }
        >
          {state === "WAITING_RESULT" ? "EVALUATING" : state}
        </Badge>
      </div>
      {renderContent()}
    </Card>
  )
}
