'use client';
import { useEffect, useCallback, useMemo } from "react";
import Register from "./register";
import { Button } from "../ui/button";
import Image from "next/image";
import Login from "./login";
import ForgotPassword from "@/components/auth/forgot-password";
import { setAuthModel, goBack, setAuthOpen } from "@/lib/slices/authSlice";
import ResetPassword from "./reset-password";
import { ArrowLeft, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import OTPVerificationForm from "../shared/otpVerificationForm";

export const Authentication = () => {
  const { model, isAuthOpen } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // All hooks must be called before any return
  useEffect(() => {
    if (isAuthOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAuthOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dispatch(setAuthOpen(false));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  const handleClose = useCallback(() => dispatch(setAuthOpen(false)), [dispatch]);
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
        return <Register className="max-w-full pb-2 px-0" />;
    }
  }, [model]);

  const isAuthForm = model === 'register' || model === 'login';

  if (!isAuthOpen) return null;

  return (
    <div
      className="fixed inset-0 p-4 flex flex-col w-full h-screen overflow-y-auto overflow-x-clip items-center justify-center backdrop-blur-sm bg-neutral-100/20 z-50"
      aria-modal="true"
      role="dialog"
    >
      <Button variant={'ghost'} className="absolute top-4 right-4 z-50 rounded-full" onClick={handleClose}><X size={24} /></Button>
      <div className="relative flex flex-col md:flex-row items-center justify-center md:max-w-5xl lg:min-h-[70vh] w-full rounded-xl shadow-lg shadow-legacisGreen/20 overflow-clip">
        {(model !== 'register' && model !== 'login') && (
          <Button variant={'ghost'} className="absolute top-4 left-4" onClick={handleBack}>
            <ArrowLeft size={20} />Back
          </Button>
        )}
        <div className="flex flex-col w-full md:w-[60%] overflow-x-hidden overflow-y-auto h-full items-center justify-center bg-white dark:bg-neutral-800 p-4 md:px-14">
          {renderModel}
          {isAuthForm && <div className="text-neutral-400">-------- or --------</div>}
          {isAuthForm && (
            <Button variant={'default'} type="submit" className="px-8 mx-8 rounded-full cursor-pointer mt-2 w-full flex items-center justify-center gap-8">
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
              Don't have an account?{" "}
              <Button variant={'link'} onClick={handleSwitchToRegister}>Create here</Button>
            </p>
          )}
        </div>
        <div className="hidden md:flex flex-col md:w-[40%] bg-legacisLightGreen p-8 h-full items-center justify-center relative">
          <div className="relative w-60 h-14">
            <Image
              src={"/legacis-logo-black.png"}
              alt="Legacis Logo"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
          <h5 className="mt-14 text-center leading-8 mb-4 dark:text-neutral-900">Welcome to smarter finances!</h5>
          <p className="text-center font-normal dark:text-neutral-900">Build your wealth with clarity, confidence, and expert support</p>
        </div>
      </div>
    </div>
  );
};