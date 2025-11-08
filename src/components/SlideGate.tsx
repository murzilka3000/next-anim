'use client';

import React, { useEffect, useRef } from 'react';
import styles from './SlideGate.module.css';

type Props = {
  children: [React.ReactNode, React.ReactNode];
  thresholdPx?: number; // при каком «вхождении» второй секции вниз сработает переход
  durationMs?: number;  // параметр оставлен для совместимости, но нативный smooth не использует его
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

export function SlideGate({
  children,
  thresholdPx = 24,
  // durationMs оставляем в пропсах, но используем нативный smooth
  durationMs,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLDivElement>(null);
  const secondRef = useRef<HTMLDivElement>(null);

  // флаги анимации и целевая позиция
  const animTargetY = useRef<number | null>(null);
  const animating = useRef(false);

  useEffect(() => {
    const container = containerRef.current!;
    const first = firstRef.current!;
    const second = secondRef.current!;
    if (!container || !first || !second) return;

    const getTop = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;
    const getRect = (el: HTMLElement) => el.getBoundingClientRect();

    const isSecondEntered = () => {
      const r = getRect(second);
      return r.top < window.innerHeight - thresholdPx; // второй уже виден снизу
    };

    const isNearSecondTop = () => {
      const r = getRect(second);
      return r.top <= thresholdPx; // верх второй у верхней кромки
    };

    const startSmoothTo = (y: number) => {
      animating.current = true;
      animTargetY.current = y;
      window.scrollTo({ top: y, behavior: 'smooth' });
    };

    const cancelAnimation = () => {
      animating.current = false;
      animTargetY.current = null;
    };

    // следим, дошли ли до цели или пользователь прервал анимацию
    const onScroll = () => {
      if (!animating.current || animTargetY.current == null) return;
      const delta = Math.abs(window.scrollY - animTargetY.current);
      // считаем «готово», когда почти попали, или перепрыгнули
      if (delta < 2 || (window.scrollY > animTargetY.current && isSecondEntered())) {
        cancelAnimation();
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (!container.contains(e.target as Node)) return;

      // если идёт программная прокрутка — не мешаем пользователю, не блокируем события
      if (animating.current) return;

      const secondTopAbs = getTop(second);
      const firstTopAbs = getTop(first);
      const curY = window.scrollY;

      // внутренняя прокрутка (если таргет внутри скроллимого контейнера)
      const currentSection = isSecondEntered() ? second : first;
      const scrollable = findScrollable(e.target as HTMLElement, currentSection);
      if (scrollable) {
        const atBottom = Math.ceil(scrollable.scrollTop + scrollable.clientHeight) >= scrollable.scrollHeight;
        const atTop = scrollable.scrollTop <= 0;
        if (e.deltaY > 0 && !atBottom) return;
        if (e.deltaY < 0 && !atTop) return;
      }

      // Вниз: когда вторая уже видна, докрутить плавно к её началу
      if (e.deltaY > 0 && isSecondEntered()) {
        // если уже стоим на самом верху второй — не перехватываем
        if (curY >= secondTopAbs - 1) return;
        e.preventDefault(); // гасим «микрошаг» по колесику, чтобы не было дерганий
        startSmoothTo(secondTopAbs);
        return;
      }

      // Вверх: когда верх второй у верхней кромки, плавно ве��нуться к началу первой
      if (e.deltaY < 0 && isNearSecondTop()) {
        // если уже у начала первой — пропускаем
        if (curY <= firstTopAbs + 1) return;
        e.preventDefault();
        startSmoothTo(firstTopAbs);
        return;
      }
      // иначе — даём странице крутиться как обычно
    };

    // свайпы
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (animating.current) return;
      const t = e.changedTouches[0];
      const dy = t.clientY - touchStartY;
      const absY = Math.abs(dy);
      const swipeThreshold = 40;
      if (absY < swipeThreshold) return;

      const secondTopAbs = getTop(second);
      const firstTopAbs = getTop(first);
      const curY = window.scrollY;

      // внутренняя прокрутка на таче — проверяем только на момент жеста (простая эвристика)
      const target = e.target as HTMLElement;
      const currentSection = isSecondEntered() ? second : first;
      const scrollable = findScrollable(target, currentSection);
      if (scrollable) {
        const atBottom = Math.ceil(scrollable.scrollTop + scrollable.clientHeight) >= scrollable.scrollHeight;
        const atTop = scrollable.scrollTop <= 0;
        if (dy < 0 && !atBottom) return;
        if (dy > 0 && !atTop) return;
      }

      if (dy < 0 && isSecondEntered() && curY < secondTopAbs - 1) {
        startSmoothTo(secondTopAbs);
      } else if (dy > 0 && isNearSecondTop() && curY > firstTopAbs + 1) {
        startSmoothTo(firstTopAbs);
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
    };
  }, [thresholdPx, durationMs]);

  return (
    <section ref={containerRef} className={[styles.container, className].filter(Boolean).join(' ')}>
      <div className={styles.track}>
        <div ref={firstRef} className={styles.slide}>
          {children[0]}
        </div>
        <div ref={secondRef} className={styles.slide}>
          {children[1]}
        </div>
      </div>
    </section>
  );
}