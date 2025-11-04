"use client";

import { useRef, useEffect } from "react";
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

  // для отката спрайта игрока
  const swappedRef = useRef<{ el: HTMLImageElement; original: string } | null>(
    null
  );

  // Состояние idle (поворот + горизонтальный сдвиг)
  const idleRef = useRef({
    target: 0,      // целевой угол (deg)
    current: 0,     // текущий угол (deg)
    xTarget: 0,     // целевой dx (px)
    xCurrent: 0,    // текущий dx (px)
    lastMove: 0,    // время последнего движения курсора
  });

  // ——— Idle: плавное раскачивание и лёгкий сдвиг по X за курсором ———
  useEffect(() => {
    const cont = containerRef.current;
    const disc = discRef.current;
    if (!cont || !disc) return;

    const pointerFine = window.matchMedia?.("(pointer: fine)")?.matches;
    if (!pointerFine) return; // на тачах — выключено

    // старт
    disc.style.transform = "translateX(-50%) rotate(0deg)";

    let r = cont.getBoundingClientRect();
    const ROT_MAX = 5;     // максимальный угол (deg)
    const DX_MAX = 8;      // максимальный сдвиг по X (px)
    const SMOOTH = 0.12;   // коэффициент сглаживания (0..1)
    const IDLE_WOBBLE = 0.6; // автоколебания по вращению при простое (deg)
    const IDLE_DELAY = 900;  // через сколько мс без движения включать автоколебания

    const update = () => {
      const st = idleRef.current;

      // если курсор не менялся давно и нет полёта — лёгкая автокачалка по вращению
      const idleNow =
        !busyRef.current && performance.now() - st.lastMove > IDLE_DELAY;
      const desiredRot = idleNow
        ? Math.sin((performance.now() / 1000) * 1.2) * IDLE_WOBBLE
        : st.target;

      const desiredDx = idleNow ? 0 : st.xTarget; // по X без автоколебаний

      // сглаживание к целевым значениям
      st.current += (desiredRot - st.current) * SMOOTH;
      st.xCurrent += (desiredDx - st.xCurrent) * SMOOTH;

      // не вмешиваемся в полёт — там GSAP управляет transform
      if (!busyRef.current) {
        disc.style.transform = `translateX(calc(-50% + ${st.xCurrent.toFixed(
          2
        )}px)) rotate(${st.current.toFixed(3)}deg)`;
      }
    };

    const onMove = (e: PointerEvent) => {
      idleRef.current.lastMove = performance.now();
      if (busyRef.current) {
        // во время полёта целимся в 0
        idleRef.current.target = 0;
        idleRef.current.xTarget = 0;
        return;
      }
      const cx = r.left + r.width / 2;
      // нормируем в интервал [-1..1]
      const nx = gsap.utils.clamp(-1, 1, (e.clientX - cx) / (r.width / 2));
      // мягкая нелинейность, чтобы около центра движения были плавнее
      const eased = Math.sign(nx) * Math.pow(Math.abs(nx), 0.7);
      idleRef.current.target = -eased * ROT_MAX;
      idleRef.current.xTarget = eased * DX_MAX;
    };

    const onLeave = () => {
      idleRef.current.lastMove = performance.now();
      idleRef.current.target = 0;
      idleRef.current.xTarget = 0;
    };

    const onResize = () => {
      r = cont.getBoundingClientRect();
    };

    gsap.ticker.add(update);
    cont.addEventListener("pointermove", onMove);
    cont.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);

    return () => {
      gsap.ticker.remove(update);
      cont.removeEventListener("pointermove", onMove);
      cont.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  // ——— /Idle ———

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

  // точка попадания по data-ax/ay (+ data-ox/oy), с учётом конечного масштаба
  const getTargetPoint = (img: HTMLImageElement, scaleForEnd = 1) => {
    const cont = containerRef.current!;
    const cr = cont.getBoundingClientRect();
    const ir = img.getBoundingClientRect();

    const ax = Number(img.dataset.ax ?? 0.5); // 0..1
    const ay = Number(img.dataset.ay ?? 0.5); // 0..1
    const ox = Number(img.dataset.ox ?? 0); // px
    const oy = Number(img.dataset.oy ?? 0); // px

    const { w: dw, h: dh } = getDiscSize();

    const px = ir.left + ir.width * ax - cr.left + ox;
    const py = ir.top + ir.height * ay - cr.top + oy;

    return { x: px - (dw * scaleForEnd) / 2, y: py - (dh * scaleForEnd) / 2 };
  };

  // позиция/масштаб диска под размеры modal__card
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
    const c1 = text1Ref.current!.closest(
      `.${s.finish__content}`
    ) as HTMLDivElement;
    const c2 = text2Ref.current!.closest(
      `.${s.finish__content}`
    ) as HTMLDivElement;
    return gsap.to([c1, c2], {
      autoAlpha: 0,
      y: 10,
      duration: 0.35,
      ease: "power1.out",
    });
  };

  // показать .finish__content
  const showTexts = () => {
    const c1 = text1Ref.current!.closest(
      `.${s.finish__content}`
    ) as HTMLDivElement;
    const c2 = text2Ref.current!.closest(
      `.${s.finish__content}`
    ) as HTMLDivElement;
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
      // вернуть в версточное состояние
      gsap.set(disc, { clearProps: "all", autoAlpha: 1, scale: 1 });
      disc.style.transform = "translateX(-50%) rotate(0deg)";
      idleRef.current.current = 0;
      idleRef.current.target = 0;
      idleRef.current.xCurrent = 0;
      idleRef.current.xTarget = 0;
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

    // Сразу скрываем инфоблоки
    hideTexts();

    // Свести idle к нулю (мягко) и зафиксировать
    idleRef.current.target = 0;
    idleRef.current.xTarget = 0;

    // смена спрайта игрока на поднятую руку
    const originalSrc = img.src;
    let altSrc = img.dataset.alt;
    if (!altSrc) altSrc = img.src.replace(/(\.\w+)$/, "-up$1");
    img.src = altSrc!;
    swappedRef.current = { el: img, original: originalSrc };

    const cont = containerRef.current!;
    const disc = discRef.current!;
    const cr = cont.getBoundingClientRect();
    const dr = disc.getBoundingClientRect();

    // старт — фиксируем текущие координаты
    const start = { x: dr.left - cr.left, y: dr.top - cr.top };

    // целевая ширина у игрока (по умолчанию 91)
    const { w: startW } = getDiscSize();
    const endW = Number(img.dataset.endw ?? 91);
    const scaleToEnd = endW / startW;

    const end = getTargetPoint(img, scaleToEnd);

    // На время анимации — управляем через x/y
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

    // Контрольная точка дуги (плоская)
    const ctrl = {
      x: (start.x + end.x) / 2,
      y: Math.min(start.y, end.y) - 120,
    };

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // 1) к игроку — уменьшаемся до endW
    tl.to(disc, {
      duration: 0.8,
      scale: scaleToEnd,
      motionPath: {
        path: [
          { x: start.x, y: start.y },
          { x: ctrl.x, y: ctrl.y },
          { x: end.x, y: end.y },
        ],
        curviness: 0.55,
      },
    });

    // 2) к модалке — увеличиваемся до её размеров
    const modalTarget = getModalTarget();
    tl.to(
      disc,
      {
        duration: 0.8,
        scale: modalTarget.scale,
        motionPath: {
          path: [
            { x: end.x, y: end.y },
            {
              x: (end.x + modalTarget.x) / 2,
              y: Math.min(end.y, modalTarget.y) - 100,
            },
            { x: modalTarget.x, y: modalTarget.y },
          ],
          curviness: 0.55,
        },
      },
      ">-0.1"
    );

    // 3) исчезновение диска поверх фона модалки
    tl.to(disc, { autoAlpha: 0, duration: 0.35, ease: "power1.inOut" });

    // 4) показать модалку
    tl.add(showModal);
  };

  return (
    <section className={s.finish} ref={sectionRef}>
      <div className={s.finish__container} ref={containerRef}>
        <p className={s.finish__intro}>
          Теперь вы знаете, какая физическая нагрузка будет полезна не только
          для <br />
          вашего тела, но и для вашего карьерного трека. Остался последний
          рывок! <br />
          Сделайте уверенный пас и положите начало новой привычке.
        </p>

        <div className={s.flex_bottom}>
          <div className={s.finish__grid}>
            <div className={s.finish__column}>
              {/* Игрок №1 (с тенью) */}
              <div
                className={s.finish__imageWrapper}
                style={{ position: "relative", display: "inline-block" }}
              >
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: "-4px",
                    width: "82%",
                    maxWidth: "340px",
                    height: "26px",
                    transform: "translateX(-50%) scale(1, 0.35)",
                    borderRadius: "50%",
                    background:
                      "radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.7) 0%, rgba(0,0,0,1) 100%)",
                    filter: "blur(33px)",
                    opacity: 0.45,
                    pointerEvents: "none",
                    zIndex: 0,
                  }}
                />
                <img
                  className={`${s.finish__image} ${s.isClickable}`}
                  src="/images/f-1.svg"
                  alt=""
                  data-ax="0.99"
                  data-ay="0.33"
                  data-ox="50"
                  data-oy="10"
                  data-alt="/images/f-1-up.svg"
                  onClick={(e) => handleThrow(e.currentTarget)}
                  style={{ position: "relative", zIndex: 1, cursor: "pointer" }}
                />
              </div>

              <div className={s.finish__card}>
                <div className={s.finish__content}>
                  <div className={s.finish__text} ref={text1Ref}>
                    <p className={s.finish__name}>Это Паша</p>
                    <p className={s.finish__description}>
                      Он пришёл прокачать скорость принятия решений и теперь
                      обходит защитников лучше всех. Ему можно кинуть короткий
                      пас!
                    </p>
                  </div>
                  <img
                    className={s.finish__image}
                    src="/images/f-2.svg"
                    alt=""
                  />
                </div>
              </div>
            </div>

            <div className={s.finish__column}>
              <div className={s.finish__card}>
                <div className={s.finish__content}>
                  <div className={s.finish__text} ref={text2Ref}>
                    <p className={s.finish__name}>Это Маша</p>
                    <p className={s.finish__description}>
                      Она хотела развить выносливость и теперь может бегать на
                      самые дальние дистанции. Ей можно дать длинный пас!
                    </p>
                  </div>
                  <img
                    className={s.finish__image}
                    src="/images/f-4.svg"
                    alt=""
                  />
                </div>
              </div>

              {/* Игрок №2 (с тенью) */}
              <div
                className={s.finish__imageWrapper}
                style={{ position: "relative", display: "inline-block" }}
              >
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: "40px",
                    width: "82%",
                    maxWidth: "340px",
                    height: "36px",
                    transform: "translateX(-50%) scale(1, 0.35)",
                    borderRadius: "50%",
                    background:
                      "radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 100%)",
                    filter: "blur(33px)",
                    opacity: 0.45,
                    pointerEvents: "none",
                    zIndex: 0,
                  }}
                />
                <img
                  className={`${s.finish__image} ${s.isClickable}`}
                  src="/images/f-3.svg"
                  alt=""
                  data-ax="0.15"
                  data-ay="0.29"
                  data-ox="-30"
                  data-oy="8"
                  data-alt="/images/f-3-up.svg"
                  onClick={(e) => handleThrow(e.currentTarget)}
                  style={{ position: "relative", zIndex: 1, cursor: "pointer" }}
                />
              </div>
            </div>
          </div>

          <div className={s.finish__footer}>
            <div className={s.finish__legal}>
              <p>erid:</p>
              <p>Реклама 18+</p>
              <p>Рекламодатель ООО «СПРИНГЛ». ИНН 7714482000</p>
              <p>
                <a
                  className={s.finish__link}
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Политика конфиденциальности
                </a>
              </p>
            </div>
            <div className={s.finish__credits}>
              <p>
                Сделано в{" "}
                <a className={s.finish__link} href="">
                  Ander
                </a>{" "}
                x{" "}
                <a className={s.finish__link} href="">
                  Loimi
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Тарелка */}
        <img
          ref={discRef}
          className={s.tarelka}
          src="/images/footer.svg"
          alt=""
        />

        {/* Модалка */}
        <div className={s.modal} ref={modalRef} aria-hidden>
          <div className={s.modal__card}>
            <h3 className={s.modal__title}>Бесплатное занятие</h3>
            <p className={s.modal__text}>по алтимат фрисби — ваше.</p>
            <button
              className={s.modal__btn}
              onClick={() => hideModal(resetAll)}
            >
              Записать в календарь
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Finish;