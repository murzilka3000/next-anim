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
  image?: string;
};

const cards: Card[] = [
  {
    id: "1",
    name: "Марк Цукерберг",
    subtitle: "Бразильское джиу-джитсу",
    image: "/images/mark.svg",
  },
  {
    id: "2",
    name: "Роман Абрамович",
    subtitle: "Яхтинг",
    image: "/images/mark-2.svg",
  },
  {
    id: "3",
    name: "Владимир Потанин",
    subtitle: "Горные лыжи",
    image: "/images/mark-3.svg",
  },
  {
    id: "4",
    name: "Опра Уинфри",
    subtitle: "Бег",
    image: "/images/mark-4.svg",
  },
  {
    id: "5",
    name: "Джефф Безос",
    subtitle: "Силовые тренировки",
    image: "/images/mark-5.svg",
  },
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

      const computeDelta = () => {
        const total = track.scrollWidth;
        const visible = viewport.clientWidth;
        return Math.max(0, total - visible);
      };

      const mm = gsap.matchMedia();
      let tween: gsap.core.Tween | null = null;
      let ro: ResizeObserver | null = null;

      mm.add("(min-width: 1112px)", () => {
        const init = () => {
          // сброс на всякий случай
          if (tween) {
            tween.scrollTrigger?.kill();
            tween.kill();
            tween = null;
          }
          gsap.set(track, { x: 0 });

          const delta = computeDelta();
          if (delta <= 0) {
            ScrollTrigger.refresh();
            return;
          }

          tween = gsap.to(track, {
            x: -delta,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${delta + 200}`,
              pin: true,
              pinSpacing: true,
              scrub: 1,
              anticipatePin: 1,
              pinType: "fixed",
              onToggle: (self) => {
                section.classList.toggle(styles.isPinned, self.isActive);
              },
            },
          });

          // обновим расчёты после инициализации
          gsap.delayedCall(0, () => ScrollTrigger.refresh());
        };

        init();

        ro = new ResizeObserver(() => {
          init();
          ScrollTrigger.refresh();
        });
        ro.observe(viewport);
        ro.observe(track);
        ro.observe(document.documentElement);

        // cleanup для этого брейкпоинта
        return () => {
          if (ro) {
            ro.disconnect();
            ro = null;
          }
          if (tween) {
            tween.scrollTrigger?.kill();
            tween.kill();
            tween = null;
          }
          // на выходе очищаем трансформации
          gsap.set(track, { clearProps: "transform" });
          section.classList.remove(styles.isPinned);
        };
      });

      // Мобильный/узкий: нативный горизонтальный скролл
      mm.add("(max-width: 1111px)", () => {
        // убить возможный десктопный твин и сбросить transform
        if (tween) {
          tween.scrollTrigger?.kill();
          tween.kill();
          tween = null;
        }
        gsap.set(track, { x: 0, clearProps: "transform" });
        section.classList.remove(styles.isPinned);

        // Ничего больше не инициализируем — скролл нативный
        return () => {
          // no-op
        };
      });

      return () => {
        mm.revert();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <div>
            <h2 className={styles.kicker}>СПОРТ</h2>
            <p className={styles.subhead}>
              — это не только про <br /> физическую форму.
            </p>
            <p className={styles.lead}>
              Он повышает качество жизни и даёт <br /> силы для самореализации в
              бизнесе.
            </p>
          </div>
          <p className={styles.note}>
            Листайте профайлы известных предпринимателей, чтобы <br /> узнать,
            из какой физической нагрузки они черпают энергию.
          </p>
        </div>

        <div className={styles.right}>
          <div className={styles.viewport} ref={viewportRef}>
            <ul className={styles.track} ref={trackRef}>
              {cards.map((c) => (
                <li key={c.id} className={styles.card}>
                  <div className={styles.cardInner}>
                    <div
                      className={styles.portrait}
                      style={
                        c.image
                          ? { backgroundImage: `url(${c.image})` }
                          : undefined
                      }
                    >
                      <div className={styles.caption}>
                        <div className={styles.name}>{c.name}</div>
                        <div className={styles.subtitle}>{c.subtitle}</div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className={`${styles.note} ${styles.note_mob}`}>
          Листайте профайлы известных предпринимателей, чтобы <br /> узнать, из
          какой физической нагрузки они черпают энергию.
        </p>
      </div>
    </section>
  );
};
