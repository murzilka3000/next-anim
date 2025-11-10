'use client';

import React, { useEffect, useRef } from 'react';
import styles from './SlideGate.module.css';

type Props = {
  children: React.ReactNode | React.ReactNode[]; // теперь можно 2+ детей
  thresholdPx?: number; // при каком «вхождении» следующей секции вниз сработает переход
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
  const slideRefs = useRef<HTMLDivElement[]>([]);

  // флаги анимации и целевая позиция
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

    const getTopAbs = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;
    const getRect = (el: HTMLElement) => el.getBoundingClientRect();

    const getCurrentIndex = () => {
      // индекс слайда, верх которого не ниже текущего скролла
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

    const isSlideEnteredFromBottom = (i: number) => {
      const r = getRect(slides[i]);
      return r.top < window.innerHeight - thresholdPx; // «виден снизу»
    };

    const isSlideTopNearViewport = (i: number) => {
      const r = getRect(slides[i]);
      return r.top <= thresholdPx; // верх «почти у кромки»
    };

    const startSmoothTo = (y: number) => {
      animating.current = true;
      animTargetY.current = y;
      animDirection.current = window.scrollY < y ? 'down' : 'up';
      window.scrollTo({ top: y, behavior: 'smooth' });
    };

    const cancelAnimation = () => {
      animating.current = false;
      animTargetY.current = null;
      animDirection.current = null;
    };

    // следим, дошли ли до цели или пользователь прервал анимацию
    const onScroll = () => {
      if (!animating.current || animTargetY.current == null) return;
      const delta = Math.abs(window.scrollY - animTargetY.current);
      const overshootDown =
        animDirection.current === 'down' && window.scrollY > animTargetY.current;
      const overshootUp =
        animDirection.current === 'up' && window.scrollY < animTargetY.current;

      if (delta < 2 || overshootDown || overshootUp) {
        cancelAnimation();
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (!container.contains(e.target as Node)) return;

      // если идёт программная прокрутка — не мешаем пользователю, не блокируем события
      if (animating.current) return;

      const curY = window.scrollY;

      // определяем текущий/следующий/предыдущий слайды
      const currentIndex = getCurrentIndex();
      const nextIndex = getNextIndex(currentIndex);
      const prevIndex = getPrevIndex(currentIndex);

      const target = e.target as HTMLElement;
      // слайд, откуда пришло событие
      const targetSlide =
        slides.find((s) => s.contains(target)) || slides[currentIndex];

      // внутренняя прокрутка (если таргет внутри скроллимого контейнера)
      const scrollable = findScrollable(target, targetSlide);
      if (scrollable) {
        const atBottom =
          Math.ceil(scrollable.scrollTop + scrollable.clientHeight) >=
          scrollable.scrollHeight;
        const atTop = scrollable.scrollTop <= 0;
        if (e.deltaY > 0 && !atBottom) return;
        if (e.deltaY < 0 && !atTop) return;
      }

      // Вниз: когда следующий уже виден снизу — докрутить к его началу
      if (e.deltaY > 0 && nextIndex != null && isSlideEnteredFromBottom(nextIndex)) {
        const nextTop = getTopAbs(slides[nextIndex]);
        // если уже стоим на самом верху следующего — не перехватываем
        if (curY >= nextTop - 1) return;
        e.preventDefault(); // гасим «микрошаг» колесика
        startSmoothTo(nextTop);
        return;
      }

      // Вверх: когда текущий «под кромкой», плавно вернуться к началу предыдущего
      if (e.deltaY < 0 && prevIndex != null && isSlideTopNearViewport(currentIndex)) {
        const prevTop = getTopAbs(slides[prevIndex]);
        // если уже у начала предыдущего — пропускаем
        if (curY <= prevTop + 1) return;
        e.preventDefault();
        startSmoothTo(prevTop);
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

      const curY = window.scrollY;
      const currentIndex = getCurrentIndex();
      const nextIndex = getNextIndex(currentIndex);
      const prevIndex = getPrevIndex(currentIndex);

      const targetEl = e.target as HTMLElement;
      const targetSlide =
        slides.find((s) => s.contains(targetEl)) || slides[currentIndex];

      // внутренняя прокрутка на таче — проверяем только на момент жеста (простая эвристика)
      const scrollable = findScrollable(targetEl, targetSlide);
      if (scrollable) {
        const atBottom =
          Math.ceil(scrollable.scrollTop + scrollable.clientHeight) >=
          scrollable.scrollHeight;
        const atTop = scrollable.scrollTop <= 0;
        if (dy < 0 && !atBottom) return; // свайп вверх, но список ещё скроллится вниз
        if (dy > 0 && !atTop) return;    // свайп вниз, но список ещё скроллится вверх
      }

      // свайп вверх (вниз по странице)
      if (dy < 0 && nextIndex != null && isSlideEnteredFromBottom(nextIndex)) {
        const nextTop = getTopAbs(slides[nextIndex]);
        if (curY < nextTop - 1) {
          startSmoothTo(nextTop);
        }
      }
      // свайп вниз (вверх по странице)
      else if (dy > 0 && prevIndex != null && isSlideTopNearViewport(currentIndex)) {
        const prevTop = getTopAbs(slides[prevIndex]);
        if (curY > prevTop + 1) {
          startSmoothTo(prevTop);
        }
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
  }, [thresholdPx, durationMs, childArray.length]);

  return (
    <section ref={containerRef} className={[styles.container, className].filter(Boolean).join(' ')}>
      <div className={styles.track}>
        {childArray.map((child, i) => (
          <div key={i} ref={(el) => setSlideRef(el, i)} className={styles.slide}>
            {child}
          </div>
        ))}
      </div>
    </section>
  );
}