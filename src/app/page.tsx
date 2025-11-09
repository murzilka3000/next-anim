import { HeroSection } from "@/components/sections/HeroSection"
import styles from "./page.module.css"
import { SportSection } from "@/components/sections/SportSection"
import { MythsDragSection } from "@/components/sections/MythsDragSection"
import { MotivationQuizSection } from "@/components/sections/MotivationQuizSection"
import { PeopleFrisbeeSection } from "@/components/sections/PeopleFrisbeeSection"
import Finish from "@/components/sections/Finish"
import { SlideGate } from "@/components/SlideGate"
import GsapSections from "@/components/GsapSections"

export default function HomePage() {
  return (
    <main className={styles.main}>
      <HeroSection />
      <SportSection />
      {/* <SlideGate thresholdPx={24} durationMs={1000}>
        <MythsDragSection />
        <MotivationQuizSection />
      </SlideGate> */}
      {/* <GsapSections /> */}
      <GsapSections enterTargetSelector=".right-col" debug>
        <section>
          <MythsDragSection />
        </section>
        <section>
          <MotivationQuizSection />
        </section>
      </GsapSections>
      <PeopleFrisbeeSection />
      <Finish />
    </main>
  )
}
