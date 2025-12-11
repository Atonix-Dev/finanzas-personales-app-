'use client'

import { useLanguage } from '@/lib/i18n/context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, CheckCircle, AlertTriangle, Scale, Ban, Mail } from 'lucide-react'

export default function TermsContent() {
  const { t } = useLanguage()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          {t('legal.terms.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('legal.terms.lastUpdated')}: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-6">
        {/* Aceptación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {t('legal.terms.sections.acceptance.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>{t('legal.terms.sections.acceptance.content')}</p>
          </CardContent>
        </Card>

        {/* Descripción del servicio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('legal.terms.sections.service.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>{t('legal.terms.sections.service.content')}</p>
            <ul className="mt-4 space-y-2">
              <li>{t('legal.terms.sections.service.items.tracking')}</li>
              <li>{t('legal.terms.sections.service.items.budgets')}</li>
              <li>{t('legal.terms.sections.service.items.analysis')}</li>
              <li>{t('legal.terms.sections.service.items.export')}</li>
            </ul>
          </CardContent>
        </Card>

        {/* Responsabilidades del usuario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              {t('legal.terms.sections.userResponsibilities.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>{t('legal.terms.sections.userResponsibilities.content')}</p>
            <ul className="mt-4 space-y-2">
              <li>{t('legal.terms.sections.userResponsibilities.items.accuracy')}</li>
              <li>{t('legal.terms.sections.userResponsibilities.items.security')}</li>
              <li>{t('legal.terms.sections.userResponsibilities.items.lawful')}</li>
            </ul>
          </CardContent>
        </Card>

        {/* Limitaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t('legal.terms.sections.limitations.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>{t('legal.terms.sections.limitations.content')}</p>
          </CardContent>
        </Card>

        {/* Prohibiciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5" />
              {t('legal.terms.sections.prohibited.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>{t('legal.terms.sections.prohibited.content')}</p>
            <ul className="mt-4 space-y-2">
              <li>{t('legal.terms.sections.prohibited.items.illegal')}</li>
              <li>{t('legal.terms.sections.prohibited.items.harm')}</li>
              <li>{t('legal.terms.sections.prohibited.items.reverse')}</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t('legal.terms.sections.contact.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>{t('legal.terms.sections.contact.content')}</p>
            <p className="mt-2">
              <strong>Email:</strong> legal@atonixdev.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
