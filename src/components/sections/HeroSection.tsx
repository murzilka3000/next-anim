"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Frisbee } from "../svg/Frisbee";
import { Hand } from "../svg/Hand";
import styles from "./HeroSection.module.scss";

// Регистрируем плагины GSAP. Это нужно делать один раз.
gsap.registerPlugin(useGSAP, ScrollTrigger);

export const HeroSection = () => {
  const container = useRef(null);

  useGSAP(
    () => {
      // --- Анимация 1: Улучшенное постоянное вращение тарелки ---
      // Эффект "качания" (wobble) для имитации 3D
      gsap.timeline({
          repeat: -1, // Бесконечный цикл
          yoyo: true, // Проигрывать вперед и назад
      })
      // Заменили scaleY на rotateX для создания иллюзии наклона
      .to(".frisbee", { 
        rotateX: 15, 
        y: '-=15px', 
        duration: 1, 
        ease: "sine.inOut" 
      })
      .to(".frisbee", { rotation: 2, duration: 1, ease: "sine.inOut" }, "<");
      
      // Анимация скользящего блика (сам элемент блика добавим в Frisbee.tsx)
      gsap.timeline({
          repeat: -1,
          repeatDelay: 0.5,
      })
      .fromTo("#shine-effect", 
          { x: '-500px', opacity: 0 },
          { x: '0px', opacity: 1, duration: 0.7, ease: 'power2.inOut' }
      )
      .to("#shine-effect", 
          { x: '500px', opacity: 0, duration: 0.7, ease: 'power2.inOut' },
          "+=0.5"
      );


      // --- Анимация 2: Основная анимация по скроллу (остается без изменений) ---
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current, // Элемент, который запускает анимацию
          pin: true, // "Прикалываем" секцию, пока идет анимация
          start: "top top", // Начинаем, когда верх секции достигает верха экрана
          end: "+=2000", // Длина прокрутки для анимации (2000px)
          scrub: 1, // Плавная привязка к скроллу (1 = 1 сек задержки)
          markers: true, // Удобные маркеры для отладки, УБРАТЬ В ПРОДАШКЕ
        },
      });

      // Добавляем шаги в нашу временную шкалу (timeline)
      tl.to(".text-content", {
        opacity: 0,
        y: 50,
        duration: 0.5,
      })
        .to(
          ".frisbee",
          {
            scale: 30, // Увеличиваем до гигантских размеров
            rotation: 90,
            duration: 2,
          },
          ">-0.2"
        ) // Начинается чуть раньше конца предыдущей анимации
        .to(
          ".hand",
          {
            opacity: 0,
            y: "100%",
            duration: 1,
          },
          "<"
        ); // "<" означает, что анимация руки начнется ОДНОВРЕМЕННО с анимацией тарелки
    },
    { scope: container }
  );

  return (
    <section className={styles.heroSection} ref={container}>
      <div className={styles.wrapper}>
        <div className={`${styles.contentWrapper} text-content`}>
          <div className={styles.logos}>
            <img src="/images/1.svg" alt="" />
            <img src="/images/2.svg" alt="" />
            <img src="/images/3.svg" alt="" />
            <img src="/images/2.svg" alt="" />
            <img src="/images/4.svg" alt="" />
          </div>
          <div className={styles.sec_cont}>
            <h1 className={styles.title}>
              РЫВОК <br /> В КАРЬЕРЕ
            </h1>
            <p className={styles.description}>
              Как включить спорт в плотный график, сделать тренировки привычкой
              и вырасти по карьерной лестнице? Разберёмся, какой вид физической
              нагрузки принесёт вам наибольшую пользу и мотивацию продолжать. В
              конце — подарок от школы Springle.
            </p>
          </div>
        </div>
      </div>

      <Hand className={`${styles.hand} hand`} />
      <Frisbee className={`${styles.frisbee} frisbee`} />
    </section>
  );
};