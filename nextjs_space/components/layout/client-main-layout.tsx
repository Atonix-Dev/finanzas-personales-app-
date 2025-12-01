
'use client'

import { ReactNode, useState, useEffect } from 'react'
import Sidebar from './sidebar'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { Footer } from './footer'
import { FeedbackWidget } from '@/components/feedback-widget'

interface ClientMainLayoutProps {
  children: ReactNode
}

export default function ClientMainLayout({ children }: ClientMainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar isOpen={true} isMobile={false} />
        </div>

        {/* Mobile Sidebar */}
        {isMobile && (
          <Sidebar 
            isOpen={isMobileMenuOpen} 
            onClose={() => setIsMobileMenuOpen(false)}
            isMobile={true}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <header className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Finanzas Personales
            </h1>
            <div className="w-10" /> {/* Spacer for alignment */}
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto">
            <div className="min-h-full flex flex-col">
              <div className="flex-1">
                {children}
              </div>
              <Footer />
            </div>
          </main>
        </div>
      </div>

      {/* Feedback Widget - Solo visible para usuarios autenticados */}
      <FeedbackWidget />
    </div>
  )
}
