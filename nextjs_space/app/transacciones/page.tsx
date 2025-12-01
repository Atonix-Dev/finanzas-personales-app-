
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ClientMainLayout from '@/components/layout/client-main-layout'
import TransactionsContent from '@/components/transactions/transactions-content'

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/')
  }

  return (
    <ClientMainLayout>
      <TransactionsContent />
    </ClientMainLayout>
  )
}
