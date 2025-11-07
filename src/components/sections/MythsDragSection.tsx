"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import styles from "./MythsDragSection.module.scss";

// Swiper (мобильный режим)
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Mousewheel, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

gsap.registerPlugin(useGSAP, ScrollTrigger, Draggable);

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
      if (!node.nodeValue || !node.nodeValue.trim())
        return NodeFilter.FILTER_REJECT;
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

type Expert = {
  name: string;
  role: string;
  photo?: string;
  answer: string;
};

type Myth = {
  id: string;
  title: string;
  text: string;
  expert: Expert;
};

const mythsData: Myth[] = [
  {
    id: "1",
    title: "МИФ №1",
    text: "Чтобы получить хоть какой-то результат, нужно заниматься спортом почти каждый день.",
    expert: {
      name: "Ксения Ясалова",
      role: "тренер школы Springle",
      photo: "/images/p-1.svg",
      answer:
        "В этом деле важнее регулярность. Лучше в вашем расписании будет одна тренировка, но каждую неделю, чем четыре тренировки за раз, а потом вы забросите занятия на месяц. По моему опыту, одного-двух раз в неделю достаточно для старта, а дальше уже можно добавить дополнительную нагрузку.",
    },
  },
  {
    id: "2",
    title: "МИФ №2",
    text: "Вечерние тренировки после работы мешают сну и менее продуктивны.",
    expert: {
      name: "Андрей Матрусов",
      role: "тренер школы Springle",
      photo: "/images/p-2.svg",
      answer:
        "Здесь важно не впадать в крайности и адекватно оценивать свои силы. С одной стороны, не стоит планировать сложные тренировки на выносливость утром, если после у вас планируется насыщенный день. С другой, плохо заканчивать вечернюю тренировку слишком поздно. После тренировки нужно заложить время на то, чтобы успокоиться ментально и физически – часа полтора-два.",
    },
  },
  {
    id: "3",
    title: "МИФ №3",
    text: "Спорт – это дополнительная нагрузка для организма, её не стоит добавлять к стрессу на работе.",
    expert: {
      name: "Алёна Виноградова",
      role: "тренер школы Springle",
      photo: "/images/p-3.svg",
      answer:
        "Правильная нагрузка – это всегда двойной эффект. Мы тренируем не только мышцы, но и нашу нервную систему, учим её справляться со стрессом и эффективно управлять ресурсами тела. Спорт – это хороший способ перезагрузки. Он действует как катализатор, преобразуя накопленный стресс в физическую усталость, а в завершении идёт выброс дофамина, который дарит чувство удовлетворения и спокойствия.",
    },
  },
  {
    id: "4",
    title: "МИФ №4",
    text: "Силовые тренировки – только для бодибилдеров, а для поддержания здоровья достаточно делать кардио.",
    expert: {
      name: "Валерия Васюкова",
      role: "тренер школы Springle",
      photo: "/images/p-4.svg",
      answer:
        "Нельзя однозначно выделить что-то одно: кардио и силовые нагрузки решают разные задачи. Кардио работает на выносливость и сердце, а силовые тренировки укрепляют опорно-двигательный аппарат, предотвращают травмы. Выбор активности зависит от ваших целей. Но важно соблюдать баланс. Если на ранних этапах не очевидно, что приносит больше пользы, надо комбинировать.",
    },
  },
  {
    id: "5",
    title: "МИФ №5",
    text: "Отсутствие регулярности тренировок можно восполнить высокой интенсивностью.",
    expert: {
      name: "Леонид Дивисенко",
      role: "тренер школы Springle",
      photo: "/images/p-5.svg",
      answer:
        "Регулярность и интенсивность для меня синонимы дисциплины и мотивации. Мотивация она сегодня есть, а завтра ее нет. Дисциплина равна регулярности. Лучше регулярно делать что-то по чуть чуть, чем один раз выжать себя и потом спустя какое-то время прийти и снова выжать себя. Это не действенная техника и дает мало результата.",
    },
  },
];

