import { useEffect, useState } from 'react'

/** Media-query hook that stays in sync with changes (SSR-safe default false). */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** True when the user has requested reduced motion at the OS level. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/**
 * True on narrow / touch-first viewports where the pinned horizontal scroll is
 * fragile. Drives the vertical-stack fallback for Projects and lighter 3D.
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 820px)')
}

/**
 * Non-hook read of reduced-motion for use inside animation loops / modules that
 * can't call hooks. Reads live each call.
 */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}
