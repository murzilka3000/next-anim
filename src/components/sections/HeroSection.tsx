"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Frisbee } from "../svg/Frisbee";
import { Hand } from "../svg/Hand";
import styles from "./HeroSection.module.scss";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export const HeroSection = () => {
  const container = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      gsap
        .timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } })
        .to(".frisbee", { y: "-=12", duration: 1.2 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          pin: true,
          start: "top top",
          end: "+=2000",
          scrub: 1,
        },
      });

      tl.to(".text-content", { opacity: 0, y: 50, duration: 0.5 })
        .to(
          ".frisbee",
          {
            scale: 30,
            rotation: 90,
            duration: 2,
            ease: "power1.inOut",
            overwrite: "auto",
          },
          ">-0.2"
        )
        .to(
          ".hand",
          {
            opacity: 0,
            y: "100%",
            duration: 1,
            ease: "power1.inOut",
            overwrite: "auto",
          },
          "<"
        );
    },
    { scope: container }
  );

  return (
    <section className={styles.heroSection} ref={container}>
      <img className={styles.abs_img} src="/images/4.svg" alt="" />
      <div className={styles.wrapper}>
        <div className={`${styles.contentWrapper} text-content`}>
          <div className={styles.logos}>
            <img src="/images/3.svg" alt="" />
            <img src="/images/2.svg" alt="" />
            <img src="/images/1.svg" alt="" />
          </div>

          <div className={styles.sec_cont}>
            <h1 className={styles.title}>
              РЫВОК <br /> <span>В КАРЬЕРЕ</span>
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
