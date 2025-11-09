"use client"

import React, { useEffect, useRef } from "react"
import styles from "./SlideGate.module.css"

type Props = {
  children: React.ReactNode[]
  thresholdPx?: number
  durationMs?: number
  className?: string
}

function isScrollable(el: HTMLElement) {
  const style = window.getComputedStyle(el)
  const canY = /auto|scroll/.test(style.overflowY) && el.scrollHeight > el.clientHeight + 1
  return canY
}

function findScrollable(target: HTMLElement, within?: HTMLElement) {
  let el: HTMLElement | null = target
  while (el && (!within || within.contains(el))) {
    if (isScrollable(el)) return el
    el = el.parentElement
  }
  return null
}

function disableScrollTemporarily(ms = 600) {
  document.body.style.overflow = "hidden"
  setTimeout(() => {
    document.body.style.overflow = ""
  }, ms)
}

export function SlideGate({ children, thresholdPx = 24, durationMs, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<HTMLDivElement[]>([])
  const animTargetY = useRef<number | null>(null)
  const animating = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !slideRefs.current.length) return

    const slides = slideRefs.current
    const getTop = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY
    const getCurrentIndex = () => {
      const scrollY = window.scrollY
      let closestIdx = 0
      let minDelta = Infinity
      slides.forEach((s, i) => {
        const top = getTop(s)
        const delta = Math.abs(scrollY - top)
        if (delta < minDelta) {
          minDelta = delta
          closestIdx = i
        }
      })
      return closestIdx
    }

    const startSmoothTo = (y: number) => {
      disableScrollTemporarily()
      animating.current = true
      animTargetY.current = y
      window.scrollTo({ top: y, behavior: "smooth" })
    }

    const cancelAnimation = () => {
      animating.current = false
      animTargetY.current = null
    }

    const onScroll = () => {
      if (!animating.current || animTargetY.current == null) return
      const delta = Math.abs(window.scrollY - animTargetY.current)
      if (delta < 2) cancelAnimation()
    }

    const scrollToIndex = (index: number) => {
      if (index < 0 || index >= slides.length) return
      const y = getTop(slides[index])
      startSmoothTo(y)
    }

    const onWheel = (e: WheelEvent) => {
      if (!container.contains(e.target as Node)) return
      if (animating.current) return

      const currentIndex = getCurrentIndex()
      const direction = e.deltaY > 0 ? 1 : -1
      const nextIndex = currentIndex + direction

      // внутренняя прокрутка — пропускаем
      const currentSection = slides[currentIndex]
      const scrollable = findScrollable(e.target as HTMLElement, currentSection)
      if (scrollable) {
        const atBottom = Math.ceil(scrollable.scrollTop + scrollable.clientHeight) >= scrollable.scrollHeight
        const atTop = scrollable.scrollTop <= 0
        if (direction > 0 && !atBottom) return
        if (direction < 0 && !atTop) return
      }

      if (nextIndex >= 0 && nextIndex < slides.length) {
        e.preventDefault()
        scrollToIndex(nextIndex)
      }
    }

    // свайпы
    let touchStartY = 0
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (animating.current) return
      const t = e.changedTouches[0]
      const dy = t.clientY - touchStartY
      const absY = Math.abs(dy)
      const swipeThreshold = 40
      if (absY < swipeThreshold) return

      const direction = dy < 0 ? 1 : -1
      const currentIndex = getCurrentIndex()
      const nextIndex = currentIndex + direction

      // проверка внутреннего скролла
      const target = e.target as HTMLElement
      const currentSection = slides[currentIndex]
      const scrollable = findScrollable(target, currentSection)
      if (scrollable) {
        const atBottom = Math.ceil(scrollable.scrollTop + scrollable.clientHeight) >= scrollable.scrollHeight
        const atTop = scrollable.scrollTop <= 0
        if (direction > 0 && !atBottom) return
        if (direction < 0 && !atTop) return
      }

      if (nextIndex >= 0 && nextIndex < slides.length) {
        scrollToIndex(nextIndex)
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    container.addEventListener("wheel", onWheel, { passive: false })
    container.addEventListener("touchstart", onTouchStart, { passive: true })
    container.addEventListener("touchend", onTouchEnd, { passive: true })

    return () => {
      window.removeEventListener("scroll", onScroll)
      container.removeEventListener("wheel", onWheel)
      container.removeEventListener("touchstart", onTouchStart)
      container.removeEventListener("touchend", onTouchEnd)
    }
  }, [thresholdPx, durationMs])

  return (
    <section ref={containerRef} className={[styles.container, className].filter(Boolean).join(" ")}>
      <div className={styles.track}>
        {children.map((child, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) slideRefs.current[i] = el
            }}
            className={styles.slide}
          >
            {child}
          </div>
        ))}
      </div>
    </section>
  )
}
