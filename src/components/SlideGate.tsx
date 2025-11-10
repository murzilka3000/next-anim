'use client';

import React, { useEffect, useRef } from 'react';
import styles from './SlideGate.module.css';

type Props = {
  children: React.ReactNode | React.ReactNode[]; // можно 2+ секций
  thresholdPx?: number;  // зона кромки (px), в пределах которой срабатывает докрутка
  durationMs?: number;   // базовая длительность (используется как ориентир для мыши)
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

// эвристика: отличаем колёсико мыши от тачпада
function isLikelyMouseWheel(e: WheelEvent) {
  if (e.deltaMode === 1) return true; // «строки» — чаще мышь
  const absY = Math.abs(e.deltaY);
  const absX = Math.abs(e.deltaX);
  // большие скачки — чаще мышь (на Win/Chrome ~100/125)
  return absY >= 40 || absX >= 40;
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
  // мягкая симметричная функция
  const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

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
    const eased = easeInOutCubic(t);
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
  durationMs = 800, // базовая мягкость для мыши
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<HTMLDivElement[]>([]);

  // состояние анимации
  const animStopRef = useRef<(() => void) | null>(null);
  const animTargetY = useRef<number | null>(null);
  const animating = useRef(false);
  const animDirection = useRef<'down' | 'up' | null>(null);

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

    const stopCurrentAnim = () => {
      if (animStopRef.current) {
        animStopRef.current();
        animStopRef.current = null;
      }
      animating.current = false;
      animTargetY.current = null;
      animDirection.current = null;
    };

    // динамическая длительность: мягче и чуть медленнее для мыши
    const durationFor = (distance: number, mode: 'wheel' | 'trackpad') => {
      const dist = Math.max(0, distance);
      if (mode === 'wheel') {
        // ~0.9 px/ms, но в рамках 500–1200 мс
        const ms = dist / 0.9;
        return Math.max(500, Math.min(1200, ms));
      }
      // трекпад быстрее: ~1.6 px/ms, в рамках 320–800 мс
      const ms = dist / 1.6;
      return Math.max(320, Math.min(800, ms));
    };

    const startSmoothTo = (y: number, ms: number) => {
      stopCurrentAnim();
      animating.current = true;
      animTargetY.current = y;
      animDirection.current = window.scrollY < y ? 'down' : 'up';
      animStopRef.current = animateScrollTo(y, ms, () => {
        animating.current = false;
        animTargetY.current = null;
        animDirection.current = null;
        animStopRef.current = null;
      });
    };

    const onScroll = () => {
      // если докрутили/перепрыгнули — считаем, что анимация завершена
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

      // если анимация идёт и направление поменялось — отменяем и дадим новому жесту стартовать
      if (animating.current) {
        if (
          (e.deltaY > 0 && animDirection.current === 'up') ||
          (e.deltaY < 0 && animDirection.current === 'down')
        ) {
          stopCurrentAnim();
        } else {
          return; // продолжаем текущую
        }
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

      const isMouse = isLikelyMouseWheel(e);
      const downEdge = nextIndex != null && nearBottomOf(currentIndex);
      const upEdge = prevIndex != null && nearTopOf(currentIndex);

      // не у кромок — обычный скролл
      if (!downEdge && !upEdge) return;

      // целевые координаты
      const curY = window.scrollY;

      if (e.deltaY > 0 && downEdge && nextIndex != null) {
        const nextTop = getTopAbs(slides[nextIndex]);
        const dist = Math.abs(nextTop - curY);
        const ms = durationFor(dist, isMouse ? 'wheel' : 'trackpad');
        e.preventDefault(); // стабилизация — берём управление
        startSmoothTo(nextTop, ms);
        return;
      }

      if (e.deltaY < 0 && upEdge && prevIndex != null) {
        const prevTop = getTopAbs(slides[prevIndex]);
        const dist = Math.abs(prevTop - curY);
        const ms = durationFor(dist, isMouse ? 'wheel' : 'trackpad');
        e.preventDefault();
        startSmoothTo(prevTop, ms);
        return;
      }
    };

    // свайпы (тач) — как раньше, плавно и быстрее
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      // если во время тача была анимация — останавливаем
      stopCurrentAnim();
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

      if (dy < 0 && nextIndex != null && nearBottomOf(currentIndex)) {
        const nextTop = getTopAbs(slides[nextIndex]);
        const dist = Math.abs(nextTop - curY);
        const ms = Math.max(300, Math.min(700, dist / 1.6));
        startSmoothTo(nextTop, ms);
      } else if (dy > 0 && prevIndex != null && nearTopOf(currentIndex)) {
        const prevTop = getTopAbs(slides[prevIndex]);
        const dist = Math.abs(prevTop - curY);
        const ms = Math.max(300, Math.min(700, dist / 1.6));
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
      stopCurrentAnim();
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