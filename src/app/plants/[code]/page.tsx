import { notFound } from 'next/navigation'
import { api } from '~/trpc/server'
import { QRCodeSVG } from 'qrcode.react'
import { format } from 'date-fns'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Timeline } from '~/components/notes/Timeline'
import { NoteInput } from '~/components/notes/NoteInput'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { PlantActions } from './_components/plant-actions'
import { PlantHealthStatus } from './_components/plant-health-status'
import Link from 'next/link'
import {
  HealthStatusIcon,
  PlantStageIcon,
  QuarantineIcon,
} from '~/components/icons'

export default async function PlantPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  try {
    const resolvedParams = await params
    const plant = await api.plant.getByCode({
      code: resolvedParams.code,
    })

    if (!plant) {
      return notFound()
    }

    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Plant {plant.code}
            </h1>
            <div className="flex gap-4 items-center">
              <PlantStageIcon stage={plant.stage} className="h-5 w-5" />
              {plant.quarantine && (
                <QuarantineIcon
                  quarantine={plant.quarantine}
                  className="h-5 w-5 text-destructive"
                />
              )}
              <HealthStatusIcon
                status={plant.healthStatus}
                className="h-5 w-5"
              />
            </div>
          </div>
          <PlantActions plant={plant} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Plant Details</CardTitle>
              <CardDescription>
                Basic information about this plant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Plant Details */}
                <div>
                  <p className="text-sm text-muted-foreground">Plant ID</p>
                  <p className="font-medium">{plant.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Source</p>
                  <p className="font-medium capitalize">{plant.source}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Stage</p>
                  <p className="font-medium capitalize">{plant.stage}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plant Date</p>
                  <p className="font-medium">
                    {plant.plantDate
                      ? format(new Date(plant.plantDate), 'PPP')
                      : 'N/A'}
                  </p>
                </div>
                {plant.harvestDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Harvest Date
                    </p>
                    <p className="font-medium">
                      {format(new Date(plant.harvestDate), 'PPP')}
                    </p>
                  </div>
                )}
                {plant.genetic && (
                  <div>
                    <p className="text-sm text-muted-foreground">Genetic</p>
                    <p className="font-medium">{plant.genetic.name}</p>
                  </div>
                )}
                {plant.sex && (
                  <div>
                    <p className="text-sm text-muted-foreground">Sex</p>
                    <p className="font-medium capitalize">{plant.sex}</p>
                  </div>
                )}
                {plant.phenotype && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phenotype</p>
                    <p className="font-medium">{plant.phenotype}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Health Status</p>
                  <p className="font-medium capitalize">{plant.healthStatus}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Quarantine Status
                  </p>
                  <p className="font-medium">
                    {plant.quarantine ? 'Yes' : 'No'}
                  </p>
                </div>
                {plant.destroyReason && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">
                      Destroy Reason
                    </p>
                    <p className="font-medium">{plant.destroyReason}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plant QR Code</CardTitle>
              <CardDescription>
                Scan to quickly access plant details
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <QRCodeSVG
                value={`${process.env.NEXT_PUBLIC_APP_URL}/plants/${plant.code}`}
                size={200}
                level="Q"
              />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="notes" className="w-full">
          <TabsList>
            <TabsTrigger value="notes">Notes & Timeline</TabsTrigger>
            <TabsTrigger value="health">Health & Status</TabsTrigger>
            {plant.batch && (
              <TabsTrigger value="batch">Batch Information</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="notes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notes & Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Timeline entityType="plant" entityId={plant.id} />
                <NoteInput entityType="plant" entityId={plant.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="mt-6">
            <PlantHealthStatus plant={plant} />
          </TabsContent>

          {plant.batch && (
            <TabsContent value="batch" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Batch Information</CardTitle>
                  <CardDescription>
                    Details about the batch this plant belongs to
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Batch</p>
                      <Link
                        href={`/batches/${plant.batch.id}`}
                        className="font-medium hover:underline"
                      >
                        {plant.batch.code}
                      </Link>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Batch Name
                      </p>
                      <Link
                        href={`/batches/${plant.batch.id}`}
                        className="font-medium hover:underline"
                      >
                        {plant.batch.name}
                      </Link>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">
                        {plant.batch.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Genetic</p>
                      <p className="font-medium">{plant.genetic?.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    )
  } catch (error) {
    console.error(error)
    return notFound()
  }
}
