'use client'

import { useState } from 'react'
import { createClient } from '@/lib/client'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Megaphone } from 'lucide-react'

interface ReportDialogProps {
  productId: string
  productName: string
}

export function ReportDialog({ productId }: ReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<'copyright_infringement' | 'other'>('other')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      const supabase = createClient()
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to report a product.',
          variant: 'destructive',
        })
        return
      }

      const { error } = await supabase
        .from('reports')
        .insert({
          product_id: productId,
          reporter_id: user.id,
          reason,
          description: description.trim(),
        })

      if (error) throw error

      toast({
        title: 'Report submitted',
        description: 'Thank you for your report. We will review it shortly.',
      })
      
      setOpen(false)
      setReason('other')
      setDescription('')
    } catch (error) {
      console.error('Error submitting report:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit report. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="outline-none">
          <div className="flex items-center space-x-2.5">
            <Megaphone className="h-5 w-5" />
            <span className="text-sm leading-[1.6] text-body-80 transition-opacity hover:opacity-50">
              Report this template
            </span>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report this template</DialogTitle>
          <DialogDescription>
            If you think a template has stolen your work or has other questionable
            content, please use the form below to report it.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Why are you reporting?</label>
            <Select
              value={reason}
              onValueChange={(value: 'copyright_infringement' | 'other') => setReason(value)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white z-[100]">
                <SelectItem value="copyright_infringement">Copyright infringement</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Please briefly explain why you are reporting this template
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about your report..."
              className="min-h-[100px] bg-white"
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!description.trim() || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Report template'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 