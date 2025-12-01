
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ClientMainLayout from '@/components/layout/client-main-layout'
import BudgetsContent from '@/components/budgets/budgets-content'

export default async function BudgetsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/')
  }

  return (
    <ClientMainLayout>
      <BudgetsContent />
    </ClientMainLayout>
  )
}
