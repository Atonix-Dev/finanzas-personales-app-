import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ClientMainLayout from '@/components/layout/client-main-layout'
import PrivacyContent from '@/components/legal/privacy-content'

export default async function PrivacyPage() {
  const session = await getServerSession(authOptions)

  // Si hay sesión, mostrar con layout principal
  if (session) {
    return (
      <ClientMainLayout>
        <PrivacyContent />
      </ClientMainLayout>
    )
  }

  // Si no hay sesión, mostrar solo el contenido
  return <PrivacyContent />
}
