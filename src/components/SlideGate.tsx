'use client';

import React, { useEffect, useRef } from 'react';
import styles from './SlideGate.module.css';

type Props = {
  children: React.ReactNode | React.ReactNode[];
  durationMs?: number;   // длительность анимации шага (динамическая, от расстояния)
  className?: string;
};

function isScrollable(el: HTMLElement) {
  const style = window.getComputedStyle(el);
  return /auto|scroll/.test(style.overflowY) && el.scrollHeight > el.clientHeight + 1;
}

function findScrollable(target: HTMLElement, within?: HTMLElement) {
  let el: HTMLElement | null = target;
  while (el && (!within || within.contains(el))) {
    if (isScrollable(el)) return el;
    el = el.parentElement;
  }
  return null;
}

// Плавная прокрутка через RAF (мягкая), возвращает стоп-функцию
function animateScrollTo(targetY: number, duration: number, onDone: () => void): () => void {
  const startY = window.scrollY;
  const delta = targetY - startY;

  const noop = () => {};
  if (Math.abs(delta) < 1 || duration <= 0) {
    window.scrollTo(0, targetY);
    onDone();
    return noop;
  }

  const easeInOutSine = (t: number) => 0.5 * (1 - Math.cos(Math.PI * t));
  const start = performance.now();
  let rafId = 0;
  let stopped = false;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    if (rafId) cancelAnimationFrame(rafId);
  };

  const tick = () => {
    if (stopped) return;
    const now = performance.now();
    const t = Math.min(1, (now - start) / duration);
    const eased = easeInOutSine(t);
    const y = startY + delta * eased;
    window.scrollTo(0, y);
    if (t < 1) {
      rafId = requestAnimationFrame(tick);
    } else {
      onDone();
    }
  };

  rafId = requestAnimationFrame(tick);
  return stop;
}

