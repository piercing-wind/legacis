import { getPlatinaWealthUsers } from '@/lib/data/admin/platina-wealth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  AlertCircle,
  CheckCircle,
  Eye,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { formatHumanDate } from '@/lib/utils';

export default async function PlatinaWealthAdminPage() {
  const users = await getPlatinaWealthUsers();

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CONSERVATIVE':
        return 'bg-green-100 text-green-800';
      case 'MODERATE':
        return 'bg-blue-100 text-blue-800';
      case 'AGGRESSIVE':
        return 'bg-orange-100 text-orange-800';
      case 'VERY_AGGRESSIVE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full mx-auto overflow-x-auto py-8 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platina Wealth Management</h1>
          <p className="text-muted-foreground">Manage user portfolios and recommendations</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {users.length} Total Users
        </Badge>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Platina Wealth Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Risk Profile</TableHead>
                  <TableHead>Investment Amount</TableHead>
                  <TableHead>Portfolio Status</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={user.id + index}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {user.riskProfile ? (
                        <div className="space-y-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getRiskLevelColor(user.riskProfile.riskLevel)}`}
                          >
                            {user.riskProfile.riskLevel}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {user.riskProfile.riskPercentage.toFixed(1)}% risk
                          </div>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          No Profile
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      {user.recommendation?.userInvestmentAmount ? (
                        <div className="space-y-1">
                          <div className="font-semibold">
                            ₹{user.recommendation.userInvestmentAmount.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.recommendation.stockCount} stocks
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>

                    <TableCell>
                      {user.recommendation && user.recommendation.isActive ? (
                        <div className="space-y-1">
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            Updated {formatHumanDate(user.recommendation.lastUpdated)}
                          </div>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          Expires {formatHumanDate(user.expiryDate)}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/platina-wealth/${user.id}`}>
                            <Eye className="w-3 h-3 mr-1" />
                            Manage
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-8">
              <div className="text-muted-foreground">No Platina Wealth users found.</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}