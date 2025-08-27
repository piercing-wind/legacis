import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-legacisLightGreen/40 to-white dark:from-neutral-900 dark:to-neutral-800 text-center px-4">
      <div className="max-w-md w-full ">
        <div className="flex flex-col items-center">
          <XCircle size={72} className="text-legacisGreen mb-6 drop-shadow-lg" />
          <h1 className="text-5xl font-extrabold mb-3 text-legacisGreen dark:text-legacisLightGreen tracking-tight">404</h1>
          <h2 className="text-xl font-semibold mb-2 text-neutral-800 dark:text-neutral-200">Page Not Found</h2>
          <p className="text-base text-neutral-600 dark:text-neutral-400 mb-8">
            Sorry, we couldn't find the page you were looking for.<br />
            It may have been moved or deleted.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-legacisGreen text-white font-semibold shadow-lg hover:bg-legacisDarkGreen transition-all hover:!text-white duration-200 focus:outline-none focus:ring-2 focus:ring-legacisGreen"
          >
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}