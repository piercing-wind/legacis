import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Loading({message, className}: {message?: string, className?: string}) {
  return (
   <div className={cn(className, "flex flex-col items-center justify-center gap-4 bg-white dark:bg-neutral-800 min-h-screen w-full overflow-clip")}>
      <div className="relative h-28 w-28">
         <Image
            src="/loading.gif"
            alt="Loading"
            fill
            style={{ objectFit: 'contain' }}
            sizes="96px"
         />
      </div>
   <p>{message ? message : 'Loading...' }</p>
   </div>
)
}