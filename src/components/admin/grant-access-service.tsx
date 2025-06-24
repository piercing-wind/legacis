'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Crown, Loader2, Plus, Search, User } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from 'next/navigation'

const formSchema = z.object({
  userId: z.string().min(1, "Please select a user"),
  serviceId: z.string().min(1, "Please select a service"),
  planDays: z.number().min(1, "Plan days must be at least 1"),
  grantReason: z.string().min(3, "Please provide a reason for granting access"),
})

interface User {
  id: string
  name: string | null
  email: string
  createdAt: Date
}

interface Service {
  id: string
  name: string
  price: number
  type: string
   slug: string
}

interface GrantAccessDialogProps {
  users: User[]
  services: Service[]
}

export function GrantAccessDialog({ users, services }: GrantAccessDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userSearch, setUserSearch] = useState("")
  const [serviceSearch, setServiceSearch] = useState("")
  const router = useRouter()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      serviceId: "",
      planDays: 30,
      grantReason: "",
    },
  })

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(serviceSearch.toLowerCase())
  )

  const selectedUser = users.find(u => u.id === form.watch("userId"))
  const selectedService = services.find(s => s.id === form.watch("serviceId"))

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/grant-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to grant access')
      }

      const result = await response.json()
      
      toast.success(`Successfully granted ${selectedService?.name} access to ${selectedUser?.name}`, {
        description: `Valid for ${values.planDays} days`
      })
      
      setOpen(false)
      form.reset()
      router.refresh()
      
    } catch (error) {
      toast.error('Failed to grant access', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPlanName = (days: number) => {
    if (days === 30) return "Monthly Plan"
    if (days === 90) return "Quarterly Plan (3 months)"
    if (days === 180) return "Half-Yearly Plan (6 months)"
    if (days === 365) return "Yearly Plan (12 months)"
    return `${days} Days Plan`
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Crown className="w-4 h-4" />
          Grant Access
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-600" />
            Grant Service Access
          </DialogTitle>
          <DialogDescription>
            Manually grant a user access to any service. This will create an admin-granted subscription.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* User Selection */}
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select User</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search users by name or email..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a user" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {filteredUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <div>
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-xs text-muted-foreground">{user.email}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  {selectedUser && (
                    <div className="p-2 bg-muted rounded-md">
                      <div className="text-sm font-medium">{selectedUser.name}</div>
                      <div className="text-xs text-muted-foreground">{selectedUser.email}</div>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Service Selection */}
            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Service</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search services..."
                          value={serviceSearch}
                          onChange={(e) => setServiceSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a service" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {filteredServices.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              <div className="flex items-center justify-between w-full">
                                <div>
                                  <div className="font-medium">{service.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {service.type.replace(/_/g, ' ')} • ₹{service.price}/month
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  {selectedService && (
                    <div className="p-2 bg-muted rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{selectedService.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {selectedService.type.replace(/_/g, ' ')}
                          </div>
                        </div>
                        <Badge variant="outline">₹{selectedService.price}/month</Badge>
                      </div>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Plan Duration */}
            <FormField
              control={form.control}
              name="planDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Duration</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">{getPlanName(30)}</SelectItem>
                          <SelectItem value="90">{getPlanName(90)}</SelectItem>
                          <SelectItem value="180">{getPlanName(180)}</SelectItem>
                          <SelectItem value="365">{getPlanName(365)}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Or enter custom days..."
                        min={1}
                        max={3650}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Service will be valid for {field.value} days from today
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Grant Reason */}
            <FormField
              control={form.control}
              name="grantReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Granting Access</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Compensation for service downtime, VIP user benefit, promotional access..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This reason will be visible in the subscription details
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Summary */}
            {selectedUser && selectedService && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Grant Summary</h4>
                <div className="space-y-1 text-sm text-purple-800">
                  <div><strong>User:</strong> {selectedUser.name} ({selectedUser.email})</div>
                  <div><strong>Service:</strong> {selectedService.name}</div>
                  <div><strong>Duration:</strong> {getPlanName(form.watch("planDays"))}</div>
                  <div><strong>Value:</strong> ₹{Math.round(selectedService.price * form.watch("planDays") / 30).toLocaleString()} (FREE for user)</div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Grant Access
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}