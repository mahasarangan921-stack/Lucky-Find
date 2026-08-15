import { useEffect } from 'react'

export function useScrollReveal(containerRef) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const elements = container.querySelectorAll('.reveal')

    // Make sure everything starts in a hidden state
    elements.forEach((el) => {
      el.classList.remove('is-visible')
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = Number(entry.target.style.getPropertyValue('--delay')) || 0

            setTimeout(() => {
              entry.target.classList.add('is-visible')
            }, delay * 80)

            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    )

    elements.forEach((el) => observer.observe(el))

    // Important when returning to this page through React Router
    requestAnimationFrame(() => {
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect()

        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('is-visible')
          observer.unobserve(el)
        }
      })
    })

    return () => {
      observer.disconnect()
    }
  }, [containerRef])
}