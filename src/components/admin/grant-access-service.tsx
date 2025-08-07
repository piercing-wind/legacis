'use client'

import { useEffect, useState } from 'react'
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
import { Crown, Loader2, Search, User } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import { ServicePlan } from '@/prisma/generated/client'

const formSchema = z.object({
  userId: z.string().min(1, "Please select a user"),
  serviceId: z.string().min(1, "Please select a service"),
  selectedPlan: z.object({
    id: z.string(),
    label: z.string(),
    durationInDays: z.number().min(1, "Duration must be at least 1 day"),
    price: z.number().min(0, "Price cannot be negative"),
    discount: z.number().nullable().optional(),
    stockLimit: z.number().nullable().optional(),
  }),
  customPlanDays: z.number().optional().nullable(),
  customStocks: z.number().optional().nullable(),
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
  type: string
  slug: string
  plans: ServicePlan[]
}

interface GrantAccessDialogProps {
  users: User[]
  services: Service[]
}

type FormData = z.infer<typeof formSchema>

export function GrantAccessDialog({ users, services }: GrantAccessDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userSearch, setUserSearch] = useState("")
  const [serviceSearch, setServiceSearch] = useState("")
  const [availablePlans, setAvailablePlans] = useState<ServicePlan[]>([])

  const router = useRouter()
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      serviceId: "",
      selectedPlan: {
        id: "",
        label: "",
        durationInDays: 30,
        price: 0,
        discount: null,
        stockLimit: null,
      },
      customPlanDays: null,
      customStocks: null,
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
  const selectedPlan = form.watch("selectedPlan")
  const customPlanDays = form.watch("customPlanDays")
  const customStocks = form.watch("customStocks")

  // Check if selected service is Portfolio Review
  const isPortfolioReview = selectedService?.type === 'PORTFOLIO_REVIEW'

  // Update available plans when service changes
  useEffect(() => {
    if (selectedService && selectedService.plans) {
      const activePlans = selectedService.plans.filter(plan => plan.isActive)
      setAvailablePlans(activePlans)
      
      if (activePlans.length > 0) {
        const firstPlan = activePlans[0]
        form.setValue("selectedPlan", {
          id: firstPlan.id,
          label: firstPlan.label,
          durationInDays: firstPlan.durationInDays,
          price: firstPlan.price,
          discount: firstPlan.discount,
          stockLimit: firstPlan.stockLimit,
        })
      }
    } else {
      setAvailablePlans([])
    }
  }, [selectedService, form])

  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true)
    try {
      let finalValues = { ...values }
      
      // Override values for Portfolio Review
      if (isPortfolioReview && customStocks) {
        finalValues = {
          ...values,
          selectedPlan: {
            ...values.selectedPlan,
            stockLimit: customStocks,
          }
        }
      }

      // Override duration for regular services
      if (!isPortfolioReview && customPlanDays) {
        finalValues = {
          ...values,
          selectedPlan: {
            ...values.selectedPlan,
            durationInDays: customPlanDays,
          }
        }
      }

      const response = await fetch('/api/admin/grant-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalValues),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to grant access')
      }

      const result = await response.json()
      
      toast.success(`Successfully granted ${selectedService?.name} access to ${selectedUser?.name}`, {
        description: `${result.data.summary.actualDuration} • Value: ${result.data.summary.value}`
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

  const calculateValue = () => {
    if (!selectedService || !selectedPlan) return 0
    
    if (isPortfolioReview) {
      const actualStocks = customStocks || selectedPlan.stockLimit || 0
      return actualStocks * 100 // Nominal value for display
    }
    
    const actualDays = customPlanDays || selectedPlan.durationInDays
    const basePrice = selectedPlan.price
    const discountAmount = selectedPlan.discount ? basePrice * selectedPlan.discount : 0
    return Math.round(basePrice - discountAmount)
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
                                    {service.type.replace(/_/g, ' ')} • {service.plans.length} plans
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
                        <Badge variant="outline">{selectedService.plans.length} plans</Badge>
                      </div>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Plan Selection */}
            {selectedService && availablePlans.length > 0 && (
              <FormField
                control={form.control}
                name="selectedPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Plan</FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={(value) => {
                          const plan = availablePlans.find(p => p.id === value)
                          if (plan) {
                            field.onChange({
                              id: plan.id,
                              label: plan.label,
                              durationInDays: plan.durationInDays,
                              price: plan.price,
                              discount: plan.discount,
                              stockLimit: plan.stockLimit,
                            })
                          }
                        }}
                        value={field.value.id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePlans.map((plan) => {
                           return(
                            <SelectItem key={plan.id} value={plan.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>
                                  {plan.label} - {plan.durationInDays} days
                                  {isPortfolioReview && plan.stockLimit && ` (${plan.stockLimit} stocks)`}
                                  {` - ₹${plan.price.toLocaleString()}`}
                                  {plan.discount != null && plan.discount > 0 && ` (${Math.round(plan.discount * 100)}% off)`}
                                </span>
                                {plan.discount != null && plan.discount > 0 && (
                                  <Badge variant="secondary" className="ml-2">
                                    {Math.round(plan.discount * 100)}% off
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          )})}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Custom Plan Days - Hide for Portfolio Review */}
            {!isPortfolioReview && selectedPlan.id && (
              <FormField
                control={form.control}
                name="customPlanDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Duration (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Override with custom days..."
                        min={1}
                        max={3650}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave empty to use selected plan duration ({selectedPlan.durationInDays} days). Custom days will override the selected plan.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Custom Stocks - Show for Portfolio Review */}
            {isPortfolioReview && selectedPlan.id && (
              <FormField
                control={form.control}
                name="customStocks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Stocks (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Override with custom stocks..."
                        min={1}
                        max={1000}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave empty to use selected plan stocks ({selectedPlan.stockLimit || 'unlimited'} stocks). Custom stocks will override the selected plan.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
            {selectedUser && selectedService && selectedPlan.id && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Grant Summary</h4>
                <div className="space-y-1 text-sm text-purple-800">
                  <div><strong>User:</strong> {selectedUser.name} ({selectedUser.email})</div>
                  <div><strong>Service:</strong> {selectedService.name}</div>
                  <div><strong>Plan:</strong> {selectedPlan.label}</div>
                  {isPortfolioReview ? (
                    <>
                      <div><strong>Duration:</strong> {selectedPlan.durationInDays} days</div>
                      <div><strong>Base Plan:</strong> Up to {selectedPlan.stockLimit} stocks</div>
                      {customStocks && (
                        <div><strong>Custom Stocks:</strong> {customStocks} stocks (overrides plan)</div>
                      )}
                      <div><strong>Final Stocks:</strong> {customStocks || selectedPlan.stockLimit} stocks</div>
                    </>
                  ) : (
                    <>
                      <div><strong>Base Duration:</strong> {selectedPlan.durationInDays} days</div>
                      {customPlanDays && (
                        <div><strong>Custom Duration:</strong> {customPlanDays} days (overrides plan)</div>
                      )}
                      <div><strong>Final Duration:</strong> {customPlanDays || selectedPlan.durationInDays} days</div>
                    </>
                  )}
                  <div><strong>Plan Price:</strong> ₹{selectedPlan.price.toLocaleString()}</div>
                  {selectedPlan.discount && (
                    <div><strong>Discount:</strong> {Math.round(selectedPlan.discount * 100)}%</div>
                  )}
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