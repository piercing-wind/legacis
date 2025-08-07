import { cn } from "@/lib/utils";
import { ClipLoader } from "react-spinners";

export default function Loading({message, className}: {message?: string, className?: string}) {
  return (
   <div className={cn(className, "flex flex-col items-center justify-center gap-4 backdrop-blur-sm dark:bg-neutral-800 min-h-screen w-full overflow-clip")}>
      
      <div className="p-8 max-w-md w-full rounded-xl bg-white shadow-2xl shadow-neutral-100 dark:bg-neutral-900">
         <ClipLoader color="var(--legacisPurple)" loading size={24} />
         <span>{message ? message : 'Loading...' }</span>
      </div>
   </div>
)
}