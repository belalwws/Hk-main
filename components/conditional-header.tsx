'use client'

import { usePathname } from 'next/navigation'
import { SiteHeader } from './site-header'

export function ConditionalHeader() {
  const pathname = usePathname()
  
  // Hide header on form pages
  const hideHeaderPaths = [
    '/judge/apply/',
    '/feedback/',
    '/forms/',
    '/register-form'
  ]
  
  const shouldHideHeader = hideHeaderPaths.some(path => pathname?.includes(path))
  
  if (shouldHideHeader) {
    return null
  }
  
  return <SiteHeader />
}

