'use client'

import { Button } from '~/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Plus } from 'lucide-react'
import { CreateGeneticForm } from './create-genetic-form'

export function CreateGeneticSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Genetic
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full p-0">
        <ScrollArea className="h-full w-full">
          <div className="p-6">
            <SheetHeader>
              <SheetTitle>Create New Genetic</SheetTitle>
              <SheetDescription>
                Add a new genetic to your genetic library.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4">
              <CreateGeneticForm />
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}