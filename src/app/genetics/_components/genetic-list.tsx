'use client'

import { api } from '~/trpc/react'
import { columns } from './columns'
import { DataTable } from '~/components/ui/data-table'
import { Card } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'

export function GeneticList() {
  const { data: genetics, isLoading } = api.genetic.list.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    networkMode: 'offlineFirst',
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </Card>
          ))}
      </div>
    )
  }

  if (!genetics?.length) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">
          No genetics found. Create your first genetic to get started.
        </p>
      </div>
    )
  }

  return <DataTable columns={columns} data={genetics} filterColumn="name" />
}
