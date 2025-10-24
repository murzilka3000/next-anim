"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Frisbee } from "../svg/Frisbee";
import { Hand } from "../svg/Hand";
import styles from "./HeroSection.module.scss";

// Регистрируем плагины
gsap.registerPlugin(useGSAP, ScrollTrigger);

export const HeroSection = () => {
  const container = useRef(null);

  useGSAP(
    () => {
      // Анимация "качания" тарелки
      gsap.timeline({
          repeat: -1,
          yoyo: true,
      })
      .to(".frisbee", { 
        rotateX: 15, 
        y: '-=15px', 
        duration: 1, 
        ease: "sine.inOut" 
      })
      .to(".frisbee", { rotation: 2, duration: 1, ease: "sine.inOut" }, "<");
      
      // Анимация прорисовки линий-бликов
      const shineLines = gsap.utils.toArray<SVGPathElement>('.shine-line-1, .shine-line-2, .shine-line-3');

      shineLines.forEach(path => {
        const length = path.getTotalLength();
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
          opacity: 1
        });
      });
      
      gsap.timeline({
          repeat: -1,
          repeatDelay: 1,
      })
      .to(shineLines, {
          strokeDashoffset: 0,
          duration: 0.8,
          ease: 'power2.inOut',
          stagger: 0.15
      })
      .to(shineLines, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.15
      }, ">-0.2");

      // Основная анимация по скроллу
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          pin: true,
          start: "top top",
          end: "+=2000",
          scrub: 1,
          markers: true,
        },
      });

      tl.to(".text-content", {
        opacity: 0,
        y: 50,
        duration: 0.5,
      })
        .to(".frisbee", {
            scale: 30,
            rotation: 90,
            duration: 2,
          }, ">-0.2"
        )
        .to(".hand", {
            opacity: 0,
            y: "100%",
            duration: 1,
          }, "<"
        );
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