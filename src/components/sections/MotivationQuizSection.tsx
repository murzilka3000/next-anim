"use client";

import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./MotivationQuizSection.module.scss";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Option = { id: string; text: string; correct: boolean };
type Question = {
  id: string;
  title?: string;
  prompt: string;
  options: Option[];
  explanation: string;
};

const ICONS = {
  good: "/images/green.svg",
  warn: "/images/red.svg",
};

// Глобальные настройки скорости/задержек анимаций
const ANIM = {
  speed: 0.85,            // 1 = как было; <1 — медленнее; >1 — быстрее
  delayBeforeResults: 0.9 // пауза перед показом результатов
};

const questions: Question[] = [
  {
    id: "q1",
    title: "ВОПРОС 1/5",
    prompt:
      "Компания готовит крупное обновление автопилота. В финальных тестах инженеры нашли сбои в отдельных сценариях. Вы — ведущий инженер, релиз намечен на завтра. Что будете делать? Компания готовит крупное обновление автопилота. В финальных тестах инженеры нашли сбои в отдельных сценариях. Вы — ведущий инженер, релиз намечен на завтра. Что будете делать?",
    options: [
      {
        id: "a",
        text: "Немедленно перенесу релиз, зафиксирую баги и честно объясню причины",
        correct: true,
      },
      {
        id: "b",
        text: "Отложу решение до совещания с руководством компании через неделю",
        correct: false,
      },
      {
        id: "c",
        text: "Возьму паузу на 2–3 дня, соберу больше информации и приму решение позже",
        correct: false,
      },
    ],
    explanation:
      "Скорость принятия решений – это умение реагировать быстро и в условиях ограниченного времени находить решение, которое снижает риски. В описанной ситуации Tesla действовала именно так: мгновенно отложила релиз, устранила ошибки и позже выпустила обновление. Это позволило сохранить доверие клиентов и репутацию бренда.",
  },
  {
    id: "q2",
    title: "ВОПРОС 2/5",
    prompt:
      "Команде предстоит важная демо-встреча через 2 дня, но ключевой разработчик болеет. Как поступите?",
    options: [
      { id: "a", text: "Отменю демо, перенесу на неделю", correct: false },
      {
        id: "b",
        text: "Упрощу сценарий демо, распределю роли и оставлю встречу в срок",
        correct: true,
      },
      {
        id: "c",
        text: "Сделаю демо сам без подготовки — импровизация выручит",
        correct: false,
      },
    ],
    explanation:
      "Гибкость и приоритизация: упростить сценарий, сохранить срок и прозрачность — чаще всего оптимальный выбор.",
  },
  {
    id: "q3",
    title: "ВОПРОС 3/5",
    prompt:
      "Вам предложили параллельно вести ещё один проект. Текущая загрузка высокая. Ваши действия?",
    options: [
      {
        id: "a",
        text: "Соглашусь, а распределение задач настрою уже по ходу",
        correct: false,
      },
      {
        id: "b",
        text: "Оценю риски/ресурсы и договорюсь об обмене приоритетами перед стартом",
        correct: true,
      },
      { id: "c", text: "Откажусь, любые доп. задачи — вредны", correct: false },
    ],
    explanation:
      "Умение договариваться о приоритетах до старта — ключ к управлению нагрукой без выгорания.",
  },
];

// Маппинг вопросов к навыкам для результата
type Skill = { id: string; title: React.ReactNode; qId?: Question["id"] };

const skillsMap: Skill[] = [
  { id: "decision_speed", title: "Скорость принятия решений", qId: "q1" },
  { id: "teamwork", title: "Работа в команде", qId: "q2" },
  { id: "negotiation", title: "Умение договариваться", qId: "q3" },
  { id: "strategic", title: "Стратегическое мышление" },
  {
    id: "stress",
    title: (
      <>
        Стрессо-
        <br />
        устойчивость
      </>
    ),
  },
];

export const MotivationQuizSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const quizRef = useRef<HTMLDivElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  // Раздельная анимация вопроса/ответов
  const cardRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const optionsRef = useRef<HTMLUListElement | null>(null);
  const explainElRef = useRef<HTMLDivElement | null>(null);

  const transitionTimeline = useRef<gsap.core.Timeline | null>(null);
  const entryTlRef = useRef<gsap.core.Timeline | null>(null);

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

      // применяем общий таймскейл
      transitionTimeline.current.timeScale(ANIM.speed);

      const pin = ScrollTrigger.create({
        trigger: sectionRef.current,
        pin: true,
        start: "top top",
        end: "bottom bottom",
      });

      return () => {
        pin.kill();
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
          onComplete: () => {
            ScrollTrigger.refresh();
          },
        },
        "<"
      );
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

  // Новый nextQuestion: раздельная анимация
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

    // 1) Ответы — fade down по очереди
    if (optionEls.length) {
      tl.to(
        optionEls,
        {
          y: 12,
          autoAlpha: 0,
          duration: 0.3, // можно увеличить
          stagger: 0.08, // можно увеличить
        },
        0
      );
    }
    // 1a) Объяснение — мягко гасим
    if (explainEl) {
      tl.to(explainEl, { y: 8, autoAlpha: 0, duration: 0.28 }, 0);
    }

    // 2) Заголовок/карточка вопроса — перелистывание «колодой»
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

  // Анимация входа новой карточки и ответов
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

    // стартовые состояния (вне кадра)
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
              <div className={`${styles.top_card} ${styles.modifier_class_1}`} />
              <div className={`${styles.top_card} ${styles.modifier_class_2}`} />
              <div className={`${styles.top_card} ${styles.modifier_class_3}`} />
              <div className={`${styles.top_card} ${styles.modifier_class_4}`} />
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

          {/* FAB "далее" */}
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
              const correct = s.qId ? !!answers[s.qId]?.correct : false;
              const cls = correct ? styles.skillGood : styles.skillWarn;
              return (
                <li key={s.id} className={`${styles.skill} ${cls}`}>
                  <span
                    className={`${styles.skillIcon} ${
                      correct ? styles.iconGood : styles.iconWarn
                    }`}
                    aria-hidden
                  >
                    <img
                      className={styles.skillGlyph}
                      src={correct ? ICONS.good : ICONS.warn}
                      alt=""
                      loading="lazy"
                    />
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