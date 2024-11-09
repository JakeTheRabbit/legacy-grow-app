'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { type Strain } from '~/server/db/schemas/cultivation'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import Link from 'next/link'

export const columns: ColumnDef<Strain>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="font-medium">{row.getValue('name')}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'floweringTime',
    header: 'Flowering Time',
    cell: ({ row }) => {
      const weeks = row.getValue('floweringTime')
      return weeks ? `${weeks} weeks` : 'N/A'
    },
  },
  {
    accessorKey: 'thcPotential',
    header: 'THC %',
    cell: ({ row }) => {
      const thc = row.getValue('thcPotential')
      return thc ? `${thc}%` : 'N/A'
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const strain = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/strains/${strain.id}`}>View Details</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
