"use client";

import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./MotivationQuizSection.module.scss";
import { questions } from "@/data/questions";
import { Option, Question } from "@/data/questions";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ICONS = {
  good: "/images/green.svg",
  warn: "/images/red.svg",
};

const UNLOCK_AFTER_RESULTS = 0;

const ANIM = {
  speed: 0.85,
  delayBeforeResults: 0.9,
};

type Skill = { id: string; title: React.ReactNode; qId?: Question["id"] };

/* ===== NBSP обработчик (висячие предлоги/союзы/частицы) ===== */
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
/* ===== конец NBSP блока ===== */

/**
 * Исправлено:
 * - корректные названия навыков
 * - корректные связи вопрос → навык
 * Примечание: если в вашем наборе вопросов меньше 5 (например, только q1..q3),
 * последние навыки (q4, q5) останутся «нейтральными» (без иконки и без красного предупреждения).
 */
const skillsMap: Skill[] = [
  {
    id: "decision_speed",
    title: (
      <>
        Скорость принятия
        <br />
        решений
      </>
    ),
    qId: "q1",
  },
  {
    id: "teamwork",
    title: (
      <>
        Работа
        <br />в команде
      </>
    ),
    qId: "q2",
  },
  {
    id: "stress",
    title: (
      <>
        Стрессо-
        <br />
        устойчивость
      </>
    ),
    qId: "q3",
  },
  {
    id: "negotiation",
    title: (
      <>
        Умение
        <br />
        договариваться
      </>
    ),
    qId: "q4",
  },
  {
    id: "strategic",
    title: (
      <>
        Стратегическое
        <br />
        мышление
      </>
    ),
    qId: "q5",
  },
];

