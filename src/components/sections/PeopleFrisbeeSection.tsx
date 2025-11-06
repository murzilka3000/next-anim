"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";
import styles from "./PeopleFrisbeeSection.module.scss";

gsap.registerPlugin(useGSAP, MotionPathPlugin);

// ===== NBSP обработчик (висячие предлоги/союзы/частицы) =====
const IGNORE_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "CODE",
  "PRE",
  "KBD",
  "SAMP",
  "TEXTAREA",
  "NOSCRIPT",
]);

// Список коротких слов: предлоги/союзы/частицы и т.п.
const SHORT =
  "(?:в|к|с|у|о|и|а|но|да|на|по|за|из|от|до|об|обо|во|со|ко|не|ни|же|ли|бы)";

// NBSP после коротких предлогов/союзов/частиц
const RX_AFTER_SHORT = new RegExp(
  `(^|[\\s(«„"'])(${SHORT})\\s+(?=[\\p{L}\\d])`,
  "giu"
);

// NBSP перед последним коротким словом в текстовом фрагменте
const RX_BEFORE_LAST_SHORT = new RegExp(
  `(\\S)\\s(${SHORT})([.!?:,…»"')\\]]*\\s*$)`,
  "giu"
);

function fixText(s: string): string {
  if (!s) return s;
  let t = s.replace(RX_AFTER_SHORT, "$1$2\u00A0");
  t = t.replace(RX_BEFORE_LAST_SHORT, "$1\u00A0$2$3");
  return t;
}

function processTextNodes(root: Node) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentNode as HTMLElement | null;
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (IGNORE_TAGS.has(parent.nodeName)) return NodeFilter.FILTER_REJECT;
      if (parent.isContentEditable || parent.closest?.("[contenteditable]"))
        return NodeFilter.FILTER_REJECT;
      if (parent.closest?.("[data-nbsp-skip]")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  for (const n of nodes) {
    const next = fixText(n.nodeValue || "");
    if (next !== n.nodeValue) n.nodeValue = next;
  }
}
// ===== конец NBSP блока =====

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

  // Новое поле: ширина блока .person в пикселях (индивидуально)
  widthPx?: number;
};

