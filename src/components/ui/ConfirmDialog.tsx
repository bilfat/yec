"use client"

import { Modal } from "./Modal"
import { Button } from "./Button"
import { AlertTriangle, Info } from "lucide-react"

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "primary" | "warning"
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  variant = "danger",
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="space-y-4">
        <div className="flex items-start gap-4 p-4 rounded-xl bg-yec-paper border border-[#DDD3C7]">
          {variant === "danger" ? (
            <AlertTriangle className="h-6 w-6 text-danger shrink-0 mt-0.5" />
          ) : (
            <Info className="h-6 w-6 text-yec-amber shrink-0 mt-0.5" />
          )}
          <p className="text-sm text-yec-text leading-relaxed">{message}</p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#DDD3C7]">
          <Button variant="ghost" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "danger" ? "dark" : "primary"}
            onClick={onConfirm}
            isLoading={isLoading}
            className={variant === "danger" ? "bg-danger hover:bg-danger/90 text-white" : ""}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
