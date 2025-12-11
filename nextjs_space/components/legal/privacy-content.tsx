'use client'

import { useLanguage } from '@/lib/i18n/context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Lock, Eye, Database, Mail, Globe } from 'lucide-react'

export default function PrivacyContent() {
  const { t } = useLanguage()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          {t('legal.privacy.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('legal.privacy.lastUpdated')}: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-6">
        {/* Introducción */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {t('legal.privacy.sections.intro.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>{t('legal.privacy.sections.intro.content')}</p>
          </CardContent>
        </Card>

        {/* Datos que recopilamos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              {t('legal.privacy.sections.dataCollection.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>{t('legal.privacy.sections.dataCollection.content')}</p>
            <ul className="mt-4 space-y-2">
              <li>{t('legal.privacy.sections.dataCollection.items.account')}</li>
              <li>{t('legal.privacy.sections.dataCollection.items.transactions')}</li>
              <li>{t('legal.privacy.sections.dataCollection.items.preferences')}</li>
              <li>{t('legal.privacy.sections.dataCollection.items.usage')}</li>
            </ul>
          </CardContent>
        </Card>

        {/* Uso de datos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('legal.privacy.sections.dataUsage.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>{t('legal.privacy.sections.dataUsage.content')}</p>
            <ul className="mt-4 space-y-2">
              <li>{t('legal.privacy.sections.dataUsage.items.service')}</li>
              <li>{t('legal.privacy.sections.dataUsage.items.analysis')}</li>
              <li>{t('legal.privacy.sections.dataUsage.items.improvement')}</li>
              <li>{t('legal.privacy.sections.dataUsage.items.communication')}</li>
            </ul>
          </CardContent>
        </Card>

        {/* Seguridad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {t('legal.privacy.sections.security.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>{t('legal.privacy.sections.security.content')}</p>
          </CardContent>
        </Card>

        {/* Contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t('legal.privacy.sections.contact.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>{t('legal.privacy.sections.contact.content')}</p>
            <p className="mt-2">
              <strong>Email:</strong> privacy@atonixdev.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
