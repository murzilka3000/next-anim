'use client';

import React, { useEffect, useRef } from 'react';
import styles from './SlideGate.module.css';

type Props = {
  children: React.ReactNode | React.ReactNode[];
  thresholdPx?: number;   // зона кромки (px), в пределах которой срабатывает докрутка
  durationMs?: number;    // базовая длительность (ориентир)
  className?: string;
};

function isScrollable(el: HTMLElement) {
  const style = window.getComputedStyle(el);
  const canY =
    /auto|scroll/.test(style.overflowY) &&
    el.scrollHeight > el.clientHeight + 1;
  return canY;
}

function findScrollable(target: HTMLElement, within?: HTMLElement) {
  let el: HTMLElement | null = target;
  while (el && (!within || within.contains(el))) {
    if (isScrollable(el)) return el;
    el = el.parentElement;
  }
  return null;
}

// плавная прокрутка через RAF, всегда возвращает стоп-функцию
function animateScrollTo(targetY: number, duration: number, onDone: () => void): () => void {
  const startY = window.scrollY;
  const delta = targetY - startY;

  const noop = () => {};
  if (Math.abs(delta) < 1 || duration <= 0) {
    window.scrollTo(0, targetY);
    onDone();
    return noop;
  }

  const start = performance.now();
  const easeInOutSine = (t: number) => 0.5 * (1 - Math.cos(Math.PI * t));

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
  thresholdPx = 24,
  durationMs = 900, // базовая мягкость
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<HTMLDivElement[]>([]);

  // состояние анимации
  const animStopRef = useRef<(() => void) | null>(null);
  const animTargetY = useRef<number | null>(null);
  const animating = useRef(false);
  const animDirection = useRef<'down' | 'up' | null>(null);

  // единый «замок жеста»: пока активен, игнорируем все wheel (мышь/тачпад)
  const gestureLockedUntilRef = useRef<number>(0);
  const GESTURE_TAIL_MS = 500; // хвост после анимации, чтобы съесть инерцию

  const childArray = React.Children.toArray(children).filter(Boolean);

  const setSlideRef = (el: HTMLDivElement | null, i: number) => {
    slideRefs.current[i] = el || (null as unknown as HTMLDivElement);
  };

  useEffect(() => {
    const container = containerRef.current!;
    const slides = slideRefs.current.filter(Boolean);
    if (!container || slides.length < 2) return;

    const getTopAbs = (el: HTMLElement) =>
      el.getBoundingClientRect().top + window.scrollY;
    const getRect = (el: HTMLElement) => el.getBoundingClientRect();

    const getContainerTopAbs = () =>
      container.getBoundingClientRect().top + window.scrollY;
    const getContainerBottomAbs = () =>
      getContainerTopAbs() + container.offsetHeight;

    const getCurrentIndex = () => {
      const curY = window.scrollY;
      let idx = 0;
      for (let i = 0; i < slides.length; i++) {
        if (getTopAbs(slides[i]) <= curY + 1) idx = i;
        else break;
      }
      return idx;
    };

    const getNextIndex = (i: number) => (i + 1 < slides.length ? i + 1 : null);
    const getPrevIndex = (i: number) => (i - 1 >= 0 ? i - 1 : null);

    // зоны «кромок» текущего слайда
    const nearTopOf = (i: number) => {
      const r = getRect(slides[i]);
      return r.top >= -thresholdPx && r.top <= thresholdPx;
    };
    const nearBottomOf = (i: number) => {
      const r = getRect(slides[i]);
      return (
        r.bottom >= window.innerHeight - thresholdPx &&
        r.bottom <= window.innerHeight + thresholdPx
      );
    };

    // у кромок всего контейнера — можно «выйти» наружу (к соседним обычным секциям)
    const nearContainerTopOut = () => {
      const r = container.getBoundingClientRect();
      return r.top >= -1; // близко к верху окна
    };
    const nearContainerBottomOut = () => {
      const r = container.getBoundingClientRect();
      return r.bottom <= window.innerHeight + 1; // низ контейнера в зоне окна
    };

    const stopCurrentAnim = () => {
      if (animStopRef.current) {
        animStopRef.current();
        animStopRef.current = null;
      }
      animating.current = false;
      animTargetY.current = null;
      animDirection.current = null;
    };

    // длительность по расстоянию (мягко)
    const durationFor = (distance: number) => {
      const dist = Math.max(0, distance);
      // 650–1400 мс, растёт с расстоянием
      const ms = 600 + dist * 0.5;
      return Math.max(650, Math.min(1400, ms));
    };

    const lockGesturesFor = (ms: number) => {
      gestureLockedUntilRef.current = Date.now() + ms;
    };

    const startSmoothTo = (y: number, ms: number) => {
      stopCurrentAnim();
      animating.current = true;
      animTargetY.current = y;
      animDirection.current = window.scrollY < y ? 'down' : 'up';
      // блокируем события на всю длительность анимации
      lockGesturesFor(ms);
      animStopRef.current = animateScrollTo(y, ms, () => {
        animating.current = false;
        animTargetY.current = null;
        animDirection.current = null;
        animStopRef.current = null;
        // добавляем хвост — съесть инерцию (мышь/тачпад)
        lockGesturesFor(GESTURE_TAIL_MS);
      });
    };

    const onScroll = () => {
      // если докрутили/перепрыгнули — завершаем анимацию
      if (!animating.current || animTargetY.current == null) return;
      const delta = Math.abs(window.scrollY - animTargetY.current);
      const overshootDown =
        animDirection.current === 'down' && window.scrollY > animTargetY.current;
      const overshootUp =
        animDirection.current === 'up' && window.scrollY < animTargetY.current;
      if (delta < 1.5 || overshootDown || overshootUp) {
        stopCurrentAnim();
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (!container.contains(e.target as Node)) return;

      const now = Date.now();
      const dir: 'down' | 'up' = e.deltaY > 0 ? 'down' : 'up';

      // Если пользователь у кромки SlideGate и скроллит наружу — даём выйти,
      // даже если идёт анимация или активен «замок жеста».
      if (dir === 'down' && nearContainerBottomOut()) {
        // если анимация шла — отменяем её, выходим к следующим секциям
        if (animating.current) stopCurrentAnim();
        return; // не preventDefault — нативный скролл вниз
      }
      if (dir === 'up' && nearContainerTopOut()) {
        if (animating.current) stopCurrentAnim();
        return; // нативный скролл вверх
      }

      // Внутри SlideGate: если анимация идёт или замок активен — гасим события
      if (animating.current || now < gestureLockedUntilRef.current) {
        e.preventDefault();
        return;
      }

      const currentIndex = getCurrentIndex();
      const nextIndex = getNextIndex(currentIndex);
      const prevIndex = getPrevIndex(currentIndex);

      const target = e.target as HTMLElement;
      const targetSlide =
        slides.find((s) => s.contains(target)) || slides[currentIndex];

      // если прокручивается внутренний контейнер — не перехватываем
      const scrollable = findScrollable(target, targetSlide);
      if (scrollable) {
        const atBottom =
          Math.ceil(scrollable.scrollTop + scrollable.clientHeight) >=
          scrollable.scrollHeight;
        const atTop = scrollable.scrollTop <= 0;
        if (e.deltaY > 0 && !atBottom) return;
        if (e.deltaY < 0 && !atTop) return;
      }

      const downEdge = nextIndex != null && nearBottomOf(currentIndex);
      const upEdge = prevIndex != null && nearTopOf(currentIndex);

      // вне зон кромок слайда — даём странице крутиться как обычно
      if (!downEdge && !upEdge) return;

      // Берём управление: ровно один соседний слайд за жест
      e.preventDefault();

      const curY = window.scrollY;

      if (dir === 'down' && downEdge && nextIndex != null) {
        const nextTop = getTopAbs(slides[nextIndex]);
        const dist = Math.abs(nextTop - curY);
        const ms = durationFor(dist);
        startSmoothTo(nextTop, ms);
        return;
      }

      if (dir === 'up' && upEdge && prevIndex != null) {
        const prevTop = getTopAbs(slides[prevIndex]);
        const dist = Math.abs(prevTop - curY);
        const ms = durationFor(dist);
        startSmoothTo(prevTop, ms);
        return;
      }
    };

    // свайпы (тач-экраны) — мягко, аналогично
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      stopCurrentAnim();
      // тач не блокируем по таймеру — сам жест короткий,
      // но хвост колеса нас не касается
      gestureLockedUntilRef.current = 0;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (animating.current) return;

      const t = e.changedTouches[0];
      const dy = t.clientY - touchStartY;
      const absY = Math.abs(dy);
      const swipeThreshold = 40;
      if (absY < swipeThreshold) return;

      const currentIndex = getCurrentIndex();
      const nextIndex = getNextIndex(currentIndex);
      const prevIndex = getPrevIndex(currentIndex);

      const targetEl = e.target as HTMLElement;
      const targetSlide =
        slides.find((s) => s.contains(targetEl)) || slides[currentIndex];

      // скролл внутри — не перехватываем
      const scrollable = findScrollable(targetEl, targetSlide);
      if (scrollable) {
        const atBottom =
          Math.ceil(scrollable.scrollTop + scrollable.clientHeight) >=
          scrollable.scrollHeight;
        const atTop = scrollable.scrollTop <= 0;
        if (dy < 0 && !atBottom) return;
        if (dy > 0 && !atTop) return;
      }

      const curY = window.scrollY;

      // у кромки контейнера — даём выйти наружу нативно
      if (dy < 0 && nearContainerBottomOut()) return;
      if (dy > 0 && nearContainerTopOut()) return;

      if (dy < 0 && nextIndex != null && nearBottomOf(currentIndex)) {
        const nextTop = getTopAbs(slides[nextIndex]);
        const dist = Math.abs(nextTop - curY);
        const ms = Math.max(400, Math.min(900, 350 + dist * 0.4));
        startSmoothTo(nextTop, ms);
      } else if (dy > 0 && prevIndex != null && nearTopOf(currentIndex)) {
        const prevTop = getTopAbs(slides[prevIndex]);
        const dist = Math.abs(prevTop - curY);
        const ms = Math.max(400, Math.min(900, 350 + dist * 0.4));
        startSmoothTo(prevTop, ms);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      container.removeEventListener('wheel', onWheel as EventListener);
      container.removeEventListener('touchstart', onTouchStart as EventListener);
      container.removeEventListener('touchend', onTouchEnd as EventListener);
      if (animStopRef.current) {
        animStopRef.current();
        animStopRef.current = null;
      }
      gestureLockedUntilRef.current = 0;
    };
  }, [thresholdPx, durationMs, childArray.length]);

  return (
    <section ref={containerRef} className={[styles.container, className].filter(Boolean).join(' ')}>
      <div className={styles.track}>
        {React.Children.toArray(children).filter(Boolean).map((child, i) => (
          <div key={i} ref={(el) => setSlideRef(el, i)} className={styles.slide}>
            {child}
          </div>
        ))}
      </div>
    </section>
  );
}