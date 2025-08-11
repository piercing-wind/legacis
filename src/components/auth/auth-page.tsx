'use client';
import { useEffect, useCallback, useMemo, Suspense } from "react";
import Register from "./register";
import { Button } from "../ui/button";
import Image from "next/image";
import Login from "./login";
import ForgotPassword from "@/components/auth/forgot-password";
import { setAuthModel, goBack } from "@/lib/slices/authSlice";
import ResetPassword from "./reset-password";
import { ArrowLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import OTPVerificationForm from "../shared/otpVerificationForm";
import { usePathname, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export const Authentication = () => {
  const { model } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const callbackUrl = searchParams.get('callbackurl') || pathname || '/';
  // Always show login by default on mount
  useEffect(() => {
    dispatch(setAuthModel('login'));
  }, [dispatch]);

  const handleBack = useCallback(() => dispatch(goBack()), [dispatch]);
  const handleSwitchToLogin = useCallback(() => dispatch(setAuthModel('login')), [dispatch]);
  const handleSwitchToRegister = useCallback(() => dispatch(setAuthModel('register')), [dispatch]);

  const renderModel = useMemo(() => {
    switch (model) {
      case 'register':
        return <Register className="max-w-full pb-2 px-0" />;
      case 'login':
        return <Login className="max-w-full pb-2 px-0" />;
      case 'forgot-password':
        return <ForgotPassword className="max-w-full pb-2 px-0" />;
      case 'otp':
        return <OTPVerificationForm className="max-w-full pb-2 px-0 border-0" />;
      case 'reset-password':
        return <ResetPassword className="max-w-full pb-2 px-0" />;
      default:
        return <Login className="max-w-full pb-2 px-0" />;
    }
  }, [model]);

  const isAuthForm = model === 'register' || model === 'login';

  return (
    <div className="flex flex-col md:flex-row items-center md:items-stretch justify-center md:max-w-5xl lg:min-h-[70vh] w-full rounded-xl shadow-lg shadow-legacisGreen/20 overflow-clip mx-auto">
      {(model !== 'register' && model !== 'login') && (
        <Button variant={'ghost'} className="absolute top-4 left-4" onClick={handleBack}>
          <ArrowLeft size={20} />Back
        </Button>
      )}
      <div className="flex flex-col w-full md:w-[60%] overflow-x-hidden overflow-y-auto items-center justify-center bg-white self-stretch dark:bg-neutral-800 p-4 md:px-14">
        <Suspense>
          {renderModel}
        </Suspense>
        {isAuthForm && <div className="text-neutral-400">-------- or --------</div>}
        {isAuthForm && (
            <Button 
               variant={'default'} 
               type="submit" 
               onClick={() => signIn('google', { callbackUrl: callbackUrl })}
               className="px-8 mx-8 rounded-full cursor-pointer mt-2 w-full flex items-center justify-center gap-8"
            >
              <Image src="./Google.svg" alt="google icon" width={24} height={24} />
            Continue with Google
          </Button>
        )}
        {model === 'register' && (
          <p className="text-sm mt-4">
            Already have an account?{" "}
            <Button variant={'link'} onClick={handleSwitchToLogin}>Login here</Button>
          </p>
        )}
        {model === 'login' && (
          <p className="text-sm mt-4">
            Don&apos;t have an account?{" "}
            <Button variant={'link'} onClick={handleSwitchToRegister}>Create here</Button>
          </p>
        )}
      </div>
      <div className="hidden md:flex flex-col md:w-[40%] bg-legacisLightGreen p-8 self-stretch items-center justify-center relative">
        <div className="relative w-60 h-14">
          <Image
            src={"/legacis-logo-black.png"}
            alt="Legacis Logo"
            fill
            style={{ objectFit: "contain" }}
          />
        </div>
        <h5 className="mt-14 text-center leading-8 mb-4 dark:text-neutral-900">Welcome to smarter finances!</h5>
        <p className="text-center dark:!text-neutral-800">Build your wealth with clarity, confidence, and expert support</p>
      </div>
    </div>
  );
};