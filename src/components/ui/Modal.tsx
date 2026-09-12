"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./Button"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "fit"
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  maxWidth = "md",
}: ModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // Handle ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    fit: "max-w-fit",
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-yec-brown/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content Box */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, type: "spring", bounce: 0, damping: 25 }}
            className={cn(
              "relative z-50 w-full max-h-[88vh] overflow-y-auto rounded-[24px] bg-yec-white p-5 sm:p-6 shadow-large border border-[#DDD3C7]",
              maxWidthClass[maxWidth],
              className
            )}
          >
            {title && (
              <div className="mb-4 flex items-center justify-between pb-3 border-b border-[#DDD3C7]/60">
                <h2 id="modal-title" className="text-lg sm:text-xl font-bold text-yec-brown font-display pr-4">
                  {title}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0 shrink-0 text-yec-text-muted hover:text-yec-brown hover:bg-yec-paper"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Tutup</span>
                </Button>
              </div>
            )}
            {!title && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-3 top-3 h-8 w-8 rounded-full p-0 shrink-0 text-yec-text-muted hover:text-yec-brown"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Tutup</span>
              </Button>
            )}
            <div className="mt-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
