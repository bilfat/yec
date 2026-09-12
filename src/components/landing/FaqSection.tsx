"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"

const faqs = [
  {
    question: "Siapa saja yang boleh mengikuti YEC?",
    answer: "YEC terbuka untuk seluruh mahasiswa aktif dan fresh graduate (maksimal 2 tahun setelah lulus) dari seluruh universitas di Indonesia yang memiliki ide bisnis kreatif dan inovatif."
  },
  {
    question: "Berapa jumlah maksimal anggota dalam satu tim?",
    answer: "Satu tim maksimal terdiri dari 3 orang, di mana 1 orang bertindak sebagai ketua tim. Anggota tim boleh berasal dari universitas atau fakultas yang berbeda."
  },
  {
    question: "Apakah ide bisnis harus sudah berjalan (sudah memiliki revenue)?",
    answer: "Tidak wajib. YEC menerima ide bisnis pada tahap ideation (baru berupa konsep) maupun yang sudah berjalan di tahap awal (early-stage startup)."
  },
  {
    question: "Bagaimana format penulisan Business Model Canvas (BMC)?",
    answer: "Format BMC bebas asalkan mencakup 9 blok utama. File wajib diunggah dalam format PDF dengan ukuran maksimal 10MB melalui Portal Tim yang telah disediakan."
  },
  {
    question: "Apakah ada biaya pendaftaran?",
    answer: "Pendaftaran dan pengumpulan karya tahap awal (BMC) 100% GRATIS."
  }
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="bg-yec-paper py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-4xl font-bold text-yec-brown">Pertanyaan yang Sering Diajukan</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <div 
                  key={index}
                  className="rounded-2xl bg-yec-white p-2 shadow-sm transition-shadow hover:shadow-md"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-4 text-left"
                  >
                    <span className="font-semibold text-yec-text">{faq.question}</span>
                    <div className={`ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${isOpen ? "bg-yec-amber text-yec-white" : "bg-yec-cream text-yec-amber"}`}>
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 text-yec-text-secondary">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
