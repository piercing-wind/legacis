'use client';

import dynamic from 'next/dynamic';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useRef, useState } from 'react';

const QuillRenderPage = dynamic(() => import('../quill'), { ssr: false });

import { Button } from '../ui/button';
import { updateUserPlatinaRationale } from '@/actions/admin/platina-wealth';
import { toast } from 'sonner';

function RationaleInput({userId, platinaServiceId, prevRationale } : {userId: string, platinaServiceId: string, prevRationale?: any}) {
   const [open, setOpen] = useState(false);
   const [quillInstance, setQuillInstance] = useState<any>(null);
   
   const [isLoading, setIsLoading] = useState(false);
   
   const handleGetContents = async () => {
      try {
         if (!quillInstance) throw new Error('Quill instance is not initialized');

         const delta = quillInstance.getContents();
         const res = await updateUserPlatinaRationale({
            userId,
            platinaServiceId,
            rationale: JSON.stringify(delta)
         })
         if(!res.success) throw new Error(res.message);
         toast.success(res.message);
      } catch (error) {
         toast.error(`Error: ${(error as Error).message}`);
      } finally {
         setIsLoading(false);
         setOpen(false);
      }
   };
   return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 h-auto">
         <span>Add Rationale</span>
          <Plus size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl flex flex-col w-full h-full min-h-[50vh] max-h-[80vh] overflow-auto'>
        <DialogHeader>
          <DialogTitle>Rationale</DialogTitle>
        </DialogHeader>
          <QuillRenderPage onQuillReady={setQuillInstance} defaultValue={prevRationale}/>
          <Button disabled={isLoading} onClick={handleGetContents}>
            {isLoading ? 'Log...' : 'Save'}
          </Button>
        <DialogFooter>
          <Button disabled={isLoading} onClick={handleGetContents}>
            {isLoading ? 'Log...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
   )
}

export default RationaleInput;