export const MotivationQuizSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const quizRef = useRef<HTMLDivElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const optionsRef = useRef<HTMLUListElement | null>(null);
  const explainElRef = useRef<HTMLDivElement | null>(null);

  const transitionTimeline = useRef<gsap.core.Timeline | null>(null);
  const entryTlRef = useRef<gsap.core.Timeline | null>(null);

  // Гейт-скролла до клика
  const gateRef = useRef<ScrollTrigger | null>(null);

  // "Мягкая" блокировка скролла без фиксации body
  const freezeActive = useRef(false);
  const savedYRef = useRef(0);
  const prevHtmlScrollBehavior = useRef<string>("");
  const onWheelRef = useRef<((e: WheelEvent) => void) | null>(null);
  const onTouchMoveRef = useRef<((e: TouchEvent) => void) | null>(null);
  const onKeyDownRef = useRef<((e: KeyboardEvent) => void) | null>(null);
  const onScrollRef = useRef<(() => void) | null>(null);

  // NBSP: обработать все текстовые узлы внутри секции и отслеживать изменения
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    // первичная обработка
    processTextNodes(root);

    // динамические изменения (переходы intro/quiz/results, тексты вопросов/ответов)
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

  const freezeScroll = () => {
    if (freezeActive.current) return;
    freezeActive.current = true;

    savedYRef.current = window.scrollY || window.pageYOffset || 0;

    const html = document.documentElement;
    prevHtmlScrollBehavior.current = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";

    onWheelRef.current = (e: WheelEvent) => {
      e.preventDefault();
    };
    onTouchMoveRef.current = (e: TouchEvent) => {
      e.preventDefault();
    };
    onKeyDownRef.current = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      const isEditable = !!t?.isContentEditable;
      if (
        isEditable ||
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT"
      )
        return;

      // блокируем клавиши, которые скроллят страницу
      const code = e.code || "";
      const key = e.key || "";
      const scrollKeys = new Set([
        "Space",
        "ArrowDown",
        "ArrowUp",
        "PageDown",
        "PageUp",
        "Home",
        "End",
      ]);
      if (scrollKeys.has(code) || key === " ") {
        e.preventDefault();
      }
    };
    onScrollRef.current = () => {
      // удерживаем позицию, если что-то попытается прокрутить страницу
      if (Math.abs((window.scrollY || 0) - savedYRef.current) > 0.5) {
        window.scrollTo(0, savedYRef.current);
      }
    };

    window.addEventListener("wheel", onWheelRef.current, { passive: false });
    window.addEventListener("touchmove", onTouchMoveRef.current, {
      passive: false,
    });
    window.addEventListener("keydown", onKeyDownRef.current!, {
      passive: false,
    });
    window.addEventListener("scroll", onScrollRef.current!, { passive: true });
  };

  const unfreezeScroll = () => {
    if (!freezeActive.current) return;
    freezeActive.current = false;

    const html = document.documentElement;

    if (onWheelRef.current)
      window.removeEventListener("wheel", onWheelRef.current as any);
    if (onTouchMoveRef.current)
      window.removeEventListener("touchmove", onTouchMoveRef.current as any);
    if (onKeyDownRef.current)
      window.removeEventListener("keydown", onKeyDownRef.current as any);
    if (onScrollRef.current)
      window.removeEventListener("scroll", onScrollRef.current as any);

    // возвращаем scroll-behavior
    html.style.scrollBehavior = prevHtmlScrollBehavior.current;
  };

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [answers, setAnswers] = useState<
    Record<string, { selectedId: string; correct: boolean }>
  >({});

  const q = questions[idx];
  const total = questions.length;

  useGSAP(
    () => {
      gsap.set(quizRef.current, { autoAlpha: 0, pointerEvents: "none" });
      gsap.set(resultsRef.current, { autoAlpha: 0, pointerEvents: "none" });

      // Как только секция доезжает до верхней кромки — "замораживаем" скролл
      gateRef.current = ScrollTrigger.create({
        trigger: sectionRef.current!,
        start: "top 9%",
        onEnter: freezeScroll,
        onEnterBack: freezeScroll,
      });

      transitionTimeline.current = gsap
        .timeline({ paused: true })
        .to(introRef.current, {
          autoAlpha: 0,
          pointerEvents: "none",
          duration: 0.4,
          ease: "power2.inOut",
        })
        .to(
          quizRef.current,
          {
            autoAlpha: 1,
            pointerEvents: "auto",
            duration: 0.4,
            ease: "power2.inOut",
          },
          "<"
        );
      transitionTimeline.current.timeScale(ANIM.speed);

      return () => {
        gateRef.current?.kill();
        unfreezeScroll();
      };
    },
    { scope: sectionRef }
  );

  const handleStart = (e: React.MouseEvent) => {
    e.preventDefault();
    transitionTimeline.current?.play();
  };

  const goToResults = () => {
    const tl = gsap
      .timeline()
      .to(quizRef.current, {
        autoAlpha: 0,
        pointerEvents: "none",
        duration: 0.4,
        ease: "power2.inOut",
      })
      .to(
        resultsRef.current,
        {
          autoAlpha: 1,
          pointerEvents: "auto",
          duration: 0.4,
          ease: "power2.inOut",
        },
        "<"
      )
      .add(() => {
        // Дадим пользователю посмотреть результаты и потом вернём скролл
        gsap.delayedCall(UNLOCK_AFTER_RESULTS, () => {
          gateRef.current?.kill();
          unfreezeScroll();
          gsap.delayedCall(0.05, () => ScrollTrigger.refresh());
        });
      });

    tl.timeScale(ANIM.speed);
  };

  const restartQuiz = () => {
    setIdx(0);
    setSelected(null);
    setQuizFinished(false);
    setAnswers({});

    const tl = gsap
      .timeline()
      .to(resultsRef.current, {
        autoAlpha: 0,
        pointerEvents: "none",
        duration: 0.3,
        ease: "power2.inOut",
      })
      .to(
        quizRef.current,
        {
          autoAlpha: 1,
          pointerEvents: "auto",
          duration: 0.3,
          ease: "power2.inOut",
        },
        "<"
      );
    tl.timeScale(ANIM.speed);
  };

  const selectOption = (opt: Option) => {
    if (selected) return;
    setSelected(opt.id);

    setAnswers((prev) => ({
      ...prev,
      [q.id]: { selectedId: opt.id, correct: opt.correct },
    }));

    if (idx === total - 1) {
      setQuizFinished(true);
      gsap.delayedCall(ANIM.delayBeforeResults, goToResults);
    }
  };

  const nextQuestion = () => {
    if (isTransitioning) return;
    const isLast = idx >= total - 1;
    if (isLast) return;

    const header = headerRef.current;
    const optionsList = optionsRef.current;
    const card = cardRef.current;
    if (!header || !optionsList || !card) return;

    setIsTransitioning(true);

    const optionEls = Array.from(
      optionsList.querySelectorAll(`.${styles.option}`)
    ) as HTMLElement[];

    const topCards = Array.from(
      card.querySelectorAll(`.${styles.top_card}`)
    ) as HTMLElement[];

    const explainEl = explainElRef.current;

    gsap.killTweensOf([header, ...optionEls, ...topCards, explainEl]);

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        setIdx((i) => i + 1);
        setSelected(null);
      },
    });

    // Ответы — fade down
    if (optionEls.length) {
      tl.to(
        optionEls,
        {
          y: 12,
          autoAlpha: 0,
          duration: 0.3,
          stagger: 0.08,
        },
        0
      );
    }
    if (explainEl) {
      tl.to(explainEl, { y: 8, autoAlpha: 0, duration: 0.28 }, 0);
    }

    // Заголовок и стопка — перелистывание
    tl.to(
      header,
      { y: -20, rotate: 5, autoAlpha: 0, duration: 0.32, ease: "power2.in" },
      0.05
    );
    if (topCards.length) {
      tl.to(
        topCards,
        {
          y: "-=10",
          autoAlpha: 0,
          duration: 0.3,
          stagger: 0.06,
          ease: "power2.in",
        },
        0.05
      );
    }

    tl.timeScale(ANIM.speed);
  };

  // Вход новой карточки
  useEffect(() => {
    if (!headerRef.current || !optionsRef.current || !cardRef.current) return;

    const header = headerRef.current;
    const optionsList = optionsRef.current;
    const optionEls = Array.from(
      optionsList.querySelectorAll(`.${styles.option}`)
    ) as HTMLElement[];

    const topCards = Array.from(
      cardRef.current.querySelectorAll(`.${styles.top_card}`)
    ) as HTMLElement[];

    gsap.set(header, { y: 20, rotate: -3, autoAlpha: 0 });
    if (topCards.length) gsap.set(topCards, { y: 15, autoAlpha: 0 });
    if (optionEls.length) gsap.set(optionEls, { y: 12, autoAlpha: 0 });

    entryTlRef.current?.kill();
    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => setIsTransitioning(false),
    });

    if (topCards.length) {
      tl.to(topCards, { y: 0, autoAlpha: 1, duration: 0.34, stagger: 0.06 }, 0);
    }
    tl.to(header, { y: 0, rotate: 0, autoAlpha: 1, duration: 0.45 }, 0.04);

    if (optionEls.length) {
      tl.to(
        optionEls,
        { y: 0, autoAlpha: 1, duration: 0.34, stagger: 0.08 },
        "-=0.1"
      );
    }

    tl.timeScale(ANIM.speed);
    entryTlRef.current = tl;
  }, [idx]);

  const nextDisabled = selected === null || isTransitioning;

  const remaining = Math.max(0, total - (idx + 1));
  const topCount = Math.min(4, remaining);

  return (
    <section className={styles.section} ref={sectionRef}>
      {/* INTRO */}
      <div ref={introRef} className={styles.intro}>
        <div className={styles.introInner}>
          <h2 className={styles.title}>
            Теперь вам легче вписать тренировки в расписание.
          </h2>
          <div className={styles.cont__cont}>
            <div className={styles.cont}>
              <p className={styles.subtitle}>
                Осталось найти верную мотивацию.
              </p>
              <p className={styles.lead}>
                Регулярная физическая нагрузка помогает держать себя в форме, а
                ещё развивает навыки, на которых строится успех в карьере и
                повседневной жизни.
              </p>
              <p className={styles.leadMuted}>
                Давайте проверим, какие софт‑скиллы спорт поможет прокачать вам?
              </p>
              <button className={styles.cta} onClick={handleStart}>
                Пройти тест
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QUIZ */}
      <div id="quiz" ref={quizRef} className={styles.quiz}>
        <div className={styles.quizInner}>
          <div className={styles.card} ref={cardRef}>
            <div className={styles.card_abs}>
              <div className={styles.cardHeader} ref={headerRef}>
                <div className={styles.counter}>
                  {q.title ?? `ВОПРОС ${idx + 1}/${total}`}
                </div>
                <div className={styles.prompt}>{q.prompt}</div>
              </div>

              {Array.from({ length: topCount }).map((_, i) => {
                const modClass = (styles as any)[`modifier_class_${i + 1}`];
                return (
                  <div
                    key={`tc-${i}`}
                    className={`${styles.top_card} ${modClass}`}
                  />
                );
              })}
            </div>

            <ul className={styles.options} ref={optionsRef}>
              {q.options.map((opt) => {
                const selectedThis = selected === opt.id;

                let stateClass;
                if (selected) {
                  if (opt.correct) stateClass = styles.correct;
                  else if (selectedThis) stateClass = styles.wrong;
                }

                return (
                  <li
                    key={opt.id}
                    className={`${styles.option} ${stateClass ?? ""}`}
                    onClick={() => selectOption(opt)}
                    role="button"
                    aria-pressed={selectedThis}
                    aria-disabled={!!selected}
                  >
                    <span className={styles.radio}>
                      <span className={styles.dot} />
                    </span>
                    <span className={styles.optionText}>{opt.text}</span>
                  </li>
                );
              })}
            </ul>

            {selected && (
              <div className={styles.explain} ref={explainElRef}>
                {q.explanation}
              </div>
            )}
          </div>

          {!quizFinished && (
            <button
              className={`${styles.nextFab} ${
                nextDisabled ? styles.disabled : ""
              }`}
              onClick={nextQuestion}
              disabled={nextDisabled}
              aria-label="Следующий вопрос"
              title="Следующий вопрос"
            >
              <span className={styles.arrow}>
                <img src="/images/str.svg" alt="" />
              </span>
            </button>
          )}
        </div>
      </div>

      {/* RESULTS */}
      <div ref={resultsRef} className={styles.results}>
        <div className={styles.resultsInner}>
          <div className={styles.resultsHeader}>
            <h3 className={styles.resultsTitle}>
              <span className={styles.titlePrimary}>Ваша карта</span>
              <span className={styles.titleAccent}>гибких навыков</span>
            </h3>
          </div>

          <ul className={styles.skills}>
            {skillsMap.map((s) => {
              const raw = s.qId ? answers[s.qId] : undefined;
              // null → навык не оценивался (нет связанного вопроса/ответа)
              const state: true | false | null =
                s.qId && raw !== undefined ? raw.correct : null;

              let cls = styles.skill;
              if (state === true) cls += ` ${styles.skillGood}`;
              if (state === false) cls += ` ${styles.skillWarn}`;

              return (
                <li key={s.id} className={cls}>
                  <span
                    className={`${styles.skillIcon} ${
                      state === true
                        ? styles.iconGood
                        : state === false
                        ? styles.iconWarn
                        : ""
                    }`}
                    aria-hidden
                  >
                    {state !== null && (
                      <img
                        className={styles.skillGlyph}
                        src={state ? ICONS.good : ICONS.warn}
                        alt=""
                        loading="lazy"
                      />
                    )}
                  </span>
                  <span className={styles.skillTitle}>{s.title}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};