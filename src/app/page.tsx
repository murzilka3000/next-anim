import { HeroSection } from '@/components/sections/HeroSection';
import styles from './page.module.css';
import { SportSection } from '@/components/sections/SportSection';

export default function HomePage() {
  return (
    <main className={styles.main}>
      <HeroSection />

      <SportSection/>
    </main>
  );
}