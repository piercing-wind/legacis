import { cn } from "@/lib/utils";
import { ClipLoader } from "react-spinners";

export default function Loading({message, className}: {message?: string, className?: string}) {
  return (
   <div className={cn(className, "flex flex-col items-center justify-center gap-4 bg-white dark:bg-neutral-800 min-h-screen w-full overflow-clip")}>
      <ClipLoader color="var(--legacisPurple)" loading size={24} />
      <span>{message ? message : 'Loading...' }</span>
   </div>
)
}