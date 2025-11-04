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

const ANIM = {
  speed: 0.85,
  delayBeforeResults: 0.9,
};

const questions: Question[] = [
  {
    id: "q1",
    title: "Скорость принятия решений",
    prompt:
      "Компания, которая занимается производством автомобилей, готовит крупное обновление технологии автопилота. В финальных тестах инженеры обнаружили сбои при определённых городских сценариях. Вы – ведущий инженер, релиз намечен на завтра. Что будете делать?",
    options: [
      {
        id: "a",
        text: "Немедленно перенесу релиз, зафиксирую баги, объявлю пользователям о переносе и честно объясню причины.",
        correct: true,
      },
      {
        id: "b",
        text: "Отложу решение такого уровня до совещания с руководством компании через неделю.",
        correct: false,
      },
      {
        id: "c",
        text: "Возьму паузу на 2-3 дня, чтобы собрать больше информации о причинах ошибок: если что, поправим баги после релиза, зато точно будем знать, что исправлять.",
        correct: false,
      },
    ],
    explanation:
      "Скорость принятия решений – это умение в условиях ограниченного времени находить решение, которое снижает риски. Tesla действовала именно так: мгновенно отложила релиз, устранила ошибки и позже выпустила обновление. Это позволило сохранить доверие клиентов и репутацию бренда.",
  },
  {
    id: "q2",
    title: "Работа в команде",
    prompt:
      "Сценаристы и аниматоры крупной киностудии не могут согласовать ключевую сцену полнометражного мультфильма. Не получается договориться, как правильно показать эмоциональный пик в переживаниях героя. Вы – продюсер проекта. Что будете делать?",
    options: [
      {
        id: "a",
        text: "Отдам окончательное решение сценаристам, потому что без хорошей драматургии не будет хорошего мультфильма.",
        correct: false,
      },
      {
        id: "b",
        text: "Организую мозговой штурм всей команды, выслушаю все идеи и вместе выберем компромиссное решение.",
        correct: true,
      },
      {
        id: "c",
        text: "Если команда никак не может договориться, придется принять решение самостоятельно.",
        correct: false,
      },
    ],
    explanation:
      "Работа в команде – ключевой навык, потому что сложные проекты редко могут быть выполнены одним человеком. Если внутри команды сталкиваются разные точки зрения, важно не просто навязать свою позицию, а собрать мнения всех специалистов, учесть их опыт и найти компромисс. В Pixar, которая столкнулась с таким кейсом, работая над фильмом «Вверх», именно совместная работа позволила найти оптимальное решение и поддерживать высокий уровень качества этого и других фильмов.",
  },
  {
    id: "q3",
    title: "Стрессоустойчивость",
    prompt:
      "Пандемия резко обрушила бронирования жилья вашего сервиса по аренде: почти все запланированные зарубежные поездки отменены, сотрудники перегружены жалобами клиентов, инвесторы требуют отчётов, а СМИ активно критикуют компанию. Ваша команда в панике, некоторые сотрудники на грани увольнения. Вы – менеджер отдела маркетинга. Что будете делать?",
    options: [
      {
        id: "a",
        text: "Сосредоточусь на отчётах инвесторам. Мне важно создать у них ощущение, что всё под контролем и не перенапрягать лишний раз команду в условиях, когда всё «горит».",
        correct: false,
      },
      {
        id: "b",
        text: "Запущу срочные рекламные акции и скидки на все поездки. В таких ситуациях важно предпринять хоть что-то, главное – быстро.",
        correct: false,
      },
      {
        id: "c",
        text: "Проанализирую кейсы отмен и отзывы клиентов, прежде чем принимать важные решения по продукту и коммуникационной стратегии.",
        correct: true,
      },
    ],
    explanation:
      "Стрессоустойчивость – это способность сохранять ясность мышления и действовать эффективно в условиях давления и неопределённости. В ситуации, с которой столкнулась компания Airbnb, важно не просто «делать что-то» быстро или показывать отчёты инвесторам, а анализировать данные и принимать продуманные решения. Благодаря последовательности компания смогла быстро адаптировать продукт и коммуникацию: внедрила гибкие условия отмен, сосредоточилась на локальных и краткосрочных поездках и оперативно информировала пользователей.",
  },
  {
    id: "q4",
    title: "Умение договариваться и вести переговоры",
    prompt:
      "Сеть кофеен хочет открыть новое кафе в престижном районе города. Владелец помещения, которое подходит идеально, требует высокую арендную плату, превышающую бюджет компании. Вы – менеджер по развитию. Что будете делать?",
    options: [
      {
        id: "a",
        text: "Предложу вариант поэтапной оплаты и процентов за продажи, чтобы снизить риск для владельца и уложиться в бюджет. ",
        correct: true,
      },
      {
        id: "b",
        text: "Буду искать другой вариант, чтобы не тратить время на неподходящее по бюджету помещение.",
        correct: false,
      },
      {
        id: "c",
        text: "Соглашусь на условия владельца сразу, чтобы не упустить такое хорошее место и не отдать его конкурентам.",
        correct: false,
      },
    ],
    explanation:
      "Умение вести переговоры подразумевает поиск решений, выгодных обеим сторонам. Starbucks, кейс которого описан выше, часто использует гибкие условия аренды и бонусы, чтобы получить хорошие локации без превышения заложенного бюджета.",
  },
  {
    id: "q5",
    title: "Стратегическое мышление",
    prompt:
      "Вы руководитель в крупной компании, которая занимается производством мебели. В основе вашего позиционирования – стратегия производства мебели, стоимость которой доступна большинству. Однако компания регулярно подвергается широкой критике за то, что ваша продукция недолговечна и создаёт много отходов. Что бы вы сделали в такой ситуации?",
    options: [
      {
        id: "a",
        text: "Продолжим игнорировать критику: низкие цены важнее для большинства покупателей, чем экология.",
        correct: false,
      },
      {
        id: "b",
        text: "Начнём инвестировать в переработку, устойчивые материалы и сервис обратного выкупа мебели у клиентов.",
        correct: true,
      },
      {
        id: "c",
        text: "Запустим рекламу про «заботу об экологии», чтобы продвигать положительный образ компании у покупателей, но в производстве ничего серьёзно менять не будем.",
        correct: false,
      },
    ],
    explanation:
      "Стратегическое мышление – это способность видеть за пределами сегодняшней выгоды и принимать решения, которые укрепят позиции компании в будущем. Так, в случае с IKEA ставка на устойчивые материалы и программы переработки требовала крупных инвестиций и не давала мгновенной отдачи. Но именно этот выбор превратил бренд в символ доступной, но при этом ответственной мебели и помог компании не просто отразить критику, а сделать её частью своей силы на рынке.",
  },
];

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

  const cardRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const optionsRef = useRef<HTMLUListElement | null>(null);
  const explainElRef = useRef<HTMLDivElement | null>(null);

  const transitionTimeline = useRef<gsap.core.Timeline | null>(null);
  const entryTlRef = useRef<gsap.core.Timeline | null>(null);

  // Гейт-скролла до клика
  const gateRef = useRef<ScrollTrigger | null>(null);

  // Локер скролла
  const scrollLockY = useRef<number | null>(null);
  const lockScroll = () => {
    if (scrollLockY.current !== null) return;
    scrollLockY.current = window.scrollY || window.pageYOffset || 0;
    const b = document.body as HTMLBodyElement;
    b.style.position = "fixed";
    b.style.top = `-${scrollLockY.current}px`;
    b.style.left = "0";
    b.style.right = "0";
    b.style.width = "100%";
    b.style.overflow = "hidden";
  };
  const unlockScroll = () => {
    const y = scrollLockY.current ?? 0;
    const b = document.body as HTMLBodyElement;
    b.style.position = "";
    b.style.top = "";
    b.style.left = "";
    b.style.right = "";
    b.style.width = "";
    b.style.overflow = "";
    scrollLockY.current = null;
    requestAnimationFrame(() => {
      const sec = sectionRef.current;
      if (sec) {
        const top = sec.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: "auto" });
      } else {
        window.scrollTo({ top: y, behavior: "auto" });
      }
    });
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

      // Гейт: как только секция у верхнего края — блокируем скролл
      gateRef.current = ScrollTrigger.create({
        trigger: sectionRef.current!,
        start: "top top",
        onEnter: lockScroll,
        onEnterBack: lockScroll,
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
        unlockScroll();
      };
    },
    { scope: sectionRef }
  );

  const handleStart = (e: React.MouseEvent) => {
    e.preventDefault();
    // ВАЖНО: скролл НЕ разблокируем здесь
    // Просто запускаем переход интро -> квиз
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
        // Разблокируем скролл ТОЛЬКО после того, как дошли до результатов
        gateRef.current?.kill();
        unlockScroll();
        // небольшой отложенный refresh на случай смены высоты
        gsap.delayedCall(0.05, () => ScrollTrigger.refresh());
      });
    tl.timeScale(ANIM.speed);
  };

  const restartQuiz = () => {
    // Можно оставить скролл разблокированным, либо снова залочить — по желанию.
    // Здесь НЕ лочим повторно — пользователь сам решит, прокручивать ли дальше.
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
              <p className={styles.subtitle}>Осталось найти верную мотивацию.</p>
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