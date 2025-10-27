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

const questions: Question[] = [
  {
    id: "q1",
    title: "ВОПРОС 1/5",
    prompt:
      "Компания готовит крупное обновление автопилота. В финальных тестах инженеры нашли сбои в отдельных сценариях. Вы — ведущий инженер, релиз намечен на завтра. Что будете делать?",
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
      "Скорость принятия решений — умение быстро реагировать и снижать риски. В реальности так и делают: сразу переносят релиз, устраняют баги, а затем выпускают обновление.",
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

export const MotivationQuizSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const quizRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const transitionTimeline = useRef<gsap.core.Timeline | null>(null);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);

  const q = questions[idx];
  const total = questions.length;

  useGSAP(
    () => {
      gsap.set(quizRef.current, { autoAlpha: 0, pointerEvents: "none" });
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

  const selectOption = (opt: Option) => {
    if (selected) return;
    setSelected(opt.id);
    // Если это последний вопрос, сразу помечаем тест как завершенный
    if (idx === total - 1) {
      setQuizFinished(true);
    }
  };

  const nextQuestion = () => {
    const isLast = idx >= total - 1;
    if (isLast) return; // Просто ничего не делаем, если это последний вопрос

    gsap.to(cardRef.current, {
      y: -150,
      rotate: 7,
      autoAlpha: 0,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => {
        setIdx((i) => i + 1);
        setSelected(null);
      },
    });
  };

  useEffect(() => {
    if (idx > 0) {
      gsap.fromTo(
        cardRef.current,
        { y: 150, rotate: -7, autoAlpha: 0 },
        { y: 0, rotate: 0, autoAlpha: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [idx]);

  const nextDisabled = selected === null;

  return (
    <section className={styles.section} ref={sectionRef}>
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

      <div id="quiz" ref={quizRef} className={styles.quiz}>
        <div className={styles.quizInner}>
          <div className={styles.card} ref={cardRef}>
            <div className={styles.cardHeader}>
              <div className={styles.counter}>
                {q.title ?? `ВОПРОС ${idx + 1}/${total}`}
              </div>
              <div className={styles.prompt}>{q.prompt}</div>
            </div>
            <ul className={styles.options}>
              {q.options.map((opt) => {
                const selectedThis = selected === opt.id;
                const stateClass =
                  selected && selectedThis
                    ? opt.correct
                      ? styles.correct
                      : styles.wrong
                    : undefined;
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
            {selected && <div className={styles.explain}>{q.explanation}</div>}
          </div>
          <button
            className={`${styles.nextFab} ${
              (nextDisabled || quizFinished) ? styles.disabled : ""
            }`}
            onClick={nextQuestion}
            disabled={nextDisabled || quizFinished}
            aria-label={quizFinished ? "Тест завершен" : "Следующий вопрос"}
            title={quizFinished ? "Тест завершен" : "Следующий вопрос"}
          >
            {quizFinished ? (
              <span className={styles.checkmark}>✓</span>
            ) : (
              <span className={styles.arrow}>›</span>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};