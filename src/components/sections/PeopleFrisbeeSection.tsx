"use client";

import React, { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";
import styles from "./PeopleFrisbeeSection.module.scss";

gsap.registerPlugin(useGSAP, MotionPathPlugin);

type Person = {
  id: string;
  name: string;
  img: string;
  // позиция человека на сцене (проценты от контейнера)
  x: string;
  y: string;
  scale?: number;
  // якорь руки (проценты от самого блока человека)
  handX: string;
  handY: string;
  // подпись софт-скилла
  tag?: string;
  tagSide?: "left" | "right" | "bottom";
  // текст попапа
  popup: string;
  // Новые опциональные поля для координат попапа
  popupX?: string;
  popupY?: string;
};

const peopleData: Person[] = [
  {
    id: "p1",
    name: "Скорость принятия решений",
    img: "/images/p1.svg",
    x: "13%",
    y: "50%",
    scale: 1,
    handX: "93%",
    handY: "3%",
    tag: "СКОРОСТЬ ПРИНЯТИЯ РЕШЕНИЙ",
    tagSide: "right",
    popup:
      "Вам подойдёт активность, которая тренирует тело быстро реагировать на сигналы извне. В алтимат фрисби игрок может держать диск в руках только 10 секунд (соперник считает их вслух). За это время нужно быстро оценить ситуацию, выбрать адресата и сделать пас. Иначе диск переходит команде соперников.",
    popupX: "180%",
    popupY: "50%",
  },
  {
    id: "p2",
    name: "Стрессоустойчивость",
    img: "/images/p2.svg",
    x: "45%",
    y: "50%",
    scale: 1.02,
    handX: "100%",
    handY: "10%",
    tag: "СТРЕССО-УСТОЙЧИВОСТЬ",
    tagSide: "right",
    popup:
      "Вам подойдёт активность, которая тренирует тело быстро реагировать на сигналы извне. В алтимат фрисби игрок может держать диск в руках только 10 секунд (соперник считает их вслух). За это время нужно быстро оценить ситуацию, выбрать адресата и сделать пас. Иначе диск переходит команде соперников.",
    popupX: "190%",
    popupY: "50%",
  },
  {
    id: "p3",
    name: "Умение договариваться",
    img: "/images/p3.svg",
    x: "77%",
    y: "44%",
    scale: 1,
    handX: "7%",
    handY: "4%",
    tag: "УМЕНИЕ ДОГОВАРИВАТЬСЯ",
    tagSide: "right",
    popup:
      "Вам подойдёт активность, которая тренирует тело быстро реагировать на сигналы извне. В алтимат фрисби игрок может держать диск в руках только 10 секунд (соперник считает их вслух). За это время нужно быстро оценить ситуацию, выбрать адресата и сделать пас. Иначе диск переходит команде соперников.",
  },
  {
    id: "p4",
    name: "Командная работа",
    img: "/images/p4.svg",
    x: "26%",
    y: "90%",
    scale: 1,
    handX: "95%",
    handY: "46%",
    tag: "КОМАНДНАЯ РАБОТА",
    tagSide: "right",
    popup:
      "Вам подойдёт активность, которая тренирует тело быстро реагировать на сигналы извне. В алтимат фрисби игрок может держать диск в руках только 10 секунд (соперник считает их вслух). За это время нужно быстро оценить ситуацию, выбрать адресата и сделать пас. Иначе диск переходит команде соперников.",
  },
  {
    id: "p5",
    name: "Спонтанная физическая активность",
    img: "/images/p5.svg",
    x: "70%",
    y: "90%",
    scale: 1,
    handX: "8%",
    handY: "18%",
    tag: "СТРАТЕГИЧЕСКОЕ МЫШЛЕНИЕ",
    tagSide: "right",
    popup:
      "Вам подойдёт активность, которая тренирует тело быстро реагировать на сигналы извне. В алтимат фрисби игрок может держать диск в руках только 10 секунд (соперник считает их вслух). За это время нужно быстро оценить ситуацию, выбрать адресата и сделать пас. Иначе диск переходит команде соперников.",
  },
];

export const PeopleFrisbeeSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const discRef = useRef<HTMLImageElement | null>(null);
  const anchorRefs = useRef<(HTMLDivElement | null)[]>([]);

  const people = useMemo(() => peopleData, []);
  // у кого сейчас тарелка (по умолчанию у 1-го)
  const [holder, setHolder] = useState(0);
  const [activePopup, setActivePopup] = useState<number | null>(0); // попап сразу у первого
  const [flying, setFlying] = useState(false);

  const placeDiscAt = (i: number) => {
    const overlay = overlayRef.current;
    const disc = discRef.current;
    const a = anchorRefs.current[i];

    if (!overlay || !disc || !a) return;
    const or = overlay.getBoundingClientRect();
    const ar = a.getBoundingClientRect();

    const dx = ar.left + ar.width / 2 - or.left;
    const dy = ar.top + ar.height / 2 - or.top;

    const dw = disc.width || 58;
    const dh = disc.height || 27;

    gsap.set(disc, {
      x: dx - dw / 2,
      y: dy - dh / 2,
      rotation: 0,
      force3D: true,
    });
  };

  useGSAP(
    () => {
      const img = discRef.current;
      if (img && !img.complete) {
        const onLoad = () => placeDiscAt(holder);
        img.addEventListener("load", onLoad, { once: true });
      } else {
        placeDiscAt(holder);
      }

      const handleResize = () => placeDiscAt(holder);
      const ro = new ResizeObserver(handleResize);
      if (overlayRef.current) ro.observe(overlayRef.current);
      if (sectionRef.current) ro.observe(sectionRef.current);
      window.addEventListener("resize", handleResize);

      return () => {
        ro.disconnect();
        window.removeEventListener("resize", handleResize);
      };
    },
    { scope: sectionRef, dependencies: [holder] }
  );

  const flyTo = (targetIndex: number) => {
    if (flying || targetIndex === holder) return;
    setFlying(true);
    setActivePopup(null);

    const overlay = overlayRef.current!;
    const disc = discRef.current!;
    const startA = anchorRefs.current[holder]!;
    const endA = anchorRefs.current[targetIndex]!;

    const or = overlay.getBoundingClientRect();
    const sr = startA.getBoundingClientRect();
    const er = endA.getBoundingClientRect();

    const start = {
      x: sr.left + sr.width / 2 - or.left,
      y: sr.top + sr.height / 2 - or.top,
    };
    const end = {
      x: er.left + er.width / 2 - or.left,
      y: er.top + er.height / 2 - or.top,
    };

    const dw = disc.width || 58;
    const dh = disc.height || 27;

    gsap.set(disc, { x: start.x - dw / 2, y: start.y - dh / 2 });

    const ctrl = {
      x: (start.x + end.x) / 2,
      y: Math.min(start.y, end.y) - 140, // высота дуги
    };

    gsap.to(disc, {
      duration: 0.8,
      ease: "power2.out",
      motionPath: {
        path: [
          { x: start.x - dw / 2, y: start.y - dh / 2 },
          { x: ctrl.x - dw / 2, y: ctrl.y - dh / 2 },
          { x: end.x - dw / 2, y: end.y - dh / 2 },
        ],
        curviness: 1.2,
        autoRotate: false,
      },
      onComplete: () => {
        setHolder(targetIndex);
        setFlying(false);
        setActivePopup(targetIndex);
        placeDiscAt(targetIndex);
      },
    });
  };

  // --- НАЧАЛО ИЗМЕНЕНИЙ ---
  // Получаем данные для активного попапа, чтобы отрендерить его отдельно
  const activePersonData =
    activePopup !== null ? people[activePopup] : null;
  // --- КОНЕЦ ИЗМЕНЕНИЙ ---

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.stage}>
        <div className={styles.header}>
          <p className={styles.headerText}>
            Вы разобрались, какие гибкие навыки у вас уже развиты, а над чем
            можно <br /> ещё поработать. Давайте выясним, какие виды физической
            нагрузки вам <br /> в этом помогут. Нажимайте на гибкий навык, который
            хотели бы развить.
          </p>
        </div>

        <div className={styles.overlay} ref={overlayRef} aria-hidden>
          <img
            ref={discRef}
            className={styles.disc}
            src="/images/frisbee-mini.svg"
            alt=""
            draggable={false}
          />
        </div>

        <div className={styles.board}>
          {people.map((p, i) => (
            <div
              key={p.id}
              className={styles.person}
              style={
                {
                  ["--x" as any]: p.x,
                  ["--y" as any]: p.y,
                  ["--scale" as any]: p.scale ?? 1,
                  ["--ax" as any]: p.handX,
                  ["--ay" as any]: p.handY,
                } as React.CSSProperties
              }
            >
              <img
                className={styles.photo}
                src={p.img}
                alt={p.name}
                draggable={false}
              />

              <div
                className={styles.anchor}
                ref={(el) => {
                  anchorRefs.current[i] = el;
                }}
                aria-hidden
              />

              {p.tag && (
                <div
                  className={`${styles.tag} ${
                    p.tagSide ? styles[`tag_${p.tagSide}`] : styles.tag_right
                  }`}
                >
                  {p.tag}
                </div>
              )}

              {holder !== i && (
                <button
                  className={styles.glow}
                  onClick={() => flyTo(i)}
                  aria-label={`Передать тарелку: ${p.name}`}
                />
              )}

              {/* Попап был удален отсюда */}
            </div>
          ))}
        </div>

        {/* --- НАЧАЛО ИЗМЕНЕНИЙ --- */}
        {/* Рендерим активный попап здесь, НАД всеми остальными элементами сцены */}
        {activePersonData && (
          <div
            className={styles.popupContainer}
            style={
              {
                ["--x" as any]: activePersonData.x,
                ["--y" as any]: activePersonData.y,
              } as React.CSSProperties
            }
          >
            <div
              className={styles.popup}
              style={
                {
                  ["--popup-x" as any]: activePersonData.popupX,
                  ["--popup-y" as any]: activePersonData.popupY,
                } as React.CSSProperties
              }
            >
              <div className={styles.popupTitle}>{activePersonData.name}</div>
              <div className={styles.popupText}>{activePersonData.popup}</div>
              <button
                className={styles.popupClose}
                onClick={() => setActivePopup(null)}
                aria-label="Закрыть"
              >
                <img src="/images/close.svg" alt="" />
              </button>
            </div>
          </div>
        )}
        {/* --- КОНЕЦ ИЗМЕНЕНИЙ --- */}
      </div>
    </section>
  );
};