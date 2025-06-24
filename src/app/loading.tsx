import { PuffLoader } from "react-spinners";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
   <div className="flex items-center justify-center gap-8 h-screen">
      <PuffLoader loading size={32} color="var(--legacisPurple)"/>
      <p>Loading...</p>
   </div>
  )
}