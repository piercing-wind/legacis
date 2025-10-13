import { Button } from '@/components/ui/button';
import { TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Metadata } from "next";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export const metadata: Metadata = {
  title: "Error - Legacis",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};


const Page = async ({ searchParams }: PageProps) => {
  const error = await searchParams?.error || 'Unknown error';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900">
      <div className="bg-white dark:bg-neutral-800 px-8 py-10 rounded-xl shadow-lg text-center max-w-md w-full">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <TriangleAlert size={32} color='#fb2c36 '/>
          </div>
          <h1 className="text-3xl font-bold text-red-500 dark:text-red-400 mb-4">Error</h1>
        </div>

        {/* Configuration Error */}
        {error === 'Configuration' && (
          <div className="mb-6 w-full">
            <p className="text-gray-800 dark:text-gray-200 text-lg font-medium mb-2">
              Your Google login session has <span className="text-red-500 dark:text-red-400 font-semibold">expired</span> or is <span className="text-red-500 dark:text-red-400 font-semibold">invalid</span>.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-base">
              This usually happens if you waited too long on the Google login page or tried to use an old login link.<br />
              Please try signing in again in a <span className="font-semibold">new tab</span>.
            </p>
          </div>
        )}

        {/* OAuth Account Not Linked */}
        {error === 'OAuthAccountNotLinked' && (
          <div className="mb-6 w-full">
            <p className="text-gray-800 dark:text-gray-200 text-lg font-medium mb-2">
              This account is already linked with another sign-in method.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-base">
              Please use the original sign-in method you used when you first created your account.
            </p>
          </div>
        )}

        {/* Access Denied */}
        {error === 'AccessDenied' && (
          <div className="mb-6 w-full">
            <p className="text-gray-800 dark:text-gray-200 text-lg font-medium mb-2">
              Access was <span className="text-red-500 dark:text-red-400 font-semibold">denied</span> during authentication.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-base">
              You may have cancelled the login process or denied permission. Please try again and allow the required permissions.
            </p>
          </div>
        )}

        {/* Verification Error */}
        {error === 'Verification' && (
          <div className="mb-6 w-full">
            <p className="text-gray-800 dark:text-gray-200 text-lg font-medium mb-2">
              Email verification <span className="text-red-500 dark:text-red-400 font-semibold">failed</span>.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-base">
              The verification link may have expired or been used already. Please request a new verification email.
            </p>
          </div>
        )}

        {/* Callback Error */}
        {error === 'Callback' && (
          <div className="mb-6 w-full">
            <p className="text-gray-800 dark:text-gray-200 text-lg font-medium mb-2">
              Authentication <span className="text-red-500 dark:text-red-400 font-semibold">callback failed</span>.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-base">
              There was an error processing your login. Please clear your browser cache and try again.
            </p>
          </div>
        )}

        {/* OAuth Create Account Error */}
        {error === 'OAuthCreateAccount' && (
          <div className="mb-6 w-full">
            <p className="text-gray-800 dark:text-gray-200 text-lg font-medium mb-2">
              Failed to <span className="text-red-500 dark:text-red-400 font-semibold">create account</span>.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-base">
              There was an error creating your account. The email might already be in use or there&apos;s a server issue.
            </p>
          </div>
        )}

        {/* Email Sign In Error */}
        {error === 'EmailSignin' && (
          <div className="mb-6 w-full">
            <p className="text-gray-800 dark:text-gray-200 text-lg font-medium mb-2">
              Failed to <span className="text-red-500 dark:text-red-400 font-semibold">send email</span>.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-base">
              Unable to send sign-in email. Please check your email address and try again later.
            </p>
          </div>
        )}

        {/* Credentials Sign In Error */}
        {error === 'CredentialsSignin' && (
          <div className="mb-6 w-full">
            <p className="text-gray-800 dark:text-gray-200 text-lg font-medium mb-2">
              <span className="text-red-500 dark:text-red-400 font-semibold">Invalid credentials</span>.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-base">
              The email or password you entered is incorrect. Please check your credentials and try again.
            </p>
          </div>
        )}

        {/* Session Required Error */}
        {error === 'SessionRequired' && (
          <div className="mb-6 w-full">
            <p className="text-gray-800 dark:text-gray-200 text-lg font-medium mb-2">
              <span className="text-red-500 dark:text-red-400 font-semibold">Sign-in required</span>.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-base">
              You need to be signed in to access this page. Please log in to continue.
            </p>
          </div>
        )}

        {/* Default Error */}
        {!['Configuration', 'OAuthAccountNotLinked', 'AccessDenied', 'Verification', 'Callback', 'OAuthCreateAccount', 'EmailSignin', 'CredentialsSignin', 'SessionRequired'].includes(error as string) && (
          <div className="mb-6 w-full">
            <p className="text-gray-800 dark:text-gray-200 text-lg font-medium mb-2">
              An <span className="text-red-500 dark:text-red-400 font-semibold">unexpected error</span> occurred.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-base">
              Error: {typeof error === 'string' ? error : Array.isArray(error) ? error.join(', ') : 'Unknown error'}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-base mt-2">
              Please try again or contact support if the problem persists.
            </p>
          </div>
        )}

        <Button asChild>
          <Link href="/" target='_blank'>
            Go Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Page;