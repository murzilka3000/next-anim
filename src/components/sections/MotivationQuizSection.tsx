"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "./MotivationQuizSection.module.scss";

gsap.registerPlugin(useGSAP);

type Option = { id: string; text: string; correct: boolean };
type Question = {
  id: string;
  title?: string; // например "ВОПРОС 1/5"
  prompt: string;
  options: Option[];
  explanation: string; // пояснение, показывается после выбора
};

const questions: Question[] = [
  {
    id: "q1",
    title: "ВОПРОС 1/5",
    prompt:
      "Компания готовит крупное обновление автопилота. В финальных тестах инженеры нашли сбои в отдельных сценариях. Вы — ведущий инженер, релиз намечен на завтра. Что будете делать?",
    options: [
      { id: "a", text: "Немедленно перенесу релиз, зафиксирую баги и честно объясню причины", correct: true },
      { id: "b", text: "Отложу решение до совещания с руководством компании через неделю", correct: false },
      { id: "c", text: "Возьму паузу на 2–3 дня, соберу больше информации и приму решение позже", correct: false },
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
      { id: "b", text: "Упрощу сценарий демо, распределю роли и оставлю встречу в срок", correct: true },
      { id: "c", text: "Сделаю демо сам без подготовки — импровизация выручит", correct: false },
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
      { id: "a", text: "Соглашусь, а распределение задач настрою уже по ходу", correct: false },
      { id: "b", text: "Оценю риски/ресурсы и договорюсь об обмене приоритетами перед стартом", correct: true },
      { id: "c", text: "Откажусь, любые доп. задачи — вредны", correct: false },
    ],
    explanation:
      "Умение договариваться о приоритетах до старта — ключ к управлению нагрузкой без выгорания.",
  },
];

export const MotivationQuizSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const quizRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const q = questions[idx];
  const total = questions.length;

  // Показать интро сразу, вопросы — скрыты до старта
  useGSAP(
    () => {
      gsap.set(quizRef.current, { autoAlpha: 0, y: 12 });
    },
    { scope: sectionRef }
  );

  const handleStart = (e: React.MouseEvent) => {
    e.preventDefault();

    // 1) гасим интро
    const tl = gsap.timeline();
    tl.to(introRef.current, {
      autoAlpha: 0,
      y: -10,
      duration: 0.35,
      ease: "power2.out",
    });

    // 2) маленькая задержка и скролл к якорю
    tl.add(() => {
      const target = document.getElementById("quiz");
      setStarted(true);
      // обновим hash для «перехода по якорю»
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", "#quiz");
      }
    }, "+=0.1");

    // 3) показать блок с вопросами
    tl.to(
      quizRef.current,
      { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" },
      "+=0.05"
    );
  };

  const selectOption = (opt: Option) => {
    if (selected) return; // не даём менять выбор
    setSelected(opt.id);
    setIsCorrect(opt.correct);
    if (opt.correct) setScore((s) => s + 1);
  };

  const nextQuestion = () => {
    // анимируем «вылет» текущей карточки
    const card = cardRef.current!;
    gsap
      .timeline()
      .to(card, { x: -80, rotate: -2, autoAlpha: 0, duration: 0.35, ease: "power2.in" })
      .add(() => {
        const isLast = idx >= total - 1;
        if (!isLast) {
          setIdx((i) => i + 1);
          setSelected(null);
          setIsCorrect(null);
        }
      })
      .fromTo(
        card,
        { x: 80, rotate: 2, autoAlpha: 0 },
        { x: 0, rotate: 0, autoAlpha: 1, duration: 0.4, ease: "power2.out" }
      );
  };

  // Если страница открыта уже с #quiz — сразу показываем второй экран
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#quiz") {
      setStarted(true);
      gsap.set(introRef.current, { autoAlpha: 0 });
      gsap.set(quizRef.current, { autoAlpha: 1, y: 0 });
    }
  }, []);

  const last = idx === total - 1;
  const nextDisabled = selected === null;

  return (
    <section className={styles.section} ref={sectionRef}>
      {/* Этап 1: текстовый блок с кнопкой */}
      <div ref={introRef} className={styles.intro}>
        <div className={styles.introInner}>
          <h2 className={styles.title}>Теперь вам легче вписать тренировки в расписание.</h2>
          <p className={styles.subtitle}>Осталось найти верную мотивацию.</p>
          <p className={styles.lead}>
            Регулярная физическая нагрузка помогает держать себя в форме, а ещё развивает навыки,
            на которых строится успех в карьере и повседневной жизни.
          </p>
          <p className={styles.leadMuted}>
            Давайте проверим, какие софт‑скиллы спорт поможет прокачать вам?
          </p>
          <button className={styles.cta} onClick={handleStart}>
            Пройти тест
          </button>
        </div>
      </div>

      {/* Этап 2: вопросы */}
      <div id="quiz" ref={quizRef} className={styles.quiz} aria-hidden={!started}>
        <div className={styles.quizInner}>
          {/* стопка карт для вида */}
          <div className={styles.stack}>
            <span />
            <span />
            <span />
          </div>

          <div className={styles.card} ref={cardRef}>
            <div className={styles.cardHeader}>
              <div className={styles.counter}>{q.title ?? `ВОПРОС ${idx + 1}/${total}`}</div>
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

            {/* Пояснение появляется после выбора */}
            {selected && (
              <div className={styles.explain}>
                {q.explanation}
              </div>
            )}
          </div>

          {/* Оранжевая кнопка следующего вопроса */}
          <button
            className={`${styles.nextFab} ${nextDisabled ? styles.disabled : ""}`}
            onClick={nextQuestion}
            disabled={nextDisabled}
            aria-label={last ? "Завершить" : "Следующий вопрос"}
            title={last ? "Завершить" : "Следующий вопрос"}
          >
            <span className={styles.arrow}>›</span>
          </button>
        </div>
      </div>
    </section>
  );
};