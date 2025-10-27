"use client";

import React, { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import styles from "./MythsDragSection.module.scss";

gsap.registerPlugin(useGSAP, ScrollTrigger, Draggable);

type Expert = {
  name: string;
  role: string;
  photo?: string;
  answer: string;
};

type Myth = {
  id: string;
  title: string; // "МИФ №1"
  text: string; // сам миф
  expert: Expert;
};

const mythsData: Myth[] = [
  {
    id: "1",
    title: "МИФ №1",
    text: "Спорт — это дополнительная нагрузка для организма, её не стоит добавлять к стрессу на работе",
    expert: {
      name: "Алёна Виноградова",
      role: "тренер школы Springle",
      photo: "/images/ava.png",
      answer:
        "Правильная нагрузка — это всегда двойной эффект. Мы тренируем не только мышцы, но и нервную систему, учим её справляться со стрессом и эффективно управлять ресурсами тела. Спорт — хороший способ перезагрузки: он преобразует накопленный стресс в физическую усталость, в конце — выброс дофамина и чувство спокойствия.",
    },
  },
  {
    id: "2",
    title: "МИФ №2",
    text: "Вечерние тренировки после работы мешают сну и делают меня менее продуктивным",
    expert: {
      name: "Артём Козлов",
      role: "тренер школы Springle",
      photo: "/images/ava.png",
      answer:
        "Время тренировки — индивидуально. Лёгкая/средняя нагрузка вечером улучшает качество сна у большинства людей. Важно корректно подбирать интенсивность и завершать тренировку минимум за 2–3 часа до сна.",
    },
  },
  {
    id: "3",
    title: "МИФ №3",
    text: "Без 60 минут в зале нет смысла — лучше вообще не начинать",
    expert: {
      name: "Марина Соколова",
      role: "тренер школы Springle",
      photo: "/images/ava.png",
      answer:
        "10–20 минут регулярного движения уже дают эффект: улучшают концентрацию, настроение и здоровье. Привычку строят маленькие шаги, а не разовые подвиги.",
    },
  },
];

export const MythsDragSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const playgroundRef = useRef<HTMLDivElement | null>(null);

  const dragCardRef = useRef<HTMLDivElement | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);
  const answerRef = useRef<HTMLDivElement | null>(null);

  const [index, setIndex] = useState(0);
  const [answeredIdx, setAnsweredIdx] = useState<number | null>(null);

  const myths = useMemo(() => mythsData, []);

  useGSAP(
    () => {
      const intro = introRef.current!;
      const play = playgroundRef.current!;

      gsap.set(play, { opacity: 0, y: 24 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current!,
            start: "top 70%",
            end: "top 20%",
            scrub: true,
          },
        })
        .to(intro, { opacity: 0, y: -10, ease: "none" })
        .to(play, { opacity: 1, y: 0, ease: "none" }, "<");

      // Draggable на левой карточке
      const card = dragCardRef.current!;
      const zone = dropZoneRef.current!;

      const isOverZone = () => {
        const cr = card.getBoundingClientRect();
        const zr = zone.getBoundingClientRect();
        const cx = cr.left + cr.width / 2;
        const cy = cr.top + cr.height / 2;
        return (
          cx >= zr.left && cx <= zr.right && cy >= zr.top && cy <= zr.bottom
        );
      };

      const onDropSuccess = () => {
        // Показать ответ эксперта справа (flip-in)
        setAnsweredIdx(index);

        // Спрятать текущую карточку и вернуть в исходную позицию
        gsap
          .timeline()
          .to(card, {
            opacity: 0,
            scale: 0.95,
            duration: 0.22,
            ease: "power2.out",
          })
          .set(card, { x: 0, y: 0 })
          .call(() => {
            // следующий миф
            setIndex((i) => Math.min(i + 1, myths.length - 1));
          })
          .to(card, {
            opacity: 1,
            scale: 1,
            duration: 0.28,
            ease: "power2.out",
          });

        // анимация появления ответа справа
        const ans = answerRef.current!;
        gsap.killTweensOf(ans);
        gsap.fromTo(
          ans,
          {
            rotateY: 90,
            opacity: 0,
            transformPerspective: 900,
            transformOrigin: "50% 50%",
          },
          { rotateY: 0, opacity: 1, duration: 0.55, ease: "power2.out" }
        );
      };

      const dr = Draggable.create(card, {
        type: "x,y",
        edgeResistance: 0.2,
        bounds: sectionRef.current!,
        onDrag() {
          if (isOverZone()) zone.classList.add(styles.active);
          else zone.classList.remove(styles.active);
        },
        onDragEnd() {
          zone.classList.remove(styles.active);
          if (isOverZone()) onDropSuccess();
          else
            gsap.to(card, { x: 0, y: 0, duration: 0.25, ease: "power2.out" });
        },
      })[0];

      const ro = new ResizeObserver(() => dr.applyBounds(sectionRef.current!));
      ro.observe(sectionRef.current!);

      return () => {
        ro.disconnect();
        dr.kill();
        ScrollTrigger.getAll().forEach((s) => s.kill());
      };
    },
    { scope: sectionRef, dependencies: [index, myths.length] }
  );

  const current = myths[index];
  const answered = answeredIdx !== null ? myths[answeredIdx] : null;

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* Этап 1: интро-текст */}
      <div ref={introRef} className={styles.intro}>
        <h2 className={styles.title}>
          Очень хочется делать силовые каждый день
        </h2>
        <p className={styles.subtitle}>
          как Джефф Безос, однако между намерением и действием часто появляется
          надоедливое «но».
        </p>
        <p className={styles.lead}>
          Давайте вместе с тренерами школы Springle разберём мифы, которые
          мешают вам сделать занятия спортом лёгкой привычкой.
        </p>
      </div>

      {/* Этап 2: playground с перетаскиванием */}
      <div ref={playgroundRef} className={styles.playground}>
        {/* Левая карточка: миф (draggable) */}
        <div className={styles.left}>
          <div className={styles.card} ref={dragCardRef}>
            <div className={styles.cardInner}>
              <div className={styles.cardLabel}>{current.title}</div>
              <div className={styles.cardText}>{current.text}</div>
            </div>
          </div>
        </div>

        {/* Правая зона: drop area / ответ эксперта */}
        <div className={styles.right}>
          <div className={styles.dropZone} ref={dropZoneRef}>
            {answered ? (
              <div className={styles.answer} ref={answerRef}>
                <div className={styles.expertHeader}>
                  {answered.expert.photo ? (
                    <img
                      className={styles.avatar}
                      src={answered.expert.photo}
                      alt={answered.expert.name}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder} />
                  )}
                  <div>
                    <div className={styles.expertName}>
                      {answered.expert.name}
                    </div>
                    <div className={styles.expertRole}>
                      {answered.expert.role}
                    </div>
                  </div>
                </div>
                <div className={styles.answerText}>
                  {answered.expert.answer}
                </div>
              </div>
            ) : (
              <div className={styles.dropHint}>
                <img className={styles.cursor} src="/images/cursor.svg" alt="" />
                Перетащите миф в экспертное поле, чтобы развеять его
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
