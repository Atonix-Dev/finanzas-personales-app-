
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  LayoutDashboard, 
  Receipt, 
  CreditCard, 
  Target, 
  Brain,
  LogOut,
  Euro,
  Download,
  X,
  Settings,
  Users,
  FolderKanban,
  FileText
} from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  isMobile?: boolean
}

export default function Sidebar({ isOpen = true, onClose, isMobile = false }: SidebarProps) {
  const pathname = usePathname()
  const { data: session, status } = useSession() || {}
  const { t } = useI18n()

  // Navegación principal - Finanzas personales
  const mainNavigation = [
    { name: t.nav.dashboard, href: '/dashboard', icon: LayoutDashboard },
    { name: t.nav.transactions, href: '/transacciones', icon: Receipt },
    { name: t.nav.accounts, href: '/cuentas', icon: CreditCard },
    { name: t.nav.budgets, href: '/presupuestos', icon: Target },
  ]

  // Navegación para autónomos/emprendedores
  const freelancerNavigation = [
    { name: t.nav.clients, href: '/clientes', icon: Users },
    { name: t.nav.projects, href: '/proyectos', icon: FolderKanban },
    { name: t.nav.invoices, href: '/facturas', icon: FileText },
  ]

  // Otras opciones
  const otherNavigation = [
    { name: t.nav.analysis, href: '/analisis', icon: Brain },
    { name: t.nav.settings, href: '/dashboard/configuracion', icon: Settings },
  ]

  if (status === 'loading') {
    return (
      <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose()
    }
  }

  const NavItem = ({ item }: { item: { name: string; href: string; icon: any } }) => {
    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={handleNavClick}
        className={`
          flex items-center space-x-3 px-3 py-2.5 lg:py-2 rounded-lg text-sm font-medium transition-colors
          ${isActive 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }
        `}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        <span>{item.name}</span>
      </Link>
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          ${isMobile ? 'fixed' : 'relative'} 
          inset-y-0 left-0 z-50 
          w-64 bg-white dark:bg-gray-900 
          border-r border-gray-200 dark:border-gray-700 
          flex flex-col h-full
          transform transition-transform duration-300 ease-in-out
          ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Euro className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                  {t.nav.financialManagement}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.nav.personal}
                </p>
              </div>
            </div>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="lg:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 lg:p-4 space-y-1 lg:space-y-2 overflow-y-auto">
          {/* Finanzas Personales */}
          {mainNavigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}

          {/* Separador - Autónomos */}
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t.nav.freelancer}
            </p>
          </div>

          {freelancerNavigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}

          {/* Separador - Otros */}
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t.nav.other}
            </p>
          </div>

          {otherNavigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 lg:p-4 border-t border-gray-200 dark:border-gray-700 space-y-3 lg:space-y-4">
          {/* Export Button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-xs lg:text-sm"
            onClick={() => window.open('/api/export/transactions', '_blank')}
          >
            <Download className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{t.nav.exportData}</span>
          </Button>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">{t.nav.theme}</span>
            <ThemeToggle />
          </div>

          {/* User Info & Sign Out */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {session?.user?.name || 'Usuario'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {session?.user?.email}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start text-xs lg:text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{t.nav.logout}</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
