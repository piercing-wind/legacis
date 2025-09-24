import { getUserPlatinaDetails } from '@/lib/data/admin/platina-wealth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  User, 
  Shield, 
  TrendingUp, 
  PieChart,
  Edit,
  Plus,
  History,
  ArrowLeft,
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { formatHumanDate } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { ActivateRecommendation, AddChartDataDialog, AddStockDialog, StockManagementActions, UpdateRecommendationDate } from '@/components/admin/stock-management-actions';
import RationaleInput from "@/components/admin/platina-rationale";
import PlatinaSimpleLineChart from '@/components/services/platinaLineChart';

export default async function UserPlatinaDetailsPage({params}: { params: Promise<{ userId: string }>}) {
   const { userId } = await params
   const user = await getUserPlatinaDetails(userId);
  
   if (!user) {
      notFound();
   }
  
  

  const activeRecommendation = user.platinaRecommendations[0];
  const userPurchasedServicePlatina = user.purchasedServices.find(s => s.service?.type === 'PLATINA_WEALTH');
  const stockHistory = activeRecommendation?.stockHistory || [];

  const totalInvestmentAmount = activeRecommendation?.stocks.reduce((total, stock) => {
    return total + (stock.purchaseAmount || 0);
  }, 0);

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getSectorColor = (sector: string) => {
    const colors: { [key: string]: string } = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Healthcare': 'bg-green-100 text-green-800',
      'Finance': 'bg-purple-100 text-purple-800',
      'Energy': 'bg-orange-100 text-orange-800',
      'Consumer': 'bg-pink-100 text-pink-800',
      'Industrial': 'bg-gray-100 text-gray-800',
      'Materials': 'bg-yellow-100 text-yellow-800',
      'Utilities': 'bg-indigo-100 text-indigo-800',
    };
    return colors[sector] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="mx-auto p-6 space-y-6 w-full overflow-x-hidden">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/platina-wealth">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">User Portfolio Management</h1>
          <p className="text-muted-foreground">Manage {user.name}&apos;s Platina Wealth portfolio</p>
        </div>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image || "/profile/user-1.png"} />
              <AvatarFallback className="text-lg">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              {user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
            </div>
            <div className="ml-auto">
              <ActivateRecommendation
                  userId={user.id}
                  platinaServiceId={activeRecommendation?.platinaServiceId || ''}
                  isActive={activeRecommendation?.isActive || false}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Profile */}
      {user?.riskProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Risk Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <Badge variant="outline" className="mt-1">
                  {user.riskProfile.riskLevel}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Update</p>
                <p className="font-semibold">{formatHumanDate(user.riskProfile.lastUpdated)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Risk Percentage</p>
                <p className="font-semibold">{user.riskProfile.riskPercentage.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )} 

      {/* Portfolio Overview */}
      {activeRecommendation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Portfolio Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Investment Amount</p>
                <p className="text-2xl font-bold">
                  ₹{totalInvestmentAmount?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
               <RationaleInput
                  userId={user.id}
                  platinaServiceId={activeRecommendation.platinaServiceId}
                  prevRationale={activeRecommendation.rationale}
               />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Stocks</p>
                <p className="text-2xl font-bold">{activeRecommendation.stocks.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Review Date</p>
               <UpdateRecommendationDate
                  recommendationId={activeRecommendation.platinaServiceId}
                  userId={user.id}
                  nextRecommendationDate={activeRecommendation.nextRecommendationDate}
               />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Portfolio */}
      {activeRecommendation ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Stock Portfolio ({activeRecommendation.stocks.length})
              </div>
              <div className="flex gap-2">
                <AddStockDialog
                  userId={user.id}
                  recommendationId={activeRecommendation.id}
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto w-full">
            {activeRecommendation.stocks.length > 0 ? (
              <div className="rounded-md border overflow-x-auto">
                <Table >
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stock</TableHead>
                      <TableHead>Portfolio Weight</TableHead>
                      <TableHead>Total Shares</TableHead>
                      <TableHead>Current Share Price</TableHead>
                      <TableHead>Purchase Amount</TableHead>
                      <TableHead>Market Value</TableHead>
                      <TableHead>Market Cap (in cr.)</TableHead>
                      <TableHead>P/E Ratio</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeRecommendation.stocks
                      .sort((a, b) => b.portfolioWeight - a.portfolioWeight)
                      .map((stock) => (
                      <TableRow key={stock.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{stock.stockName}</div>
                            <div className="text-sm text-muted-foreground">{stock.stockTicker}</div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="font-semibold">{stock.portfolioWeight.toFixed(2)}%</div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="font-medium">{stock.totalShares.toLocaleString()}</div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="font-medium">₹{stock.currentSharePrice.toLocaleString()}</div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="font-semibold">₹{stock.purchaseAmount.toLocaleString()}</div>
                        </TableCell>

                        <TableCell>
                          <div className="font-medium">₹{stock.marketValue.toLocaleString()}</div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="font-medium">₹{stock.marketCapInCrore.toLocaleString()} Cr</div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="font-medium">{stock.PEratio.toFixed(1)}</div>
                        </TableCell>
                        
                        <TableCell>
                          {stock.isActive ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${getSectorColor(stock.sector)}`}>
                            {stock.sector}
                          </Badge>
                        </TableCell>

                        <TableCell>
                           <StockManagementActions 
                              stockId={stock.id}
                              recommendationId={activeRecommendation.id}
                              stockName={stock.stockName}
                              isActive={stock.isActive}
                              userId={user.id}
                              stockData={{
                                 stockName: stock.stockName,
                                 purchaseAmount : stock.purchaseAmount,
                                 stockTicker: stock.stockTicker,
                                 sector: stock.sector,
                                 portfolioWeight: stock.portfolioWeight,
                                 totalShares: stock.totalShares,
                                 currentSharePrice: stock.currentSharePrice,
                                 marketValue: stock.marketValue,
                                 PEratio: stock.PEratio,
                                 marketCapInCrore: stock.marketCapInCrore,
                                 entryDate: stock.entryDate,
                                 exitDate: stock.exitDate || undefined
                              }}
                           />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Stocks Added</h3>
                <p className="text-muted-foreground mb-4">
                  Start building the portfolio by adding stocks for this user.
                </p>
               <AddStockDialog
                  userId={user.id}
                  recommendationId={activeRecommendation.id}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Portfolio Recommendation
              </div>
              <Button asChild>
                <Link href={`/admin/platina-wealth/${user.id}/create`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Portfolio
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <PieChart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Portfolio Recommendation</h3>
              <p className="text-muted-foreground mb-4">
                This user doesn&apos;t have a portfolio recommendation yet. Create one to start managing their stocks.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock History */}
      {stockHistory?.length > 0 && (
      <Card>
         <CardHeader>
            <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Stock Change History
            </CardTitle>
         </CardHeader>
         <CardContent className="overflow-x-auto">
            <Table>
            <TableHeader>
               <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Change Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Previous Weight</TableHead>
                  <TableHead>New Weight</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {stockHistory
                  .sort((a, b) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime())
                  .map((history) => (
                  <TableRow key={history.id}>
                  <TableCell>
                     {formatHumanDate(history.changeDate)}
                  </TableCell>
                  <TableCell>
                     <div className="font-medium">{history.stockName}</div>
                     <div className="text-xs text-muted-foreground">{history.stockTicker}</div>
                  </TableCell>
                  <TableCell>
                     <Badge
                        variant={
                        history.changeType === 'ADDED'
                           ? 'default'
                           : history.changeType === 'REMOVED'
                           ? 'destructive'
                           : 'outline'
                        }
                        className={
                        history.changeType === 'ADDED'
                           ? 'bg-green-100 text-green-800'
                           : history.changeType === 'REMOVED'
                           ? 'bg-red-100 text-red-800'
                           : 'bg-blue-100 text-blue-800'
                        }
                     >
                        {history.changeType}
                     </Badge>
                  </TableCell>
                  <TableCell>
                     <span className="text-sm">{history.changeDescription}</span>
                  </TableCell>
                  <TableCell>
                     {history.previousWeight !== undefined && history.previousWeight !== null
                        ? `${history.previousWeight.toFixed(2)}%`
                        : '-'}
                  </TableCell>
                  <TableCell>
                     {history.newWeight !== undefined && history.newWeight !== null
                        ? `${history.newWeight.toFixed(2)}%`
                        : '-'}
                  </TableCell>
                  </TableRow>
               ))}
            </TableBody>
            </Table>
         </CardContent>
      </Card>
      )}
      {/* PE Chart */}
      <div className='flex flex-col md:flex-row gap-4'>
         <Card>
            <CardHeader>
               <CardTitle className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  PE Chart
               </div>

               </CardTitle>
            </CardHeader>
            <CardContent>
               
               {activeRecommendation?.peChart ? (
                  <div>
                     <PlatinaSimpleLineChart
                        data={activeRecommendation?.peChart as { date: string; value: number }[]}
                     />
                     <AddChartDataDialog
                        recommendationId={activeRecommendation?.id || ''}
                        userId={user.id}
                        chartType="peChart"
                        defaultValue={activeRecommendation?.peChart ? JSON.stringify(activeRecommendation?.peChart, null, 2) : ''}
                     />
                  </div>
               ):(
                  <AddChartDataDialog
                     recommendationId={activeRecommendation?.id || ''}
                     userId={user.id}
                     chartType="peChart"
                  />
               )}
            </CardContent>
         </Card>
         <Card>
            <CardHeader>
               <CardTitle className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  EPS Chart
               </div>

               </CardTitle>
            </CardHeader>
            <CardContent>
               
               {activeRecommendation?.epsChart ? (
                  <div>
                     <PlatinaSimpleLineChart
                        data={activeRecommendation?.epsChart as { date: string; value: number }[]}
                     />
                     <AddChartDataDialog
                        recommendationId={activeRecommendation?.id || ''}
                        userId={user.id}
                        chartType="epsChart"
                        defaultValue={activeRecommendation?.epsChart ? JSON.stringify(activeRecommendation?.epsChart, null, 2) : ''}
                     />
                  </div>
               ):(
                  <AddChartDataDialog
                     recommendationId={activeRecommendation?.id || ''}
                     userId={user.id}
                     chartType="epsChart"
                  />
               )}
            </CardContent>
         </Card>
      </div>

    </div>
  );
}