
'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useConfetti } from '@/hooks/use-confetti';
import { Loader2, Trash2, User, Globe, DollarSign, Save, CheckCircle2, XCircle, ArrowLeft, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { languageNames, currencies, Language } from '@/lib/i18n/translations';
import { useI18n } from '@/lib/i18n/context';

export default function ConfiguracionPage() {
  const { data: session } = useSession() || {};
  const { toast } = useToast();
  const { fireConfetti } = useConfetti();
  const router = useRouter();
  const { language, setLanguage, currency, setCurrency, t } = useI18n();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [selectedCurrency, setSelectedCurrency] = useState(currency);

  // Sincronizar con el contexto cuando cambie
  useEffect(() => {
    setSelectedLanguage(language);
    setSelectedCurrency(currency);
  }, [language, currency]);

  useEffect(() => {
    // Cargar configuración del servidor
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSelectedLanguage(data.language || 'es');
        setSelectedCurrency(data.currency || 'EUR');
        setLanguage(data.language || 'es');
        setCurrency(data.currency || 'EUR');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Primero actualizar localStorage ANTES de guardar en la API
      if (typeof window !== 'undefined') {
        localStorage.setItem('user-language', selectedLanguage);
        localStorage.setItem('user-currency', selectedCurrency);
      }

      // Actualizar el contexto de i18n INMEDIATAMENTE
      setLanguage(selectedLanguage);
      setCurrency(selectedCurrency);

      // Luego guardar en la base de datos
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLanguage,
          currency: selectedCurrency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar configuración');
      }

      // ¡Lanzar confeti! 🎉
      fireConfetti();

      toast({
        title: t.settings.successSaving,
        description: t.settings.settingsSaved,
        className: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
      });

      // Esperar y recargar la página para aplicar los cambios en toda la app
      setTimeout(() => {
        // Forzar recarga completa desde el servidor
        window.location.href = window.location.href;
      }, 1500);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: '❌ Error',
        description: error.message || t.settings.errorSaving,
        variant: 'destructive',
      });
      setIsSaving(false);
    }
    // No hacer setIsSaving(false) en caso de éxito porque la página se va a recargar
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la cuenta');
      }

      toast({
        title: `✅ ${t.settings.accountDeleted}`,
        description: t.settings.accountDeletedMessage,
      });

      // Cerrar sesión y redirigir
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: '❌ Error',
        description: t.settings.errorDeleting,
        variant: 'destructive',
      });
      setIsDeleting(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      {/* Botón volver al dashboard */}
      <Button 
        variant="ghost" 
        onClick={() => router.push('/dashboard')}
        className="gap-2 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.nav.backToDashboard}
      </Button>

      <div>
        <h1 className="text-3xl font-bold">{t.settings.title}</h1>
        <p className="text-muted-foreground">{t.settings.manageAccount}</p>
      </div>

      {/* Información del Usuario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t.settings.accountInfo}
          </CardTitle>
          <CardDescription>
            {t.settings.accountDetails}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">{t.settings.name}</label>
            <p className="text-lg">{session?.user?.name || t.settings.notAvailable}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">{t.settings.email}</label>
            <p className="text-lg">{session?.user?.email || t.settings.notAvailable}</p>
          </div>
        </CardContent>
      </Card>

      {/* Preferencias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t.settings.preferences}
          </CardTitle>
          <CardDescription>
            {t.settings.customizeExperience}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Idioma */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t.settings.language}
            </Label>
            <Select value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as Language)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(languageNames).map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Moneda */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t.settings.currency}
            </Label>
            <Select value={selectedCurrency} onValueChange={(value) => setSelectedCurrency(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(currencies).map(([code, info]) => (
                  <SelectItem key={code} value={code}>
                    {info.symbol} - {info.name} ({code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botón Guardar */}
          <Button 
            onClick={handleSaveSettings} 
            disabled={isSaving}
            className="w-full sm:w-auto gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.settings.saving}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t.common.save}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Zona de Peligro */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            {t.settings.dangerZone}
          </CardTitle>
          <CardDescription>
            {t.settings.permanentActions}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{t.settings.deleteAccountTitle}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t.settings.deleteAccountDescription}
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mb-4">
                <li>{t.settings.deleteAccountItems.profile}</li>
                <li>{t.settings.deleteAccountItems.transactions}</li>
                <li>{t.settings.deleteAccountItems.budgets}</li>
                <li>{t.settings.deleteAccountItems.accounts}</li>
                <li>{t.settings.deleteAccountItems.categories}</li>
              </ul>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    disabled={isDeleting}
                    className="gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t.settings.deleting}
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        {t.settings.deleteMyAccount}
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t.settings.absolutelySure}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t.settings.cannotUndo}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>{t.common.cancel}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isDeleting ? t.settings.deleting : t.settings.yesDelete}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