// Мобильная флип‑карта: фронт (миф) → клик → оборот (ответ)
const MobileAnswerSlide: React.FC<{ myth: Myth }> = ({ myth }) => {
  const frontRef = useRef<HTMLDivElement | null>(null);
  const backRef = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const front = frontRef.current;
    const back = backRef.current;
    if (front && back) {
      gsap.set(front, {
        autoAlpha: 1,
        rotateY: 0,
        transformPerspective: 900,
        transformOrigin: "50% 50%",
      });
      gsap.set(back, {
        autoAlpha: 0,
        rotateY: 90,
        transformPerspective: 900,
        transformOrigin: "50% 50%",
      });
    }
  }, []);

  const reveal = () => {
    if (revealed) return;
    setRevealed(true);

    const front = frontRef.current!;
    const back = backRef.current!;

    const tl = gsap.timeline();
    tl.to(front, {
      rotateY: -90,
      autoAlpha: 0,
      duration: 0.25,
      ease: "power2.in",
      transformPerspective: 900,
      transformOrigin: "50% 50%",
    }).fromTo(
      back,
      {
        rotateY: 90,
        autoAlpha: 0,
        transformPerspective: 900,
        transformOrigin: "50% 50%",
      },
      {
        rotateY: 0,
        autoAlpha: 1,
        duration: 0.5,
        ease: "power2.out",
      },
      "<0.05"
    );
  };

  return (
    <div
      className={`${styles.card} ${styles.cardMobile}`}
      onClick={reveal}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          reveal();
        }
      }}
      style={{ cursor: revealed ? "default" : "pointer" }}
    >
      {/* Передняя сторона: миф */}
      <div className={styles.cardInner} ref={frontRef} aria-hidden={revealed}>
        <div className={styles.cardLabel}>{myth.title}</div>
        <div className={styles.cardText}>{myth.text}</div>
      </div>

      {/* Задняя сторона: ответ */}
      <div className={styles.answer} ref={backRef} aria-hidden={!revealed}>
        <div className={styles.expertHeader}>
          {myth.expert.photo ? (
            <img
              className={styles.avatar}
              src={myth.expert.photo}
              alt={fixText(myth.expert.name)}
            />
          ) : (
            <div className={styles.avatarPlaceholder} />
          )}
          <div>
            <div className={styles.expertName}>{myth.expert.name}</div>
            <div className={styles.expertRole}>{myth.expert.role}</div>
          </div>
        </div>
        <div className={styles.answerText}>{myth.expert.answer}</div>
      </div>
    </div>
  );
};

