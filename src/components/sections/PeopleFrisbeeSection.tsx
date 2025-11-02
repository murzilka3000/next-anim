"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";
import styles from "./PeopleFrisbeeSection.module.scss";

gsap.registerPlugin(useGSAP, MotionPathPlugin);

type Person = {
  id: string;
  name: string;
  img: string;
  x: string;
  y: string;
  scale?: number;
  handX: string;
  handY: string;
  tag?: string;
  tagSide?: "left" | "right" | "bottom";
  popup: string;
  popupX?: string;
  popupY?: string;
};

const peopleData: Person[] = [
  {
    id: "p1",
    name: "Скорость принятия решений",
    img: "/images/p1.svg",
    x: "17%",
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
  const mImgRefs = useRef<(HTMLImageElement | null)[]>([]);

  const people = useMemo(() => peopleData, []);
  const [holder, setHolder] = useState(0);
  const [activePopup, setActivePopup] = useState<number | null>(0);
  const [flying, setFlying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.matchMedia("(max-width: 871px)").matches);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => {
      window.removeEventListener("resize", checkDevice);
    };
  }, []);

  const toUnit = (v: string) => {
    const n = parseFloat(v);
    return isFinite(n) ? n / (v.toString().includes("%") ? 100 : 1) : 0.5;
  };

  const getAnchorCenter = (i: number) => {
    const overlay = overlayRef.current!;
    const or = overlay.getBoundingClientRect();

    if (isMobile && mImgRefs.current[i]) {
      const img = mImgRefs.current[i]!;
      const ir = img.getBoundingClientRect();
      const ax = toUnit(people[i].handX);
      const ay = toUnit(people[i].handY);
      const px = ir.left + ir.width * ax - or.left;
      const py = ir.top + ir.height * ay - or.top;
      return { x: px, y: py };
    }

    const a = anchorRefs.current[i];
    if (a) {
      const ar = a.getBoundingClientRect();
      return {
        x: ar.left + ar.width / 2 - or.left,
        y: ar.top + ar.height / 2 - or.top,
      };
    }

    return { x: or.width / 2, y: or.height / 2 };
  };

  const placeDiscAt = (i: number) => {
    const disc = discRef.current;
    const overlay = overlayRef.current;
    if (!disc || !overlay) return;

    const c = getAnchorCenter(i);
    const dw = disc.width || 58;
    const dh = disc.height || 27;

    gsap.set(disc, {
      x: c.x - dw / 2,
      y: c.y - dh / 2,
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
        requestAnimationFrame(() => placeDiscAt(holder));
      }

      const handleResize = () =>
        requestAnimationFrame(() => placeDiscAt(holder));
      const ro = new ResizeObserver(handleResize);
      if (overlayRef.current) ro.observe(overlayRef.current);
      if (sectionRef.current) ro.observe(sectionRef.current);
      window.addEventListener("resize", handleResize);

      return () => {
        ro.disconnect();
        window.removeEventListener("resize", handleResize);
      };
    },
    { scope: sectionRef, dependencies: [holder, isMobile] }
  );

  const flyTo = (targetIndex: number) => {
    if (flying || targetIndex === holder) return;
    setFlying(true);
    setActivePopup(null);

    const overlay = overlayRef.current!;
    const disc = discRef.current!;

    const startC = getAnchorCenter(holder);
    const endC = getAnchorCenter(targetIndex);

    const dw = disc.width || 58;
    const dh = disc.height || 27;

    gsap.set(disc, { x: startC.x - dw / 2, y: startC.y - dh / 2 });

    const ctrl = {
      x: (startC.x + endC.x) / 2,
      y: Math.min(startC.y, endC.y) - 140,
    };

    gsap.to(disc, {
      duration: 0.8,
      ease: "power2.out",
      motionPath: {
        path: [
          { x: startC.x - dw / 2, y: startC.y - dh / 2 },
          { x: ctrl.x - dw / 2, y: ctrl.y - dh / 2 },
          { x: endC.x - dw / 2, y: endC.y - dh / 2 },
        ],
        curviness: 1.2,
        autoRotate: false,
      },
      onComplete: () => {
        setHolder(targetIndex);
        setFlying(false);
        if (!isMobile) setActivePopup(targetIndex);
        placeDiscAt(targetIndex);
      },
    });
  };

  const activePersonData = activePopup !== null ? people[activePopup] : null;

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.stage}>
        <div className={styles.header}>
          <p className={styles.headerText}>
            Вы разобрались, какие гибкие навыки у вас уже развиты, а над чем
            можно <br /> ещё поработать. Давайте выясним, какие виды физической
            нагрузки вам <br /> в этом помогут. Нажимайте на гибкий навык,
            который хотели бы развить.
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

              <button
                className={styles.glow}
                onClick={() => flyTo(i)}
                aria-label={`Передать тарелку: ${p.name}`}
              />
            </div>
          ))}
        </div>

        <div className={styles.mobileGrid}>
          {people.map((p, i) => {
            const reversed = i % 2 === 1;
            return (
              <div
                key={`m-${p.id}`}
                className={`${styles.mobileRow} ${
                  reversed ? styles.mobileRowReverse : ""
                }`}
              >
                <div className={styles.mobileImgCol}>
                  <img
                    src={p.img}
                    alt={p.name}
                    className={styles.mobileImg}
                    ref={(el) => {
                      mImgRefs.current[i] = el;
                    }}
                    onClick={() => flyTo(i)}
                  />
                  {p.tag && <div className={styles.mobileSkill}>{p.tag}</div>}
                </div>
                <div className={styles.mobileCardCol}>
                  <div className={styles.mobileCard}>
                    <div className={styles.mobileCardTitle}>{p.name}</div>
                    <div className={styles.mobileCardText}>{p.popup}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {activePersonData && !isMobile && (
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
      </div>
    </section>
  );
};
