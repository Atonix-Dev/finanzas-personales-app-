
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ClientMainLayout from '@/components/layout/client-main-layout'
import AccountsContent from '@/components/accounts/accounts-content'

export default async function AccountsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/')
  }

  return (
    <ClientMainLayout>
      <AccountsContent />
    </ClientMainLayout>
  )
}
