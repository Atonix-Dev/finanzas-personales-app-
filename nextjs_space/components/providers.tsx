
'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import type { Session } from 'next-auth'
import { I18nProvider } from '@/lib/i18n/context'

interface ProvidersProps {
  children: ReactNode
  session: Session | null
}

export default function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <I18nProvider>
        {children}
      </I18nProvider>
    </SessionProvider>
  )
}
