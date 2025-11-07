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

  // для отката спрайта игрока (только для десктопа)
  const swappedRef = useRef<{ el: HTMLImageElement; original: string } | null>(
    null
  );

  // флаг мобилки
  const isMobileRef = useRef(false);

  // Состояние idle (поворот + горизонтальный сдвиг)
  const idleRef = useRef({
    target: 0,
    current: 0,
    xTarget: 0,
    xCurrent: 0,
    lastMove: 0,
  });

  // На мобилке сразу показываем «вторые» спрайты людей (data-alt). На десктопе — оригиналы.
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const mq = window.matchMedia("(max-width: 811px)");

    const applySprites = () => {
      isMobileRef.current = mq.matches;
      const imgs = Array.from(
        root.querySelectorAll("img[data-alt]")
      ) as HTMLImageElement[];

      if (mq.matches) {
        // Mobile: подставляем alt и запоминаем original в data-orig один раз
        imgs.forEach((img) => {
          if (!img.getAttribute("data-orig"))
            img.setAttribute("data-orig", img.src);
          let alt = img.dataset.alt as string | undefined;
          if (!alt) alt = img.src.replace(/(\.\w+)$/, "-up$1");
          if (img.src !== alt) img.src = alt;
        });
      } else {
        // Desktop: возвращаем оригиналы, если есть сохранённые
        imgs.forEach((img) => {
          const orig = img.getAttribute("data-orig");
          if (orig && img.src !== orig) img.src = orig;
          img.removeAttribute("data-orig");
        });
      }
    };

    applySprites();
    // @ts-ignore кроссбраузерная подписка
    mq.addEventListener
      ? mq.addEventListener("change", applySprites)
      : mq.addListener(applySprites as any);
    return () => {
      // @ts-ignore кроссбраузерная отписка
      mq.removeEventListener
        ? mq.removeEventListener("change", applySprites)
        : mq.removeListener(applySprites as any);
    };
  }, []);

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
    const ROT_MAX = 5;
    const DX_MAX = 8;
    const SMOOTH = 0.12;
    const IDLE_WOBBLE = 0.6;
    const IDLE_DELAY = 900;

    const update = () => {
      const st = idleRef.current;

      const idleNow =
        !busyRef.current && performance.now() - st.lastMove > IDLE_DELAY;
      const desiredRot = idleNow
        ? Math.sin((performance.now() / 1000) * 1.2) * IDLE_WOBBLE
        : st.target;
      const desiredDx = idleNow ? 0 : st.xTarget;

      st.current += (desiredRot - st.current) * SMOOTH;
      st.xCurrent += (desiredDx - st.xCurrent) * SMOOTH;

      if (!busyRef.current) {
        disc.style.transform = `translateX(calc(-50% + ${st.xCurrent.toFixed(
          2
        )}px)) rotate(${st.current.toFixed(3)}deg)`;
      }
    };

    const onMove = (e: PointerEvent) => {
      idleRef.current.lastMove = performance.now();
      if (busyRef.current) {
        idleRef.current.target = 0;
        idleRef.current.xTarget = 0;
        return;
      }
      const cx = r.left + r.width / 2;
      const nx = gsap.utils.clamp(-1, 1, (e.clientX - cx) / (r.width / 2));
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

  // БАЗОВЫЕ (без поворота) размеры диска: по CSS width + соотношению сторон
  const getDiscBaseSize = () => {
    const disc = discRef.current!;
    const rect = disc.getBoundingClientRect();
    const cssW = parseFloat(getComputedStyle(disc).width) || rect.width || 325;
    const ratio =
      disc.naturalWidth && disc.naturalHeight
        ? disc.naturalHeight / disc.naturalWidth
        : rect.width
        ? rect.height / rect.width
        : 0.5;
    const w = cssW;
    const h = cssW * ratio;
    return { w, h };
  };

  // точка попадания по data-ax/ay (+ data-ox/oy), с учётом конечного масштаба (origin = 0 0)
  const getTargetTopLeft = (img: HTMLImageElement, scaleForEnd = 1) => {
    const cont = containerRef.current!;
    const cr = cont.getBoundingClientRect();
    const ir = img.getBoundingClientRect();

    const ax = Number(img.dataset.ax ?? 0.5);
    const ay = Number(img.dataset.ay ?? 0.5);
    const ox = Number(img.dataset.ox ?? 0);
    const oy = Number(img.dataset.oy ?? 0);

    const { w: dw, h: dh } = getDiscBaseSize();

    const px = ir.left + ir.width * ax - cr.left + ox;
    const py = ir.top + ir.height * ay - cr.top + oy;

    return { x: px - (dw * scaleForEnd) / 2, y: py - (dh * scaleForEnd) / 2 };
  };

  // позиция/масштаб диска под размеры modal__card (по центру карточки)
  const getModalTarget = () => {
    const cont = containerRef.current!;
    const modal = modalRef.current!;
    const card = modal.querySelector(`.${s.modal__card}`) as HTMLElement;
    const cr = cont.getBoundingClientRect();
    const rr = card.getBoundingClientRect();
    const { w, h } = getDiscBaseSize();

    const scale = rr.width / w;
    const x = rr.left - cr.left + (rr.width - w * scale) / 2;
    const y = rr.top - cr.top + (rr.height - h * scale) / 2;

    return { x, y, scale };
  };

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
      gsap.set(disc, { clearProps: "all", autoAlpha: 1, scale: 1 });
      disc.style.transform = "translateX(-50%) rotate(0deg)";
      idleRef.current.current = 0;
      idleRef.current.target = 0;
      idleRef.current.xCurrent = 0;
      idleRef.current.xTarget = 0;
    }
    // Возвращаем спрайт только если был swap (т.е. на десктопе)
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

    hideTexts();

    // Свести idle к нулю
    idleRef.current.target = 0;
    idleRef.current.xTarget = 0;

    // Десктоп: меняем спрайт на «поднятая рука». Мобилка: уже «up», пропускаем.
    if (!isMobileRef.current) {
      const originalSrc = img.src;
      let altSrc = img.dataset.alt;
      if (!altSrc) altSrc = img.src.replace(/(\.\w+)$/, "-up$1");
      img.src = altSrc!;
      swappedRef.current = { el: img, original: originalSrc };
    } else {
      swappedRef.current = null;
    }

    const cont = containerRef.current!;
    const disc = discRef.current!;
    const cr = cont.getBoundingClientRect();
    const dr = disc.getBoundingClientRect();

    // 1) фиксируем видимую позицию диска относительно контейнера
    const startLeft = dr.left - cr.left;
    const startTop = dr.top - cr.top;

    // 2) Сбрасываем transform и «прибиваем» диск в ту же точку (origin = 0 0!)
    gsap.set(disc, {
      position: "absolute",
      left: startLeft,
      top: startTop,
      right: "auto",
      bottom: "auto",
      transform: "none",
      transformOrigin: "0 0",
      x: 0,
      y: 0,
      scale: 1,
      autoAlpha: 1,
      overwrite: true,
    });

    // 3) Первая дуга: к игроку
    const { w: baseW } = getDiscBaseSize();
    const endW = Number(img.dataset.endw ?? 91);
    const scaleToEnd = endW / baseW;

    const endAbs = getTargetTopLeft(img, scaleToEnd);
    const ctrl1Abs = {
      x: (startLeft + endAbs.x) / 2,
      y: Math.min(startTop, endAbs.y) - 120,
    };

    const path1 = [
      { x: 0, y: 0 },
      { x: ctrl1Abs.x - startLeft, y: ctrl1Abs.y - startTop },
      { x: endAbs.x - startLeft, y: endAbs.y - startTop },
    ];

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    tl.to(disc, {
      duration: 0.8,
      scale: scaleToEnd,
      motionPath: {
        path: path1,
        curviness: 0.55,
        autoRotate: false,
      },
    });

    // 4) Вторая дуга: к модалке (центр карточки по вертикали)
    const modalTarget = getModalTarget();
    const ctrl2Abs = {
      x: (endAbs.x + modalTarget.x) / 2,
      y: Math.min(endAbs.y, modalTarget.y) - 100,
    };

    const path2 = [
      { x: endAbs.x - startLeft, y: endAbs.y - startTop },
      { x: ctrl2Abs.x - startLeft, y: ctrl2Abs.y - startTop },
      { x: modalTarget.x - startLeft, y: modalTarget.y - startTop },
    ];

    tl.to(
      disc,
      {
        duration: 0.8,
        scale: modalTarget.scale,
        motionPath: {
          path: path2,
          curviness: 0.55,
          autoRotate: false,
        },
      },
      ">-0.1"
    );

    // 5) исчезновение диска поверх фона модалки
    tl.to(disc, { autoAlpha: 0, duration: 0.35, ease: "power1.inOut" });

    // 6) показать модалку
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
                  data-ox="20"
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
              <p>erid: 2SDnjeVK1nf</p>
              <p>Реклама 18+</p>
              <p>Рекламодатель ООО «СПРИНГЛ». ИНН 7714482000</p>
              <p>
                <a
                  className={s.finish__link}
                  href="https://frankmedia.ru/privacy-policy "
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
                <a className={s.finish__link} href="https://www.anderteam.ru">
                  Ander
                </a>{" "}
                x{" "}
                <a className={s.finish__link} href="https://loimi.ru/ ">
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
