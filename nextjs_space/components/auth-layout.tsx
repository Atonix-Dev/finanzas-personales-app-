
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'
import { Euro, TrendingUp, PieChart, BarChart3 } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

export default function AuthLayout() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { t } = useI18n()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: t.auth.authError,
          description: t.auth.incorrectCredentials,
          variant: 'destructive',
        })
      } else {
        toast({
          title: t.auth.welcome,
          description: t.auth.loggedInSuccess,
        })
        router.replace('/dashboard')
      }
    } catch (error) {
      toast({
        title: t.common.error,
        description: t.common.error,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const loadDemoData = formData.get('loadDemoData') === 'on'

    if (password.length < 6) {
      toast({
        title: t.auth.validationError,
        description: t.auth.passwordMinLength,
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          loadDemoData
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: t.auth.accountCreated,
          description: loadDemoData 
            ? t.auth.accountCreatedWithDemo
            : t.auth.accountCreatedSuccess,
        })

        // Auto login after successful signup
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (!result?.error) {
          router.replace('/dashboard')
        }
      } else {
        toast({
          title: t.auth.errorCreatingAccount,
          description: data.error || t.common.error,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: t.common.error,
        description: t.common.error,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950">
      <div className="container mx-auto flex min-h-screen max-w-7xl items-center justify-between px-4 py-8">
        {/* Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 flex-col space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Euro className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                {t.nav.financialManagement} {t.nav.personal}
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md">
              {t.auth.takeControl}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <TrendingUp className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {t.auth.intelligentTracking}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t.auth.intelligentTrackingDesc}
              </p>
            </div>

            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <PieChart className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {t.auth.clearVisualization}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t.auth.clearVisualizationDesc}
              </p>
            </div>

            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <BarChart3 className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {t.auth.dynamicBudgets}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t.auth.dynamicBudgetsDesc}
              </p>
            </div>

            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Euro className="h-8 w-8 text-indigo-600 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {t.auth.aiAssistant}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t.auth.aiAssistantDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Auth Forms */}
        <div className="w-full max-w-md lg:max-w-lg mx-auto lg:mx-0">
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 shadow-2xl">
            <CardHeader className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2 lg:hidden">
                <Euro className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-2xl">{t.nav.financialManagement} {t.nav.personal}</CardTitle>
              </div>
              <CardDescription>
                {t.auth.manageYourMoney}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">{t.auth.login}</TabsTrigger>
                  <TabsTrigger value="signup">{t.auth.signup}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">{t.auth.email}</Label>
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder={t.auth.email.toLowerCase()}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">{t.auth.password}</Label>
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? t.auth.loggingIn : t.auth.login}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">{t.auth.firstName}</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder={t.auth.firstName}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">{t.auth.lastName}</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          placeholder={t.auth.lastName}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t.auth.email}</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder={t.auth.email.toLowerCase()}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">{t.auth.password}</Label>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder={t.auth.minimumPassword}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="loadDemoData" name="loadDemoData" />
                      <Label htmlFor="loadDemoData" className="text-sm text-gray-600 dark:text-gray-300">
                        {t.auth.loadDemoData}
                      </Label>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? t.auth.creatingAccount : t.auth.signup}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
