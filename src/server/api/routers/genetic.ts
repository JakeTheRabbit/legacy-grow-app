import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { eq, sql, and, ne } from 'drizzle-orm'
import { genetics, plants, batches } from '~/server/db/schemas'
import { slugify } from '~/lib/utils'

// Use the same validation schema for both create and update
const geneticInput = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['sativa', 'indica', 'hybrid']),
  breeder: z.string().nullish(),
  description: z.string().nullish(),
  floweringTime: z.number().nullish(),
  thcPotential: z.number().min(0).max(100).nullish(),
  cbdPotential: z.number().min(0).max(100).nullish(),
  terpeneProfile: z.record(z.unknown()).nullish(),
  growthCharacteristics: z.record(z.unknown()).nullish(),
  lineage: z.record(z.unknown()).nullish(),
})

export const geneticRouter = createTRPCRouter({
  getBySlug: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const genetic = await ctx.db
        .select({
          id: genetics.id,
          name: genetics.name,
          type: genetics.type,
          breeder: genetics.breeder,
          description: genetics.description,
          floweringTime: genetics.floweringTime,
          thcPotential: genetics.thcPotential,
          cbdPotential: genetics.cbdPotential,
          growthCharacteristics: genetics.growthCharacteristics,
          createdAt: genetics.createdAt,
          updatedAt: genetics.updatedAt,
          _count: {
            plants: sql<number>`count(distinct ${plants.id})`,
            batches: sql<number>`count(distinct ${batches.id})`,
          },
          plants: sql<any[]>`
            json_agg(distinct jsonb_build_object(
              'id', ${plants.id},
              'code', ${plants.code},
              'stage', ${plants.stage},
              'healthStatus', ${plants.healthStatus},
              'plantDate', ${plants.plantDate}
            )) filter (where ${plants.id} is not null)
          `,
          batches: sql<any[]>`
            json_agg(distinct jsonb_build_object(
              'id', ${batches.id},
              'name', ${batches.name},
              'status', ${batches.status},
              'plantCount', ${batches.plantCount},
              'createdAt', ${batches.createdAt}
            )) filter (where ${batches.id} is not null)
          `,
        })
        .from(genetics)
        .leftJoin(plants, eq(plants.geneticId, genetics.id))
        .leftJoin(batches, eq(batches.geneticId, genetics.id))
        .where(eq(genetics.slug, input))
        .groupBy(genetics.id)
        .limit(1)
        .then((rows) => rows[0])

      if (!genetic) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Genetic not found',
        })
      }

      return {
        ...genetic,
        plants: genetic.plants || [],
        batches: genetic.batches || [],
      }
    }),

  create: protectedProcedure
    .input(geneticInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const slug = slugify(input.name)

        // Check for existing slug
        const existing = await ctx.db.query.genetics.findFirst({
          where: eq(genetics.slug, slug),
        })

        // If slug exists, append a number
        const finalSlug = existing
          ? `${slug}-${Date.now().toString().slice(-4)}`
          : slug

        // Convert number values to strings for decimal fields
        const insertData: Partial<NewGenetic> = {
          ...input,
          slug: finalSlug,
          createdById: ctx.session.user.id,
        }

        await ctx.db.insert(genetics).values(insertData as Partial<NewGenetic>)
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create genetic',
          cause: error,
        })
      }
    }),

  list: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.genetics.findMany({
      orderBy: (genetics) => [genetics.name],
      with: {
        createdBy: true,
      },
    })
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if genetic is in use by any plants using count
        const plantsResult = await ctx.db
          .select({ count: sql<number>`count(*)::int` })
          .from(plants)
          .where(eq(plants.geneticId, input.id))

        const plantsCount = plantsResult[0]?.count ?? 0

        if (plantsCount > 0) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'Cannot delete genetic that is in use by plants',
          })
        }

        // Check if genetic is in use by any batches using count
        const batchesResult = await ctx.db
          .select({ count: sql<number>`count(*)::int` })
          .from(batches)
          .where(eq(batches.geneticId, input.id))

        const batchesCount = batchesResult[0]?.count ?? 0

        if (batchesCount > 0) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'Cannot delete genetic that is in use by batches',
          })
        }

        await ctx.db.delete(genetics).where(eq(genetics.id, input.id))
      } catch (error) {
        if (error instanceof TRPCError) throw error

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete genetic',
          cause: error,
        })
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: geneticInput.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, data } = input
        const updateData: Record<string, unknown> = {}

        // Handle name and slug update
        if (data.name) {
          const slug = slugify(data.name)
          const existing = await ctx.db.query.genetics.findFirst({
            where: and(eq(genetics.slug, slug), ne(genetics.id, id)),
          })
          updateData.name = data.name
          updateData.slug = existing
            ? `${slug}-${Date.now().toString().slice(-4)}`
            : slug
        }

        // Copy over fields, handling nullish values correctly
        if (data.type !== undefined) updateData.type = data.type
        if (data.description !== undefined)
          updateData.description = data.description
        if (data.breeder !== undefined) updateData.breeder = data.breeder
        if (data.floweringTime !== undefined)
          updateData.floweringTime = data.floweringTime
        if (data.growthCharacteristics !== undefined)
          updateData.growthCharacteristics = data.growthCharacteristics
        if (data.terpeneProfile !== undefined)
          updateData.terpeneProfile = data.terpeneProfile
        if (data.lineage !== undefined) updateData.lineage = data.lineage

        // Handle decimal fields
        if (data.thcPotential !== undefined) {
          updateData.thcPotential = data.thcPotential?.toString() ?? null
        }
        if (data.cbdPotential !== undefined) {
          updateData.cbdPotential = data.cbdPotential?.toString() ?? null
        }

        // Add updatedAt timestamp
        updateData.updatedAt = new Date()

        const [updated] = await ctx.db
          .update(genetics)
          .set(updateData)
          .where(eq(genetics.id, id))
          .returning()

        return updated
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update genetic',
          cause: error,
        })
      }
    }),
})