const peopleData: Person[] = [
  {
    id: "p1",
    name: "Спонтанная физическая активность",
    img: "/images/p1.svg",
    x: "17%",
    y: "50%",
    scale: 1,
    handX: "93%",
    handY: "3%",
    tag: "Скорость принятия решений",
    tagSide: "right",
    popup:
      "Вам подойдёт активность, которая тренирует тело быстро реагировать на сигналы извне. В алтимат фрисби игрок может держать диск в руках только 10 секунд (соперник считает их вслух). За это время нужно быстро оценить ситуацию, выбрать адресата и сделать пас. Иначе диск переходит команде соперников.",
    popupX: "95%",
    popupY: "-40%",
    widthPx: 180, // ← можно менять под конкретный блок
  },
  {
    id: "p2",
    name: "Спортивное соревнование",
    img: "/images/p2.svg",
    x: "45%",
    y: "60%",
    scale: 1.02,
    handX: "93%",
    handY: "11%",
    tag: "Стрессо-устойчивость",
    tagSide: "right",
    popup:
      "Выбирайте физическую нагрузку, в которой присутствует соревновательный элемент. В любом соревновании есть конфликт интересов, который важно урегулировать справедливо. Обычно это делают судьи. Но в алтимат фрисби эту роль на себя берут игроки: все спорные ситуации разрешаются командами прямо на поле, а по итогу команда с самой честной игрой получает награду «Дух игры».",
    popupX: "75%",
    popupY: "0%",
    widthPx: 210,
  },
  {
    id: "p3",
    name: "Командный спорт",
    img: "/images/p3.svg",
    x: "77%",
    y: "44%",
    scale: 1,
    handX: "22%",
    handY: "4%",
    tag: "Умение договариваться",
    tagSide: "right",
    popup:
      "В командных видах спорта победа зависит не от одного игрока, а от взаимодействия всей команды. Например, в алтимат фрисби играют в командах от 3 до 7 человек. Чтобы забить гол, нужно сделать несколько точных пасов и не потерять диск. Поэтому важно точно считывать намерения сокомандников и помогать друг другу.",
    popupX: "-80%",
    popupY: "60%",
    widthPx: 210,
  },
  {
    id: "p4",
    name: "Игра",
    img: "/images/p4.svg",
    x: "26%",
    y: "90%",
    scale: 1,
    handX: "95%",
    handY: "46%",
    tag: "Командная работа",
    tagSide: "right",
    popup:
      "Выбирайте физическую нагрузку, в которой есть игровая цель. Например, забить гол команде соперников – как в алтимат фрисби. В этой игре нет фиксированных ролей (как, например, в футболе): игрок может в один момент быть защитником, а в другой – атакующим. Это заставляет постоянно оценивать расстановку сил и принимать эффективные решения с учетом основной цели.",
    popupX: "100%",
    popupY: "-20%",
    widthPx: 250,
  },
  {
    id: "p5",
    name: "Бег",
    img: "/images/p5.svg",
    x: "70%",
    y: "90%",
    scale: 1,
    handX: "8%",
    handY: "18%",
    tag: "Стратегическое мышление",
    tagSide: "right",
    popup:
      "Выносливость хорошо развивают циклические виды физической нагрузки. Например, в алтимат фрисби игроки перемещаются по полю, чтобы поймать пас. Это может быть челночный бег для обхода игроков в защите или длинный забег, чтобы поймать диск в зоне противника.",
    popupX: "-100%",
    popupY: "00%",
    widthPx: 210,
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

  // NBSP: обработать все текстовые узлы внутри секции и отслеживать изменения
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    // первичная обработка
    processTextNodes(root);

    // наблюдаем за динамическими изменениями (попапы, тексты и т.п.)
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "characterData" && m.target.nodeType === Node.TEXT_NODE) {
          const t = m.target as Text;
          const next = fixText(t.nodeValue || "");
          if (next !== t.nodeValue) t.nodeValue = next;
        }
        for (const n of m.addedNodes) {
          if (n.nodeType === Node.TEXT_NODE) {
            const t = n as Text;
            const next = fixText(t.nodeValue || "");
            if (next !== t.nodeValue) t.nodeValue = next;
          } else if (n.nodeType === Node.ELEMENT_NODE) {
            processTextNodes(n);
          }
        }
      }
    });

    mo.observe(root, { childList: true, subtree: true, characterData: true });
    return () => mo.disconnect();
  }, []);

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

    // — Настройки более «плоской» дуги —
    const ARC_FACTOR = 0.08; // 0.05..0.10 — чем меньше, тем «тупее»
    const ARC_MIN = 28; // минимальный подъём дуги
    const ARC_MAX = 90; // максимальный подъём дуги
    const CURVINESS = 0.55; // 0.3..0.7 — меньше = прямее

    // Дистанция между точками
    const dx = endC.x - startC.x;
    const dy = endC.y - startC.y;
    const dist = Math.hypot(dx, dy);

    // Высота дуги (делаем её поменьше)
    const arc = gsap.utils.clamp(ARC_MIN, ARC_MAX, dist * ARC_FACTOR);

    // Контрольная точка: от середины отрезка отклоняемся перпендикулярно
    const mx = (startC.x + endC.x) / 2;
    const my = (startC.y + endC.y) / 2;
    const angle = Math.atan2(dy, dx);
    const nx = Math.cos(angle - Math.PI / 2) * arc;
    const ny = Math.sin(angle - Math.PI / 2) * arc;

    // Берём «верхнюю» из двух возможных перпендикулярных (чтобы дуга шла вверх)
    const c1 = { x: mx + nx, y: my + ny };
    const c2 = { x: mx - nx, y: my - ny };
    const ctrl = c1.y < c2.y ? c1 : c2;

    gsap.to(disc, {
      duration: 0.8,
      ease: "power2.out",
      motionPath: {
        path: [
          { x: startC.x - dw / 2, y: startC.y - dh / 2 },
          { x: ctrl.x - dw / 2, y: ctrl.y - dh / 2 },
          { x: endC.x - dw / 2, y: endC.y - dh / 2 },
        ],
        curviness: CURVINESS,
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
            {/* Текст обработается автоматически в эффекте */}
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
                  // Новое: индивидуальная ширина .person в пикселях
                  width: p.widthPx ? `${p.widthPx}px` : undefined,
                } as React.CSSProperties
              }
            >
              <img
                className={styles.photo}
                src={p.img}
                alt={fixText(p.name)}
                draggable={false}
                onClick={() => flyTo(i)}
                role="button"
                aria-label={fixText(`Передать тарелку: ${p.name}`)}
                style={{ cursor: "pointer" }}
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
                aria-label={fixText(`Передать тарелку: ${p.name}`)}
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
                    alt={fixText(p.name)}
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
                  ["--dx" as any]: activePersonData.popupX ?? "0",
                  ["--dy" as any]: activePersonData.popupY ?? "-8%",
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