import { HeroSection } from '@/components/sections/HeroSection';
import styles from './page.module.css';
import { SportSection } from '@/components/sections/SportSection';
import { MythsDragSection } from '@/components/sections/MythsDragSection';
import { MotivationQuizSection } from '@/components/sections/MotivationQuizSection';
import { PeopleFrisbeeSection } from '@/components/sections/PeopleFrisbeeSection';

export default function HomePage() {
  return (
    <main className={styles.main}>
      <HeroSection />

      <SportSection/>
      <MythsDragSection/>
      <MotivationQuizSection/>
      <PeopleFrisbeeSection/>
    </main>
  );
}