"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import s from "./Finish.module.scss";

gsap.registerPlugin(MotionPathPlugin);

const Finish = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const discRef = useRef<HTMLImageElement | null>(null);
  const text1Ref = useRef<HTMLDivElement | null>(null);
  const text2Ref = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const busyRef = useRef(false);

  // запоминаем заменённого игрока для отката
  const swappedRef = useRef<{ el: HTMLImageElement; original: string } | null>(null);

  // реальные размеры диска (учитывает CSS width: 325px)
  const getDiscSize = () => {
    const disc = discRef.current!;
    const rect = disc.getBoundingClientRect();
    const compW = parseFloat(getComputedStyle(disc).width) || 325;
    const w = rect.width || compW || 325;
    const ratio =
      (disc.naturalWidth && disc.naturalHeight
        ? disc.naturalHeight / disc.naturalWidth
        : rect.height && rect.width
        ? rect.height / rect.width
        : 0.5) || 0.5;
    const h = rect.height || w * ratio;
    return { w, h };
  };

  // точка попадания по data-ax/ay (+ опциональные пиксельные сдвиги data-ox/oy), с учётом конечного масштаба
  const getTargetPoint = (img: HTMLImageElement, scaleForEnd = 1) => {
    const cont = containerRef.current!;
    const cr = cont.getBoundingClientRect();
    const ir = img.getBoundingClientRect();

    const ax = Number(img.dataset.ax ?? 0.5); // 0..1
    const ay = Number(img.dataset.ay ?? 0.5); // 0..1
    const ox = Number(img.dataset.ox ?? 0);   // px
    const oy = Number(img.dataset.oy ?? 0);   // px

    const { w: dw, h: dh } = getDiscSize();

    const px = ir.left + ir.width * ax - cr.left + ox;
    const py = ir.top + ir.height * ay - cr.top + oy;

    return { x: px - (dw * scaleForEnd) / 2, y: py - (dh * scaleForEnd) / 2 };
  };

  // позиция/масштаб диска под размеры modal__card (фон-тарелка)
  const getModalTarget = () => {
    const cont = containerRef.current!;
    const modal = modalRef.current!;
    const card = modal.querySelector(`.${s.modal__card}`) as HTMLElement;
    const cr = cont.getBoundingClientRect();
    const rr = card.getBoundingClientRect();
    const { w, h } = getDiscSize();

    const scale = rr.width / w;
    const x = rr.left - cr.left + (rr.width - w * scale) / 2;
    const y = rr.top - cr.top + (rr.height - h * scale) / 2;

    return { x, y, scale };
  };

  // скрыть оба .finish__content (и текст, и картинку)
  const hideTexts = () => {
    const c1 = text1Ref.current!.closest(`.${s.finish__content}`) as HTMLDivElement;
    const c2 = text2Ref.current!.closest(`.${s.finish__content}`) as HTMLDivElement;
    return gsap.to([c1, c2], {
      autoAlpha: 0,
      y: 10,
      duration: 0.35,
      ease: "power1.out",
    });
  };

  // показать .finish__content
  const showTexts = () => {
    const c1 = text1Ref.current!.closest(`.${s.finish__content}`) as HTMLDivElement;
    const c2 = text2Ref.current!.closest(`.${s.finish__content}`) as HTMLDivElement;
    gsap.set([c1, c2], { clearProps: "all" });
    gsap.fromTo(
      [c1, c2],
      { autoAlpha: 0, y: 8 },
      { autoAlpha: 1, y: 0, duration: 0.35, ease: "power1.out" }
    );
  };

  const showModal = () => {
    const m = modalRef.current!;
    gsap.fromTo(
      m,
      { autoAlpha: 0, y: 20 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
        onStart: () => {
          m.style.pointerEvents = "auto";
        },
      }
    );
  };

  const hideModal = (onComplete?: () => void) => {
    const m = modalRef.current!;
    gsap.to(m, {
      autoAlpha: 0,
      y: 10,
      duration: 0.25,
      ease: "power1.in",
      onComplete: () => {
        m.style.pointerEvents = "none";
        onComplete?.();
      },
    });
  };

  const resetAll = () => {
    const disc = discRef.current;
    if (disc) {
      // вернуть в версточное состояние (bottom/left/translateX)
      gsap.set(disc, { clearProps: "all", autoAlpha: 1, scale: 1 });
    }
    if (swappedRef.current) {
      const { el, original } = swappedRef.current;
      el.src = original;
      swappedRef.current = null;
    }
    showTexts();
    busyRef.current = false;
  };

  const handleThrow = (img: HTMLImageElement) => {
    if (busyRef.current) return;
    busyRef.current = true;

    // смена спрайта игрока на поднятую руку (через data-alt, либо f-x-up.svg по умолчанию)
    const originalSrc = img.src;
    let altSrc = img.dataset.alt;
    if (!altSrc) altSrc = img.src.replace(/(\.\w+)$/, "-up$1");
    img.src = altSrc!;
    swappedRef.current = { el: img, original: originalSrc };

    const cont = containerRef.current!;
    const disc = discRef.current!;
    const cr = cont.getBoundingClientRect();
    const dr = disc.getBoundingClientRect();

    // старт (как в верстке)
    const start = { x: dr.left - cr.left, y: dr.top - cr.top };

    // целевая ширина у игрока — по умолчанию 91px, можно переопределить на img через data-endw
    const { w: startW } = getDiscSize();
    const endW = Number(img.dataset.endw ?? 91);
    const scaleToEnd = endW / startW;

    // финальная точка у игрока
    const end = getTargetPoint(img, scaleToEnd);

    // на время анимации управляем через x/y
    gsap.set(disc, {
      top: 0,
      left: 0,
      bottom: "auto",
      right: "auto",
      transform: "none",
      transformOrigin: "0 0",
      x: start.x,
      y: start.y,
      scale: 1,
      autoAlpha: 1,
    });

    const ctrl = { x: (start.x + end.x) / 2, y: Math.min(start.y, end.y) - 140 };

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // 1) к игроку — уменьшаемся до endW (по умолчанию 91 px)
    tl.to(disc, {
      duration: 0.8,
      scale: scaleToEnd,
      motionPath: {
        path: [
          { x: start.x, y: start.y },
          { x: ctrl.x, y: ctrl.y },
          { x: end.x, y: end.y },
        ],
        curviness: 1.2,
      },
    });

    // 2) скрыть контентные блоки
    tl.add(hideTexts());

    // 3) к модалке — увеличиваемся до её размеров и становимся по центру карточки
    const modalTarget = getModalTarget();
    tl.to(
      disc,
      {
        duration: 0.8,
        scale: modalTarget.scale,
        motionPath: {
          path: [
            { x: end.x, y: end.y },
            { x: (end.x + modalTarget.x) / 2, y: Math.min(end.y, modalTarget.y) - 120 },
            { x: modalTarget.x, y: modalTarget.y },
          ],
          curviness: 1.2,
        },
      },
      ">-0.1"
    );

    // 4) исчезновение диска поверх фона модалки
    tl.to(disc, { autoAlpha: 0, duration: 0.35, ease: "power1.inOut" });

    // 5) показать модалку
    tl.add(showModal);
  };

  return (
    <section className={s.finish} ref={sectionRef}>
      <div className={s.finish__container} ref={containerRef}>
        <p className={s.finish__intro}>
          Теперь вы знаете, какая физическая нагрузка будет полезна не только для <br />
          вашего тела, но и для вашего карьерного трека. Остался последний рывок! <br />
          Сделайте уверенный пас и положите начало новой привычке.
        </p>

        <div className={s.flex_bottom}>
          <div className={s.finish__grid}>
            <div className={s.finish__column}>
              <div className={s.finish__imageWrapper}>
                {/* Игрок №1 — точка руки и тонкая подгонка в px */}
                <img
                  className={`${s.finish__image} ${s.isClickable}`}
                  src="/images/f-1.svg"
                  alt=""
                  data-ax="0.99"
                  data-ay="0.33"
                  data-ox="50"         // опционально: сдвиг по X в px
                  data-oy="10"         // опционально: сдвиг по Y в px
                  data-alt="/images/f-1-up.svg"
                  // data-endw="91"    // опционально: своя целевая ширина при прилёте
                  onClick={(e) => handleThrow(e.currentTarget)}
                />
              </div>

              <div className={s.finish__card}>
                <div className={s.finish__content}>
                  <div className={s.finish__text} ref={text1Ref}>
                    <p className={s.finish__name}>Это Паша</p>
                    <p className={s.finish__description}>
                      Он пришёл прокачать скорость принятия решений и теперь обходит защитников
                      лучше всех. Ему можно кинуть короткий пас!
                    </p>
                  </div>
                  <img className={s.finish__image} src="/images/f-2.svg" alt="" />
                </div>
              </div>
            </div>

            <div className={s.finish__column}>
              <div className={s.finish__card}>
                <div className={s.finish__content}>
                  <div className={s.finish__text} ref={text2Ref}>
                    <p className={s.finish__name}>Это Паша</p>
                    <p className={s.finish__description}>
                      Он пришёл прокачать скорость принятия решений и теперь обходит защитников
                      лучше всех. Ему можно кинуть короткий пас!
                    </p>
                  </div>
                  <img className={s.finish__image} src="/images/f-4.svg" alt="" />
                </div>
              </div>

              {/* Игрок №2 */}
              <img
                className={`${s.finish__image} ${s.isClickable}`}
                src="/images/f-3.svg"
                alt=""
                data-ax="0.15"
                data-ay="0.18"
                data-ox="0"
                data-oy="0"
                data-alt="/images/f-3-up.svg"
                onClick={(e) => handleThrow(e.currentTarget)}
              />
            </div>
          </div>

          <div className={s.finish__footer}>
            <div className={s.finish__legal}>
              <p>erid:</p>
              <p>Реклама 18+</p>
              <p>Рекламодатель ООО «СПРИНГЛ». ИНН 7714482000</p>
              <p>
                <a className={s.finish__link} href="/privacy" target="_blank" rel="noopener noreferrer">
                  Политика конфиденциальности
                </a>
              </p>
            </div>
            <div className={s.finish__credits}>
              <p>
                Сделано в <a className={s.finish__link} href="">Ander</a> x{" "}
                <a className={s.finish__link} href="">Loimi</a>
              </p>
            </div>
          </div>
        </div>

        {/* Тарелка */}
        <img ref={discRef} className={s.tarelka} src="/images/footer.svg" alt="" />

        {/* Модалка */}
        <div className={s.modal} ref={modalRef} aria-hidden>
          <div className={s.modal__card}>
            <h3 className={s.modal__title}>Бесплатное занятие</h3>
            <p className={s.modal__text}>по алтимат фрисби — ваше.</p>
            <button className={s.modal__btn} onClick={() => hideModal(resetAll)}>
              Записать в календарь
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Finish;