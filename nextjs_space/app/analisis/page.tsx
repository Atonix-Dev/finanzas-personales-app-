
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ClientMainLayout from '@/components/layout/client-main-layout'
import AnalysisContent from '@/components/analysis/analysis-content'

export default async function AnalysisPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/')
  }

  return (
    <ClientMainLayout>
      <AnalysisContent />
    </ClientMainLayout>
  )
}
