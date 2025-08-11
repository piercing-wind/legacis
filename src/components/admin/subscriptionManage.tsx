'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { AlertTriangle, Calendar, Clock, Plus, Power } from 'lucide-react'
import { updateSubscriptionExpiry, extendSubscriptionByDays, toggleSubscriptionStatus } from '@/actions/admin/subscription-actions'
import { toast } from 'sonner'
import { Separator } from '../ui/separator'
import { Switch } from '../ui/switch'
import { useRouter } from 'next/navigation'
import { formatHumanDate } from '@/lib/utils'

interface SubscriptionActionsProps {
  subscriptionId: string
  currentExpiry: Date | null
  userName: string
  serviceName: string
  isActive : boolean
}

export function SubscriptionActions({ 
  subscriptionId, 
  currentExpiry, 
  userName, 
  serviceName,
  isActive
}: SubscriptionActionsProps) {
   const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newExpiryDate, setNewExpiryDate] = useState('')
  const [extensionDays, setExtensionDays] = useState('')
  const [currentIsActive, setCurrentIsActive] = useState(isActive) 

  const handleUpdateExpiry = async () => {
    if (!newExpiryDate) {
      toast.error('Please select a new expiry date')
      return
    }

    setIsLoading(true)
    try {
      const result = await updateSubscriptionExpiry(subscriptionId, new Date(newExpiryDate))
      
      if (result.success) {
        toast.success(result.message)
        setIsOpen(false)
        setNewExpiryDate('')
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExtendSubscription = async (days: number) => {
    setIsLoading(true)
    try {
      const result = await extendSubscriptionByDays(subscriptionId, days)
      
      if (result.success) {
        toast.success(result.message)
        setIsOpen(false)
         setNewExpiryDate('')
         router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomExtension = async () => {
    const days = parseInt(extensionDays)
    if (!days || days <= 0) {
      toast.error('Please enter a valid number of days')
      return
    }
    await handleExtendSubscription(days)
  }

   const handleToggleStatus = async () => {
    setIsLoading(true)
    try {
      const result = await toggleSubscriptionStatus(subscriptionId, !currentIsActive)
      
      if (result.success) {
        setCurrentIsActive(!currentIsActive)
        toast.success(result.message)
        setIsOpen(false)
        setNewExpiryDate('')
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 px-2">
          <Calendar className="h-3 w-3 mr-1" />
          Manage
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Subscription</DialogTitle>
          <DialogDescription>
            Update expiry for {userName}&apos;s {serviceName} subscription
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Current expiry: {currentExpiry ? formatHumanDate(currentExpiry) : 'Not Applicable'}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Power className="h-4 w-4" />
                <Label className="text-sm font-medium">Subscription Status</Label>
              </div>
              <div className="text-xs text-muted-foreground">
                {currentIsActive ? 'Active - User can access the service' : 'Inactive - User cannot access the service'}
              </div>
            </div>
            <Switch
              checked={currentIsActive}
              onCheckedChange={handleToggleStatus}
              disabled={isLoading}
            />
          </div>

          {/* Warning for deactivation */}
          {currentIsActive && (
            <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-xs text-amber-800">
                Deactivating will immediately block user access, even if subscription hasn&apos;t expired.
              </div>
            </div>
          )}

          <Separator />

          {/* Quick Extension Options */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Extensions</Label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExtendSubscription(7)}
                disabled={isLoading}
              >
                +7 days
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExtendSubscription(30)}
                disabled={isLoading}
              >
                +30 days
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExtendSubscription(90)}
                disabled={isLoading}
              >
                +90 days
              </Button>
            </div>
          </div>

          {/* Custom Extension */}
          <div className="space-y-2">
            <Label htmlFor="extension-days" className="text-sm font-medium">
              Custom Extension (days)
            </Label>
            <div className="flex gap-2">
              <Input
                id="extension-days"
                type="number"
                placeholder="Enter days"
                value={extensionDays}
                onChange={(e) => setExtensionDays(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleCustomExtension}
                disabled={isLoading || !extensionDays}
                size="sm"
              >
                <Plus className="h-3 w-3 mr-1" />
                Extend
              </Button>
            </div>
          </div>

          {/* Set Specific Date */}
          <div className="space-y-2">
            <Label htmlFor="new-expiry" className="text-sm font-medium">
              Set Specific Expiry Date
            </Label>
            <Input
              id="new-expiry"
              type="date"
              value={newExpiryDate}
              onChange={(e) => setNewExpiryDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateExpiry}
            disabled={isLoading || !newExpiryDate}
          >
            {isLoading ? 'Updating...' : 'Update Expiry'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}