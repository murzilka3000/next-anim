"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import styles from "./MythsDragSection.module.scss";

// Swiper (мобильный режим)
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

gsap.registerPlugin(useGSAP, ScrollTrigger, Draggable);

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
      photo: "/images/ava.png",
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
      photo: "/images/ava.png",
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
      photo: "/images/ava.png",
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
      photo: "/images/ava.png",
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
      photo: "/images/ava.png",
      answer:
        "Регулярность и интенсивность для меня синонимы дисциплины и мотивации. Мотивация она сегодня есть, а завтра ее нет. Дисциплина равна регулярности. Лучше регулярно делать что-то по чуть чуть, чем один раз выжать себя и потом спустя какое-то время прийти и снова выжать себя. Это не действенная техника и дает мало результата.",
    },
  },
];

// Внутренний компонент для мобильного “ответного” слайда с переворотом
const MobileAnswerSlide: React.FC<{ myth: Myth }> = ({ myth }) => {
  const hintRef = useRef<HTMLDivElement | null>(null);
  const ansRef = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const hint = hintRef.current;
    const ans = ansRef.current;
    if (hint && ans) {
      gsap.set(hint, {
        autoAlpha: 1,
        rotateY: 0,
        transformPerspective: 900,
        transformOrigin: "50% 50%",
      });
      gsap.set(ans, {
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

    const hint = hintRef.current!;
    const ans = ansRef.current!;

    const tl = gsap.timeline();
    tl.to(hint, {
      rotateY: -90,
      autoAlpha: 0,
      duration: 0.25,
      ease: "power2.in",
      transformPerspective: 900,
      transformOrigin: "50% 50%",
    }).fromTo(
      ans,
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
      className={`${styles.dropZone} ${styles.cardMobile}`}
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
      {/* Передняя сторона: подсказка (как на десктопе) */}
      <div className={styles.dropHint} ref={hintRef} aria-hidden={revealed}>
        <img className={styles.cursor} src="/images/cursor.svg" alt="" />
        Нажмите, чтобы увидеть ответ эксперта
      </div>

      {/* Задняя сторона: ответ */}
      <div className={styles.answer} ref={ansRef} aria-hidden={!revealed}>
        <div className={styles.expertHeader}>
          {myth.expert.photo ? (
            <img
              className={styles.avatar}
              src={myth.expert.photo}
              alt={myth.expert.name}
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

  const [index, setIndex] = useState(0);
  const [answeredIdx, setAnsweredIdx] = useState<number | null>(null);

  const myths = useMemo(() => mythsData, []);
  const current = myths[index];
  const answered = answeredIdx !== null ? myths[answeredIdx] : null;

  useGSAP(
    () => {
      const intro = introRef.current!;
      const play = playgroundRef.current!;
      const mobile = mobileRef.current!;
      const mm = gsap.matchMedia();

      // Десктоп (>= 812px) — drag & drop
      mm.add("(min-width: 812px)", () => {
        gsap.set(play, { opacity: 0, y: 24 });

        const tlIntro = gsap
          .timeline({
            scrollTrigger: {
              trigger: intro,
              start: "center center",
              end: "+=300",
              scrub: true,
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

          const tl = gsap.timeline();
          tl.to(card, {
            opacity: 0,
            scale: 0.95,
            duration: 0.22,
            ease: "power2.out",
          })
            .set(card, { x: 0, y: 0 })
            .call(() => setIndex((i) => Math.min(i + 1, myths.length - 1)))
            .to(card, {
              opacity: 1,
              scale: 1,
              duration: 0.28,
              ease: "power2.out",
            });

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

      // Мобилка (<= 811px) — двуслайдовый слайдер (миф/ответ) для каждого мифа
      mm.add("(max-width: 811px)", () => {
        gsap.set(mobile, { opacity: 0, y: 24 });
        const tlIntro = gsap
          .timeline({
            scrollTrigger: {
              trigger: intro,
              start: "center center",
              end: "+=300",
              scrub: true,
              refreshPriority: -1,
            },
          })
          .to(intro, { opacity: 0, y: -10, ease: "none" })
          .to(mobile, { opacity: 1, y: 0, ease: "none" }, "<");

        return () => {
          tlIntro.scrollTrigger?.kill();
          tlIntro.kill();
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
      {/* Этап 1: интро-текст */}
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

      {/* Этап 2: playground (десктоп) */}
      <div ref={playgroundRef} className={styles.playground}>
        <div className={styles.left}>
          <div className={styles.card} ref={dragCardRef}>
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

      {/* Этап 2: мобильный слайдер (миф/ответ) — данные из массива */}
      <div ref={mobileRef} className={styles.mobileSlider}>
        <Swiper
          modules={[Pagination]}
          className={styles.swiper}
          pagination={{
            el: `.${styles.mobilePagination}`,
            clickable: true,
          }}
        >
          {myths.map((m) => (
            <React.Fragment key={`pair-${m.id}`}>
              {/* Слайд мифа */}
              <SwiperSlide className={styles.mobileSlide} key={`myth-${m.id}`}>
                <div className={`${styles.card} ${styles.cardMobile}`}>
                  <div className={styles.cardInner}>
                    <div className={styles.cardLabel}>{m.title}</div>
                    <div className={styles.cardText}>{m.text}</div>
                  </div>
                </div>
              </SwiperSlide>

              {/* Слайд ответа с переворотом */}
              <SwiperSlide className={styles.mobileSlide} key={`ans-${m.id}`}>
                <MobileAnswerSlide myth={m} />
              </SwiperSlide>
            </React.Fragment>
          ))}
        </Swiper>

        {/* ВНЕШНЯЯ пагинация (под слайдером) */}
        <div className={styles.mobilePagination} />
      </div>
    </section>
  );
};