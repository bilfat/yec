import { HeroSection } from "@/components/landing/HeroSection"
import { EventIntro } from "@/components/landing/EventIntro"
import { HighlightGrid } from "@/components/landing/HighlightGrid"
import { CompetitionStages } from "@/components/landing/CompetitionStages"
import { CtaSection } from "@/components/landing/CtaSection"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-yec-paper selection:bg-yec-amber/30">
      <HeroSection />
      <EventIntro />
      <HighlightGrid />
      <CompetitionStages />
      <CtaSection />
    </main>
  )
}




