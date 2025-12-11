'use client';

import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail, ExternalLink, Euro } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export function Footer() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Left Section - Brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Euro className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">{t.footer.brand}</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t.footer.brandDescription}
            </p>
            <Link
              href="https://atonixdev.com"
              target="_blank"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              atonixdev.com
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          {/* Right Section - Links & Social */}
          <div className="flex flex-col items-start md:items-end gap-4">
            {/* Legal Links */}
            <div className="flex items-center gap-4 text-sm">
              <Link 
                href="/privacidad" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {t.footer.privacy}
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link 
                href="/terminos" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {t.footer.terms}
              </Link>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <Link
                href="https://github.com/atonix-dev"
                target="_blank"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </Link>
              <Link
                href="https://twitter.com/atonixdev"
                target="_blank"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </Link>
              <Link
                href="https://linkedin.com/company/atonixdev"
                target="_blank"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </Link>
              <Link
                href="mailto:hola@atonixdev.com"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </Link>
            </div>

            {/* Copyright */}
            <p className="text-xs text-muted-foreground">
              © {currentYear} atonixdev.com · {t.footer.madeWith} <span className="text-red-500">♥</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