export const MythsDragSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);

  // desktop
  const playgroundRef = useRef<HTMLDivElement | null>(null);
  const dragCardRef = useRef<HTMLDivElement | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);
  const answerRef = useRef<HTMLDivElement | null>(null);

  // mobile
  const mobileRef = useRef<HTMLDivElement | null>(null);

  // NBSP: обработать все текстовые узлы внутри секции и отслеживать изменения
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    // первичная обработка
    processTextNodes(root);

    // наблюдаем за динамическими изменениями (слайды, тексты и т.п.)
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

  const [index, setIndex] = useState(0);
  const [answeredIdx, setAnsweredIdx] = useState<number | null>(null);

  // скрыть карточку на десктопе после последнего дропа (оставить пустое место)
  const [desktopCardHidden, setDesktopCardHidden] = useState(false);

  // Определяем мобильный брейкпоинт (для условного рендера)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 811px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile("matches" in e ? e.matches : (e as MediaQueryList).matches);
    setIsMobile(mq.matches);
    // @ts-ignore кроссбраузерная подписка
    mq.addEventListener ? mq.addEventListener("change", handler) : mq.addListener(handler as any);
    return () => {
      // @ts-ignore кроссбраузерная отписка
      mq.removeEventListener ? mq.removeEventListener("change", handler) : mq.removeListener(handler as any);
    };
  }, []);

  const myths = useMemo(() => mythsData, []);
  const current = myths[index];
  const answered = answeredIdx !== null ? myths[answeredIdx] : null;

  useGSAP(
    () => {
      const intro = introRef.current!;
      const play = playgroundRef.current!;
      const mm = gsap.matchMedia();

      // Десктоп (>= 812px) — drag & drop + по-слайдовое переключение интро → playground (snap)
      mm.add("(min-width: 812px)", () => {
        gsap.set(play, { opacity: 0, y: 24 });

        // при входе в десктопный брейкпоинт не скрываем карточку по умолчанию
        setDesktopCardHidden(false);

        const tlIntro = gsap
          .timeline({
            scrollTrigger: {
              trigger: intro,
              start: "center center",
              end: "+=550",
              scrub: true,
              // включаем «снап» в начало/конец — ощущение «слайда»
              snap: {
                snapTo: [0, 1],
                duration: { min: 0.12, max: 0.3 },
                ease: "power1.inOut",
              },
              refreshPriority: -1,
            },
          })
          .to(intro, { opacity: 0, y: -10, ease: "none" })
          .to(play, { opacity: 1, y: 0, ease: "none" }, "<");

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
          setAnsweredIdx(index);
          const ans = answerRef.current!;

          const isLast = index >= myths.length - 1;

          const tl = gsap.timeline();
          tl.to(card, {
            opacity: 0,
            scale: 0.95,
            duration: 0.22,
            ease: "power2.out",
          }).set(card, { x: 0, y: 0 });

          if (isLast) {
            tl.call(() => {
              setDesktopCardHidden(true);
            });
          } else {
            tl.call(() =>
              setIndex((i) => Math.min(i + 1, myths.length - 1))
            ).to(card, {
              opacity: 1,
              scale: 1,
              duration: 0.28,
              ease: "power2.out",
            });
          }

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

        const ro = new ResizeObserver(() =>
          dr.applyBounds(sectionRef.current!)
        );
        ro.observe(sectionRef.current!);

        return () => {
          tlIntro.scrollTrigger?.kill();
          tlIntro.kill();
          ro.disconnect();
          dr.kill();
        };
      });

      return () => {
        mm.revert();
      };
    },
    { scope: sectionRef, dependencies: [index, myths.length] }
  );

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* Этап 1: интро-текст (рендерим только на десктопе) */}
      {!isMobile && (
        <div ref={introRef} className={styles.intro}>
          <h2 className={styles.title}>
            Очень хочется делать <br /> силовые каждый день
          </h2>
          <div className={styles.subtitle_cont}>
            <p className={styles.subtitle}>
              как Джефф Безос, однако между <br /> намерением и действием часто{" "}
              <br /> появляется надоедливое «но».
            </p>
          </div>
          <p className={styles.lead}>
            Давайте вместе с тренерами школы Springle разберём <br />
            мифы, которые мешают вам сделать занятия спортом <br />
            лёгкой привычкой.
          </p>
        </div>
      )}

      {/* Этап 2: playground (десктоп) */}
      {!isMobile && (
        <div ref={playgroundRef} className={styles.playground}>
          <div className={styles.left}>
            <div
              className={styles.card}
              ref={dragCardRef}
              style={
                desktopCardHidden
                  ? { opacity: 0, pointerEvents: "none" }
                  : undefined
              }
              aria-hidden={desktopCardHidden}
            >
              <div className={styles.cardInner}>
                <div className={styles.cardLabel}>{current.title}</div>
                <div className={styles.cardText}>{current.text}</div>
              </div>
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.dropZone} ref={dropZoneRef}>
              {answered ? (
                <div className={styles.answer} ref={answerRef}>
                  <div className={styles.expertHeader}>
                    {answered.expert.photo ? (
                      <img
                        className={styles.avatar}
                        src={answered.expert.photo}
                        alt={fixText(answered.expert.name)}
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
                  <img
                    className={styles.cursor}
                    src="/images/cursor.svg"
                    alt=""
                  />
                  Перетащите миф в экспертное поле, чтобы развеять его
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Мобильный: один слайд на миф — клик по карточке переворачивает на ответ */}
      {isMobile && (
        <div ref={mobileRef} className={styles.mobileSlider}>
          <div className={styles.intro}>
            <h2 className={styles.title}>
              Очень хочется делать <br /> силовые каждый день
            </h2>
            <div className={styles.subtitle_cont}>
              <p className={styles.subtitle}>
                как Джефф Безос, однако между <br /> намерением и действием
                часто <br /> появляется надоедливое «но».
              </p>
            </div>
            <p className={styles.lead}>
              Давайте вместе с тренерами школы Springle разберём <br />
              мифы, которые мешают вам сделать занятия спортом <br />
              лёгкой привычкой.
            </p>
          </div>

          <Swiper
            modules={[Pagination, Mousewheel, Keyboard]}
            className={styles.swiper}
            pagination={{
              el: `.${styles.mobilePagination}`,
              clickable: true,
            }}
            mousewheel={{ forceToAxis: true, releaseOnEdges: true }}
            keyboard={{ enabled: true }}
            slidesPerView={1}
            speed={450}
            spaceBetween={24} 
          >
            {myths.map((m) => (
              <SwiperSlide className={styles.mobileSlide} key={`myth-${m.id}`}>
                <MobileAnswerSlide myth={m} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* ВНЕШНЯЯ пагинация (под слайдером) */}
          <div className={styles.mobilePagination} />
        </div>
      )}
    </section>
  );
};