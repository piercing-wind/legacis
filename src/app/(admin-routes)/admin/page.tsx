import { findAllUserPurchasedServices, getUsersForGrantAccess, getServicesForGrantAccess, UserPurchasedService } from "@/lib/data/admin/userPurchasedServices"
import { formatHumanDate } from "@/lib/utils"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CheckCircle, XCircle, Calendar, DollarSign, Users, Tag, CreditCard, Gift, Crown, HelpCircle } from "lucide-react"
import { SubscriptionActions } from "@/components/admin/subscriptionManage"
import { GrantAccessDialog } from "@/components/admin/grant-access-service"
import { ExportSubscriptionsToExcel } from "@/components/admin/export-excel"

export default async function Page() {
    const [data, users, services] = await Promise.all([
    findAllUserPurchasedServices(),
    getUsersForGrantAccess(),
    getServicesForGrantAccess()
  ])

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

  const getGrantTypeBadge = (purchase: UserPurchasedService) => {
    const { type, badge, iconName } = purchase.displayInfo;
    const IconComponent = getIconComponent(iconName);
    
    return (
      <Badge variant="outline" className={`text-xs ${badge}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {type}
      </Badge>
    );
  };

  const getPlanName = (days: number) => {
    if (days === 30) return "Monthly Plan"
    if (days === 90) return "Quarterly Plan (3 months)"
    if (days === 180) return "Half-Yearly Plan (6 months)"
    if (days === 360) return "Yearly Plan (12 months)"
    return `${days} Days Plan`
  }

  const SubscriptionRow = ({ purchase, index }: { purchase: UserPurchasedService, index: number }) => {
   const isNotExpiredByDate = new Date(purchase.expiryDate) > new Date();
    const originalPrice = purchase.service?.price || 0;

     // Handle amount display based on grant type
    const getAmountDisplay = () => {
      switch (purchase.grantType) {
        case 'PURCHASED':
          if (purchase.actualAmountPaid) {
            const planMonths = purchase.planDays / 30;
            const totalOriginalPrice = originalPrice * planMonths;
            const totalSavings = totalOriginalPrice - purchase.actualAmountPaid;
            
            return (
              <div className="space-y-1">
                <div className="font-semibold text-lg">
                  ₹{purchase.actualAmountPaid.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  Monthly: ₹{originalPrice.toLocaleString()}
                </div>
                {purchase.couponUsed && (
                  <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <Tag className="w-3 h-3" />
                    {purchase.couponUsed.code} (-{purchase.couponUsed.percentOff}%)
                  </div>
                )}
                {totalSavings > 0 && (
                  <div className="text-xs text-green-600 font-medium">
                    Saved: ₹{Math.round(totalSavings).toLocaleString()}
                  </div>
                )}
              </div>
            );
          }
          // Fallback calculation
          return (
            <div className="space-y-1">
              <div className="font-semibold text-lg">
                ₹{Math.round((originalPrice * purchase.planDays / 30) * (1 - purchase.planDiscount / 100)).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Monthly: ₹{originalPrice.toLocaleString()}
              </div>
              {purchase.planDiscount > 0 && (
                <div className="text-xs text-green-600 font-medium">
                  {purchase.planDiscount}% plan discount
                </div>
              )}
            </div>
          );

        case 'COMPLIMENTARY':
          return (
            <div className="space-y-1">
              <div className="font-semibold text-lg text-green-600">FREE</div>
              <div className="text-xs text-muted-foreground">
                Value: ₹{Math.round(originalPrice * purchase.planDays / 30).toLocaleString()}
              </div>
              <div className="text-xs text-green-600 flex items-center gap-2"><Gift size={14}/> Complimentary</div>
            </div>
          );

        case 'ADMIN_GRANTED':
          const storedPrice = purchase.grantMetadata?.finalPrice || purchase.grantMetadata?.pricing?.finalPrice;
          return (
            <div className="space-y-1">
              <div className="font-semibold text-lg text-purple-600">GRANTED</div>
              <div className="text-xs text-muted-foreground">
                Value: ₹{storedPrice?.toLocaleString()}
              </div>
              <div className="text-xs text-purple-600 flex items-center gap-2"><Crown size={14}/> Admin Grant</div>
            </div>
          );

        default:
          return <div className="text-muted-foreground">-</div>;
      }
    };

    return (
      <TableRow key={purchase.id}>
        <TableCell>{index + 1}</TableCell>
        
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(purchase.user?.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{purchase.user?.name || 'N/A'}</div>
              <div className="text-xs text-muted-foreground">{purchase.user?.email}</div>
            </div>
          </div>
        </TableCell>

         <TableCell>
          <div className="space-y-2">
            <div className="font-medium">{purchase.service?.name}</div>
            <div className="flex flex-wrap gap-1">
              {getServiceTypeBadge(purchase.service?.type)}
              {getGrantTypeBadge(purchase)}
            </div>
          </div>
        </TableCell>

        <TableCell>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              {formatHumanDate(purchase.purchaseDate)}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              {getPlanName(purchase.planDays)}
            </div>
            {/* Show grant reason for admin granted services */}
            {purchase.grantType === 'ADMIN_GRANTED' && purchase.grantReason && (
              <div className="text-xs text-purple-600 italic max-w-[200px] truncate">
                "{purchase.grantReason}"
              </div>
            )}
          </div>
        </TableCell>

         <TableCell className={!purchase.isActive ? 'text-gray-600' : new Date(purchase.expiryDate) > new Date() ? 'text-green-600' : 'text-red-600'}>
          <div className="space-y-1">
            <div>{formatHumanDate(purchase.expiryDate)}</div>
            <SubscriptionActions 
              subscriptionId={purchase.id}
              currentExpiry={purchase.expiryDate}
              userName={purchase.user?.name || 'Unknown'}
              serviceName={purchase.service?.name || 'Unknown Service'}
              isActive={purchase.isActive}
            />
          </div>
        </TableCell>
        

       <TableCell>
        {!purchase.isActive ? (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">Deactivated</Badge>
        ) : new Date(purchase.expiryDate) > new Date() ? (
          <Badge className="bg-green-100 text-green-800">Active</Badge>
        ) : (
          <Badge variant="destructive">Expired</Badge>
        )}
      </TableCell>


        <TableCell className="text-right">
          {getAmountDisplay()}
        </TableCell>
      </TableRow>
    );
  };



  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Subscriptions</h1>
          <p className="text-muted-foreground">Manage all service subscriptions</p>
        </div>
      <div className="flex items-center gap-3">
         <ExportSubscriptionsToExcel data={data.all} />
          <GrantAccessDialog
            users={users} 
            services={services}
          />
          <Badge variant="outline" className="text-lg px-4 py-1">
            {data.all.length} Total
          </Badge>
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
            <div className="text-2xl font-bold">{data.all.length}</div>
            <p className="text-xs text-muted-foreground">All time purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.active.length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.expired.length}</div>
            <p className="text-xs text-muted-foreground">Expired or deactivated</p>
          </CardContent>
        </Card>

         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complimentary</CardTitle>
            <Tag className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.all.filter(s => s.grantType === 'COMPLIMENTARY').length}
            </div>
            <p className="text-xs text-muted-foreground">Services as Additional</p>
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
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.active.map((purchase, index) => (
                  <SubscriptionRow key={purchase.id} purchase={purchase} index={index} />
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
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.expired.map((purchase, index) => (
                  <SubscriptionRow key={purchase.id} purchase={purchase} index={index} />
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
    </div>
  )
}