'use client'

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, Edit, Trash2, Eye, Power, Save, Plus, Pen } from 'lucide-react';
import { removeStockFromPortfolio, updateStockInPortfolio, createStockInPortfolio, updateRecommendationDate } from '@/actions/admin/platina-wealth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { DialogTrigger } from '@radix-ui/react-dialog';
import QuillInput from '../quill';

interface StockManagementActionsProps {
  stockId: string;
  recommendationId: string;
  stockName: string;
  isActive: boolean;
  userId: string;
  stockData: {
    stockName: string;
    purchaseAmount: number;
    stockTicker: string;
    sector: string;
    portfolioWeight: number;
    totalShares: number;
    currentSharePrice: number;
    marketValue: number;
    PEratio: number;
    marketCapInCrore: number;
    entryDate: string;
    exitDate?: string;
  };
}

export function StockManagementActions({ 
  stockId, 
  recommendationId, 
  stockName, 
  isActive,
  userId,
  stockData
}: StockManagementActionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Edit form state - only include fields that can be updated
const [editData, setEditData] = useState({
  stockName: stockData.stockName ?? stockName,
  stockTicker: stockData.stockTicker,
  sector: stockData.sector,
  portfolioWeight: stockData.portfolioWeight,
  totalShares: stockData.totalShares,
  currentSharePrice: stockData.currentSharePrice,
  purchaseAmount: stockData.purchaseAmount,
  marketValue: stockData.marketValue,
  PEratio: stockData.PEratio,
  marketCapInCrore: stockData.marketCapInCrore,
  isActive: isActive,
});

  const handleRemoveStock = async () => {
    setIsLoading(true);
    try {
      const result = await removeStockFromPortfolio(recommendationId, stockId);
      
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to remove stock');
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleToggleStatus = async () => {
    setIsLoading(true);
    try {
      const result = await updateStockInPortfolio(recommendationId, stockId, {
        isActive: !isActive
      });
      
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update stock status');
    } finally {
      setIsLoading(false);
    }
  };

const handleUpdateStock = async () => {
  setIsLoading(true);
  try {
    const result = await updateStockInPortfolio(recommendationId, stockId, {
      stockName: editData.stockName,
      stockTicker: editData.stockTicker,
      sector: editData.sector,
      portfolioWeight: editData.portfolioWeight,
      totalShares: editData.totalShares,
      currentSharePrice: editData.currentSharePrice,
      purchaseAmount: editData.purchaseAmount,
      marketValue: editData.marketValue,
      PEratio: editData.PEratio,
      marketCapInCrore: editData.marketCapInCrore,
      isActive: editData.isActive,
    });
    if (result.success) {
      toast.success(result.message);
      setShowEditDialog(false);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  } catch (error) {
    toast.error('Failed to update stock');
  } finally {
    setIsLoading(false);
  }
};
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowViewDialog(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Stock
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleToggleStatus} disabled={isLoading}>
            <Power className="mr-2 h-4 w-4" />
            {isActive ? 'Deactivate' : 'Activate'}
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove Stock
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{stockName} Details</DialogTitle>
            <DialogDescription>
              Complete information about this stock in the portfolio
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Stock Name</Label>
              <p className="text-sm text-muted-foreground">{stockName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Ticker</Label>
              <p className="text-sm text-muted-foreground">{stockData.stockTicker}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Sector</Label>
              <p className="text-sm text-muted-foreground">{stockData.sector}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Portfolio Weight</Label>
              <p className="text-sm text-muted-foreground">{stockData.portfolioWeight.toFixed(2)}%</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Total Shares</Label>
              <p className="text-sm text-muted-foreground">{stockData.totalShares.toLocaleString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Current Price</Label>
              <p className="text-sm text-muted-foreground">₹{stockData.currentSharePrice.toLocaleString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Market Value</Label>
              <p className="text-sm text-muted-foreground">₹{stockData.marketValue.toLocaleString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">P/E Ratio</Label>
              <p className="text-sm text-muted-foreground">{stockData.PEratio.toFixed(1)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Market Cap (Cr)</Label>
              <p className="text-sm text-muted-foreground">₹{stockData.marketCapInCrore.toLocaleString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Entry Date</Label>
              <p className="text-sm text-muted-foreground">{stockData.entryDate}</p>
            </div>
            {stockData.exitDate && (
              <div>
                <Label className="text-sm font-medium">Exit Date</Label>
                <p className="text-sm text-muted-foreground">{stockData.exitDate}</p>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <p className="text-sm text-muted-foreground">{isActive ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Stock Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
      <DialogContent>
         <DialogHeader>
            <DialogTitle>Edit {stockName}</DialogTitle>
            <DialogDescription>
            Update all stock information manually.
            </DialogDescription>
         </DialogHeader>
         <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
            <div>
               <Label htmlFor="stockName">Stock Name</Label>
               <Input
                  id="stockName"
                  value={editData.stockName}
                  onChange={e => setEditData(prev => ({ ...prev, stockName: e.target.value }))}
               />
            </div>
            <div>
               <Label htmlFor="stockTicker">Ticker</Label>
               <Input
                  id="stockTicker"
                  value={editData.stockTicker}
                  onChange={e => setEditData(prev => ({ ...prev, stockTicker: e.target.value }))}
               />
            </div>
            <div>
               <Label htmlFor="sector">Sector</Label>
               <Input
                  id="sector"
                  value={editData.sector}
                  onChange={e => setEditData(prev => ({ ...prev, sector: e.target.value }))}
               />
            </div>
            <div>
               <Label htmlFor="portfolioWeight">Portfolio Weight (%)</Label>
               <Input
                  id="portfolioWeight"
                  type="number"
                  step="0.01"
                  value={editData.portfolioWeight}
                  onChange={e => setEditData(prev => ({ ...prev, portfolioWeight: parseFloat(e.target.value) || 0 }))}
               />
            </div>
            <div>
               <Label htmlFor="totalShares">Total Shares</Label>
               <Input
                  id="totalShares"
                  type="number"
                  value={editData.totalShares}
                  onChange={e => setEditData(prev => ({ ...prev, totalShares: parseInt(e.target.value) || 0 }))}
               />
            </div>
            <div>
               <Label htmlFor="currentSharePrice">Current Price (₹)</Label>
               <Input
                  id="currentSharePrice"
                  type="number"
                  step="0.01"
                  value={editData.currentSharePrice}
                  onChange={e => setEditData(prev => ({ ...prev, currentSharePrice: parseFloat(e.target.value) || 0 }))}
               />
            </div>
            <div>
               <Label htmlFor="purchaseAmount">Purchase Amount</Label>
               <Input
                  id="purchaseAmount"
                  type="number"
                  step="0.01"
                  value={editData.purchaseAmount}
                  onChange={e => setEditData(prev => ({ ...prev, purchaseAmount: parseFloat(e.target.value) || 0 }))}
               />
            </div>
            <div>
               <Label htmlFor="marketValue">Market Value</Label>
               <Input
                  id="marketValue"
                  type="number"
                  step="0.01"
                  value={editData.marketValue}
                  onChange={e => setEditData(prev => ({ ...prev, marketValue: parseFloat(e.target.value) || 0 }))}
               />
            </div>
            <div>
               <Label htmlFor="PEratio">P/E Ratio</Label>
               <Input
                  id="PEratio"
                  type="number"
                  step="0.1"
                  value={editData.PEratio}
                  onChange={e => setEditData(prev => ({ ...prev, PEratio: parseFloat(e.target.value) || 0 }))}
               />
            </div>
            <div>
               <Label htmlFor="marketCapInCrore">Market Cap (Cr)</Label>
               <Input
                  id="marketCapInCrore"
                  type="number"
                  step="0.01"
                  value={editData.marketCapInCrore}
                  onChange={e => setEditData(prev => ({ ...prev, marketCapInCrore: parseFloat(e.target.value) || 0 }))}
               />
            </div>
            <div>
               <Label htmlFor="isActive">Status</Label>
               <select
                  id="isActive"
                  value={editData.isActive ? 'active' : 'inactive'}
                  onChange={e => setEditData(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                  className="w-full border rounded px-2 py-1"
               >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
               </select>
            </div>
            </div>
         </div>
         <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
            Cancel
            </Button>
            <Button onClick={handleUpdateStock} disabled={isLoading}>
            {isLoading ? 'Saving...' : (
               <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
               </>
            )}
            </Button>
         </div>
      </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{stockName}" from the portfolio. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveStock}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Removing...' : 'Remove Stock'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


export function AddStockDialog({ recommendationId, userId }: { recommendationId: string; userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    stockName: '',
    stockTicker: '',
    sector: '',
    portfolioWeight: 0,
    totalShares: 0,
    currentSharePrice: 0,
    purchaseAmount: 0,
    marketValue: 0,
    PEratio: 0,
    marketCapInCrore: 0,
    isActive: true,
  });

  const handleAddStock = async () => {
    setIsLoading(true);
    try {
      const result = await createStockInPortfolio(recommendationId, {
        ...form,
        entryDate: new Date().toISOString().slice(0, 10), // or let admin enter this
      });
      if (result.success) {
        toast.success('Stock added successfully');
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message || 'Failed to add stock');
      }
    } catch (error) {
      toast.error('Failed to add stock');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
            <Button className="">
               Add Stock
            </Button>
         </DialogTrigger>
        <DialogContent className='max-w-4xl w-full'>
          <DialogHeader>
            <DialogTitle>Add New Stock</DialogTitle>
            <DialogDescription>
              Enter all stock information manually.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stockName">Stock Name</Label>
                <Input id="stockName" value={form.stockName} onChange={e => setForm(f => ({ ...f, stockName: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="stockTicker">Ticker</Label>
                <Input id="stockTicker" value={form.stockTicker} onChange={e => setForm(f => ({ ...f, stockTicker: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="sector">Sector</Label>
                <Input id="sector" value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="portfolioWeight">Portfolio Weight (%)</Label>
                <Input id="portfolioWeight" type="number" step="0.01" value={form.portfolioWeight} onChange={e => setForm(f => ({ ...f, portfolioWeight: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label htmlFor="totalShares">Total Shares</Label>
                <Input id="totalShares" type="number" value={form.totalShares} onChange={e => setForm(f => ({ ...f, totalShares: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label htmlFor="currentSharePrice">Current Price (₹)</Label>
                <Input id="currentSharePrice" type="number" step="0.01" value={form.currentSharePrice} onChange={e => setForm(f => ({ ...f, currentSharePrice: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label htmlFor="purchaseAmount">Purchase Amount</Label>
                <Input id="purchaseAmount" type="number" step="0.01" value={form.purchaseAmount} onChange={e => setForm(f => ({ ...f, purchaseAmount: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label htmlFor="marketValue">Market Value</Label>
                <Input id="marketValue" type="number" step="0.01" value={form.marketValue} onChange={e => setForm(f => ({ ...f, marketValue: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label htmlFor="PEratio">P/E Ratio</Label>
                <Input id="PEratio" type="number" step="0.1" value={form.PEratio} onChange={e => setForm(f => ({ ...f, PEratio: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label htmlFor="marketCapInCrore">Market Cap (Cr)</Label>
                <Input id="marketCapInCrore" type="number" step="0.01" value={form.marketCapInCrore} onChange={e => setForm(f => ({ ...f, marketCapInCrore: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label htmlFor="isActive">Status</Label>
                <select
                  id="isActive"
                  value={form.isActive ? 'active' : 'inactive'}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'active' }))}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStock} disabled={isLoading}>
              {isLoading ? 'Saving...' : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Add Stock
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
  );
}


export function UpdateRecommendationDate({
  recommendationDate,
  recommendationId,
  userId,
}: {
  recommendationDate: Date; // ISO date string, e.g. "2024-06-25"
  recommendationId: string;
  userId: string;
}) {
  const router = useRouter();

  const initialDate =
  recommendationDate instanceof Date && !isNaN(recommendationDate.getTime())
    ? recommendationDate.toISOString().slice(0, 10)
    : '';

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(initialDate || '');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);


  // Reset date and focus input when dialog opens
  useEffect(() => {
    if (open) {
      setDate(initialDate);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, recommendationDate]);

  const handleSave = async () => {
   try {
      if (!date) throw new Error('Please select a date');

      setIsLoading(true);
      const res = await updateRecommendationDate({
        userId,
        platinaServiceId: recommendationId,
        recommendationDate: date,
      });
      setIsLoading(false);
      if (!res.success) throw new Error(res.message || 'Failed to update date');
      
      toast.success(res.message);
      setOpen(false);
      router.refresh();
      
   }catch(error){
      toast.error(`${(error as Error).message}`);
   }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto">
          {initialDate ? (
            <span>{new Date(initialDate).toLocaleDateString()}</span>
          ) : (
            <span className="text-muted-foreground">Set Date</span>
          )}
          <Pen size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl w-full'>
        <DialogHeader>
          <DialogTitle>Edit Next Review Date</DialogTitle>
        </DialogHeader>
        <Input
          ref={inputRef}
          type="date"
          className="input input-bordered w-full"
          value={date}
          min={new Date().toISOString().slice(0, 10)}
          onChange={e => setDate(e.target.value)}
          disabled={isLoading}
        />
        <DialogFooter>
          <Button disabled={isLoading || !date} onClick={handleSave}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


