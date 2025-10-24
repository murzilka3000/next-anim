"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./SportSection.module.scss";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Card = {
  id: string;
  name: string;
  subtitle: string;
  image?: string; // путь к картинке, по желанию
};

const cards: Card[] = [
  { id: "1", name: "Марк Цукерберг", subtitle: "Бразильское джиу-джитсу", image: "/images/people/mark.png" },
  { id: "2", name: "Роман Абрамович", subtitle: "Футбол", image: "/images/people/roman.png" },
  { id: "3", name: "Сергей Брин", subtitle: "Прыжки с парашютом", image: "/images/people/sergey.png" },
  { id: "4", name: "Опра Уинфри", subtitle: "Йога", image: "/images/people/oprah.png" },
  { id: "5", name: "Илон Маск", subtitle: "Тяжёлая атлетика", image: "/images/people/elon.png" },
];

export const SportSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLUListElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current!;
      const viewport = viewportRef.current!;
      const track = trackRef.current!;
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

      // Считаем ширину дорожки и viewport
      const compute = () => {
        const total = track.scrollWidth;          // полная ширина контента
        const visible = viewport.clientWidth;     // ширина видимой области справа
        const delta = Math.max(0, total - visible);
        return { total, visible, delta };
      };

      let tween: gsap.core.Tween | null = null;
      let st: ScrollTrigger | null = null;

      const init = () => {
        const { delta } = compute();

        // Если горизонтального скролла не хватает — просто выходим
        if (delta <= 0 || reduce) return;

        // Сбрасываем текущий трансформ
        gsap.set(track, { x: 0 });

        // Пин и горизонтальный скролл
        tween = gsap.to(track, {
          x: -delta,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${delta + 200}`, // расстояние прокрутки внутри секции
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        st = tween.scrollTrigger!;
      };

      init();

      // Пересчёт при ресайзе
      const ro = new ResizeObserver(() => {
        if (tween) tween.kill();
        if (st) st.kill();
        init();
      });
      ro.observe(viewport);
      ro.observe(track);
      ro.observe(document.documentElement);

      return () => {
        ro.disconnect();
        if (tween) tween.kill();
        if (st) st.kill();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.inner}>
        {/* Левый текст */}
        <div className={styles.left}>
          <h2 className={styles.kicker}>СПОРТ</h2>
          <p className={styles.subhead}>— это не только про физическую форму.</p>
          <p className={styles.lead}>
            Он повышает качество жизни и даёт силы для самореализации в бизнесе.
          </p>
          <p className={styles.note}>
            Листая профайлы известных предпринимателей, чтобы узнать, из какой физической нагрузки
            они черпают энергию.
          </p>
        </div>

        {/* Правый горизонтальный слайдер */}
        <div className={styles.right}>
          <div className={styles.viewport} ref={viewportRef}>
            <ul className={styles.track} ref={trackRef}>
              {cards.map((c) => (
                <li key={c.id} className={styles.card}>
                  <div className={styles.cardInner}>
                    {/* Картинка (опционально) */}
                    {c.image ? (
                      <img className={styles.portrait} src={c.image} alt={c.name} />
                    ) : (
                      <div className={styles.placeholder} />
                    )}

                    <div className={styles.caption}>
                      <div className={styles.name}>{c.name}</div>
                      <div className={styles.subtitle}>{c.subtitle}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};