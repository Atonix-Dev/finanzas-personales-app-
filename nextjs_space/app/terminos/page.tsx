import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ClientMainLayout from '@/components/layout/client-main-layout'
import TermsContent from '@/components/legal/terms-content'

export default async function TermsPage() {
  const session = await getServerSession(authOptions)

  // Si hay sesión, mostrar con layout principal
  if (session) {
    return (
      <ClientMainLayout>
        <TermsContent />
      </ClientMainLayout>
    )
  }

  // Si no hay sesión, mostrar solo el contenido
  return <TermsContent />
}
