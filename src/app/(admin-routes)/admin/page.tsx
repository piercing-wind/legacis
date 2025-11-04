import { findAllUserPurchasedServices, getUsersForGrantAccess, getServicesForGrantAccess, UserPurchasedWithRelations } from "@/lib/data/admin/userPurchasedServices"
import { formatHumanDate, formatDateWithTime } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, XCircle, Calendar, DollarSign, Users, Tag, CreditCard, Gift, Crown, HelpCircle } from "lucide-react"
import { SubscriptionActions } from "@/components/admin/subscriptionManage"
import { GrantAccessDialog } from "@/components/admin/grant-access-service"
import { ExportSubscriptionsToExcel } from "@/components/admin/export-excel"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import Link from "next/link";
import { Service, ServiceType, UserPurchasedServices } from "@/prisma/generated/client"
import { AgreementDialog } from "@/components/agreementdialog"

const getInitials = (name: string | null | undefined) => {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getServiceTypeBadge = (type: string | undefined) => {
 if(!type) return null; 
 const colors = {
    'PLATINA_WEALTH': 'bg-purple-100 text-purple-800',
    'TRADING': 'bg-blue-100 text-blue-800',
    'RESEARCH_ADVISORY': 'bg-green-100 text-green-800',
    'PORTFOLIO_REVIEW': 'bg-orange-100 text-orange-800',
  };
  
  return (
    <Badge variant="outline" className={`text-xs ${colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
      {type.replace(/_/g, ' ')}
    </Badge>
  );
}

const getIconComponent = (iconName: string) => {
  const iconMap = {
    CreditCard,
    Gift,
    Crown,
    HelpCircle
  };
  return iconMap[iconName as keyof typeof iconMap] || HelpCircle;
};

export interface GrantMetadata {
  finalPrice?: number;
  pricing?: {
    finalPrice: number;
  };
}

const parseGrantMetadata = (metadata: any): GrantMetadata | null => {
  if (!metadata) return null;
  
  try {
    // If it's already an object, return it
    if (typeof metadata === 'object' && metadata !== null) {
      return metadata as GrantMetadata;
    }
    
    // If it's a string, try to parse it
    if (typeof metadata === 'string') {
      return JSON.parse(metadata) as GrantMetadata;
    }
    
    return null;
  } catch (error) {
    console.log('Error parsing grantMetadata:', error);
    return null;
  }
};

export const getGrantTypeDisplay = (subscription: UserPurchasedWithRelations) => {
  switch (subscription.grantType) {
    case 'PURCHASED':
      return {
        type: 'Purchased',
        badge: 'bg-blue-100 text-blue-800',
        iconName: 'CreditCard',
        description: 'User paid for this service'
      };
    case 'COMPLIMENTARY':
      return {
        type: 'Complimentary',
        badge: 'bg-green-100 text-green-800',
        iconName: 'Gift',
        description: 'Acquired with another service'
      };
    case 'ADMIN_GRANTED':
      return {
        type: 'Admin Granted',
        badge: 'bg-purple-100 text-purple-800',
        iconName: 'Crown',
        description: subscription.grantReason || 'Manually granted by admin'
      };
    default:
      return {
        type: 'Unknown',
        badge: 'bg-gray-100 text-gray-800',
        iconName: 'HelpCircle',
        description: 'Unknown grant type'
      };
  }
};

const getGrantTypeBadge = (subscription : UserPurchasedWithRelations) => {
  const { type, badge, iconName } = getGrantTypeDisplay(subscription);
  const IconComponent = getIconComponent(iconName);
  
  return (
    <Badge variant="outline" className={`text-xs ${badge}`}>
      <IconComponent className="w-3 h-3 mr-1" />
      {type}
    </Badge>
  );
};


const getPlanDisplay = (subscription : UserPurchasedWithRelations) => {
   //   if (purchase.servicePlan) {
   //     return purchase.servicePlan.label;
   //   }
   
  // Fallback to metadata if available
  const metadata = subscription.grantMetadata as any;
  if (metadata?.selectedPlan?.label) {
    return metadata.selectedPlan.label;
  }
  
  return "-";
}

const SubscriptionRow = ({ subscription, service, transaction, index }: { subscription: UserPurchasedWithRelations, service : UserPurchasedWithRelations['service'] | null, transaction: UserPurchasedWithRelations['transaction'] | null, index: number }) => {
  const isActive = subscription.isActive && (!subscription.expiryDate || new Date(subscription.expiryDate) > new Date());
  
  // Get plan information
  const planInfo = subscription.servicePlan || (subscription.grantMetadata as any)?.selectedPlan;
  const isPortfolioReview = service?.type === 'PORTFOLIO_REVIEW';
  const metadata = parseGrantMetadata(subscription.grantMetadata);
  // Handle amount display based on grant type
  const getAmountDisplay = () => {
    switch (subscription.grantType) {
      case 'PURCHASED':
        if (transaction?.amount) {
          return (
            <div className="space-y-1 w-full flex flex-col items-end">
              <div className="font-semibold text-lg">
                ₹{transaction?.amount.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Base: ₹{planInfo?.price?.toLocaleString() || 'N/A'}
              </div>
              {transaction?.coupon && (
                <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <Tag className="w-3 h-3" />
                  {transaction.coupon.code} (- {transaction.coupon.percentOff * 100}%)
                </div>
              )}
            </div>
          );
        }
        // Fallback calculation
        return (
          <div className="space-y-1">
            <div className="font-semibold text-lg">
              ₹{planInfo?.price?.toLocaleString() || 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">
              Plan Price
            </div>
            {planInfo?.discount && (
              <div className="text-xs text-green-600 font-medium">
                {Math.round(planInfo.discount * 100)}% plan discount
              </div>
            )}
          </div>
        );

      case 'COMPLIMENTARY':
        const complimentaryValue = metadata?.finalPrice || planInfo?.price || 0;
        return (
          <div className="space-y-1 w-full flex flex-col items-end">
            <h5 className="font-medium text-green-600">COMPLIMENTARY</h5>
            <div className="text-xs text-muted-foreground">
              Value: ₹{complimentaryValue.toLocaleString()}
            </div>
            <div className="text-xs text-green-600 flex items-center gap-2">
              <Gift size={14}/> Complimentary
            </div>
          </div>
        );

      case 'ADMIN_GRANTED':
        const storedPrice = metadata?.finalPrice || metadata?.pricing?.finalPrice || planInfo?.price || 0;
        return (
          <div className="space-y-1 w-full flex flex-col items-end">
            <h6 className="font-medium text-purple-600">GRANTED</h6>
            <div className="text-xs text-muted-foreground">
              Value: ₹{storedPrice.toLocaleString()}
            </div>
            <div className="text-xs text-purple-600 flex items-center gap-2">
              <Crown size={14}/> Admin Grant
            </div>
          </div>
        );

      default:
        return <div className="text-muted-foreground">-</div>;
    }
  };

  const pricingDetail = () => {
    if (subscription.grantType !== 'PURCHASED') return '-';
    
    const basePrice = planInfo?.price || 0;
    const planDiscount = planInfo?.discount ? Math.round(basePrice * planInfo.discount) : 0;
    const priceAfterPlanDiscount = basePrice - planDiscount;

    const couponDiscount = transaction?.coupon?.percentOff
      ? Math.round(priceAfterPlanDiscount * transaction.coupon.percentOff)
      : 0;
    
    const priceAfterCouponDiscount = priceAfterPlanDiscount - couponDiscount;
    const taxPercent = service?.taxPercent || 0;
    const taxAmount = Math.round(priceAfterCouponDiscount * (taxPercent / 100));
    const finalPrice = priceAfterCouponDiscount + taxAmount;

    return (
      <Dialog>
        <DialogTrigger className="border p-1 rounded-sm text-xs">Pricing Detail</DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pricing Breakdown</DialogTitle>
          </DialogHeader>
          <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-4">
            <div className="space-y-2 text-sm">
              <div><strong>Base Price:</strong> ₹{basePrice.toLocaleString()}</div>
              {planInfo?.discount && (
                <>
                  <div><strong>Plan Discount:</strong> {Math.round(planInfo.discount * 100)}% (₹{planDiscount.toLocaleString()})</div>
                  <div><strong>After Plan Discount:</strong> ₹{priceAfterPlanDiscount.toLocaleString()}</div>
                </>
              )}
              {transaction?.coupon && (
                <>
                  <div><strong>Coupon ({transaction.coupon.code}):</strong> {transaction.coupon.percentOff * 100}% (₹{couponDiscount.toLocaleString()})</div>
                  <div><strong>After Coupon:</strong> ₹{priceAfterCouponDiscount.toLocaleString()}</div>
                </>
              )}
              <div><strong>Tax ({taxPercent}%):</strong> ₹{taxAmount.toLocaleString()}</div>
              <div className="border-t pt-2"><strong>Final Price:</strong> ₹{finalPrice.toLocaleString()}</div>
              {transaction?.amount && (
                <div><strong>Actually Paid:</strong> ₹{transaction.amount.toLocaleString()}</div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <TableRow key={subscription.id}>
      <TableCell>{index + 1}</TableCell>
      
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={subscription.user?.image!} alt={getInitials(subscription.user?.name)} />
            <AvatarFallback className="text-xs">
              {getInitials(subscription.user?.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{subscription.user?.name || 'N/A'}</div>
            <div className="text-xs text-muted-foreground">{subscription.user?.email}</div>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="space-y-2">
          <div className="font-medium">{subscription.service?.name}</div>
          <div className="flex flex-wrap gap-1">
            {getServiceTypeBadge(subscription.service?.type)}
            {getGrantTypeBadge(subscription)}
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            {formatHumanDate(subscription.purchaseDate)}
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            {getPlanDisplay(subscription)}
          </div>
          {subscription.grantType === 'ADMIN_GRANTED' && subscription.grantReason && (
            <div className="text-xs text-purple-600 italic max-w-[200px] truncate">
              &quot;{subscription.grantReason}&quot;
            </div>
          )}
        </div>
      </TableCell>

      <TableCell className={!subscription.isActive ? 'text-gray-600' : isActive ? 'text-green-600' : 'text-red-600'}>
        <div className="space-y-1">
          <div>
            {subscription.expiryDate ? formatHumanDate(subscription.expiryDate) : 'No expiry'}
          </div>
          <SubscriptionActions 
            subscriptionId={subscription.id}
            currentExpiry={subscription.expiryDate}
            userName={subscription.user?.name || 'Unknown'}
            serviceName={subscription.service?.name || 'Unknown Service'}
            isActive={subscription.isActive}
          />
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          {pricingDetail()}
        </div>
      </TableCell>

      <TableCell>
        {!subscription.isActive ? (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">Deactivated</Badge>
        ) : !subscription.expiryDate ? (
          <Badge className="bg-purple-100 text-purple-800">No Expiry</Badge>
        ) : isActive ? (
          <Badge className="bg-green-100 text-green-800">Active</Badge>
        ) : (
          <Badge variant="destructive">Expired</Badge>
        )}
      </TableCell>

      <TableCell className="text-right">
        {getAmountDisplay()}
      </TableCell>
      <TableCell className="text-center">
         {transaction ? (
         <Dialog>
            <DialogTrigger className="border p-1 px-4 rounded-sm text-xs">
                     See
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
               <DialogHeader>
                  <DialogTitle>Aadhaar {transaction?.aadhaarOtp?.aadhaarNumber}</DialogTitle>
                  {transaction?.aadhaarOtp ? (
                     <div className="text-xs">
                          <h6 className="font-medium text-sm mb-2">Generated OTP</h6>
                          <pre className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md max-w-full whitespace-pre-wrap break-words">{JSON.stringify(transaction.aadhaarOtp.generatedOTPResponse, null, 2)}</pre>
                     </div>
                  ):(
                     <div className="text-sm text-muted-foreground">No Aadhaar Generated OTP details available</div>
                  )}
                  {transaction?.aadhaarOtp ? (
                     <div className="text-xs">
                           <h6 className="font-medium text-sm mb-2">Verified OTP</h6>
                          <pre className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md max-w-full whitespace-pre-wrap break-words">{JSON.stringify(transaction.aadhaarOtp.verifiedOTPResponse, null, 2)}</pre>
                     </div>
                  ):(
                     <div className="text-sm text-muted-foreground">No Aadhaar Verified OTP details available</div>
                  )}
               </DialogHeader>
            </DialogContent>
         </Dialog>
         ) : (
            <span className="text-xs">- -</span>
         )}
      </TableCell>
      <TableCell className="text-center">
         {transaction ? (
         <Dialog>
            <DialogTrigger className="border p-1 px-4 rounded-sm text-xs">
               View Summary
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
               <DialogHeader>
                  <DialogTitle>Agreement Summary</DialogTitle>
                  {transaction?.agreementSummary ? (
                     <div className="text-xs">
                          <h6 className="font-medium text-sm">Summary</h6>
                          <span className="mb-2 font-medium">Signed on: {formatDateWithTime(transaction?.agreementAcceptedAt!)}</span>
                          <pre className="font-mono mt-2 text-sm bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md max-w-full whitespace-pre-wrap break-words">{JSON.stringify(transaction.agreementSummary, null, 2)}</pre>
                     </div>
                  ):(
                     <div className="text-sm text-muted-foreground">No Agreement Summary details available</div>
                  )}
         
               </DialogHeader>
            </DialogContent>
         </Dialog>
         ):(
            <span className="text-xs">- -</span>
         )}
      </TableCell>
      <TableCell className="text-center">
         {transaction ? (
            <AgreementDialog 
               txn={transaction} 
               btnText="View" />
         ):(
            <span className="text-xs">- -</span>
         )}
      </TableCell>
    </TableRow>
  );
};

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function Page({ searchParams }: PageProps) {
   
  const params = await searchParams || {};
  const search = typeof params.search === "string" ? params.search : "";
  const serviceType = typeof params.serviceType === "string" ? params.serviceType : "ALL";
  const page = Number(params.page) || 1;
  const USER_PER_PAGE = 20;

  const skip = (page - 1) * USER_PER_PAGE;
  const data = await findAllUserPurchasedServices({
    search,
    serviceType,
    skip,
    take: USER_PER_PAGE,
  });

  const totalPages = Math.ceil((data?.stats?.total ?? 0) / USER_PER_PAGE);
   
  const [users, services] = await Promise.all([
    getUsersForGrantAccess(),
    getServicesForGrantAccess()
  ])

  return (
    <div className=" mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Subscriptions</h1>
          <p className="text-muted-foreground">Manage all service subscriptions</p>
        </div>
        <div className="flex items-center gap-3">
          <form method="GET" action="" className="flex items-center gap-2">
            <Input 
              type="text" 
              name="search" 
              placeholder="Search by user or service" 
              defaultValue={params.search || ''} 
              className="w-64"
            />
            <Select name="serviceType" defaultValue={typeof params.serviceType === "string" ? params.serviceType : "ALL"}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Service Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Services</SelectItem>
                {Object.values(ServiceType).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button type="submit" className="w-full sm:w-auto">Search</Button>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                asChild
              >
                <Link href="/admin">
                  Clear
                </Link>
              </Button>
            </div>
          </form>
          <ExportSubscriptionsToExcel data={data.all} />
          <GrantAccessDialog
            users={users} 
            services={services}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.total}</div>
            <p className="text-xs text-muted-foreground">All time purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.stats.activeCount}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.stats.expiredCount}</div>
            <p className="text-xs text-muted-foreground">Expired or deactivated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Granted</CardTitle>
            <Crown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {data.stats.adminGrant}
            </div>
            <p className="text-xs text-muted-foreground">Manually granted</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Active Subscriptions ({data.active.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Purchase & Plan</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Pricing Detail</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount Paid</TableHead>
                  <TableHead className="text-right">Aadhaar Details</TableHead>
                  <TableHead className="w-[100px]">Agreement Details</TableHead>
                  <TableHead className="w-[100px]">Agreement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.active.map((subscription, index) => (
                  <SubscriptionRow 
                    key={subscription.id} 
                    subscription={subscription} 
                    service={subscription.service}
                    transaction={subscription.transaction}
                    index={index} 
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {data.active.length === 0 && (
            <div className="text-center py-8">
              <div className="text-muted-foreground">No active subscriptions found.</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expired Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            Expired Subscriptions ({data.expired.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Purchase & Plan</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Pricing Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount Paid</TableHead>
                  <TableHead className="text-right">Aadhaar Details</TableHead>
                  <TableHead className="text-right">Agreement Details</TableHead>
                  <TableHead className="text-right">Agreement</TableHead>

                </TableRow>
              </TableHeader>
              <TableBody>
                {data.expired.map((subscription, index) => (
                  <SubscriptionRow 
                    key={subscription.id} 
                    subscription={subscription} 
                    service={subscription.service}
                    transaction={subscription.transaction}
                    index={index} 
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {data.expired.length === 0 && (
            <div className="text-center py-8">
              <div className="text-muted-foreground">No expired subscriptions found.</div>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent className="flex-wrap mt-8">
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={`?page=${page - 1}&search=${search}&serviceType=${serviceType}`} />
              </PaginationItem>
            )}
            {Array.from({ length: totalPages }, (_, i) => {
              const pageNumber = i + 1;
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href={`?page=${pageNumber}&search=${search}&serviceType=${serviceType}`}
                    isActive={page === pageNumber}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            {page < totalPages && (
              <PaginationItem>
                <PaginationNext href={`?page=${page + 1}&search=${search}&serviceType=${serviceType}`} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}