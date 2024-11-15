import { Suspense } from 'react'
import { BatchList } from './_components/batch-list'
import { Skeleton } from '~/components/ui/skeleton'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'
import { BatchSheet } from './_components/batch-sheet'

export default async function BatchesPage() {
  const session = await auth()

  if (!session) {
    redirect('/')
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Batches</h2>
        <BatchSheet mode="create" />
      </div>
      <div className="h-full">
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <BatchList />
        </Suspense>
      </div>
    </div>
  )
}