export function SlideGate({
  children,
  durationMs = 900,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<HTMLDivElement[]>([]);

  const animStopRef = useRef<(() => void) | null>(null);
  const animating = useRef(false);
  const lockUntilRef = useRef(0);      // пока активен — гасим wheel внутри SlideGate
  const TAIL_MS = 350;                 // хвост после анимации (съесть инерцию)

  // Исключение для SportSection (первый слайд): игнорим 3 «флика» вниз у конца секции
  const SPORT_SLIDE_INDEX = 0;
  const SPORT_HOLD_STEPS = 3;           // <- можно увеличить/уменьшить задержку
  const SPORT_END_THRESHOLD = 0.985;    // с какого прогресса считаем «конец»
  const GESTURE_GAP_MS = 240;           // антидребезг (минимум между фликами)
  const sportHoldCountRef = useRef(0);
  const sportLastGestureTsRef = useRef(0);

  // Фейд для слайда при первом входе
  const markFadedOnceRef = useRef<Set<number>>(new Set());

  const setSlideRef = (el: HTMLDivElement | null, i: number) => {
    slideRefs.current[i] = el || (null as unknown as HTMLDivElement);
  };

  useEffect(() => {
    const container = containerRef.current!;
    const slides = slideRefs.current.filter(Boolean);
    if (!container || slides.length < 2) return;

    const getTopAbs = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;

    const containerTop = () => container.getBoundingClientRect().top + window.scrollY;
    const containerBottom = () => containerTop() + container.offsetHeight;
    const nearContainerTop = () => window.scrollY <= containerTop() + 1;
    const nearContainerBottom = () => window.scrollY + window.innerHeight >= containerBottom() - 1;

    const getCurrentIndex = () => {
      const y = window.scrollY;
      let idx = 0;
      for (let i = 0; i < slides.length; i++) {
        if (getTopAbs(slides[i]) <= y + 1) idx = i;
        else break;
      }
      return idx;
    };

    // Геометрия и прогресс слайда (устойчиво для pin/spacer)
    const slideRect = (i: number) => slides[i].getBoundingClientRect();
    const slideHeight = (i: number) => slideRect(i).height;
    const isTall = (i: number) => slideHeight(i) > window.innerHeight + 2;
    const slideProgress = (i: number) => {
      const h = slideHeight(i);
      if (h <= window.innerHeight + 1) return 1;
      const topAbs = getTopAbs(slides[i]);
      const scrolled = window.scrollY - topAbs;
      const denom = h - window.innerHeight;
      const p = denom > 0 ? scrolled / denom : 1;
      return Math.max(0, Math.min(1, p));
    };
    const hasInSlideScrollDown = (i: number) => isTall(i) && slideProgress(i) < 1 - 1e-3;
    const hasInSlideScrollUp = (i: number) => isTall(i) && slideProgress(i) > 1e-3;

    // Фейд: подготовка и запуск (однократно для каждого слайда)
    const prepareFade = (i: number) => {
      if (markFadedOnceRef.current.has(i)) return;
      const s = slides[i];
      if (!s) return;
      s.style.opacity = '0';
      s.style.transform = 'translateY(8px)';
      s.style.willChange = 'opacity, transform';
    };
    const runFade = (i: number) => {
      if (markFadedOnceRef.current.has(i)) return;
      const s = slides[i];
      if (!s) return;
      requestAnimationFrame(() => {
        s.style.transition = 'opacity 520ms ease-out, transform 520ms ease-out';
        s.style.opacity = '1';
        s.style.transform = 'translateY(0)';
        window.setTimeout(() => {
          s.style.transition = '';
          s.style.willChange = '';
          markFadedOnceRef.current.add(i);
        }, 560);
      });
    };
    // Не даём первому слайду мигнуть при инициализации
    markFadedOnceRef.current.add(getCurrentIndex());

    const stepToIndex = (nextIndex: number) => {
      const idx = Math.max(0, Math.min(nextIndex, slides.length - 1));
      const destY = getTopAbs(slides[idx]);
      const dist = Math.abs(destY - window.scrollY);
      // мягкость по расстоянию: 650–1400 мс
      const ms = Math.max(650, Math.min(1400, 600 + dist * 0.5));

      // готовим фейд для целевого слайда (если ещё не показывали)
      prepareFade(idx);

      // сбрасываем спорт-холд при самом переходе
      sportHoldCountRef.current = 0;
      sportLastGestureTsRef.current = 0;

      if (animStopRef.current) {
        animStopRef.current();
        animStopRef.current = null;
      }
      animating.current = true;
      lockUntilRef.current = Date.now() + ms + TAIL_MS;

      animStopRef.current = animateScrollTo(destY, ms, () => {
        animating.current = false;
        animStopRef.current = null;
        runFade(idx);
      });
    };

    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (!container.contains(target)) return;

      const dir: 'down' | 'up' = e.deltaY > 0 ? 'down' : 'up';

      // 1) Выход из контейнера — нативно
      if ((dir === 'up' && nearContainerTop()) || (dir === 'down' && nearContainerBottom())) {
        if (animStopRef.current) {
          animStopRef.current();
          animStopRef.current = null;
        }
        animating.current = false;
        lockUntilRef.current = 0;
        sportHoldCountRef.current = 0;
        sportLastGestureTsRef.current = 0;
        return;
      }

      // 2) Замок/анимация — гасим wheel
      const now = Date.now();
      if (animating.current || now < lockUntilRef.current) {
        e.preventDefault();
        return;
      }

      const currentIndex = getCurrentIndex();
      const currentSlide = slides[currentIndex];

      // 3) Внутренний скролл — не перехватываем
      const scrollable = findScrollable(target, currentSlide);
      if (scrollable) {
        const atBottom = Math.ceil(scrollable.scrollTop + scrollable.clientHeight) >= scrollable.scrollHeight;
        const atTop = scrollable.scrollTop <= 0;
        if (e.deltaY > 0 && !atBottom) return;
        if (e.deltaY < 0 && !atTop) return;
      }

      // 4) Длинный слайд: пока есть свой скролл — не шагаем
      if (dir === 'down' && hasInSlideScrollDown(currentIndex)) return;
      if (dir === 'up' && hasInSlideScrollUp(currentIndex)) return;

      // 5) Спец-правило для SportSection (индекс 0): у самого низа — игнорим SPORT_HOLD_STEPS фликов вниз
      if (currentIndex === SPORT_SLIDE_INDEX && dir === 'down' && isTall(currentIndex)) {
        const p = slideProgress(currentIndex);
        if (p >= SPORT_END_THRESHOLD) {
          const since = now - sportLastGestureTsRef.current;
          if (since > GESTURE_GAP_MS) {
            sportHoldCountRef.current += 1;
            sportLastGestureTsRef.current = now;
          }
          if (sportHoldCountRef.current <= SPORT_HOLD_STEPS) {
            e.preventDefault(); // держим
            return;
          }
          // на следующий — сбросим счётчик и пойдём дальше
          sportHoldCountRef.current = 0;
          sportLastGestureTsRef.current = 0;
        } else {
          // ушли от конца — сброс
          sportHoldCountRef.current = 0;
          sportLastGestureTsRef.current = 0;
        }
      } else if (dir === 'up') {
        // любое движение вверх — сброс «держалки»
        sportHoldCountRef.current = 0;
        sportLastGestureTsRef.current = 0;
      }

      // 6) Ровно один шаг к соседнему слайду (если есть)
      const hasNext = currentIndex < slides.length - 1;
      const hasPrev = currentIndex > 0;

      if ((dir === 'down' && !hasNext) || (dir === 'up' && !hasPrev)) {
        return; // край — выпускаем наружу
      }

      e.preventDefault();
      stepToIndex(currentIndex + (dir === 'down' ? 1 : -1));
    };

    // Тач: аналогично — игнорим SPORT_HOLD_STEPS свайпов вниз у конца SportSection
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      if (animStopRef.current) {
        animStopRef.current();
        animStopRef.current = null;
      }
      animating.current = false;
      lockUntilRef.current = 0;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!container.contains(target)) return;

      const dy = e.changedTouches[0].clientY - touchStartY;
      const absY = Math.abs(dy);
      const swipeThreshold = 40;
      if (absY < swipeThreshold) return;

      const dir: 'down' | 'up' = dy < 0 ? 'down' : 'up';

      if ((dir === 'up' && nearContainerTop()) || (dir === 'down' && nearContainerBottom())) {
        sportHoldCountRef.current = 0;
        sportLastGestureTsRef.current = 0;
        return;
      }

      const currentIndex = getCurrentIndex();
      const currentSlide = slides[currentIndex];

      const scrollable = findScrollable(target, currentSlide);
      if (scrollable) {
        const atBottom = Math.ceil(scrollable.scrollTop + scrollable.clientHeight) >= scrollable.scrollHeight;
        const atTop = scrollable.scrollTop <= 0;
        if (dy < 0 && !atBottom) return;
        if (dy > 0 && !atTop) return;
      }

      if (dir === 'down' && hasInSlideScrollDown(currentIndex)) return;
      if (dir === 'up' && hasInSlideScrollUp(currentIndex)) return;

      if (currentIndex === SPORT_SLIDE_INDEX && dir === 'down' && isTall(currentIndex)) {
        const p = slideProgress(currentIndex);
        if (p >= SPORT_END_THRESHOLD) {
          sportHoldCountRef.current += 1;
          if (sportHoldCountRef.current <= SPORT_HOLD_STEPS) {
            return; // держим N раз
          }
          sportHoldCountRef.current = 0;
        } else {
          sportHoldCountRef.current = 0;
        }
      } else if (dir === 'up') {
        sportHoldCountRef.current = 0;
      }

      const hasNext = currentIndex < slides.length - 1;
      const hasPrev = currentIndex > 0;

      if (dir === 'down' && hasNext) stepToIndex(currentIndex + 1);
      else if (dir === 'up' && hasPrev) stepToIndex(currentIndex - 1);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel as EventListener);
      window.removeEventListener('touchstart', onTouchStart as EventListener);
      window.removeEventListener('touchend', onTouchEnd as EventListener);
      if (animStopRef.current) {
        animStopRef.current();
        animStopRef.current = null;
      }
      animating.current = false;
      lockUntilRef.current = 0;
      sportHoldCountRef.current = 0;
      sportLastGestureTsRef.current = 0;
    };
  }, [durationMs]);

  return (
    <section ref={containerRef} className={[styles.container, className].filter(Boolean).join(' ')}>
      <div className={styles.track}>
        {React.Children.toArray(children)
          .filter(Boolean)
          .map((child, i) => (
            <div key={i} ref={(el) => setSlideRef(el, i)} className={styles.slide}>
              {child}
            </div>
          ))}
      </div>
    </section>
  );
}