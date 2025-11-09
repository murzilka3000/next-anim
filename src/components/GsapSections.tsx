"use client"

import React, { useLayoutEffect, useRef, useMemo } from "react"
import styles from "./GsapSections.module.css"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"

export interface GsapSectionsProps {
  children: React.ReactNode
  scrollDuration?: number // Длительность анимации скролла
  start?: string // Начало триггера
  end?: string // Конец триггера
  enterTargetSelector?: string // Элемент внутри секции для анимации при входе
  debug?: boolean
}

const GsapSections: React.FC<GsapSectionsProps> = ({
  children,
  scrollDuration = 1,
  start = "top bottom-=1",
  end = "bottom top+=1",
  enterTargetSelector = ".right-col",
  debug = false,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null)

  const scrolling = useMemo(() => {
    const state = {
      enabled: true,
      events: "scroll,wheel,touchmove,pointermove".split(","),
      prevent: (e: Event) => e.preventDefault(),
      disable() {
        if (state.enabled) {
          state.enabled = false
          window.addEventListener("scroll", gsap.ticker.tick as EventListener, { passive: true })
          state.events.forEach((e, i) => (i ? document : window).addEventListener(e as any, state.prevent, { passive: false }))
        }
      },
      enable() {
        if (!state.enabled) {
          state.enabled = true
          window.removeEventListener("scroll", gsap.ticker.tick as EventListener)
          state.events.forEach((e, i) => (i ? document : window).removeEventListener(e as any, state.prevent as EventListener))
        }
      },
    }
    return state
  }, [])

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

    const ctx = gsap.context(() => {
      const root = rootRef.current
      if (!root) return

      const sections = Array.from(root.querySelectorAll("section")) as HTMLElement[]

      const goToSection = (section: HTMLElement, anim?: gsap.core.Tween) => {
        if (scrolling.enabled) {
          scrolling.disable()
          gsap.to(window, {
            scrollTo: { y: section, autoKill: false },
            duration: scrollDuration,
            onComplete: scrolling.enable,
          })
          if (anim) anim.restart()
        }
      }

      sections.forEach((section, i) => {
        const target = section.querySelector(enterTargetSelector)
        const intoAnim = target
          ? gsap.from(target, {
              yPercent: 50,
              duration: 1,
              paused: true,
            })
          : null

        let initialized = false // 👈 добавили флаг

        ScrollTrigger.create({
          trigger: section,
          start,
          end,
          onEnter: () => {
            // 👇 игнорим первый "авто-вызов" при загрузке
            if (!initialized && i === 0) {
              initialized = true
              return
            }
            initialized = true
            if (debug) console.log("Enter section", i)
            goToSection(section, intoAnim || undefined)
          },
          onEnterBack: () => {
            if (!initialized && i === 0) {
              initialized = true
              return
            }
            initialized = true
            if (debug) console.log("EnterBack section", i)
            goToSection(section)
          },
        })
      })
    }, rootRef)

    return () => ctx.revert()
  }, [scrollDuration, start, end, enterTargetSelector, scrolling, debug])

  return (
    <div ref={rootRef} className={styles.root}>
      {React.Children.map(children, (child, i) => (
        <section key={i} className={styles.section}>
          {child}
        </section>
      ))}
    </div>
  )
}

export default GsapSections
