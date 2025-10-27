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
    subtitle: "Футбол",
    image: "/images/mark.svg",
  },
  {
    id: "3",
    name: "Сергей Брин",
    subtitle: "Прыжки с парашютом",
    image: "/images/mark.svg",
  },
  {
    id: "4",
    name: "Опра Уинфри",
    subtitle: "Йога",
    image: "/images/mark.svg",
  },
  {
    id: "5",
    name: "Илон Маск",
    subtitle: "Тяжёлая атлетика",
    image: "/images/mark.svg",
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

      const compute = () => {
        const total = track.scrollWidth;
        const visible = viewport.clientWidth;
        const delta = Math.max(0, total - visible);
        return { delta };
      };

      let tween: gsap.core.Tween | null = null;

      const init = () => {
        const { delta } = compute();
        if (delta <= 0) return;

        gsap.set(track, { x: 0 });

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
      };

      init();

      const ro = new ResizeObserver(() => {
        if (tween) {
          tween.scrollTrigger?.kill();
          tween.kill();
          tween = null;
        }
        init();
      });
      ro.observe(viewport);
      ro.observe(track);
      ro.observe(document.documentElement);

      return () => {
        ro.disconnect();
        if (tween) {
          tween.scrollTrigger?.kill();
          tween.kill();
        }
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
      </div>
    </section>
  );
};
