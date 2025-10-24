import { HeroSection } from '@/components/sections/HeroSection';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.main}>
      <HeroSection />

      {/* Это следующая секция, которая появится после анимации */}
      <section className={styles.nextSection}>
        <h2>Следующий блок</h2>
        <p>Анимация завершена, и вы доскроллили сюда.</p>
      </section>
    </main>
  );
}