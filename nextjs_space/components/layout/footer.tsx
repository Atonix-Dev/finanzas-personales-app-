'use client';

import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail, ExternalLink } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export function Footer() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg">{t.footer.brand}</h3>
            <p className="text-sm text-muted-foreground">
              {t.footer.brandDescription}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t.footer.poweredBy}</span>
              <Link
                href="https://atonixdev.com"
                target="_blank"
                className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                atonixdev.com
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">{t.footer.product}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/transacciones" className="text-muted-foreground hover:text-primary transition-colors">
                  {t.nav.transactions}
                </Link>
              </li>
              <li>
                <Link href="/presupuestos" className="text-muted-foreground hover:text-primary transition-colors">
                  {t.nav.budgets}
                </Link>
              </li>
              <li>
                <Link href="/analisis" className="text-muted-foreground hover:text-primary transition-colors">
                  {t.nav.analysis}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">{t.footer.company}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="https://atonixdev.com/about"
                  target="_blank"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  {t.footer.aboutUs}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link
                  href="https://atonixdev.com/blog"
                  target="_blank"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  {t.footer.blog}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link
                  href="https://atonixdev.com/projects"
                  target="_blank"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  {t.footer.projects}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link
                  href="https://atonixdev.com/contact"
                  target="_blank"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  {t.footer.contact}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">{t.footer.legal}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacidad" className="text-muted-foreground hover:text-primary transition-colors">
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-muted-foreground hover:text-primary transition-colors">
                  {t.footer.terms}
                </Link>
              </li>
            </ul>

            {/* Social Links */}
            <div className="pt-3">
              <h4 className="font-semibold text-sm mb-3">{t.footer.followUs}</h4>
              <div className="flex gap-3">
                <Link
                  href="https://github.com/atonixdev"
                  target="_blank"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </Link>
                <Link
                  href="https://twitter.com/atonixdev"
                  target="_blank"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link
                  href="https://linkedin.com/company/atonixdev"
                  target="_blank"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </Link>
                <Link
                  href="mailto:hola@atonixdev.com"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Email"
                >
                  <Mail className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>
              © {currentYear} atonixdev.com. {t.footer.allRightsReserved}
            </p>
            <p className="flex items-center gap-2">
              {t.footer.madeWith} <span className="text-red-500">♥</span> {t.footer.usingAI}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
