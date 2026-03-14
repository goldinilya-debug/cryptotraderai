'use client'

import { useEffect } from 'react'

export default function NavigationHandler() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const path = params.get('__path')
    if (path) {
      window.history.replaceState({}, '', path)
    }
  }, [])

  return null
}
