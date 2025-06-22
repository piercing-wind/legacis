import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center w-full -mt-14">
      <h5>404! Not Found</h5>
      <p>Could not find requested resource</p>
      <Link href="/">Return Home</Link>
    </div>
  )
}