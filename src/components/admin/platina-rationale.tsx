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

function RationaleInput(){
   const [open, setOpen] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);

   const [isLoading, setIsLoading] = useState(false);
   const handleGetContents = () => {
   if (editorRef.current) {
      // Quill attaches itself to the DOM node via __quill property
      const quillInstance = (editorRef.current as any).__quill;
      if (quillInstance) {
         console.log(quillInstance.getContents());
      } else {
         console.log("Quill instance not found yet.");
      }
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
          <QuillRenderPage ref={editorRef}/>
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